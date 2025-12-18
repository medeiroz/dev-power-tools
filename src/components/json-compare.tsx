import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, ArrowLeftRight, CheckCircle, AlertCircle, Maximize2, Minimize2, History, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/code-editor";
import { compareJson } from "@/lib/json-utils";
import { useHistory } from "@/hooks/use-history";

export function JsonCompare() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [differences, setDifferences] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [expandedInput1, setExpandedInput1] = useState(false);
  const [expandedInput2, setExpandedInput2] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(20);
  const { toast } = useToast();
  const { addHistoryEntry, getHistoryByTool } = useHistory();
  
  const toolHistory = getHistoryByTool("JSON Compare");
  const visibleHistory = toolHistory.slice(0, historyLimit);
  const hasMoreHistory = toolHistory.length > historyLimit;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setHistoryOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCompare = () => {
    if (!input1.trim() || !input2.trim()) {
      setDifferences([]);
      setError("");
      setIsValid(undefined);
      return;
    }

    const result = compareJson(input1, input2);

    if (result.success) {
      setDifferences(result.data || []);
      setIsValid(true);
      setError("");
      
      // Format differences for better readability in history
      const formattedDifferences = result.data?.length 
        ? result.data.map((diff: any) => {
            const pathStr = diff.path || 'root';
            const typeLabel = diff.type === 'added' ? '➕ Added' 
                           : diff.type === 'removed' ? '➖ Removed' 
                           : diff.type === 'changed' ? '🔄 Changed' 
                           : diff.type;
            
            let details = `${typeLabel} at "${pathStr}"`;
            if (diff.type === 'changed') {
              details += `\n  Old: ${JSON.stringify(diff.oldValue)}`;
              details += `\n  New: ${JSON.stringify(diff.newValue)}`;
            } else if (diff.type === 'added') {
              details += `\n  Value: ${JSON.stringify(diff.newValue)}`;
            } else if (diff.type === 'removed') {
              details += `\n  Value: ${JSON.stringify(diff.oldValue)}`;
            }
            return details;
          }).join('\n\n')
        : 'No differences found';
      
      addHistoryEntry({
        tool: "JSON Compare",
        operation: "compare",
        input: { json1: input1, json2: input2 },
        output: formattedDifferences,
        options: { 
          differencesCount: result.data?.length || 0,
          rawDifferences: result.data 
        }
      });
    } else {
      setDifferences([]);
      setIsValid(false);
      setError(result.error || "Comparison failed");
      
      addHistoryEntry({
        tool: "JSON Compare",
        operation: "compare",
        input: { json1: input1, json2: input2 },
        output: "",
        error: result.error || "Comparison failed"
      });
    }
  };

  // Auto-compare on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input1.trim() && input2.trim()) {
        handleCompare();
      } else {
        setDifferences([]);
        setError("");
        setIsValid(undefined);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [input1, input2]);

  const handleClear = () => {
    setInput1("");
    setInput2("");
    setDifferences([]);
    setError("");
    setIsValid(undefined);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getDiffBadgeColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-success/20 text-success border-success/30';
      case 'removed': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'changed': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            JSON Compare
          </h1>
          {isValid !== undefined && (
            <Badge variant={isValid ? "default" : "destructive"} className="gap-1">
              {isValid ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Match
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Different
                </>
              )}
            </Badge>
          )}
          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              >
                <History className="h-4 w-4" />
                History
                {toolHistory.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-white text-violet-700 hover:bg-gray-100 font-semibold">
                    {toolHistory.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  JSON Compare History
                  <Badge variant="secondary">{toolHistory.length} entries</Badge>
                </DialogTitle>
                <p className="text-sm text-muted-foreground">Recent operations (showing {visibleHistory.length} of {toolHistory.length})</p>
              </DialogHeader>
              <div className="space-y-4">
                {toolHistory.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <History className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No history yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Start using this tool to see your history here</p>
                    </CardContent>
                  </Card>
                ) : (
                  visibleHistory.map((entry) => (
                    <Card key={entry.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={entry.error ? "destructive" : "default"} className="gap-1">
                              {entry.error ? (
                                <>
                                  <AlertCircle className="h-3 w-3" />
                                  Error
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Success
                                </>
                              )}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (entry.input && typeof entry.input === 'object' && 'json1' in entry.input && 'json2' in entry.input) {
                                setInput1(entry.input.json1);
                                setInput2(entry.input.json2);
                                setHistoryOpen(false);
                                toast({
                                  title: "Applied!",
                                  description: "Input restored from history",
                                });
                              }
                            }}
                            className="gap-2"
                          >
                            <ArrowLeftRight className="h-3 w-3" />
                            Apply
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {entry.input && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs font-medium">Input:</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const inputText = typeof entry.input === 'object' && 'json1' in entry.input
                                    ? `JSON 1:\n${entry.input.json1}\n\nJSON 2:\n${entry.input.json2}`
                                    : JSON.stringify(entry.input, null, 2);
                                  copyToClipboard(inputText, "Input");
                                }}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            {typeof entry.input === 'object' && 'json1' in entry.input ? (
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">JSON 1:</div>
                                  <div className="p-2 rounded text-xs font-mono max-h-20 overflow-auto bg-muted">
                                    {entry.input.json1.length > 150 ? entry.input.json1.substring(0, 150) + "..." : entry.input.json1}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">JSON 2:</div>
                                  <div className="p-2 rounded text-xs font-mono max-h-20 overflow-auto bg-muted">
                                    {entry.input.json2.length > 150 ? entry.input.json2.substring(0, 150) + "..." : entry.input.json2}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-2 rounded text-xs font-mono max-h-20 overflow-auto bg-muted">
                                {typeof entry.input === 'string' 
                                  ? (entry.input.length > 200 ? entry.input.substring(0, 200) + "..." : entry.input)
                                  : JSON.stringify(entry.input, null, 2).substring(0, 200) + "..."}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-medium">
                              {entry.error ? "Error:" : "Output:"}
                            </div>
                            {!entry.error && entry.output && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(entry.output, "Output")}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className={`p-2 rounded text-xs font-mono max-h-32 overflow-auto whitespace-pre-wrap ${
                            entry.error ? 'bg-destructive/10 text-destructive' : 'bg-muted'
                          }`}>
                            {entry.error || (entry.output.length > 300 ? entry.output.substring(0, 300) + "..." : entry.output)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                {hasMoreHistory && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryLimit(prev => prev + 20)}
                    >
                      Load More ({toolHistory.length - historyLimit} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Compare two JSON objects and highlight the differences between them.
        </p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive text-sm font-mono">{error}</p>
          </div>
        )}
      </div>

      {/* Input Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First JSON */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">First JSON</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput1("")}
                className="h-8 px-2"
              >
                Clear
              </Button>
              {input1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(input1, "First JSON")}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedInput1(true)}
                className="h-8 px-2"
                title="Maximize"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={input1}
              onChange={setInput1}
              placeholder='{"name": "John", "age": 30}'
              minHeight={200}
              language="json"
              wrapLines={true}
            />
          </CardContent>
        </Card>

        {/* Second JSON */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Second JSON</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput2("")}
                className="h-8 px-2"
              >
                Clear
              </Button>
              {input2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(input2, "Second JSON")}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedInput2(true)}
                className="h-8 px-2"
                title="Maximize"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={input2}
              onChange={setInput2}
              placeholder='{"name": "Jane", "age": 25, "city": "NYC"}'
              minHeight={200}
              language="json"
              wrapLines={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button 
          onClick={handleCompare}
          className="bg-gradient-primary hover:opacity-90 transition-smooth"
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Compare JSONs
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear All
        </Button>
      </div>

      {/* Results */}
      {differences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Differences Found ({differences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {differences.map((diff, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={getDiffBadgeColor(diff.type)}>
                      {diff.type}
                    </Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {diff.path}
                    </code>
                  </div>
                  
                  {diff.type !== 'added' && (
                    <div className="pl-4 border-l-2 border-destructive/30">
                      <p className="text-xs text-muted-foreground">Original:</p>
                      <code className="text-sm bg-destructive/10 px-2 py-1 rounded block">
                        {JSON.stringify(diff.value1)}
                      </code>
                    </div>
                  )}
                  
                  {diff.type !== 'removed' && (
                    <div className="pl-4 border-l-2 border-success/30">
                      <p className="text-xs text-muted-foreground">New:</p>
                      <code className="text-sm bg-success/10 px-2 py-1 rounded block">
                        {JSON.stringify(diff.value2)}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isValid && differences.length === 0 && input1 && input2 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-success mb-2">
                No Differences Found
              </h3>
              <p className="text-muted-foreground">
                The two JSON objects are identical.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded Input1 Dialog */}
      <Dialog open={expandedInput1} onOpenChange={setExpandedInput1}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>First JSON - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(input1, "First JSON")}
                  disabled={!input1}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedInput1(false)}
                  className="h-8 px-2"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={input1}
              onChange={setInput1}
              placeholder='{"name": "John", "age": 30}'
              minHeight={600}
              language="json"
              wrapLines={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Input2 Dialog */}
      <Dialog open={expandedInput2} onOpenChange={setExpandedInput2}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Second JSON - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(input2, "Second JSON")}
                  disabled={!input2}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedInput2(false)}
                  className="h-8 px-2"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={input2}
              onChange={setInput2}
              placeholder='{"name": "Jane", "age": 25, "city": "NYC"}'
              minHeight={600}
              language="json"
              wrapLines={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}