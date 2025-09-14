import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolLayout } from "@/components/tool-layout";
import { timestampToDate, dateToTimestamp } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export function TimestampConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"toDate" | "toTimestamp">("toDate");
  const { addHistoryEntry } = useHistory();

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      let result;
      if (mode === "toDate") {
        const timestampResult = timestampToDate(input.trim());
        if (timestampResult.error) {
          throw new Error(timestampResult.error);
        }
        result = timestampResult.result;
      } else {
        const dateResult = dateToTimestamp(input.trim());
        if (dateResult.error) {
          throw new Error(dateResult.error);
        }
        result = dateResult.result;
      }
      setOutput(result);
      
      addHistoryEntry({
        tool: "Timestamp Converter",
        operation: mode,
        input: input,
        output: result,
        options: { mode }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
      addHistoryEntry({
        tool: "Timestamp Converter",
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
    setMode(newMode as "toDate" | "toTimestamp");
  };

  const insertCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    if (mode === "toDate") {
      setInput(now.toString());
    } else {
      setInput(new Date().toISOString());
    }
  };

  const currentTimeButton = (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={insertCurrentTimestamp}
      className="mb-2"
    >
      <Clock className="h-4 w-4 mr-2" />
      Use Current Time
    </Button>
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Unix Timestamp Converter
        </h1>
        <p className="text-muted-foreground">
          Convert between Unix timestamps and human-readable dates.
        </p>
      </div>

      <Tabs value={mode} onValueChange={handleModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="toDate">Timestamp → Date</TabsTrigger>
          <TabsTrigger value="toTimestamp">Date → Timestamp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="toDate">
          <div className="mb-4">{currentTimeButton}</div>
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Convert to Date"
            inputPlaceholder="1234567890"
            outputPlaceholder="Human-readable date will appear here..."
            toolName="Timestamp Converter"
          />
        </TabsContent>
        
        <TabsContent value="toTimestamp">
          <div className="mb-4">{currentTimeButton}</div>
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Convert to Timestamp"
            inputPlaceholder="2024-01-01T00:00:00.000Z"
            outputPlaceholder="Unix timestamp will appear here..."
            toolName="Timestamp Converter"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}