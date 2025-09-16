import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, History, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHistory } from "@/hooks/use-history";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface GeneratorLayoutProps {
  title: string;
  description: string;
  outputValue: string;
  onGenerate: () => void;
  onClear: () => void;
  generateLabel?: string;
  outputPlaceholder?: string;
  options?: ReactNode;
  toolName?: string;
  language?: string;
}

export function GeneratorLayout({
  title,
  description,
  outputValue,
  onGenerate,
  onClear,
  generateLabel = "Generate",
  outputPlaceholder = "Generated output will appear here...",
  options,
  toolName,
  language = "text",
}: GeneratorLayoutProps) {
  const { toast } = useToast();
  const { getHistoryByTool } = useHistory();
  
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
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
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

      {/* Generate Button */}
      <div className="flex gap-2">
        <Button 
          onClick={onGenerate}
          className="bg-gradient-primary hover:opacity-90 transition-smooth"
        >
          {generateLabel}
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

      {/* Output Section */}
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">Generated Output</CardTitle>
          <div className="flex gap-2">
            {outputValue && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadAsFile(outputValue, `generated.txt`)}
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
            <div className="min-h-[200px] border rounded-md overflow-auto bg-code-bg">
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '0.75rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
                  minHeight: '200px',
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
  );
}