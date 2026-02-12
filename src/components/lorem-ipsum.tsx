import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Copy, Download, Shuffle, Trash2, HelpCircle, RotateCcw, Loader2, History, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/code-editor";
import { useHistory } from "@/hooks/use-history";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { downloadAsFile } from "@/lib/download-utils";
import { createToastHelper } from "@/lib/toast-utils";
import { faker } from '@faker-js/faker';

const PREFERENCES_KEY = 'dev-power-tools-preferences';
const MODULE_KEY = 'lorem-ipsum';

type UnitType = 'words' | 'sentences' | 'paragraphs';
type FormatType = 'plain' | 'markdown' | 'html';
type LocaleType = 'en' | 'pt_BR' | 'es' | 'fr' | 'de';

interface LoremSettings {
  unitType: UnitType;
  quantity: number;
  format: FormatType;
  locale: LocaleType;
  startWithLorem: boolean;
  includeHeadings: boolean;
  includeLists: boolean;
  includeEmphasis: boolean;
}

interface AppPreferences {
  [key: string]: any;
  'lorem-ipsum'?: LoremSettings;
}

const getDefaultSettings = (): LoremSettings => ({
  unitType: 'paragraphs',
  quantity: 3,
  format: 'plain',
  locale: 'en',
  startWithLorem: true,
  includeHeadings: false,
  includeLists: false,
  includeEmphasis: false,
});

