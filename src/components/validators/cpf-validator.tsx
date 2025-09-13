import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { validateCPF, formatCPF } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";

export function CPFValidator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean>();
  const [error, setError] = useState<string>();
  const { addHistoryEntry } = useHistory();

  const handleValidate = () => {
    try {
      const result = validateCPF(input);
      const formattedCPF = formatCPF(input);
      
      let outputText = `CPF: ${formattedCPF}\n`;
      outputText += `Status: ${result.valid ? 'VÁLIDO' : 'INVÁLIDO'}\n`;
      
      if (result.error) {
        outputText += `Erro: ${result.error}\n`;
      }
      
      if (result.valid) {
        outputText += `Formatted: ${formattedCPF}`;
      }
      
      setOutput(outputText);
      setIsValid(result.valid);
      setError(result.error);
      
      addHistoryEntry({
        tool: "CPF Validator",
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
        tool: "CPF Validator",
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
      title="CPF Validator"
      description="Validate Brazilian CPF numbers and check their format"
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleValidate}
      processLabel="Validate CPF"
      isValid={isValid}
      error={error}
      inputPlaceholder="Enter CPF number (with or without formatting)..."
      outputPlaceholder="Validation result will appear here..."
    />
  );
}