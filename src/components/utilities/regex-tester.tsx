import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/code-editor";
import { useToast } from "@/hooks/use-toast";
import { createToastHelper } from "@/lib/toast-utils";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { useHistory } from "@/hooks/use-history";
import { 
  Copy, 
  Trash2, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

interface RegexFlags {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}

const commonPatterns = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { name: "URL", pattern: "https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&'()*+,;=%]+" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "Phone (BR)", pattern: "\\(?\\d{2}\\)?[\\s.-]?9?\\d{4}[\\s.-]?\\d{4}" },
  { name: "CPF", pattern: "\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}" },
  { name: "CNPJ", pattern: "\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2}" },
  { name: "Date (DD/MM/YYYY)", pattern: "\\d{2}/\\d{2}/\\d{4}" },
  { name: "Time (HH:MM)", pattern: "\\b([01]?\\d|2[0-3]):[0-5]\\d\\b" },
  { name: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b" },
  { name: "UUID", pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" },
];

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  });
  const [expandedInput, setExpandedInput] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(false);
  
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);
  const { addHistoryEntry } = useHistory();

  const getFlagsString = () => {
    let flagStr = "";
    if (flags.global) flagStr += "g";
    if (flags.ignoreCase) flagStr += "i";
    if (flags.multiline) flagStr += "m";
    if (flags.dotAll) flagStr += "s";
    if (flags.unicode) flagStr += "u";
    if (flags.sticky) flagStr += "y";
    return flagStr;
  };

  const { regex, error, matches, highlightedText } = useMemo(() => {
    if (!pattern) {
      return { regex: null, error: null, matches: [], highlightedText: testString };
    }

    try {
      const flagStr = getFlagsString();
      const regex = new RegExp(pattern, flagStr);
      const matches: RegexMatch[] = [];
      
      if (flags.global) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      // Create highlighted text
      let highlighted = testString;
      if (matches.length > 0 && testString) {
        const parts: string[] = [];
        let lastIndex = 0;
        
        // Sort matches by index
        const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
        
        for (const m of sortedMatches) {
          if (m.index >= lastIndex) {
            parts.push(testString.slice(lastIndex, m.index));
            parts.push(`【${m.match}】`);
            lastIndex = m.index + m.match.length;
          }
        }
        parts.push(testString.slice(lastIndex));
        highlighted = parts.join("");
      }

      return { regex, error: null, matches, highlightedText: highlighted };
    } catch (e) {
      return { 
        regex: null, 
        error: e instanceof Error ? e.message : "Invalid regex", 
        matches: [], 
        highlightedText: testString 
      };
    }
  }, [pattern, testString, flags]);

  useEffect(() => {
    if (pattern && testString && !error) {
      const timer = setTimeout(() => {
        addHistoryEntry({
          tool: "Regex Tester",
          operation: "test",
          input: `Pattern: ${pattern}\nFlags: ${getFlagsString()}\nTest: ${testString}`,
          output: `${matches.length} match(es) found`,
          options: { pattern, flags: getFlagsString(), matchCount: matches.length }
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pattern, testString, flags, matches.length, error]);

  const handleCopy = async (text: string, label: string) => {
    const result = await copyToClipboard(text);
    if (result.success) {
      toastHelper.copySuccess(label);
    } else {
      toastHelper.copyError();
    }
  };

  const handleClear = () => {
    setPattern("");
    setTestString("");
  };

  const handlePatternSelect = (selectedPattern: string) => {
    setPattern(selectedPattern);
  };

  const formatMatchesOutput = () => {
    if (!matches.length) return "";
    return matches.map((m, i) => {
      let result = `Match ${i + 1}: "${m.match}" at index ${m.index}`;
      if (m.groups.length > 0) {
        result += `\n  Groups: ${m.groups.map((g, gi) => `$${gi + 1}: "${g}"`).join(", ")}`;
      }
      return result;
    }).join("\n");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Regex Tester</h1>
        <p className="text-muted-foreground">
          Test and debug regular expressions with real-time matching and highlighting
        </p>
      </div>

      {/* Pattern Input */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Pattern</CardTitle>
              <CardDescription>Enter your regular expression</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {error ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Invalid
                </Badge>
              ) : pattern ? (
                <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Valid
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</div>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="font-mono pl-6 pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                /{getFlagsString()}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(`/${pattern}/${getFlagsString()}`, "Pattern")}
              disabled={!pattern}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Flags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Flags</Label>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "global", label: "g", desc: "Global - Find all matches" },
                { key: "ignoreCase", label: "i", desc: "Case insensitive" },
                { key: "multiline", label: "m", desc: "Multiline - ^ and $ match line boundaries" },
                { key: "dotAll", label: "s", desc: "Dot All - . matches newlines" },
                { key: "unicode", label: "u", desc: "Unicode" },
                { key: "sticky", label: "y", desc: "Sticky - Match from lastIndex only" },
              ].map(({ key, label, desc }) => (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={flags[key as keyof RegexFlags]}
                        onCheckedChange={(checked) =>
                          setFlags((prev) => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm font-mono cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{desc}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Common Patterns */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              Common Patterns
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to use a common pattern</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((p) => (
                <Button
                  key={p.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePatternSelect(p.pattern)}
                  className="text-xs"
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test String Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Test String</CardTitle>
                <CardDescription>Enter text to test against the pattern</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandedInput(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={testString}
              onChange={setTestString}
              language="text"
              placeholder="Enter test string..."
              minHeight="200px"
              maxHeight="300px"
            />
          </CardContent>
        </Card>

        {/* Highlighted Output */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Highlighted Matches</CardTitle>
                <CardDescription>
                  {matches.length > 0 
                    ? `${matches.length} match${matches.length > 1 ? "es" : ""} found`
                    : "No matches"
                  }
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandedOutput(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="min-h-[200px] max-h-[300px] overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-sm whitespace-pre-wrap"
            >
              {testString ? (
                highlightedText.split(/【|】/).map((part, index) => {
                  // Odd indexes are matched parts (between 【 and 】)
                  if (index % 2 === 1) {
                    return (
                      <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 text-foreground px-0.5 rounded">
                        {part}
                      </mark>
                    );
                  }
                  return <span key={index}>{part}</span>;
                })
              ) : (
                <span className="text-muted-foreground">Matches will be highlighted here...</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Details */}
      {matches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Match Details</CardTitle>
                <CardDescription>Detailed information about each match</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(formatMatchesOutput(), "Match details")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {matches.map((match, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-md bg-muted/50 border border-border"
                >
                  <Badge variant="outline" className="shrink-0">
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Match:</span>
                      <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">
                        {match.match}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Index:</span>
                      <span className="text-sm font-mono">{match.index}</span>
                    </div>
                    {match.groups.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-muted-foreground">Groups:</span>
                        <div className="flex flex-wrap gap-1">
                          {match.groups.map((group, gi) => (
                            <Badge key={gi} variant="secondary" className="font-mono text-xs">
                              ${gi + 1}: {group}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopy(match.match, `Match #${index + 1}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded Input Dialog */}
      <Dialog open={expandedInput} onOpenChange={setExpandedInput}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Test String</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeEditor
              value={testString}
              onChange={setTestString}
              language="text"
              placeholder="Enter test string..."
              minHeight="100%"
              maxHeight="calc(80vh - 120px)"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setExpandedInput(false)}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minimize
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Output Dialog */}
      <Dialog open={expandedOutput} onOpenChange={setExpandedOutput}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Highlighted Matches ({matches.length} match{matches.length !== 1 ? "es" : ""})
            </DialogTitle>
          </DialogHeader>
          <div 
            className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-sm whitespace-pre-wrap"
            style={{ maxHeight: "calc(80vh - 160px)" }}
          >
            {testString ? (
              highlightedText.split(/【|】/).map((part, index) => {
                if (index % 2 === 1) {
                  return (
                    <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 text-foreground px-0.5 rounded">
                      {part}
                    </mark>
                  );
                }
                return <span key={index}>{part}</span>;
              })
            ) : (
              <span className="text-muted-foreground">Matches will be highlighted here...</span>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => handleCopy(testString, "Test string")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={() => setExpandedOutput(false)}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Minimize
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
