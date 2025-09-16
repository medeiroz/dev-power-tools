import { useState } from "react";
import { GeneratorLayout } from "@/components/generator-layout";
import { generateCEP } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CEPGenerator() {
  const [output, setOutput] = useState("");
  const [withMask, setWithMask] = useState(true);
  const { addHistoryEntry } = useHistory();

  const handleGenerate = () => {
    try {
      const cep = generateCEP(withMask);
      setOutput(cep);
      
      addHistoryEntry({
        tool: "CEP Generator",
        operation: "generate",
        input: "",
        output: cep,
        options: { withMask }
      });
    } catch (error) {
      setOutput("");
      addHistoryEntry({
        tool: "CEP Generator",
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
      <Label htmlFor="with-mask">Include formatting (XXXXX-XXX)</Label>
    </div>
  );

  return (
    <GeneratorLayout
      title="CEP Generator"
      description="Generate Brazilian CEP (postal code) numbers for testing purposes"
      outputValue={output}
      onGenerate={handleGenerate}
      onClear={() => setOutput("")}
      generateLabel="Generate CEP"
      outputPlaceholder="Generated CEP will appear here..."
      options={options}
      toolName="CEP Generator"
    />
  );
}