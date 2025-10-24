import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToolLayout } from "./tool-layout";
import { beautifyJson } from "@/lib/json-utils";
import { useHistory } from "@/hooks/use-history";

export function JsonBeautify() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [recursive, setRecursive] = useState(true);
  const [indent, setIndent] = useState([2]);
  const [indentType, setIndentType] = useState<'space' | 'tab'>('space');
  const [wrapLines, setWrapLines] = useState(true);
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState("");
  const { addHistoryEntry } = useHistory();
  const outputRef = useRef<HTMLDivElement>(null);

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(undefined);
      setError("");
      return;
    }

    const result = beautifyJson(input, { 
      indent: indent[0], 
      recursive,
      indentType
    });

    if (result.success) {
      setOutput(result.data || "");
      setIsValid(true);
      setError("");
      
      // Scroll to output section
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      addHistoryEntry({
        tool: "JSON Beautify",
        operation: "beautify",
        input: input,
        output: result.data || "",
        options: { recursive, indent: indent[0], indentType, wrapLines }
      });
    } else {
      setOutput("");
      setIsValid(false);
      setError(result.error || "Unknown error");
      
      addHistoryEntry({
        tool: "JSON Beautify",
        operation: "beautify",
        input: input,
        output: "",
        error: result.error || "Unknown error",
        options: { recursive, indent: indent[0], indentType, wrapLines }
      });
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
  }, [input, recursive, indent, indentType]); // Removed wrapLines from dependencies

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
      
      <div className="space-y-3">
        <Label className="text-sm">Indentation Type</Label>
        <RadioGroup value={indentType} onValueChange={(value: 'space' | 'tab') => setIndentType(value)} className="flex flex-row space-x-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="space" id="space" />
            <Label htmlFor="space" className="text-sm">Spaces</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tab" id="tab" />
            <Label htmlFor="tab" className="text-sm">Tabs</Label>
          </div>
        </RadioGroup>
      </div>
      
      {indentType === 'space' && (
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
      )}
      
      <div className="flex items-center space-x-2">
        <Switch
          id="wrap-lines"
          checked={wrapLines}
          onCheckedChange={setWrapLines}
        />
        <Label htmlFor="wrap-lines" className="text-sm">
          Wrap long lines in editor
        </Label>
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
      toolName="JSON Beautify"
      wrapLines={wrapLines}
      outputRef={outputRef}
    />
  );
}