import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { encode } from "gpt-tokenizer";

export function TokenCounter() {
  const [input, setInput] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed) {
      // Count tokens using GPT tokenizer
      const tokens = encode(trimmed);
      setTokenCount(tokens.length);

      // Count words (split by whitespace and filter empty)
      const words = trimmed.split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);

      // Count characters
      setCharCount(trimmed.length);

      // Count lines
      setLineCount(input.split('\n').length);
    } else {
      setTokenCount(0);
      setWordCount(0);
      setCharCount(0);
      setLineCount(0);
    }
  }, [input]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Token Counter</h1>
        <p className="text-muted-foreground">
          Count tokens, words, and characters in your text for LLM usage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{tokenCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{wordCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{charCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Characters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{lineCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Lines</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <p>
              Token count is calculated using GPT tokenizer, which is used by OpenAI models.
              This provides an accurate estimate for token usage in LLM APIs.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Input Text</CardTitle>
            <Badge variant="secondary">{lineCount} lines</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text here to count tokens..."
            className="w-full min-h-64 p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </CardContent>
      </Card>
    </div>
  );
}