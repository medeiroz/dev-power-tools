import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download, Shuffle, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRandomJson } from "@/lib/json-utils";
import { CodeEditor } from "@/components/code-editor";

export function JsonGenerator() {
  const [output, setOutput] = useState("");
  const [depth, setDepth] = useState([2, 4]);
  const [arrayLength, setArrayLength] = useState([3, 7]);
  const [objectKeys, setObjectKeys] = useState([3, 7]);
  const [expandedOutput, setExpandedOutput] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    const generated = generateRandomJson({
      depthMin: depth[0],
      depthMax: depth[1],
      arrayLengthMin: arrayLength[0],
      arrayLengthMax: arrayLength[1],
      objectKeysMin: objectKeys[0],
      objectKeysMax: objectKeys[1],
    });
    setOutput(generated);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAsFile = (content: string) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `random-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "JSON file saved successfully",
    });
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
              <Label className="text-sm">Nesting Depth: {depth[0]} - {depth[1]}</Label>
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
              <Label className="text-sm">Array Length: {arrayLength[0]} - {arrayLength[1]}</Label>
              <Slider
                value={arrayLength}
                onValueChange={setArrayLength}
                max={15}
                min={0}
                step={1}
                className="w-full"
                minStepsBetweenThumbs={0}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Object Keys: {objectKeys[0]} - {objectKeys[1]}</Label>
              <Slider
                value={objectKeys}
                onValueChange={setObjectKeys}
                max={15}
                min={1}
                step={1}
                className="w-full"
                minStepsBetweenThumbs={0}
              />
            </div>

            <Button 
              onClick={handleGenerate}
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate
            </Button>
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
                    onClick={() => downloadAsFile(output)}
                    className="h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(output)}
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
              onChange={() => {}} // Read-only
              placeholder="Click 'Generate Random JSON' to create test data..."
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
                  onClick={() => copyToClipboard(output)}
                  disabled={!output}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadAsFile(output)}
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
              onChange={() => {}}
              placeholder="Click 'Generate Random JSON' to create test data..."
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