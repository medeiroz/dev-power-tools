import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { validateEmail } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";

export function EmailValidator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean>();
  const [error, setError] = useState<string>();
  const { addHistoryEntry } = useHistory();

  const handleValidate = () => {
    try {
      const result = validateEmail(input);
      
      let outputText = `Email: ${input}\n`;
      outputText += `Status: ${result.valid ? 'VALID' : 'INVALID'}\n`;
      
      if (result.error) {
        outputText += `Error: ${result.error}\n`;
      }
      
      if (result.valid) {
        const domain = input.split('@')[1];
        outputText += `Domain: ${domain}`;
      }
      
      setOutput(outputText);
      setIsValid(result.valid);
      setError(result.error);
      
      addHistoryEntry({
        tool: "Email Validator",
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
        tool: "Email Validator",
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
      title="Email Validator"
      description="Validate email addresses and check their format"
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleValidate}
      processLabel="Validate Email"
      isValid={isValid}
      error={error}
      inputPlaceholder="Enter email address..."
      outputPlaceholder="Validation result will appear here..."
    />
  );
}