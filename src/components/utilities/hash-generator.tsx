import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { generateHash } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [algorithm, setAlgorithm] = useState<'md5' | 'sha1' | 'sha256'>('sha256');
  const { addHistoryEntry } = useHistory();

  const handleProcess = async () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const hash = await generateHash(input, algorithm);
      setOutput(hash);
      
      addHistoryEntry({
        tool: "Hash Generator",
        operation: "generate",
        input: input,
        output: hash,
        options: { algorithm }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`Error: ${errorMsg}`);
      
      addHistoryEntry({
        tool: "Hash Generator",
        operation: "generate",
        input: input,
        output: "",
        error: errorMsg,
        options: { algorithm }
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
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input, algorithm]);

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const options = (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Hash Algorithm</Label>
      <RadioGroup value={algorithm} onValueChange={(value: 'md5' | 'sha1' | 'sha256') => setAlgorithm(value)}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="md5" id="md5" />
          <Label htmlFor="md5" className="text-sm">MD5 (128-bit)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sha1" id="sha1" />
          <Label htmlFor="sha1" className="text-sm">SHA-1 (160-bit)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sha256" id="sha256" />
          <Label htmlFor="sha256" className="text-sm">SHA-256 (256-bit)</Label>
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate cryptographic hashes using MD5, SHA-1, or SHA-256 algorithms"
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleProcess}
      processLabel="Generate Hash"
      inputPlaceholder="Enter text to hash..."
      outputPlaceholder="Hash will appear here..."
      options={options}
      toolName="Hash Generator"
    />
  );
}