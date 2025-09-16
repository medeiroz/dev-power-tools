import { useState } from "react";
import { GeneratorLayout } from "@/components/generator-layout";
import { generateRG } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function RGGenerator() {
  const [output, setOutput] = useState("");
  const [withMask, setWithMask] = useState(true);
  const { addHistoryEntry } = useHistory();

  const handleGenerate = () => {
    try {
      const rg = generateRG(withMask);
      setOutput(rg);
      
      addHistoryEntry({
        tool: "RG Generator",
        operation: "generate",
        input: "",
        output: rg,
        options: { withMask }
      });
    } catch (error) {
      setOutput("");
      addHistoryEntry({
        tool: "RG Generator",
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
      <Label htmlFor="with-mask">Include formatting (XX.XXX.XXX-X)</Label>
    </div>
  );

  return (
    <GeneratorLayout
      title="RG Generator"
      description="Generate Brazilian RG (Registro Geral) numbers for testing purposes"
      outputValue={output}
      onGenerate={handleGenerate}
      onClear={() => setOutput("")}
      generateLabel="Generate RG"
      outputPlaceholder="Generated RG will appear here..."
      options={options}
      toolName="RG Generator"
    />
  );
}