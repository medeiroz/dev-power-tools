import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/code-editor";
import { validateCNPJ, formatCNPJ } from "@/lib/brazilian-utils";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, CheckCircle, AlertCircle, Copy, Table2, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard-utils";

interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  uf: string;
  cep: string;
  bairro: string;
  numero: string;
  municipio: string;
  logradouro: string;
  complemento: string;
  email: string | null;
  porte: string;
  capital_social: number;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_inicio_atividade: string;
  data_situacao_cadastral: string;
  natureza_juridica: string;
  qsa: any[];
  cnaes_secundarios: any[];
  regime_tributario: any[];
}

export function CNPJValidator() {
  const [input, setInput] = useState("");
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null);
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
      setCnpjData(null);

      // Validate format first
      const result = validateCNPJ(input);
      
      if (!result.valid) {
        setIsValid(false);
        setError(result.error);
        setIsLoading(false);
        return;
      }

      const cleanCNPJ = input.replace(/\D/g, '');
      
      // Fetch from BrasilAPI
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }

      const data: CNPJData = await response.json();
      setCnpjData(data);
      setIsValid(true);

      addHistoryEntry({
        tool: "CNPJ Validator",
        operation: "validate",
        input: input,
        output: JSON.stringify(data, null, 2),
      });

      toast({
        title: "Sucesso!",
        description: "CNPJ validado com sucesso!",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CNPJ';
      setIsValid(false);
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      addHistoryEntry({
        tool: "CNPJ Validator",
        operation: "validate",
        input: input,
        output: "",
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const handleCopy = () => {
    if (cnpjData) {
      const text = viewMode === "json" 
        ? JSON.stringify(cnpjData, null, 2)
        : `CNPJ\t${cnpjData.cnpj || ''}
Razão Social\t${cnpjData.razao_social || ''}
Nome Fantasia\t${cnpjData.nome_fantasia || ''}
Situação\t${cnpjData.descricao_situacao_cadastral || ''}
Data Início\t${cnpjData.data_inicio_atividade || ''}
Capital Social\tR$ ${cnpjData.capital_social?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
Natureza Jurídica\t${cnpjData.natureza_juridica || ''}
Porte\t${cnpjData.porte || ''}
CNAE Principal\t${cnpjData.cnae_fiscal || ''} - ${cnpjData.cnae_fiscal_descricao || ''}
Endereço\t${cnpjData.logradouro || ''}, ${cnpjData.numero || ''} ${cnpjData.complemento || ''}
Bairro\t${cnpjData.bairro || ''}
Município\t${cnpjData.municipio || ''}
UF\t${cnpjData.uf || ''}
CEP\t${formatCEP(cnpjData.cep) || ''}
Telefone 1\t${formatPhone(cnpjData.ddd_telefone_1) || ''}
Telefone 2\t${formatPhone(cnpjData.ddd_telefone_2) || ''}
Email\t${cnpjData.email || ''}
Qtd. Sócios\t${cnpjData.qsa?.length || 0}
Qtd. CNAEs Secundários\t${cnpjData.cnaes_secundarios?.length || 0}`;
      
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
        <h1 className="text-3xl font-bold mb-2">CNPJ Validator</h1>
        <p className="text-muted-foreground">
          Valide e consulte informações de CNPJs brasileiros
        </p>
      </div>

      <div className="grid gap-6">
        {/* Input Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj-input">CNPJ</Label>
                <div className="flex gap-2">
                  <Input
                    id="cnpj-input"
                    placeholder="Digite o CNPJ (ex: 19.131.243/0001-97)"
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
                      CNPJ Válido
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      CNPJ Inválido
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
        {cnpjData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Informações do CNPJ</h2>
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
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">CNPJ:</span>
                      <span className="font-mono">{cnpjData.cnpj || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Razão Social:</span>
                      <span>{cnpjData.razao_social || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Nome Fantasia:</span>
                      <span>{cnpjData.nome_fantasia || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Situação:</span>
                      <span>{cnpjData.descricao_situacao_cadastral || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Data Início:</span>
                      <span>{cnpjData.data_inicio_atividade || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Capital Social:</span>
                      <span className="font-mono">
                        R$ {cnpjData.capital_social?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Natureza Jurídica:</span>
                      <span>{cnpjData.natureza_juridica || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Porte:</span>
                      <span>{cnpjData.porte || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">CNAE Principal:</span>
                      <span>{cnpjData.cnae_fiscal || '-'} - {cnpjData.cnae_fiscal_descricao || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Endereço:</span>
                      <span>
                        {cnpjData.logradouro || '-'}, {cnpjData.numero || '-'} {cnpjData.complemento || ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Bairro:</span>
                      <span>{cnpjData.bairro || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Município:</span>
                      <span>{cnpjData.municipio || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">UF:</span>
                      <span>{cnpjData.uf || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">CEP:</span>
                      <span className="font-mono">{formatCEP(cnpjData.cep) || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Telefone 1:</span>
                      <span className="font-mono">{formatPhone(cnpjData.ddd_telefone_1) || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Telefone 2:</span>
                      <span className="font-mono">{formatPhone(cnpjData.ddd_telefone_2) || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Email:</span>
                      <span>{cnpjData.email || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">Qtd. Sócios:</span>
                      <span>{cnpjData.qsa?.length || 0}</span>
                    </div>
                    <div className="grid grid-cols-[160px_1fr] gap-2 items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-semibold">CNAEs Secundários:</span>
                      <span>{cnpjData.cnaes_secundarios?.length || 0}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="json" className="mt-4">
                  <CodeEditor
                    value={JSON.stringify(cnpjData, null, 2)}
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