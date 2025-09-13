// Brazilian document generators and validators

// CPF utilities
export function generateCPF(withMask: boolean = false): string {
  const randomDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  
  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (10 - i);
  }
  const firstCheck = ((sum * 10) % 11) % 10;
  
  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (11 - i);
  }
  sum += firstCheck * 2;
  const secondCheck = ((sum * 10) % 11) % 10;
  
  const cpf = [...randomDigits, firstCheck, secondCheck].join('');
  
  return withMask ? formatCPF(cpf) : cpf;
}

export function validateCPF(cpf: string): { valid: boolean; error?: string } {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    return { valid: false, error: 'CPF deve ter 11 dígitos' };
  }
  
  // Check for invalid sequences
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, error: 'CPF não pode ter todos os dígitos iguais' };
  }
  
  const digits = cleaned.split('').map(Number);
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const firstCheck = ((sum * 10) % 11) % 10;
  
  if (firstCheck !== digits[9]) {
    return { valid: false, error: 'Primeiro dígito verificador inválido' };
  }
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (11 - i);
  }
  sum += digits[9] * 2;
  const secondCheck = ((sum * 10) % 11) % 10;
  
  if (secondCheck !== digits[10]) {
    return { valid: false, error: 'Segundo dígito verificador inválido' };
  }
  
  return { valid: true };
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
}

// CNPJ utilities
export function generateCNPJ(withMask: boolean = false): string {
  const randomDigits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  
  // Calculate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += randomDigits[i] * weights1[i];
  }
  const firstCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  // Calculate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += randomDigits[i] * weights2[i];
  }
  sum += firstCheck * weights2[12];
  const secondCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  const cnpj = [...randomDigits, firstCheck, secondCheck].join('');
  
  return withMask ? formatCNPJ(cnpj) : cnpj;
}

export function validateCNPJ(cnpj: string): { valid: boolean; error?: string } {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) {
    return { valid: false, error: 'CNPJ deve ter 14 dígitos' };
  }
  
  // Check for invalid sequences
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return { valid: false, error: 'CNPJ não pode ter todos os dígitos iguais' };
  }
  
  const digits = cleaned.split('').map(Number);
  
  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  const firstCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (firstCheck !== digits[12]) {
    return { valid: false, error: 'Primeiro dígito verificador inválido' };
  }
  
  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights2[i];
  }
  sum += digits[12] * weights2[12];
  const secondCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (secondCheck !== digits[13]) {
    return { valid: false, error: 'Segundo dígito verificador inválido' };
  }
  
  return { valid: true };
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cnpj;
}

// CEP utilities
export function generateCEP(withMask: boolean = false): string {
  const cep = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return withMask ? formatCEP(cep) : cep;
}

export function validateCEP(cep: string): { valid: boolean; error?: string } {
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length !== 8) {
    return { valid: false, error: 'CEP deve ter 8 dígitos' };
  }
  
  if (!/^\d{8}$/.test(cleaned)) {
    return { valid: false, error: 'CEP deve conter apenas números' };
  }
  
  return { valid: true };
}

export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
}

// Phone utilities
export function generatePhone(withMask: boolean = false): string {
  const ddd = Math.floor(Math.random() * 89) + 11; // DDDs de 11 a 99
  const firstDigit = Math.floor(Math.random() * 5) + 5; // 5, 6, 7, 8, 9
  const remainingDigits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
  
  const phone = `${ddd}${firstDigit}${remainingDigits}`;
  return withMask ? formatPhone(phone) : phone;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return { valid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
  }
  
  const ddd = parseInt(cleaned.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return { valid: false, error: 'DDD inválido (deve estar entre 11 e 99)' };
  }
  
  if (cleaned.length === 11) {
    const firstDigit = parseInt(cleaned[2]);
    if (firstDigit < 5 || firstDigit > 9) {
      return { valid: false, error: 'Celular deve começar com 5, 6, 7, 8 ou 9' };
    }
  }
  
  return { valid: true };
}

// RG utilities
export function generateRG(): string {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
}

export function formatRG(rg: string): string {
  const cleaned = rg.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
  return rg;
}

// Brazilian license plate utilities
export function generateLicensePlate(mercosul: boolean = true): string {
  if (mercosul) {
    // Padrão Mercosul: ABC1D23
    const letters1 = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const number1 = Math.floor(Math.random() * 10);
    const letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers2 = Array.from({ length: 2 }, () => Math.floor(Math.random() * 10)).join('');
    return `${letters1}${number1}${letter2}${numbers2}`;
  } else {
    // Padrão antigo: ABC-1234
    const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
    return `${letters}-${numbers}`;
  }
}

export function validateLicensePlate(plate: string): { valid: boolean; error?: string; type?: 'mercosul' | 'antiga' } {
  const cleaned = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Padrão Mercosul: ABC1D23
  const mercosulPattern = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  if (mercosulPattern.test(cleaned)) {
    return { valid: true, type: 'mercosul' };
  }
  
  // Padrão antigo: ABC1234
  const oldPattern = /^[A-Z]{3}\d{4}$/;
  if (oldPattern.test(cleaned)) {
    return { valid: true, type: 'antiga' };
  }
  
  return { valid: false, error: 'Placa deve seguir o padrão ABC1234 ou ABC1D23' };
}