import { useState } from "react";
import { GeneratorLayout } from "@/components/generator-layout";
import { generateCPF } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CPFGenerator() {
  const [output, setOutput] = useState("");
  const [withMask, setWithMask] = useState(true);
  const { addHistoryEntry } = useHistory();

  const handleGenerate = () => {
    try {
      const cpf = generateCPF(withMask);
      setOutput(cpf);
      
      addHistoryEntry({
        tool: "CPF Generator",
        operation: "generate",
        input: "",
        output: cpf,
        options: { withMask }
      });
    } catch (error) {
      setOutput("");
      addHistoryEntry({
        tool: "CPF Generator",
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
      <Label htmlFor="with-mask">Include formatting (XXX.XXX.XXX-XX)</Label>
    </div>
  );

  return (
    <GeneratorLayout
      title="CPF Generator"
      description="Generate valid Brazilian CPF numbers for testing purposes"
      outputValue={output}
      onGenerate={handleGenerate}
      onClear={() => setOutput("")}
      generateLabel="Generate CPF"
      outputPlaceholder="Generated CPF will appear here..."
      options={options}
      toolName="CPF Generator"
    />
  );
}