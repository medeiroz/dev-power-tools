import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolLayout } from "./tool-layout";
import { flattenJson, unflattenJson, safeJsonParse } from "@/lib/json-utils";

export function JsonFlatten() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"flatten" | "unflatten">("flatten");
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState("");

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(undefined);
      setError("");
      return;
    }

    try {
      if (mode === "flatten") {
        const parseResult = safeJsonParse(input);
        if (!parseResult.success) {
          setIsValid(false);
          setError(parseResult.error || "Invalid JSON");
          setOutput("");
          return;
        }

        const flattened = flattenJson(parseResult.data);
        setOutput(JSON.stringify(flattened, null, 2));
        setIsValid(true);
        setError("");
      } else {
        // For unflatten, expect a flat object with dot notation keys
        const parseResult = safeJsonParse(input);
        if (!parseResult.success) {
          setIsValid(false);
          setError(parseResult.error || "Invalid JSON");
          setOutput("");
          return;
        }

        const unflattened = unflattenJson(parseResult.data);
        setOutput(JSON.stringify(unflattened, null, 2));
        setIsValid(true);
        setError("");
      }
    } catch (error) {
      setIsValid(false);
      setError(error instanceof Error ? error.message : 'Processing error');
      setOutput("");
    }
  };

  // Auto-process on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        handleProcess();
      } else {
        setOutput("");
        setIsValid(undefined);
        setError("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input, mode]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setIsValid(undefined);
    setError("");
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as "flatten" | "unflatten");
    // Auto-process when mode changes
    setTimeout(handleProcess, 0);
  };

  const flattenExample = `{
  "user": {
    "name": "John Doe",
    "contact": {
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York"
      }
    },
    "preferences": ["dark-mode", "notifications"]
  }
}`;

  const unflattenExample = `{
  "user.name": "John Doe",
  "user.contact.email": "john@example.com",
  "user.contact.address.street": "123 Main St",
  "user.contact.address.city": "New York",
  "user.preferences.0": "dark-mode",
  "user.preferences.1": "notifications"
}`;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          JSON Flatten / Unflatten
        </h1>
        <p className="text-muted-foreground">
          Convert between nested JSON objects and flat objects using dot notation for keys.
        </p>
      </div>

      <Tabs value={mode} onValueChange={handleModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flatten">Flatten</TabsTrigger>
          <TabsTrigger value="unflatten">Unflatten</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flatten">
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Flatten"
            isValid={isValid}
            error={error}
            inputPlaceholder={flattenExample}
            outputPlaceholder="Flattened JSON with dot notation keys will appear here..."
          />
        </TabsContent>
        
        <TabsContent value="unflatten">
          <ToolLayout
            title=""
            description=""
            inputValue={input}
            outputValue={output}
            onInputChange={setInput}
            onClear={handleClear}
            onProcess={handleProcess}
            processLabel="Unflatten"
            isValid={isValid}
            error={error}
            inputPlaceholder={unflattenExample}
            outputPlaceholder="Nested JSON structure will appear here..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}