import React from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function CodeEditor({ value, onChange, placeholder, minHeight = 300 }: CodeEditorProps) {
  return (
    <div className="relative">
      {!value && placeholder && (
        <div className="pointer-events-none absolute top-3 left-3 text-sm text-muted-foreground">
          {placeholder}
        </div>
      )}
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages.json, "json")}
        padding={12}
        className="rounded-md border bg-code-bg font-mono text-sm focus:outline-none"
        style={{
          minHeight,
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          lineHeight: 1.4,
          whiteSpace: "pre",
        }}
      />
    </div>
  );
}
