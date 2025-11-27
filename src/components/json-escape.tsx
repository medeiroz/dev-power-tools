import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download, Trash2, ArrowLeftRight, ArrowUpDown, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/code-editor";
import { escapeJson, unescapeJson } from "@/lib/json-utils";
import { useHistory } from "@/hooks/use-history";
import { downloadAsFile } from "@/lib/download-utils";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { createToastHelper } from "@/lib/toast-utils";

export function JsonEscape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [expandedInput, setExpandedInput] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(false);
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);

  const handleEscape = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const result = escapeJson(input);
      setOutput(result);
      setError("");
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "escape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput("");
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "escape",
        input: input,
        output: "",
        error: errorMsg,
      });
    }
  };

  const handleUnescape = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const result = unescapeJson(input);
      setOutput(result);
      setError("");
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "unescape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput("");
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "unescape",
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
            JSON Escape/Unescape
          </h1>
        </div>
        <p className="text-muted-foreground">
          Escape JSON for embedding in strings or unescape JSON from string format.
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
              placeholder='{"message": "Hello \"World\"!\nThis is a test."}'
              minHeight={300}
              wrapLines={true}
            />
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleUnescape}
                className="bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                Unescape
              </Button>
              <Button 
                onClick={handleEscape}
              >
                Escape
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
                onClick={() => handleDownloadAsFile(output, "escaped-json.txt")}
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
              placeholder="Escaped/Unescaped JSON will appear here..."
              minHeight={300}
              wrapLines={true}
              readOnly
            />
          </CardContent>
        </Card>
      </div>

      {/* Expanded Input Dialog */}
      <Dialog open={expandedInput} onOpenChange={setExpandedInput}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col">
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
              placeholder='{"message": "Hello \"World\"!\nThis is a test."}'
              minHeight={600}
              wrapLines={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Output Dialog */}
      <Dialog open={expandedOutput} onOpenChange={setExpandedOutput}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col">
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
                  onClick={() => handleDownloadAsFile(output, "escaped-json.txt")}
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
              placeholder="Escaped/Unescaped JSON will appear here..."
              minHeight={600}
              wrapLines={true}
              readOnly
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}