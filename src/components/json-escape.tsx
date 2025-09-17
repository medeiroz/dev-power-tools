import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "./tool-layout";
import { escapeJson, unescapeJson } from "@/lib/json-utils";
import { useHistory } from "@/hooks/use-history";

export function JsonEscape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { addHistoryEntry } = useHistory();

  const handleEscape = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const result = escapeJson(input);
      setOutput(result);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "escape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "escape",
        input: input,
        output: "",
        error: errorMsg,
      });
    }
  };

  const handleUnescape = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const result = unescapeJson(input);
      setOutput(result);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "unescape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
      addHistoryEntry({
        tool: "JSON Escape/Unescape",
        operation: "unescape",
        input: input,
        output: "",
        error: errorMsg,
      });
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolLayout
      title="JSON Escape/Unescape"
      description="Escape JSON for embedding in strings or unescape JSON from string format."
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleEscape}
      processLabel="Escape"
      inputPlaceholder='{"message": "Hello \"World\"!\nThis is a test."}'
      outputPlaceholder='Escaped/Unescaped JSON will appear here...'
      toolName="JSON Escape/Unescape"
    >
      <div className="flex gap-2 mt-4 px-6">
        <Button 
          onClick={handleUnescape}
          variant="outline"
        >
          Unescape
        </Button>
      </div>
    </ToolLayout>
  );
}