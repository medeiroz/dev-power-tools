import { useState } from "react";
import { ToolLayout } from "./tool-layout";
import { escapeJson } from "@/lib/json-utils";
import { useHistory } from "@/hooks/use-history";

export function JsonEscapeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { addHistoryEntry } = useHistory();

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const result = escapeJson(input);
      setOutput(result);
      
      addHistoryEntry({
        tool: "JSON Escape",
        operation: "escape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
      addHistoryEntry({
        tool: "JSON Escape",
        operation: "escape",
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
      title="JSON Escape"
      description="Escape JSON for embedding in strings by adding necessary backslashes."
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleProcess}
      processLabel="Escape"
      inputPlaceholder='{"message": "Hello \"World\"!\nThis is a test."}'
      outputPlaceholder='Escaped JSON will appear here...'
      toolName="JSON Escape"
    />
  );
}