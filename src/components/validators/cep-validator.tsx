import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/code-editor";
import { validateCEP, formatCEP } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, CheckCircle, AlertCircle, Copy, Table2, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard-utils";

interface CEPData {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  location: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

export function CEPValidator() {
  const [input, setInput] = useState("");
  const [cepData, setCepData] = useState<CEPData | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();
  const [error, setError] = useState<string>();
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();

  const handleValidate = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      setCepData(null);

      // Validate format first
      const result = validateCEP(input);
      
      if (!result.valid) {
        setIsValid(false);
        setError(result.error);
        setIsLoading(false);
        return;
      }

      const cleanCEP = input.replace(/\D/g, '');
      
      // Fetch from BrasilAPI
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCEP}`);
      
      if (!response.ok) {
        throw new Error('CEP não encontrado');
      }

      const data: CEPData = await response.json();
      setCepData(data);
      setIsValid(true);

      addHistoryEntry({
        tool: "CEP Validator",
        operation: "validate",
        input: input,
        output: JSON.stringify(data, null, 2),
      });

      toast({
        title: "Sucesso!",
        description: "CEP validado com sucesso!",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CEP';
      setIsValid(false);
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      addHistoryEntry({
        tool: "CEP Validator",
        operation: "validate",
        input: input,
        output: "",
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (cepData) {
      const text = viewMode === "json" 
        ? JSON.stringify(cepData, null, 2)
        : `CEP\t${cepData.cep || ''}\nEstado\t${cepData.state || ''}\nCidade\t${cepData.city || ''}\nBairro\t${cepData.neighborhood || ''}\nRua\t${cepData.street || ''}\nLatitude\t${cepData.location?.coordinates?.latitude || ''}\nLongitude\t${cepData.location?.coordinates?.longitude || ''}`;
      
      copyToClipboard(text);
      
      toast({
        title: "Copiado!",
        description: "Dados copiados para a área de transferência!",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CEP Validator</h1>
        <p className="text-muted-foreground">
          Valide e consulte informações de CEPs brasileiros
        </p>
      </div>

      <div className="grid gap-6">
        {/* Input Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cep-input">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep-input"
                    placeholder="Digite o CEP (ex: 89010-025)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleValidate} 
                    disabled={isLoading || !input}
                    className="min-w-[120px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Consultar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Status Badge */}
              {isValid !== undefined && (
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      CEP Válido
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      CEP Inválido
                    </Badge>
                  )}
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {cepData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Informações do CEP</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                </div>
              </div>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "json")}>
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                  <TabsTrigger value="table">
                    <Table2 className="mr-2 h-4 w-4" />
                    Tabela
                  </TabsTrigger>
                  <TabsTrigger value="json">
                    <Code2 className="mr-2 h-4 w-4" />
                    JSON
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-4">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">CEP:</span>
                      <span className="font-mono">{cepData.cep || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Estado:</span>
                      <span>{cepData.state || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Cidade:</span>
                      <span>{cepData.city || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Bairro:</span>
                      <span>{cepData.neighborhood || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Rua:</span>
                      <span>{cepData.street || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Latitude:</span>
                      <span className="font-mono">{cepData.location?.coordinates?.latitude || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Longitude:</span>
                      <span className="font-mono">{cepData.location?.coordinates?.longitude || '-'}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="json" className="mt-4">
                  <CodeEditor
                    value={JSON.stringify(cepData, null, 2)}
                    onChange={() => {}}
                    language="json"
                    minHeight={400}
                    readOnly={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
