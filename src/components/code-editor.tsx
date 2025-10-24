import React from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-clike";
import "prismjs/themes/prism-tomorrow.css";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  language?: string;
  wrapLines?: boolean;
  readOnly?: boolean;
}

export function CodeEditor({ 
  value, 
  onChange, 
  placeholder, 
  minHeight = 300,
  language = "json",
  wrapLines = true,
  readOnly = false
}: CodeEditorProps) {
  return (
    <div className="relative overflow-auto h-full w-full">
      {!value && placeholder && (
        <div className="pointer-events-none absolute top-3 left-3 text-sm text-muted-foreground">
          {placeholder}
        </div>
      )}
      <Editor
        value={value}
        onValueChange={readOnly ? () => {} : onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages[language] || Prism.languages.json, language)}
        padding={12}
        readOnly={readOnly}
        className={`
          code-editor float-left h-full w-full
          rounded-md border bg-code-bg font-mono
          text-sm focus:outline-none
          ${readOnly ? 'cursor-default' : ''}
          ${wrapLines ? 'is-wrap' : 'is-nowrap'}
        `}
        style={{
          minHeight,
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          lineHeight: 1.4,
          tabSize: 2,
        }}
      />
    </div>
  );
}