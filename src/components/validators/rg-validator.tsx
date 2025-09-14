import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { useHistory } from "@/hooks/use-history";

export function RGValidator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean>();
  const [error, setError] = useState<string>();
  const { addHistoryEntry } = useHistory();

  const validateRG = (rg: string): { valid: boolean; error?: string } => {
    const cleaned = rg.replace(/\D/g, '');
    
    if (cleaned.length !== 9) {
      return { valid: false, error: 'RG deve ter 9 dígitos' };
    }
    
    // Basic format validation
    if (!/^\d{9}$/.test(cleaned)) {
      return { valid: false, error: 'RG deve conter apenas números' };
    }
    
    return { valid: true };
  };

  const handleValidate = () => {
    try {
      const result = validateRG(input);
      
      let outputText = `RG: ${input}\n`;
      outputText += `Status: ${result.valid ? 'VÁLIDO' : 'INVÁLIDO'}\n`;
      
      if (result.error) {
        outputText += `Erro: ${result.error}`;
      }
      
      setOutput(outputText);
      setIsValid(result.valid);
      setError(result.error);
      
      addHistoryEntry({
        tool: "RG Validator",
        operation: "validate",
        input: input,
        output: outputText,
        options: { valid: result.valid }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setOutput(`Error: ${errorMsg}`);
      setIsValid(false);
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "RG Validator",
        operation: "validate",
        input: input,
        output: "",
        error: errorMsg
      });
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setIsValid(undefined);
    setError(undefined);
  };

  return (
    <ToolLayout
      title="RG Validator"
      description="Validate Brazilian RG (Registro Geral) numbers"
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleValidate}
      processLabel="Validate RG"
      isValid={isValid}
      error={error}
      inputPlaceholder="Enter RG number..."
      outputPlaceholder="Validation result will appear here..."
      toolName="RG Validator"
    />
  );
}