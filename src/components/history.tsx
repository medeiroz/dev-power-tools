import { useState } from "react";
import { useHistory } from "@/hooks/use-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Copy, Search, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function History() {
  const { history, clearHistory, removeHistoryEntry } = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTool, setFilterTool] = useState<string>("all");
  const { toast } = useToast();

  const filteredHistory = history.filter(entry => {
    const matchesSearch = searchTerm === "" || 
      entry.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.output.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTool = filterTool === "all" || entry.tool === filterTool;
    
    return matchesSearch && matchesTool;
  });

  const uniqueTools = Array.from(new Set(history.map(entry => entry.tool)));

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Operation History
        </h1>
        <p className="text-muted-foreground">
          View and manage your tool usage history
        </p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Label htmlFor="tool-filter">Filter by Tool</Label>
          <Select value={filterTool} onValueChange={setFilterTool}>
            <SelectTrigger id="tool-filter">
              <SelectValue placeholder="All Tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              {uniqueTools.map(tool => (
                <SelectItem key={tool} value={tool}>{tool}</SelectItem>
              ))}
            </SelectContent>
          </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {filteredHistory.length} of {history.length} entries
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Entries */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {history.length === 0 ? "No history entries yet. Start using tools to see your history here." : "No entries match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map(entry => (
            <Card key={entry.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.tool}</Badge>
                      <Badge variant={entry.error ? "destructive" : "default"} className="gap-1">
                        {entry.error ? (
                          <>
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Success
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHistoryEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {entry.input && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Input</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(entry.input, "Input")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      {truncateText(entry.input)}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      {entry.error ? "Error" : "Output"}
                    </Label>
                    {!entry.error && entry.output && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(entry.output, "Output")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className={`p-3 rounded-md font-mono text-sm ${
                    entry.error ? 'bg-destructive/10 text-destructive' : 'bg-muted'
                  }`}>
                    {entry.error || truncateText(entry.output)}
                  </div>
                </div>
                
                {entry.options && Object.keys(entry.options).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Options</Label>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      {JSON.stringify(entry.options, null, 2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}