import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolLayout } from "./tool-layout";
import { escapeJson, unescapeJson } from "@/lib/json-utils";

export function JsonEscape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "escape") {
        setOutput(escapeJson(input));
      } else {
        setOutput(unescapeJson(input));
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as "escape" | "unescape");
    // Auto-process when mode changes
    setTimeout(handleProcess, 0);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          JSON Escape / Unescape
        </h1>
        <p className="text-muted-foreground">
          Escape JSON for embedding in strings or unescape JSON from string format.
        </p>
      </div>

      <Tabs value={mode} onValueChange={handleModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="escape">Escape</TabsTrigger>
          <TabsTrigger value="unescape">Unescape</TabsTrigger>
        </TabsList>
        
        <TabsContent value="escape">
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Escape"
            inputPlaceholder='{"message": "Hello \"World\"!\nThis is a test."}'
            outputPlaceholder='Escaped JSON will appear here...'
          />
        </TabsContent>
        
        <TabsContent value="unescape">
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Unescape"
            inputPlaceholder='{\"message\": \"Hello \\\"World\\\"!\\nThis is a test.\"}'
            outputPlaceholder='Unescaped JSON will appear here...'
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}