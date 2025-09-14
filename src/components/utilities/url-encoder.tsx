import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolLayout } from "@/components/tool-layout";
import { useHistory } from "@/hooks/use-history";

export function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const { addHistoryEntry } = useHistory();

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      let result;
      if (mode === "encode") {
        result = encodeURIComponent(input);
      } else {
        result = decodeURIComponent(input);
      }
      setOutput(result);
      
      addHistoryEntry({
        tool: "URL Encoder",
        operation: mode,
        input: input,
        output: result,
        options: { mode }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
      addHistoryEntry({
        tool: "URL Encoder",
        operation: mode,
        input: input,
        output: "",
        error: errorMsg,
        options: { mode }
      });
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as "encode" | "decode");
    // Auto-process when mode changes
    setTimeout(handleProcess, 0);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          URL Encode / Decode
        </h1>
        <p className="text-muted-foreground">
          Encode URLs for safe transmission or decode URL-encoded strings.
        </p>
      </div>

      <Tabs value={mode} onValueChange={handleModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
        
        <TabsContent value="encode">
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Encode"
            inputPlaceholder='https://example.com/search?q=hello world&type=web'
            outputPlaceholder='URL encoded string will appear here...'
            toolName="URL Encoder"
          />
        </TabsContent>
        
        <TabsContent value="decode">
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Decode"
            inputPlaceholder='https%3A//example.com/search%3Fq%3Dhello%20world%26type%3Dweb'
            outputPlaceholder='URL decoded string will appear here...'
            toolName="URL Encoder"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}