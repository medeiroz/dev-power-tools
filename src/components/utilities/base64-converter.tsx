import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Trash2, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { encodeBase64, decodeBase64 } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { downloadAsFile } from "@/lib/download-utils";
import { createToastHelper } from "@/lib/toast-utils";
import { CodeEditor } from "@/components/code-editor";

export function Base64Converter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);

  const handleEncode = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const result = encodeBase64(input);
      setOutput(result);
      setError("");
      
      addHistoryEntry({
        tool: "Base64 Converter",
        operation: "encode",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput("");
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "Base64 Converter",
        operation: "encode",
        input: input,
        output: "",
        error: errorMsg,
      });
    }
  };

  const handleDecode = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const result = decodeBase64(input);
      if (result.error) {
        setOutput("");
        setError(result.error);
        addHistoryEntry({
          tool: "Base64 Converter",
          operation: "decode",
          input: input,
          output: "",
          error: result.error,
        });
      } else {
        setOutput(result.result);
        setError("");
        addHistoryEntry({
          tool: "Base64 Converter",
          operation: "decode",
          input: input,
          output: result.result,
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput("");
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "Base64 Converter",
        operation: "decode",
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
            Base64 Converter
          </h1>
        </div>
        <p className="text-muted-foreground">
          Encode text to Base64 or decode Base64 to text.
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
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Enter text to encode or Base64 to decode..."
              minHeight={300}
              language="text"
              wrapLines={true}
            />
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleEncode}
                className="bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                Encode
              </Button>
              <Button 
                onClick={handleDecode}
              >
                Decode
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
                onClick={() => handleDownloadAsFile(output, "base64-result.txt")}
                disabled={!output}
                className="h-8 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              placeholder="Encoded/Decoded result will appear here..."
              minHeight={300}
              language="text"
              wrapLines={true}
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}