const loadSettings = (): LoremSettings => {
  try {
    const preferencesStr = localStorage.getItem(PREFERENCES_KEY);
    if (preferencesStr) {
      const preferences: AppPreferences = JSON.parse(preferencesStr);
      if (preferences[MODULE_KEY]) {
        return { ...getDefaultSettings(), ...preferences[MODULE_KEY] };
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return getDefaultSettings();
};

const saveSettings = (settings: LoremSettings) => {
  try {
    const preferencesStr = localStorage.getItem(PREFERENCES_KEY);
    const preferences: AppPreferences = preferencesStr ? JSON.parse(preferencesStr) : {};
    preferences[MODULE_KEY] = settings;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

const localeMap: Record<LocaleType, any> = {
  'en': faker,
  'pt_BR': faker,
  'es': faker,
  'fr': faker,
  'de': faker,
};

const localeNames: Record<LocaleType, string> = {
  'en': 'English',
  'pt_BR': 'Português (Brasil)',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
};

export function LoremIpsum() {
  const savedSettings = loadSettings();

  const [output, setOutput] = useState("");
  const [unitType, setUnitType] = useState<UnitType>(savedSettings.unitType);
  const [quantity, setQuantity] = useState(savedSettings.quantity);
  const [format, setFormat] = useState<FormatType>(savedSettings.format);
  const [locale, setLocale] = useState<LocaleType>(savedSettings.locale);
  const [startWithLorem, setStartWithLorem] = useState(savedSettings.startWithLorem);
  const [includeHeadings, setIncludeHeadings] = useState(savedSettings.includeHeadings);
  const [includeLists, setIncludeLists] = useState(savedSettings.includeLists);
  const [includeEmphasis, setIncludeEmphasis] = useState(savedSettings.includeEmphasis);
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(20);

  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);
  const { addHistoryEntry, getHistoryByTool } = useHistory();
  
  const toolHistory = getHistoryByTool("Lorem Ipsum Generator");
  const visibleHistory = toolHistory.slice(0, historyLimit);
  const hasMoreHistory = toolHistory.length > historyLimit;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setHistoryOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings({
      unitType,
      quantity,
      format,
      locale,
      startWithLorem,
      includeHeadings,
      includeLists,
      includeEmphasis,
    });
  }, [unitType, quantity, format, locale, startWithLorem, includeHeadings, includeLists, includeEmphasis]);

  const generateLoremIpsum = (): string => {
    const fakerInstance = localeMap[locale];

    let content: string[] = [];

    switch (unitType) {
      case 'words':
        const words = fakerInstance.lorem.words(quantity);
        content = [startWithLorem && locale === 'en' ? `Lorem ipsum ${words}` : words];
        break;

      case 'sentences':
        for (let i = 0; i < quantity; i++) {
          const sentence = fakerInstance.lorem.sentence();
          if (i === 0 && startWithLorem && locale === 'en') {
            content.push(`Lorem ipsum dolor sit amet, ${sentence.toLowerCase()}`);
          } else {
            content.push(sentence);
          }
        }
        break;

      case 'paragraphs':
        for (let i = 0; i < quantity; i++) {
          const paragraph = fakerInstance.lorem.paragraph();
          if (i === 0 && startWithLorem && locale === 'en') {
            content.push(`Lorem ipsum dolor sit amet, ${paragraph.toLowerCase()}`);
          } else {
            content.push(paragraph);
          }
        }
        break;
    }

    return formatContent(content);
  };

  const formatContent = (content: string[]): string => {
    switch (format) {
      case 'plain':
        return unitType === 'words'
          ? content.join(' ')
          : content.join('\n\n');

      case 'markdown':
        let md = '';

        if (includeHeadings && unitType === 'paragraphs') {
          content.forEach((para, idx) => {
            if (idx % 2 === 0 && idx > 0) {
              md += `\n\n## ${faker.lorem.words(3)}\n\n`;
            }

            let paragraph = para;

            if (includeEmphasis) {
              const sentences = paragraph.split('. ');
              paragraph = sentences.map((sent, i) => {
                if (i === 0 && Math.random() > 0.5) {
                  const words = sent.split(' ');
                  const emphWord = words[Math.floor(Math.random() * words.length)];
                  return sent.replace(emphWord, `**${emphWord}**`);
                }
                return sent;
              }).join('. ');
            }

            md += paragraph + '\n\n';
          });

          if (includeLists) {
            md += '\n### Key Points:\n\n';
            for (let i = 0; i < 4; i++) {
              md += `- ${faker.lorem.sentence()}\n`;
            }
          }
        } else {
          md = content.map((item, idx) => {
            let text = item;
            if (includeEmphasis && Math.random() > 0.5) {
              const words = text.split(' ');
              const emphWord = words[Math.floor(Math.random() * words.length)];
              text = text.replace(emphWord, `**${emphWord}**`);
            }
            return text;
          }).join('\n\n');
        }

        return md.trim();

      case 'html':
        let html = '';

        if (includeHeadings && unitType === 'paragraphs') {
          content.forEach((para, idx) => {
            if (idx % 2 === 0 && idx > 0) {
              html += `<h2>${faker.lorem.words(3)}</h2>\n`;
            }

            let paragraph = para;

            if (includeEmphasis) {
              const sentences = paragraph.split('. ');
              paragraph = sentences.map((sent, i) => {
                if (i === 0 && Math.random() > 0.5) {
                  const words = sent.split(' ');
                  const emphWord = words[Math.floor(Math.random() * words.length)];
                  return sent.replace(emphWord, `<strong>${emphWord}</strong>`);
                }
                return sent;
              }).join('. ');
            }

            html += `<p>${paragraph}</p>\n`;
          });

          if (includeLists) {
            html += '<h3>Key Points:</h3>\n<ul>\n';
            for (let i = 0; i < 4; i++) {
              html += `  <li>${faker.lorem.sentence()}</li>\n`;
            }
            html += '</ul>\n';
          }
        } else {
          html = content.map((item) => {
            let text = item;
            if (includeEmphasis && Math.random() > 0.5) {
              const words = text.split(' ');
              const emphWord = words[Math.floor(Math.random() * words.length)];
              text = text.replace(emphWord, `<strong>${emphWord}</strong>`);
            }

            if (unitType === 'paragraphs') {
              return `<p>${text}</p>`;
            }
            return text;
          }).join('\n');
        }

        return html.trim();

      default:
        return content.join('\n\n');
    }
  };

  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 100) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be between 1 and 100",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const generated = generateLoremIpsum();
      setOutput(generated);

      addHistoryEntry({
        tool: "Lorem Ipsum Generator",
        operation: "generate",
        input: `${quantity} ${unitType} (${localeNames[locale]}, ${format})`,
        output: generated,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setOutput("");
  };

  const handleResetSettings = () => {
    const defaults = getDefaultSettings();
    setUnitType(defaults.unitType);
    setQuantity(defaults.quantity);
    setFormat(defaults.format);
    setLocale(defaults.locale);
    setStartWithLorem(defaults.startWithLorem);
    setIncludeHeadings(defaults.includeHeadings);
    setIncludeLists(defaults.includeLists);
    setIncludeEmphasis(defaults.includeEmphasis);

    toast({
      title: "Settings Reset",
      description: "All options have been restored to default values",
    });
  };

  const handleCopyToClipboard = async (text: string) => {
    const result = await copyToClipboard(text);
    if (result.success) {
      toastHelper.copySuccess("Lorem Ipsum");
    } else {
      toastHelper.copyError();
    }
  };

  const handleDownloadAsFile = (content: string) => {
    try {
      const extension = format === 'html' ? 'html' : format === 'markdown' ? 'md' : 'txt';
      downloadAsFile(content, `lorem-ipsum-${Date.now()}.${extension}`);
      toastHelper.downloadSuccess(`lorem-ipsum.${extension}`);
    } catch (error) {
      toastHelper.downloadError();
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Lorem Ipsum Generator
          </h1>
          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <History className="h-4 w-4" />
                History
                {toolHistory.length > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    {toolHistory.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">History</h2>
                  <Badge variant="secondary">{toolHistory.length} items</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Recent operations (showing {visibleHistory.length} of {toolHistory.length})</p>
                {toolHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleHistory.map((entry, index) => (
                      <Card key={index} className="p-4 hover:bg-accent/50 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {entry.tool}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {entry.input && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="text-xs font-medium text-muted-foreground">Settings:</div>
                                    </div>
                                    <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto max-h-16">
                                      {typeof entry.input === 'string' ? entry.input : JSON.stringify(entry.input, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {entry.output && (
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="text-xs font-medium text-muted-foreground">Output:</div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          clipboardHelper.copyToClipboard(
                                            typeof entry.output === 'string' ? entry.output : JSON.stringify(entry.output, null, 2)
                                          );
                                        }}
                                        className="h-6 px-2 gap-1"
                                      >
                                        <Copy className="h-3 w-3" />
                                        Copy
                                      </Button>
                                    </div>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-20">
                                      {typeof entry.output === 'string' 
                                        ? (entry.output.length > 300 ? entry.output.substring(0, 300) + "..." : entry.output)
                                        : JSON.stringify(entry.output, null, 2).substring(0, 300) + "..."}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {hasMoreHistory && (
                      <div className="text-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryLimit(prev => prev + 20)}
                        >
                          Load More ({toolHistory.length - historyLimit} remaining)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Generate placeholder text in multiple languages and formats for your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generation Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Language</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Select the language for generated text. Note: Lorem Ipsum is Latin-based placeholder text.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={locale} onValueChange={(value) => setLocale(value as LocaleType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(localeNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Unit Type</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Choose what to generate: individual words, complete sentences, or full paragraphs.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={unitType} onValueChange={(value) => setUnitType(value as UnitType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Quantity</Label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Number of units to generate (1-100).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {quantity}
                </Badge>
              </div>
              <Input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Output Format</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Choose how the text should be formatted: plain text, Markdown, or HTML.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={format} onValueChange={(value) => setFormat(value as FormatType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">Plain Text</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Label className="text-sm font-medium">Text Options</Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="start-lorem" className="text-sm font-normal">
                  Start with "Lorem ipsum"
                </Label>
                <Switch
                  id="start-lorem"
                  checked={startWithLorem}
                  onCheckedChange={setStartWithLorem}
                  disabled={locale !== 'en'}
                />
              </div>

              {format !== 'plain' && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-headings" className="text-sm font-normal">
                      Include Headings
                    </Label>
                    <Switch
                      id="include-headings"
                      checked={includeHeadings}
                      onCheckedChange={setIncludeHeadings}
                      disabled={unitType !== 'paragraphs'}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-lists" className="text-sm font-normal">
                      Include Lists
                    </Label>
                    <Switch
                      id="include-lists"
                      checked={includeLists}
                      onCheckedChange={setIncludeLists}
                      disabled={unitType !== 'paragraphs'}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-emphasis" className="text-sm font-normal">
                      Add Emphasis (bold)
                    </Label>
                    <Switch
                      id="include-emphasis"
                      checked={includeEmphasis}
                      onCheckedChange={setIncludeEmphasis}
                    />
                  </div>
                </>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="w-full"
              size="sm"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Reset to Defaults
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shuffle className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              <Button variant="outline" onClick={handleClear} disabled={!output}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Generated Text</CardTitle>
            <div className="flex gap-2">
              {output && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAsFile(output)}
                    className="h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(output)}
                    className="h-8 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={output}
              onChange={setOutput}
              language={format === 'html' ? 'html' : format === 'markdown' ? 'markdown' : 'text'}
              placeholder="Click 'Generate' to create Lorem Ipsum text..."
              minHeight="500px"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
