import { useState, useEffect } from "react";
import { ToolLayout } from "./tool-layout";
import { minifyJson } from "@/lib/json-utils";

export function JsonMinify() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState("");

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(undefined);
      setError("");
      return;
    }

    const result = minifyJson(input);

    if (result.success) {
      setOutput(result.data || "");
      setIsValid(true);
      setError("");
    } else {
      setOutput("");
      setIsValid(false);
      setError(result.error || "Unknown error");
    }
  };

  // Auto-process on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        handleProcess();
      } else {
        setOutput("");
        setIsValid(undefined);
        setError("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setIsValid(undefined);
    setError("");
  };

  return (
    <ToolLayout
      title="JSON Minify"
      description="Remove all unnecessary whitespace and formatting from JSON to create a compact version."
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleProcess}
      processLabel="Minify"
      isValid={isValid}
      error={error}
      inputPlaceholder={`{
  "name": "John",
  "age": 30,
  "city": "New York"
}`}
    />
  );
}