import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { generateUUID } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function UUIDGenerator() {
  const [output, setOutput] = useState("");
  const [version, setVersion] = useState<'v1' | 'v4' | 'v7'>('v4');
  const { addHistoryEntry } = useHistory();

  const handleGenerate = () => {
    try {
      const uuid = generateUUID(version);
      setOutput(uuid);
      
      addHistoryEntry({
        tool: "UUID Generator",
        operation: "generate",
        input: "",
        output: uuid,
        options: { version }
      });
    } catch (error) {
      setOutput("");
      addHistoryEntry({
        tool: "UUID Generator",
        operation: "generate",
        input: "",
        output: "",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const options = (
    <div className="space-y-2">
      <Label htmlFor="version">UUID Version</Label>
      <Select value={version} onValueChange={(value: 'v1' | 'v4' | 'v7') => setVersion(value)}>
        <SelectTrigger id="version">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="v1">Version 1 (Timestamp-based)</SelectItem>
          <SelectItem value="v4">Version 4 (Random)</SelectItem>
          <SelectItem value="v7">Version 7 (Timestamp + Random)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate UUIDs (Universally Unique Identifiers) in different versions"
      inputValue=""
      outputValue={output}
      onInputChange={() => {}}
      onClear={() => setOutput("")}
      onProcess={handleGenerate}
      processLabel="Generate UUID"
      inputPlaceholder="Click 'Generate UUID' to create a new UUID"
      outputPlaceholder="Generated UUID will appear here..."
      options={options}
    />
  );
}