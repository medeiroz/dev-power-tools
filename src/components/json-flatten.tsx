import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Trash2, ArrowLeftRight, ArrowUpDown } from "lucide-react";
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
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);

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
              wrapLines={false}
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
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={output}
              onChange={() => {}} // Read-only
              placeholder="Flattened/Unflattened JSON will appear here..."
              minHeight={300}
              language="json"
              wrapLines={false}
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}