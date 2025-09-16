import { useState } from "react";
import { ToolLayout } from "./tool-layout";
import { unescapeJson } from "@/lib/json-utils";
import { useHistory } from "@/hooks/use-history";

export function JsonUnescapeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { addHistoryEntry } = useHistory();

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const result = unescapeJson(input);
      setOutput(result);
      
      addHistoryEntry({
        tool: "JSON Unescape",
        operation: "unescape",
        input: input,
        output: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
      addHistoryEntry({
        tool: "JSON Unescape",
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
      title="JSON Unescape"
      description="Unescape JSON from string format by removing escape backslashes."
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleProcess}
      processLabel="Unescape"
      inputPlaceholder='{\"message\": \"Hello \\\"World\\\"!\\nThis is a test.\"}'
      outputPlaceholder='Unescaped JSON will appear here...'
      toolName="JSON Unescape"
    />
  );
}