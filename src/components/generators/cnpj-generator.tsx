import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { generateCNPJ } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CNPJGenerator() {
  const [output, setOutput] = useState("");
  const [withMask, setWithMask] = useState(true);
  const { addHistoryEntry } = useHistory();

  const handleGenerate = () => {
    try {
      const cnpj = generateCNPJ(withMask);
      setOutput(cnpj);
      
      addHistoryEntry({
        tool: "CNPJ Generator",
        operation: "generate",
        input: "",
        output: cnpj,
        options: { withMask }
      });
    } catch (error) {
      setOutput("");
      addHistoryEntry({
        tool: "CNPJ Generator",
        operation: "generate",
        input: "",
        output: "",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const options = (
    <div className="flex items-center space-x-2">
      <Switch
        id="with-mask"
        checked={withMask}
        onCheckedChange={setWithMask}
      />
      <Label htmlFor="with-mask">Include formatting (XX.XXX.XXX/XXXX-XX)</Label>
    </div>
  );

  return (
    <ToolLayout
      title="CNPJ Generator"
      description="Generate valid Brazilian CNPJ numbers for testing purposes"
      inputValue=""
      outputValue={output}
      onInputChange={() => {}}
      onClear={() => setOutput("")}
      onProcess={handleGenerate}
      processLabel="Generate CNPJ"
      inputPlaceholder="Click 'Generate CNPJ' to create a new CNPJ"
      outputPlaceholder="Generated CNPJ will appear here..."
      options={options}
    />
  );
}