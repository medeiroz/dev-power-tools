import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { encodeBase64, decodeBase64 } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function Base64Converter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [operation, setOperation] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string>();
  const { addHistoryEntry } = useHistory();

  const handleProcess = () => {
    try {
      setError(undefined);
      
      if (operation === 'encode') {
        const encoded = encodeBase64(input);
        setOutput(encoded);
        
        addHistoryEntry({
          tool: "Base64 Converter",
          operation: "encode",
          input: input,
          output: encoded
        });
      } else {
        const result = decodeBase64(input);
        if (result.error) {
          setError(result.error);
          setOutput("");
        } else {
          setOutput(result.result);
        }
        
        addHistoryEntry({
          tool: "Base64 Converter",
          operation: "decode",
          input: input,
          output: result.result,
          error: result.error
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setOutput("");
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "Base64 Converter",
        operation: operation,
        input: input,
        output: "",
        error: errorMsg
      });
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(undefined);
  };

  const options = (
    <div className="space-y-2">
      <Label htmlFor="operation">Operation</Label>
      <Select value={operation} onValueChange={(value: 'encode' | 'decode') => setOperation(value)}>
        <SelectTrigger id="operation">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="encode">Encode to Base64</SelectItem>
          <SelectItem value="decode">Decode from Base64</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <ToolLayout
      title="Base64 Converter"
      description="Encode text to Base64 or decode Base64 to text"
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleProcess}
      processLabel={operation === 'encode' ? 'Encode' : 'Decode'}
      error={error}
      inputPlaceholder={operation === 'encode' ? "Enter text to encode..." : "Enter Base64 to decode..."}
      outputPlaceholder="Result will appear here..."
      options={options}
    />
  );
}