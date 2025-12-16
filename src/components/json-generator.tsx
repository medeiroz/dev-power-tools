import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Download, Shuffle, Maximize2, Minimize2, Trash2, Info, Loader2, HelpCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRandomJson } from "@/lib/json-utils";
import { CodeEditor } from "@/components/code-editor";
import { useHistory } from "@/hooks/use-history";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { downloadAsFile } from "@/lib/download-utils";
import { createToastHelper } from "@/lib/toast-utils";

const PREFERENCES_KEY = 'dev-power-tools-preferences';
const MODULE_KEY = 'json-generator';

interface GeneratorSettings {
  depth: [number, number];
  arrayLength: [number, number];
  objectKeys: [number, number];
  includeNulls: boolean;
  includeDates: boolean;
  includeNumbers: boolean;
  includeStrings: boolean;
  includeBooleans: boolean;
}

interface AppPreferences {
  [key: string]: any;
  'json-generator'?: GeneratorSettings;
}

const getDefaultSettings = (): GeneratorSettings => ({
  depth: [1, 3],
  arrayLength: [1, 2],
  objectKeys: [1, 5],
  includeNulls: true,
  includeDates: true,
  includeNumbers: true,
  includeStrings: true,
  includeBooleans: true,
});

const loadSettings = (): GeneratorSettings => {
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

const saveSettings = (settings: GeneratorSettings) => {
  try {
    const preferencesStr = localStorage.getItem(PREFERENCES_KEY);
    const preferences: AppPreferences = preferencesStr ? JSON.parse(preferencesStr) : {};
    preferences[MODULE_KEY] = settings;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export function JsonGenerator() {
  const savedSettings = loadSettings();

  const [output, setOutput] = useState(() => {
    // Generate initial JSON on component mount
    try {
      return generateRandomJson({
        depthMin: savedSettings.depth[0],
        depthMax: savedSettings.depth[1],
        arrayLengthMin: savedSettings.arrayLength[0],
        arrayLengthMax: savedSettings.arrayLength[1],
        objectKeysMin: savedSettings.objectKeys[0],
        objectKeysMax: savedSettings.objectKeys[1],
        includeNulls: savedSettings.includeNulls,
        includeDates: savedSettings.includeDates,
        includeNumbers: savedSettings.includeNumbers,
        includeStrings: savedSettings.includeStrings,
        includeBooleans: savedSettings.includeBooleans,
      });
    } catch (error) {
      console.error('Error generating initial JSON:', error);
      return '{}';
    }
  });
  const [depth, setDepth] = useState(savedSettings.depth);
  const [arrayLength, setArrayLength] = useState(savedSettings.arrayLength);
  const [objectKeys, setObjectKeys] = useState(savedSettings.objectKeys);
  const [includeNulls, setIncludeNulls] = useState(savedSettings.includeNulls);
  const [includeDates, setIncludeDates] = useState(savedSettings.includeDates);
  const [includeNumbers, setIncludeNumbers] = useState(savedSettings.includeNumbers);
  const [includeStrings, setIncludeStrings] = useState(savedSettings.includeStrings);
  const [includeBooleans, setIncludeBooleans] = useState(savedSettings.includeBooleans);
  const [expandedOutput, setExpandedOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const toastHelper = createToastHelper(toast);
  const { addHistoryEntry } = useHistory();

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings({
      depth,
      arrayLength,
      objectKeys,
      includeNulls,
      includeDates,
      includeNumbers,
      includeStrings,
      includeBooleans,
    });
  }, [depth, arrayLength, objectKeys, includeNulls, includeDates, includeNumbers, includeStrings, includeBooleans]);

  const handleGenerate = async () => {
    // Validate ranges
    if (depth[0] > depth[1]) {
      toast({
        title: "Invalid Range",
        description: "Depth minimum cannot be greater than maximum",
        variant: "destructive",
      });
      return;
    }
    if (arrayLength[0] > arrayLength[1]) {
      toast({
        title: "Invalid Range",
        description: "Array length minimum cannot be greater than maximum",
        variant: "destructive",
      });
      return;
    }
    if (objectKeys[0] > objectKeys[1]) {
      toast({
        title: "Invalid Range",
        description: "Object keys minimum cannot be greater than maximum",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simular pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 100));

      const generated = generateRandomJson({
        depthMin: depth[0],
        depthMax: depth[1],
        arrayLengthMin: arrayLength[0],
        arrayLengthMax: arrayLength[1],
        objectKeysMin: objectKeys[0],
        objectKeysMax: objectKeys[1],
        includeNulls,
        includeDates,
        includeNumbers,
        includeStrings,
        includeBooleans,
      });
      setOutput(generated);

      addHistoryEntry({
        tool: "Random JSON Generator",
        operation: "generate",
        input: `Depth: ${depth[0]}-${depth[1]}, Arrays: ${arrayLength[0]}-${arrayLength[1]}, Keys: ${objectKeys[0]}-${objectKeys[1]}`,
        output: generated,
      });
    } finally {
      setIsGenerating(false);
    }

    setIsGenerating(false);
  };

  const handleClear = () => {
    setOutput("{}");
  };

  const handleResetSettings = () => {
    const defaults = getDefaultSettings();
    setDepth(defaults.depth);
    setArrayLength(defaults.arrayLength);
    setObjectKeys(defaults.objectKeys);
    setIncludeNulls(defaults.includeNulls);
    setIncludeDates(defaults.includeDates);
    setIncludeNumbers(defaults.includeNumbers);
    setIncludeStrings(defaults.includeStrings);
    setIncludeBooleans(defaults.includeBooleans);

    toast({
      title: "Settings Reset",
      description: "All options have been restored to default values",
    });
  };

  const handleCopyToClipboard = async (text: string) => {
    const result = await copyToClipboard(text);
    if (result.success) {
      toastHelper.copySuccess("JSON");
    } else {
      toastHelper.copyError();
    }
  };

  const handleDownloadAsFile = (content: string) => {
    try {
      downloadAsFile(content, `random-data-${Date.now()}.json`);
      toastHelper.downloadSuccess("random-data.json");
    } catch (error) {
      toastHelper.downloadError();
    }
  };

  const getEnabledTypesCount = () => {
    return [includeNulls, includeDates, includeNumbers, includeStrings, includeBooleans].filter(Boolean).length;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Random JSON Generator
        </h1>
        <p className="text-muted-foreground">
          Generate random JSON data for testing and development purposes.
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Nesting Depth</Label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Controls how many levels deep the JSON structure can be. Example: depth 1 = {'{'}a: 1{'}'}, depth 2 = {'{'}a: {'{'}b: 1{'}'}{'}'}.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {depth[0]} - {depth[1]}
                </Badge>
              </div>
              <Slider
                value={depth}
                onValueChange={setDepth}
                max={6}
                min={1}
                step={1}
                className="w-full"
                minStepsBetweenThumbs={0}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Array Length</Label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Defines the minimum and maximum number of items that will be generated inside arrays. Lower values create simpler, more compact arrays.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {arrayLength[0]} - {arrayLength[1]}
                </Badge>
              </div>
              <Slider
                value={arrayLength}
                onValueChange={setArrayLength}
                max={20}
                min={0}
                step={1}
                className="w-full"
                minStepsBetweenThumbs={0}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Object Keys</Label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Specifies how many properties (key-value pairs) each generated object will have. Example: 3 keys = {'{'}name: "...", email: "...", age: 25{'}'}.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {objectKeys[0]} - {objectKeys[1]}
                </Badge>
              </div>
              <Slider
                value={objectKeys}
                onValueChange={setObjectKeys}
                max={20}
                min={1}
                step={1}
                className="w-full"
                minStepsBetweenThumbs={0}
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Data Types</Label>
                <Badge variant="outline" className="text-xs">
                  {getEnabledTypesCount()}/5 enabled
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-strings" className="text-sm font-normal">Strings</Label>
                  <Switch
                    id="include-strings"
                    checked={includeStrings}
                    onCheckedChange={setIncludeStrings}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-numbers" className="text-sm font-normal">Numbers</Label>
                  <Switch
                    id="include-numbers"
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-booleans" className="text-sm font-normal">Booleans</Label>
                  <Switch
                    id="include-booleans"
                    checked={includeBooleans}
                    onCheckedChange={setIncludeBooleans}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-dates" className="text-sm font-normal">Dates (ISO)</Label>
                  <Switch
                    id="include-dates"
                    checked={includeDates}
                    onCheckedChange={setIncludeDates}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-nulls" className="text-sm font-normal">Nulls</Label>
                  <Switch
                    id="include-nulls"
                    checked={includeNulls}
                    onCheckedChange={setIncludeNulls}
                  />
                </div>
              </div>

              {getEnabledTypesCount() === 0 && (
                <div className="flex items-start gap-2 p-2 bg-warning/10 border border-warning/20 rounded-md">
                  <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-warning">
                    At least one data type must be enabled
                  </p>
                </div>
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
                disabled={getEnabledTypesCount() === 0 || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shuffle className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={!output}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Generated JSON</CardTitle>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedOutput(true)}
                    className="h-8 px-2"
                    title="Maximize"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={output}
              onChange={() => { }} // Read-only
              placeholder="Click 'Generate' to create random JSON data..."
              minHeight={400}
              language="json"
              wrapLines={true}
              readOnly
            />
          </CardContent>
        </Card>
      </div>

      {/* Expanded Output Dialog */}
      <Dialog open={expandedOutput} onOpenChange={setExpandedOutput}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Generated JSON - Maximized</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(output)}
                  disabled={!output}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadAsFile(output)}
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
              onChange={() => { }}
              placeholder="Click 'Generate' to create random JSON data..."
              minHeight={600}
              language="json"
              wrapLines={true}
              readOnly
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}