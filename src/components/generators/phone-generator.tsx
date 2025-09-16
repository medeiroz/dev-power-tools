import { useState } from "react";
import { GeneratorLayout } from "@/components/generator-layout";
import { generatePhone } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function PhoneGenerator() {
  const [output, setOutput] = useState("");
  const [withMask, setWithMask] = useState(true);
  const { addHistoryEntry } = useHistory();

  const handleGenerate = () => {
    try {
      const phone = generatePhone(withMask);
      setOutput(phone);
      
      addHistoryEntry({
        tool: "Phone Generator",
        operation: "generate",
        input: "",
        output: phone,
        options: { withMask }
      });
    } catch (error) {
      setOutput("");
      addHistoryEntry({
        tool: "Phone Generator",
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
      <Label htmlFor="with-mask">Include formatting ((XX) XXXXX-XXXX)</Label>
    </div>
  );

  return (
    <GeneratorLayout
      title="Phone Generator"
      description="Generate valid Brazilian phone numbers for testing purposes"
      outputValue={output}
      onGenerate={handleGenerate}
      onClear={() => setOutput("")}
      generateLabel="Generate Phone"
      outputPlaceholder="Generated phone number will appear here..."
      options={options}
      toolName="Phone Generator"
    />
  );
}