import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { decodeJWT } from "@/lib/dev-utils";
import { useHistory } from "@/hooks/use-history";

export function JWTDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean>();
  const [error, setError] = useState<string>();
  const { addHistoryEntry } = useHistory();

  const handleDecode = () => {
    try {
      const result = decodeJWT(input);
      
      if (result.valid) {
        const outputObject = {
          header: result.header,
          payload: result.payload,
          signature: result.signature,
          claims: {
            issuer: result.payload?.iss,
            subject: result.payload?.sub,
            audience: result.payload?.aud,
            expirationTime: result.payload?.exp ? new Date(result.payload.exp * 1000).toISOString() : undefined,
            notBefore: result.payload?.nbf ? new Date(result.payload.nbf * 1000).toISOString() : undefined,
            issuedAt: result.payload?.iat ? new Date(result.payload.iat * 1000).toISOString() : undefined,
            jwtId: result.payload?.jti,
          }
        };
        
        setOutput(JSON.stringify(outputObject, null, 2));
        setIsValid(true);
        setError(undefined);
      } else {
        setOutput(result.error || "Invalid JWT");
        setIsValid(false);
        setError(result.error);
      }
      
      addHistoryEntry({
        tool: "JWT Decoder",
        operation: "decode",
        input: input,
        output: result.valid ? JSON.stringify({ header: result.header, payload: result.payload }) : "",
        error: result.error
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setOutput(`Error: ${errorMsg}`);
      setIsValid(false);
      setError(errorMsg);
      
      addHistoryEntry({
        tool: "JWT Decoder",
        operation: "decode",
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
      title="JWT Decoder"
      description="Decode and analyze JSON Web Tokens (JWT)"
      inputValue={input}
      outputValue={output}
      onInputChange={setInput}
      onClear={handleClear}
      onProcess={handleDecode}
      processLabel="Decode JWT"
      isValid={isValid}
      error={error}
      inputPlaceholder="Paste your JWT token here..."
      outputPlaceholder="Decoded JWT will appear here..."
    />
  );
}