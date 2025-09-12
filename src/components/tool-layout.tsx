import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
}: ToolLayoutProps) {
  const { toast } = useToast();

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
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={inputValue}
              onChange={onInputChange}
              placeholder={inputPlaceholder}
              minHeight={300}
            />
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={onProcess}
                className="bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                {processLabel}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="h-fit">
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="min-h-[300px] border rounded-md overflow-auto bg-code-bg">
                <SyntaxHighlighter
                  language="json"
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: '0.75rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
                    minHeight: '300px',
                  }}
                  showLineNumbers={false}
                >
                  {outputValue || outputPlaceholder}
                </SyntaxHighlighter>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {children}
    </div>
  );
}