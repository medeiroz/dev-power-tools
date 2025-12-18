import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, Trash2, ArrowLeftRight, ArrowUpDown, Maximize2, Minimize2, History, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { flattenJson, unflattenJson, safeJsonParse } from "@/lib/json-utils";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { downloadAsFile } from "@/lib/download-utils";
import { createToastHelper } from "@/lib/toast-utils";
import { CodeEditor } from "@/components/code-editor";

export function JsonFlatten() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [expandedInput, setExpandedInput] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(20);
  const { addHistoryEntry, getHistoryByTool } = useHistory();
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);
  
  const toolHistory = getHistoryByTool("JSON Flatten/Unflatten");
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

  const handleFlatten = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const parseResult = safeJsonParse(input);
      if (!parseResult.success) {
        setOutput("");
        setError(parseResult.error || "Invalid JSON");
        
        addHistoryEntry({
          tool: "JSON Flatten/Unflatten",
          operation: "flatten",
          input: input,
          output: "",
          error: parseResult.error || "Invalid JSON",
        });
        return;
      }

      const flattened = flattenJson(parseResult.data);
      const result = JSON.stringify(flattened, null, 2);
      setOutput(result);
      setError("");
      
      addHistoryEntry({
        tool: "JSON Flatten/Unflatten",
        operation: "flatten",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput("");
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "JSON Flatten/Unflatten",
        operation: "flatten",
        input: input,
        output: "",
        error: errorMsg,
      });
    }
  };

  const handleUnflatten = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const parseResult = safeJsonParse(input);
      if (!parseResult.success) {
        setOutput("");
        setError(parseResult.error || "Invalid JSON");
        
        addHistoryEntry({
          tool: "JSON Flatten/Unflatten",
          operation: "unflatten",
          input: input,
          output: "",
          error: parseResult.error || "Invalid JSON",
        });
        return;
      }

      const unflattened = unflattenJson(parseResult.data);
      const result = JSON.stringify(unflattened, null, 2);
      setOutput(result);
      setError("");
      
      addHistoryEntry({
        tool: "JSON Flatten/Unflatten",
        operation: "unflatten",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput("");
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "JSON Flatten/Unflatten",
        operation: "unflatten",
        input: input,
        output: "",
        error: errorMsg,
      });
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const handleClearOutput = () => {
    setOutput("");
    setError("");
  };

  const handleSwapContent = () => {
    if (output.trim()) {
      const temp = input;
      setInput(output);
      setOutput(temp);
      setError("");
    }
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    const result = await copyToClipboard(text);
    if (result.success) {
      toastHelper.copySuccess(label);
    } else {
      toastHelper.copyError();
    }
  };

  const handleDownloadAsFile = (content: string, filename: string) => {
    try {
      downloadAsFile(content, filename);
      toastHelper.downloadSuccess(filename);
    } catch (error) {
      toastHelper.downloadError();
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            JSON Flatten/Unflatten
          </h1>
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
                  JSON Flatten/Unflatten History
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
                              if (entry.input) {
                                setInput(entry.input);
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
                                onClick={() => handleCopyToClipboard(entry.input, "Input")}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="p-2 rounded text-xs font-mono max-h-20 overflow-auto bg-muted">
                              {entry.input.length > 200 ? entry.input.substring(0, 200) + "..." : entry.input}
                            </div>
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
                                onClick={() => handleCopyToClipboard(entry.output, "Output")}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className={`p-2 rounded text-xs font-mono max-h-20 overflow-auto ${
                            entry.error ? 'bg-destructive/10 text-destructive' : 'bg-muted'
                          }`}>
                            {entry.error || (entry.output.length > 200 ? entry.output.substring(0, 200) + "..." : entry.output)}
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
          Convert between nested JSON objects and flat objects using dot notation for keys.
        </p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive text-sm font-mono">{error}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Input */}
        <Card className="h-fit w-full lg:flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Input</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!input && !output}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(input, "Input")}
                disabled={!input}
                className="h-8 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedInput(true)}
                className="h-8 px-2"
                title="Maximize"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder={`{
  "user": {
    "name": "John Doe",
    "contact": {
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York"
      }
    }
  }
}`}
              minHeight={300}
              language="json"
              wrapLines={true}
            />
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleFlatten}
                className="bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                Flatten
              </Button>
              <Button 
                onClick={handleUnflatten}
              >
                Unflatten
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Swap Button - Between cards */}
        <div className="flex justify-center items-center lg:mt-20 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapContent}
            disabled={!output.trim()}
            className="h-10 w-10 rounded-full p-0 bg-background border-2 shadow-sm hover:shadow-md transition-all"
            title="Swap input and output"
          >
            {/* Desktop icon */}
            <ArrowLeftRight className="h-4 w-4 hidden lg:block" />
            {/* Mobile icon */}
            <ArrowUpDown className="h-4 w-4 lg:hidden" />
          </Button>
        </div>

        {/* Output */}
        <Card className="h-fit w-full lg:flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Output</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearOutput}
                disabled={!output}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(output, "Output")}
                disabled={!output}
                className="h-8 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadAsFile(output, "flattened-json.json")}
                disabled={!output}
                className="h-8 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedOutput(true)}
                className="h-8 px-2"
                title="Maximize"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              placeholder="Flattened/Unflattened JSON will appear here..."
              minHeight={300}
              language="json"
              wrapLines={true}
              readOnly
            />
          </CardContent>
        </Card>
      </div>

      {/* Expanded Input Dialog */}
      <Dialog open={expandedInput} onOpenChange={setExpandedInput}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Input - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(input, "Input")}
                  disabled={!input}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedInput(false)}
                  className="h-8 px-2"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder={`{
  "user": {
    "name": "John Doe",
    "contact": {
      "email": "john@example.com"
    }
  }
}`}
              minHeight={600}
              language="json"
              wrapLines={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Output Dialog */}
      <Dialog open={expandedOutput} onOpenChange={setExpandedOutput}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Output - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(output, "Output")}
                  disabled={!output}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadAsFile(output, "flattened-json.json")}
                  disabled={!output}
                  className="h-8 px-2"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedOutput(false)}
                  className="h-8 px-2"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Flattened/Unflattened JSON will appear here..."
              minHeight={600}
              language="json"
              wrapLines={true}
              readOnly
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}