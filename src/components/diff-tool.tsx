import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2, ArrowUpDown, ArrowLeftRight, Maximize2, Minimize2, GitCompare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/code-editor";
import { useHistory } from "@/hooks/use-history";
import { downloadAsFile } from "@/lib/download-utils";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { createToastHelper } from "@/lib/toast-utils";

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber1?: number;
  lineNumber2?: number;
}

export function DiffTool() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [diffs, setDiffs] = useState<DiffLine[]>([]);
  const [expandedInput1, setExpandedInput1] = useState(false);
  const [expandedInput2, setExpandedInput2] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(false);
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);

  const computeDiff = (text1: string, text2: string): DiffLine[] => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: DiffLine[] = [];

    // Simple line-by-line diff algorithm
    const maxLines = Math.max(lines1.length, lines2.length);
    let lineNum1 = 0;
    let lineNum2 = 0;

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === line2) {
        result.push({
          type: 'unchanged',
          content: line1 || '',
          lineNumber1: ++lineNum1,
          lineNumber2: ++lineNum2,
        });
      } else {
        if (line1 !== undefined) {
          result.push({
            type: 'removed',
            content: line1,
            lineNumber1: ++lineNum1,
          });
        }
        if (line2 !== undefined) {
          result.push({
            type: 'added',
            content: line2,
            lineNumber2: ++lineNum2,
          });
        }
      }
    }

    return result;
  };

  const handleCompare = () => {
    if (!input1.trim() && !input2.trim()) {
      setDiffs([]);
      return;
    }

    const result = computeDiff(input1, input2);
    setDiffs(result);

    const addedCount = result.filter(d => d.type === 'added').length;
    const removedCount = result.filter(d => d.type === 'removed').length;

    addHistoryEntry({
      tool: "Diff Tool",
      operation: "compare",
      input: `Text 1 (${input1.split('\n').length} lines)\nText 2 (${input2.split('\n').length} lines)`,
      output: `${addedCount} additions, ${removedCount} deletions`,
    });
  };

  const handleClear = () => {
    setInput1("");
    setInput2("");
    setDiffs([]);
  };

  const handleSwap = () => {
    const temp = input1;
    setInput1(input2);
    setInput2(temp);
    if (diffs.length > 0) {
      handleCompare();
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

  const getDiffOutput = (): string => {
    return diffs.map(line => {
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      return prefix + line.content;
    }).join('\n');
  };

  const getStats = () => {
    const added = diffs.filter(d => d.type === 'added').length;
    const removed = diffs.filter(d => d.type === 'removed').length;
    const unchanged = diffs.filter(d => d.type === 'unchanged').length;
    return { added, removed, unchanged, total: diffs.length };
  };

  const stats = getStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Diff Tool
          </h1>
          {stats.total > 0 && (
            <div className="flex gap-2">
              {stats.added > 0 && (
                <Badge variant="default" className="bg-success">
                  +{stats.added}
                </Badge>
              )}
              {stats.removed > 0 && (
                <Badge variant="destructive">
                  -{stats.removed}
                </Badge>
              )}
              {stats.unchanged > 0 && (
                <Badge variant="secondary">
                  {stats.unchanged} unchanged
                </Badge>
              )}
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          Compare two texts side-by-side and see the differences line by line.
        </p>
      </div>

      {/* Input Areas */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
        {/* Original Text */}
        <Card className="h-fit w-full lg:flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Original Text</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput1("")}
                disabled={!input1}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(input1, "Original Text")}
                disabled={!input1}
                className="h-8 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
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
              placeholder="Enter original text here..."
              minHeight={300}
              wrapLines={true}
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleCompare}
                className="bg-gradient-primary hover:opacity-90 transition-smooth"
                disabled={!input1 && !input2}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Compare
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Swap Button - Between cards */}
        <div className="flex justify-center items-center lg:mt-20 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwap}
            disabled={!input1 && !input2}
            className="h-10 w-10 rounded-full p-0 bg-background border-2 shadow-sm hover:shadow-md transition-all"
            title="Swap texts"
          >
            {/* Desktop icon */}
            <ArrowLeftRight className="h-4 w-4 hidden lg:block" />
            {/* Mobile icon */}
            <ArrowUpDown className="h-4 w-4 lg:hidden" />
          </Button>
        </div>

        {/* Modified Text */}
        <Card className="h-fit w-full lg:flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Modified Text</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput2("")}
                disabled={!input2}
                className="h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(input2, "Modified Text")}
                disabled={!input2}
                className="h-8 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
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
              placeholder="Enter modified text here..."
              minHeight={300}
              wrapLines={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Diff Output */}
      {diffs.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Differences</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadAsFile(getDiffOutput(), "diff.txt")}
                className="h-8 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(getDiffOutput(), "Diff")}
                className="h-8 px-2"
              >
                <Copy className="h-3 w-3" />
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
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 max-h-[500px] overflow-y-auto font-mono text-sm">
                {diffs.map((line, index) => (
                  <div
                    key={index}
                    className={`px-4 py-1 whitespace-pre ${line.type === 'added'
                        ? 'bg-success/10 text-success border-l-4 border-success'
                        : line.type === 'removed'
                          ? 'bg-destructive/10 text-destructive border-l-4 border-destructive'
                          : 'hover:bg-muted/50'
                      }`}
                  >
                    <span className="inline-block w-12 text-muted-foreground text-xs mr-2">
                      {line.lineNumber1 || line.lineNumber2 || ''}
                    </span>
                    <span className="mr-2">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className="whitespace-pre">{line.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded Input1 Dialog */}
      <Dialog open={expandedInput1} onOpenChange={setExpandedInput1}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Original Text - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(input1, "Original Text")}
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
              placeholder="Enter original text here..."
              minHeight={600}
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
              <span>Modified Text - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(input2, "Modified Text")}
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
              placeholder="Enter modified text here..."
              minHeight={600}
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
              <span>Differences - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadAsFile(getDiffOutput(), "diff.txt")}
                  className="h-8 px-2"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(getDiffOutput(), "Diff")}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
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
            <div className="border rounded-lg overflow-hidden h-full">
              <div className="bg-muted/30 h-full overflow-y-auto font-mono text-sm">
                {diffs.map((line, index) => (
                  <div
                    key={index}
                    className={`px-4 py-1 whitespace-pre ${line.type === 'added'
                        ? 'bg-success/10 text-success border-l-4 border-success'
                        : line.type === 'removed'
                          ? 'bg-destructive/10 text-destructive border-l-4 border-destructive'
                          : 'hover:bg-muted/50'
                      }`}
                  >
                    <span className="inline-block w-12 text-muted-foreground text-xs mr-2">
                      {line.lineNumber1 || line.lineNumber2 || ''}
                    </span>
                    <span className="mr-2">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className="whitespace-pre">{line.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
