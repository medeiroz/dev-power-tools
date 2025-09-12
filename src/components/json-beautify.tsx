import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToolLayout } from "./tool-layout";
import { beautifyJson } from "@/lib/json-utils";

export function JsonBeautify() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [recursive, setRecursive] = useState(false);
  const [indent, setIndent] = useState([2]);
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState("");

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(undefined);
      setError("");
      return;
    }

    const result = beautifyJson(input, { 
      indent: indent[0], 
      recursive 
    });

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
  }, [input, recursive, indent]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setIsValid(undefined);
    setError("");
  };

  const options = (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="recursive"
          checked={recursive}
          onCheckedChange={setRecursive}
        />
        <Label htmlFor="recursive" className="text-sm">
          Recursive beautify (parse nested JSON strings)
        </Label>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm">Indentation: {indent[0]} spaces</Label>
        <Slider
          value={indent}
          onValueChange={setIndent}
          max={8}
          min={2}
          step={2}
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="JSON Beautify"
      description="Format and prettify JSON with proper indentation and structure. Enable recursive mode to parse nested JSON strings."
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleProcess}
      processLabel="Beautify"
      isValid={isValid}
      error={error}
      inputPlaceholder='{"name":"John","age":30,"city":"New York"}'
      options={options}
    />
  );
}