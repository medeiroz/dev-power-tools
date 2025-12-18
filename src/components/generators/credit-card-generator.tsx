import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Copy, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { faker } from "@faker-js/faker";

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'random';

interface CreditCardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  brand: string;
}

export function CreditCardGenerator() {
  const [selectedBrand, setSelectedBrand] = useState<CardBrand>('random');
  const [cardData, setCardData] = useState<CreditCardData | null>(null);
  const { addHistoryEntry } = useHistory();
  const { toast } = useToast();

  // Algoritmo de Luhn para validar/gerar número de cartão
  const luhnCheck = (num: string): boolean => {
    let sum = 0;
    let isEven = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const generateCardNumber = (brand: string): string => {
    let prefix = '';
    let length = 16;

    switch (brand) {
      case 'visa':
        prefix = '4';
        break;
      case 'mastercard':
        prefix = '5' + Math.floor(Math.random() * 5 + 1).toString();
        break;
      case 'amex':
        prefix = '3' + (Math.random() > 0.5 ? '4' : '7');
        length = 15;
        break;
      case 'discover':
        prefix = '6011';
        break;
    }

    // Gerar o resto dos dígitos (menos o último para o dígito de verificação)
    let cardNumber = prefix;
    while (cardNumber.length < length - 1) {
      cardNumber += Math.floor(Math.random() * 10).toString();
    }

    // Calcular o dígito de verificação usando Luhn
    let sum = 0;
    let isEven = true;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    cardNumber += checkDigit.toString();

    return cardNumber;
  };

  const formatCardNumber = (number: string): string => {
    if (number.length === 15) {
      // American Express format: 0000 000000 00000
      return number.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    // Standard format: 0000 0000 0000 0000
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  const generateCard = () => {
    const brands = ['visa', 'mastercard', 'amex', 'discover'];
    const brand = selectedBrand === 'random' 
      ? brands[Math.floor(Math.random() * brands.length)]
      : selectedBrand;

    const number = generateCardNumber(brand);
    const holder = faker.person.fullName().toUpperCase();
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(-2);
    const expiry = `${month}/${year}`;
    const cvv = brand === 'amex' 
      ? String(Math.floor(Math.random() * 9000) + 1000) 
      : String(Math.floor(Math.random() * 900) + 100);

    const card: CreditCardData = {
      number,
      holder,
      expiry,
      cvv,
      brand: brand.charAt(0).toUpperCase() + brand.slice(1)
    };

    setCardData(card);

    addHistoryEntry({
      tool: "Credit Card Generator",
      operation: "generate",
      input: brand,
      output: JSON.stringify(card, null, 2)
    });
  };

  const copyField = (value: string, label: string) => {
    copyToClipboard(value);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência!`,
    });
  };

  const copyAll = () => {
    if (cardData) {
      const text = `Número: ${cardData.number}\nTitular: ${cardData.holder}\nValidade: ${cardData.expiry}\nCVV: ${cardData.cvv}\nBandeira: ${cardData.brand}`;
      copyToClipboard(text);
      toast({
        title: "Copiado!",
        description: "Todos os dados copiados!",
      });
    }
  };

  const getCardGradient = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'from-blue-600 via-blue-700 to-blue-900';
      case 'mastercard':
        return 'from-red-600 via-orange-600 to-yellow-600';
      case 'amex':
        return 'from-blue-800 via-blue-900 to-gray-900';
      case 'discover':
        return 'from-orange-500 via-orange-600 to-orange-700';
      default:
        return 'from-gray-700 via-gray-800 to-gray-900';
    }
  };

  const getBrandLogo = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <svg className="h-10 w-16" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="32" rx="4" fill="white" fillOpacity="0.2"/>
            <text x="24" y="20" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Arial">VISA</text>
          </svg>
        );
      case 'mastercard':
        return (
          <svg className="h-10 w-16" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="16" r="10" fill="#EB001B" fillOpacity="0.9"/>
            <circle cx="30" cy="16" r="10" fill="#F79E1B" fillOpacity="0.9"/>
          </svg>
        );
      case 'amex':
        return (
          <svg className="h-10 w-20" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="32" rx="4" fill="white" fillOpacity="0.2"/>
            <text x="24" y="14" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="Arial">AMERICAN</text>
            <text x="24" y="22" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="Arial">EXPRESS</text>
          </svg>
        );
      case 'discover':
        return (
          <svg className="h-10 w-20" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="32" rx="4" fill="white" fillOpacity="0.2"/>
            <text x="24" y="20" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial">DISCOVER</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Credit Card Generator</h1>
        <p className="text-muted-foreground">
          Gere números de cartão de crédito válidos para testes
        </p>
      </div>

      <div className="grid gap-6">
        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="brand-select">Bandeira</Label>
                <Select value={selectedBrand} onValueChange={(value) => setSelectedBrand(value as CardBrand)}>
                  <SelectTrigger id="brand-select">
                    <SelectValue placeholder="Selecione a bandeira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Aleatório</SelectItem>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateCard} className="min-w-[140px]">
                <RefreshCw className="mr-2 h-4 w-4" />
                Gerar Cartão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Display */}
        {cardData && (
          <div className="space-y-6">
            {/* Visual Card */}
            <div className="relative">
              <div className={`relative w-full max-w-[420px] mx-auto aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${getCardGradient(cardData.brand)} p-6 shadow-2xl`}>
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full -ml-20 -mb-20"></div>
                </div>

                {/* Card Content */}
                <div className="relative h-full flex flex-col justify-between text-white">
                  {/* Top Section - Brand Logo */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-8 w-8 opacity-80" />
                    </div>
                    {getBrandLogo(cardData.brand)}
                  </div>

                  {/* Middle Section - Card Number */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs opacity-70 mb-1">Número do Cartão</p>
                      <p className="text-2xl font-mono tracking-wider font-semibold">
                        {formatCardNumber(cardData.number)}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section - Holder, Expiry, CVV */}
                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      <p className="text-xs opacity-70 mb-1">Titular</p>
                      <p className="text-sm font-semibold tracking-wide">
                        {cardData.holder}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-70 mb-1">Validade</p>
                      <p className="text-lg font-mono font-semibold">
                        {cardData.expiry}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Back (CVV) */}
              <div className="relative w-full max-w-[420px] mx-auto aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 mt-6 shadow-2xl overflow-hidden">
                <div className="absolute top-8 left-0 right-0 h-12 bg-black"></div>
                <div className="absolute top-24 right-8 bg-white px-4 py-2 rounded">
                  <p className="text-xs text-gray-600 mb-1">CVV</p>
                  <p className="font-mono font-bold text-black">{cardData.cvv}</p>
                </div>
              </div>
            </div>

            {/* Card Data */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Dados do Cartão</h3>
                  <Button variant="outline" size="sm" onClick={copyAll}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Tudo
                  </Button>
                </div>

                <div className="grid gap-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Número do Cartão</p>
                      <p className="font-mono font-semibold">{formatCardNumber(cardData.number)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyField(cardData.number, 'Número')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Titular</p>
                      <p className="font-semibold">{cardData.holder}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyField(cardData.holder, 'Titular')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Validade</p>
                        <p className="font-mono font-semibold">{cardData.expiry}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyField(cardData.expiry, 'Validade')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">CVV</p>
                        <p className="font-mono font-semibold">{cardData.cvv}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyField(cardData.cvv, 'CVV')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bandeira</p>
                      <p className="font-semibold">{cardData.brand}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    ⚠️ <strong>Aviso:</strong> Estes cartões são gerados para fins de teste apenas. Não use para transações reais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
