import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Trash2 } from "lucide-react";
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
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);

  const handleEscape = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const result = escapeJson(input);
      setOutput(result);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "escape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
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
      return;
    }

    try {
      const result = unescapeJson(input);
      setOutput(result);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "unescape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
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
      </div>

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
                onClick={handleClear}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              {input && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(input, "Input")}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder='{"message": "Hello \"World\"!\nThis is a test."}'
              minHeight={300}
              wrapLines={false}
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

        {/* Output */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Output</CardTitle>
            <div className="flex gap-2">
              {output && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(output, "Output")}
                    className="h-8 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAsFile(output, "escaped-json.txt")}
                    className="h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              placeholder="Escaped/Unescaped JSON will appear here..."
              minHeight={300}
              wrapLines={false}
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}