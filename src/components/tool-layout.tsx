import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, Trash2, CheckCircle, AlertCircle, History, Clock, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHistory } from "@/hooks/use-history";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeEditor } from "@/components/code-editor";

interface ToolLayoutProps {
  title: string;
  description: string;
  children?: ReactNode;
  inputValue: string;
  outputValue: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  onProcess: () => void;
  processLabel?: string;
  isValid?: boolean;
  error?: string;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
  options?: ReactNode;
  toolName?: string;
  wrapLines?: boolean;
  outputRef?: React.RefObject<HTMLDivElement>;
}

export function ToolLayout({
  title,
  description,
  children,
  inputValue,
  outputValue,
  onInputChange,
  onClear,
  onProcess,
  processLabel = "Process",
  isValid,
  error,
  inputPlaceholder = "Enter your input here...",
  outputPlaceholder = "Output will appear here...",
  options,
  toolName,
  wrapLines = true,
  outputRef,
}: ToolLayoutProps) {
  const { toast } = useToast();
  const { getHistoryByTool } = useHistory();
  const [expandedInput, setExpandedInput] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(false);
  
  const toolHistory = toolName ? getHistoryByTool(toolName) : [];

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

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `File saved as ${filename}`,
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </h1>
          {isValid !== undefined && (
            <Badge variant={isValid ? "default" : "destructive"} className="gap-1">
              {isValid ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Valid
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Invalid
                </>
              )}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">{description}</p>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive text-sm font-mono">{error}</p>
          </div>
        )}
      </div>

      {/* Options */}
      {options && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {options}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Input</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              {inputValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(inputValue, "Input")}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
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
              value={inputValue}
              onChange={onInputChange}
              placeholder={inputPlaceholder}
              minHeight={300}
              wrapLines={wrapLines}
            />
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={onProcess}
                className="bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                {processLabel}
              </Button>
              {toolName && toolHistory.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <History className="h-4 w-4 mr-2" />
                      History ({toolHistory.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>{toolName} History</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {toolHistory.slice(0, 10).map((entry) => (
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
                              {!entry.error && entry.output && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(entry.output, "Output")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {entry.input && (
                              <div>
                                <div className="text-xs font-medium mb-1">Input:</div>
                                <div className="bg-muted p-2 rounded text-xs font-mono max-h-20 overflow-auto">
                                  {entry.input.length > 200 ? entry.input.substring(0, 200) + "..." : entry.input}
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-medium mb-1">
                                {entry.error ? "Error:" : "Output:"}
                              </div>
                              <div className={`p-2 rounded text-xs font-mono max-h-20 overflow-auto ${
                                entry.error ? 'bg-destructive/10 text-destructive' : 'bg-muted'
                              }`}>
                                {entry.error || (entry.output.length > 200 ? entry.output.substring(0, 200) + "..." : entry.output)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="h-fit" ref={outputRef}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Output</CardTitle>
            <div className="flex gap-2">
              {outputValue && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadAsFile(outputValue, `output.json`)}
                    className="h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(outputValue, "Output")}
                    className="h-8 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </>
              )}
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
              value={outputValue}
              onChange={() => {}} // Read-only
              placeholder={outputPlaceholder}
              minHeight={300}
              wrapLines={wrapLines}
              readOnly
            />
          </CardContent>
        </Card>
      </div>

      {children}

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
                  onClick={() => copyToClipboard(inputValue, "Input")}
                  disabled={!inputValue}
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
              value={inputValue}
              onChange={onInputChange}
              placeholder={inputPlaceholder}
              minHeight={600}
              wrapLines={wrapLines}
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
                  onClick={() => copyToClipboard(outputValue, "Output")}
                  disabled={!outputValue}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadAsFile(outputValue, `output.json`)}
                  disabled={!outputValue}
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
              value={outputValue}
              onChange={() => {}}
              placeholder={outputPlaceholder}
              minHeight={600}
              wrapLines={wrapLines}
              readOnly
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}