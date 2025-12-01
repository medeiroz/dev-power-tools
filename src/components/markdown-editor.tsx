import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download, Trash2, Eye, Maximize2, Minimize2 } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { downloadAsFile } from "@/lib/download-utils";
import { createToastHelper } from "@/lib/toast-utils";
import { CodeEditor } from "@/components/code-editor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownEditor() {
  const [input, setInput] = useState("");
  const [expandedInput, setExpandedInput] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(false);
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);

  const handleClear = () => {
    setInput("");
  };

  const handleCopyMarkdown = async () => {
    const result = await copyToClipboard(input);
    if (result.success) {
      toastHelper.copySuccess("Markdown");
    } else {
      toastHelper.copyError();
    }
  };

  const handleCopyHTML = async () => {
    // Convert markdown to HTML by getting the rendered content
    const tempDiv = document.createElement("div");
    const rendered = document.querySelector(".markdown-preview");
    if (rendered) {
      tempDiv.innerHTML = rendered.innerHTML;
      const result = await copyToClipboard(tempDiv.innerHTML);
      if (result.success) {
        toastHelper.copySuccess("HTML");
      } else {
        toastHelper.copyError();
      }
    }
  };

  const handleDownloadMarkdown = () => {
    try {
      downloadAsFile(input, "document.md");
      toastHelper.downloadSuccess("document.md");
      
      addHistoryEntry({
        tool: "Markdown Editor",
        operation: "download",
        input: input,
        output: "document.md",
      });
    } catch (error) {
      toastHelper.downloadError();
    }
  };

  const handleDownloadHTML = () => {
    try {
      const rendered = document.querySelector(".markdown-preview");
      if (rendered) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    table th, table td { border: 1px solid #ddd; padding: 8px 12px; }
    table th { background: #f6f8fa; font-weight: 600; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; }
    ul, ol { padding-left: 2em; }
    li { margin: 4px 0; }
  </style>
</head>
<body>
${rendered.innerHTML}
</body>
</html>`;
        downloadAsFile(html, "document.html");
        toastHelper.downloadSuccess("document.html");
        
        addHistoryEntry({
          tool: "Markdown Editor",
          operation: "download-html",
          input: input,
          output: "document.html",
        });
      }
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
            Markdown Editor
          </h1>
        </div>
        <p className="text-muted-foreground">
          Write and preview Markdown with GitHub Flavored Markdown support.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Input - Editor */}
        <Card className="h-fit w-full lg:flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Markdown Input</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!input}
                className="h-8 px-2"
                title="Clear"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMarkdown}
                disabled={!input}
                className="h-8 px-2"
                title="Copy Markdown"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadMarkdown}
                disabled={!input}
                className="h-8 px-2"
                title="Download as .md"
              >
                <Download className="h-3 w-3" />
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
              placeholder={`# Hello, Markdown!

## Features
- **Bold** and *italic* text
- [Links](https://example.com)
- \`inline code\`

### Code Blocks
\`\`\`javascript
console.log("Hello World!");
\`\`\`

### Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

### Blockquotes
> This is a blockquote

### Lists
1. First item
2. Second item
   - Nested item
   - Another nested item`}
              minHeight={400}
              language="text"
              wrapLines={true}
            />
          </CardContent>
        </Card>

        {/* Output - Preview */}
        <Card className="h-fit w-full lg:flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyHTML}
                disabled={!input}
                className="h-8 px-2"
                title="Copy as HTML"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadHTML}
                disabled={!input}
                className="h-8 px-2"
                title="Download as .html"
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
            <div className="markdown-preview min-h-[400px] p-4 rounded-md border bg-card overflow-auto">
              {input ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-border" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3 pb-2 border-b border-border" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                    h4: ({ ...props }) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
                    h5: ({ ...props }) => <h5 className="text-base font-bold mt-2 mb-1" {...props} />,
                    h6: ({ ...props }) => <h6 className="text-sm font-bold mt-2 mb-1" {...props} />,
                    p: ({ ...props }) => <p className="mb-4 leading-7" {...props} />,
                    a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                    li: ({ ...props }) => <li className="ml-4" {...props} />,
                    code: ({ className, children, ...props }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ ...props }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />,
                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />,
                    table: ({ ...props }) => <table className="w-full border-collapse mb-4" {...props} />,
                    thead: ({ ...props }) => <thead className="bg-muted" {...props} />,
                    th: ({ ...props }) => <th className="border border-border px-4 py-2 text-left font-semibold" {...props} />,
                    td: ({ ...props }) => <td className="border border-border px-4 py-2" {...props} />,
                    img: ({ ...props }) => <img className="max-w-full h-auto rounded-lg my-4" {...props} />,
                    hr: ({ ...props }) => <hr className="my-6 border-border" {...props} />,
                  }}
                  >
                    {input}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Your rendered Markdown will appear here...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expanded Input Dialog */}
      <Dialog open={expandedInput} onOpenChange={setExpandedInput}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Markdown Input - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  disabled={!input}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadMarkdown}
                  disabled={!input}
                  className="h-8 px-2"
                >
                  <Download className="h-3 w-3" />
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
              placeholder={`# Hello, Markdown!

## Features
- **Bold** and *italic* text
- [Links](https://example.com)
- \`inline code\`

### Code Blocks
\`\`\`javascript
console.log("Hello World!");
\`\`\`

### Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`}
              minHeight={600}
              language="text"
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
              <span>Preview - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyHTML}
                  disabled={!input}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadHTML}
                  disabled={!input}
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
          <div className="flex-1 overflow-auto">
            <div className="markdown-preview min-h-full p-4 rounded-md border bg-card">
              {input ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-border" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3 pb-2 border-b border-border" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                    h4: ({ ...props }) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
                    h5: ({ ...props }) => <h5 className="text-base font-bold mt-2 mb-1" {...props} />,
                    h6: ({ ...props }) => <h6 className="text-sm font-bold mt-2 mb-1" {...props} />,
                    p: ({ ...props }) => <p className="mb-4 leading-7" {...props} />,
                    a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                    li: ({ ...props }) => <li className="ml-4" {...props} />,
                    code: ({ className, children, ...props }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ ...props }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />,
                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />,
                    table: ({ ...props }) => <table className="w-full border-collapse mb-4" {...props} />,
                    thead: ({ ...props }) => <thead className="bg-muted" {...props} />,
                    th: ({ ...props }) => <th className="border border-border px-4 py-2 text-left font-semibold" {...props} />,
                    td: ({ ...props }) => <td className="border border-border px-4 py-2" {...props} />,
                    img: ({ ...props }) => <img className="max-w-full h-auto rounded-lg my-4" {...props} />,
                    hr: ({ ...props }) => <hr className="my-6 border-border" {...props} />,
                  }}
                  >
                    {input}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Your rendered Markdown will appear here...
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
