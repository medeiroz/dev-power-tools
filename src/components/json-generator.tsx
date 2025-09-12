import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRandomJson } from "@/lib/json-utils";

export function JsonGenerator() {
  const [output, setOutput] = useState("");
  const [depth, setDepth] = useState([3]);
  const [arrayLength, setArrayLength] = useState([5]);
  const [objectKeys, setObjectKeys] = useState([5]);
  const { toast } = useToast();

  const handleGenerate = () => {
    const generated = generateRandomJson({
      depth: depth[0],
      arrayLength: arrayLength[0],
      objectKeys: objectKeys[0],
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
              <Label className="text-sm">Nesting Depth: {depth[0]}</Label>
              <Slider
                value={depth}
                onValueChange={setDepth}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Max Array Length: {arrayLength[0]}</Label>
              <Slider
                value={arrayLength}
                onValueChange={setArrayLength}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Max Object Keys: {objectKeys[0]}</Label>
              <Slider
                value={objectKeys}
                onValueChange={setObjectKeys}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate Random JSON
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
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              placeholder="Click 'Generate Random JSON' to create test data..."
              className="min-h-[400px] font-mono text-sm bg-code-bg resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}