import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { generatePassword, type PasswordOptions } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function PasswordGenerator() {
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  });
  const { addHistoryEntry } = useHistory();

  const handleGenerate = () => {
    try {
      const password = generatePassword(options);
      setOutput(password);
      
      addHistoryEntry({
        tool: "Password Generator",
        operation: "generate",
        input: "",
        output: password,
        options: { ...options }
      });
    } catch (error) {
      setOutput("");
      addHistoryEntry({
        tool: "Password Generator",
        operation: "generate",
        input: "",
        output: "",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const optionControls = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Password Length: {options.length}</Label>
        <Slider
          value={[options.length]}
          onValueChange={(value) => setOptions(prev => ({ ...prev, length: value[0] }))}
          min={4}
          max={128}
          step={1}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="uppercase"
            checked={options.includeUppercase}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeUppercase: checked }))}
          />
          <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="lowercase"
            checked={options.includeLowercase}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeLowercase: checked }))}
          />
          <Label htmlFor="lowercase">Lowercase (a-z)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="numbers"
            checked={options.includeNumbers}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeNumbers: checked }))}
          />
          <Label htmlFor="numbers">Numbers (0-9)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="symbols"
            checked={options.includeSymbols}
            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeSymbols: checked }))}
          />
          <Label htmlFor="symbols">Symbols (!@#$...)</Label>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="exclude-similar"
          checked={options.excludeSimilar}
          onCheckedChange={(checked) => setOptions(prev => ({ ...prev, excludeSimilar: checked }))}
        />
        <Label htmlFor="exclude-similar">Exclude similar characters (0, O, l, I, 1)</Label>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure passwords with customizable options"
      inputValue=""
      outputValue={output}
      onInputChange={() => {}}
      onClear={() => setOutput("")}
      onProcess={handleGenerate}
      processLabel="Generate Password"
      inputPlaceholder="Click 'Generate Password' to create a new password"
      outputPlaceholder="Generated password will appear here..."
      options={optionControls}
    />
  );
}