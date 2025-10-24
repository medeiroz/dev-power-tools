import {
  generateCPF,
  validateCPF,
  formatCPF,
  generateCNPJ,
  validateCNPJ,
  formatCNPJ,
  generateRG,
  formatRG,
  generateCEP,
  validateCEP,
  formatCEP,
  generatePhone,
  validatePhone,
  formatPhone,
  generateLicensePlate,
  validateLicensePlate
} from '../../src/lib/brazilian-utils';

describe('brazilian-utils', () => {
  describe('CPF utilities', () => {
    test('should generate valid CPF without mask', () => {
      const cpf = generateCPF(false);
      expect(cpf).toHaveLength(11);
      expect(/^\d{11}$/.test(cpf)).toBe(true);
      expect(validateCPF(cpf).valid).toBe(true);
    });

    test('should generate valid CPF with mask', () => {
      const cpf = generateCPF(true);
      expect(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)).toBe(true);
      expect(validateCPF(cpf).valid).toBe(true);
    });

    test('should validate correct CPF', () => {
      const validCPF = generateCPF();
      const result = validateCPF(validCPF);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject invalid CPF', () => {
      expect(validateCPF('123.456.789-00').valid).toBe(false);
      expect(validateCPF('111.111.111-11').valid).toBe(false);
      expect(validateCPF('123').valid).toBe(false);
    });

    test('should format CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
      expect(formatCPF('123')).toBe('123'); // Invalid length should return as-is
    });

    test('should validate CPF with detailed error messages', () => {
      const shortCPF = validateCPF('123');
      expect(shortCPF.valid).toBe(false);
      expect(shortCPF.error).toBe('CPF must have 11 digits');

      const sameCPF = validateCPF('111.111.111-11');
      expect(sameCPF.valid).toBe(false);
      expect(sameCPF.error).toBe('CPF cannot have all equal digits');

      const invalidCheck = validateCPF('123.456.789-00');
      expect(invalidCheck.valid).toBe(false);
      expect(invalidCheck.error).toContain('check digit is invalid');
    });

    test('should handle CPF with and without formatting', () => {
      const cpf = generateCPF();
      const formatted = formatCPF(cpf);
      
      expect(validateCPF(cpf).valid).toBe(true);
      expect(validateCPF(formatted).valid).toBe(true);
    });
  });

  describe('CNPJ utilities', () => {
    test('should generate valid CNPJ without mask', () => {
      const cnpj = generateCNPJ(false);
      expect(cnpj).toHaveLength(14);
      expect(/^\d{14}$/.test(cnpj)).toBe(true);
      expect(validateCNPJ(cnpj).valid).toBe(true);
    });

    test('should generate valid CNPJ with mask', () => {
      const cnpj = generateCNPJ(true);
      expect(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj)).toBe(true);
      expect(validateCNPJ(cnpj).valid).toBe(true);
    });

    test('should validate correct CNPJ', () => {
      const validCNPJ = generateCNPJ();
      const result = validateCNPJ(validCNPJ);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject invalid CNPJ', () => {
      expect(validateCNPJ('12.345.678/0001-00').valid).toBe(false);
      expect(validateCNPJ('11.111.111/1111-11').valid).toBe(false);
      expect(validateCNPJ('123').valid).toBe(false);
    });

    test('should format CNPJ correctly', () => {
      expect(formatCNPJ('12345678000195')).toBe('12.345.678/0001-95');
      expect(formatCNPJ('12.345.678/0001-95')).toBe('12.345.678/0001-95');
      expect(formatCNPJ('123')).toBe('123'); // Invalid length should return as-is
    });

    test('should validate CNPJ with detailed error messages', () => {
      const shortCNPJ = validateCNPJ('123');
      expect(shortCNPJ.valid).toBe(false);
      expect(shortCNPJ.error).toBe('CNPJ must have 14 digits');

      const sameCNPJ = validateCNPJ('11.111.111/1111-11');
      expect(sameCNPJ.valid).toBe(false);
      expect(sameCNPJ.error).toBe('CNPJ cannot have all equal digits');

      const invalidCheck = validateCNPJ('12.345.678/0001-00');
      expect(invalidCheck.valid).toBe(false);
      expect(invalidCheck.error).toContain('check digit is invalid');
    });

    test('should handle CNPJ with and without formatting', () => {
      const cnpj = generateCNPJ();
      const formatted = formatCNPJ(cnpj);
      
      expect(validateCNPJ(cnpj).valid).toBe(true);
      expect(validateCNPJ(formatted).valid).toBe(true);
    });
  });

  describe('RG utilities', () => {
    test('should generate RG with correct length', () => {
      const rg = generateRG();
      expect(rg).toHaveLength(9);
      expect(/^\d{9}$/.test(rg)).toBe(true);
    });

    test('should generate RG with mask when specified', () => {
      const rg = generateRG(true);
      expect(/^\d{2}\.\d{3}\.\d{3}-\d{1}$/.test(rg)).toBe(true);
    });

    test('should generate different RG numbers', () => {
      const rg1 = generateRG();
      const rg2 = generateRG();
      expect(rg1).not.toBe(rg2);
    });

    test('should format RG correctly', () => {
      expect(formatRG('123456789')).toBe('12.345.678-9');
      expect(formatRG('12.345.678-9')).toBe('12.345.678-9');
      expect(formatRG('123')).toBe('123'); // Invalid length should return as-is
    });

    test('should generate RG with numeric digits only', () => {
      for (let i = 0; i < 10; i++) {
        const rg = generateRG();
        expect(/^\d{9}$/.test(rg)).toBe(true);
      }
    });

    test('should format RG with mask consistently', () => {
      const rg = generateRG();
      const formatted = formatRG(rg);
      expect(/^\d{2}\.\d{3}\.\d{3}-\d{1}$/.test(formatted)).toBe(true);
    });
  });

  describe('CEP utilities', () => {
    test('should generate CEP with correct length', () => {
      const cep = generateCEP();
      expect(cep).toHaveLength(8);
      expect(/^\d{8}$/.test(cep)).toBe(true);
    });

    test('should generate CEP with mask when specified', () => {
      const cep = generateCEP(true);
      expect(/^\d{5}-\d{3}$/.test(cep)).toBe(true);
    });

    test('should format CEP correctly', () => {
      expect(formatCEP('12345678')).toBe('12345-678');
      expect(formatCEP('12345-678')).toBe('12345-678');
      expect(formatCEP('123')).toBe('123'); // Invalid length should return as-is
    });

    test('should validate CEP correctly', () => {
      const validCEP = generateCEP();
      const result = validateCEP(validCEP);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate CEP with detailed error messages', () => {
      const shortCEP = validateCEP('123');
      expect(shortCEP.valid).toBe(false);
      expect(shortCEP.error).toBe('CEP must have 8 digits');

      // Note: The CEP validation removes non-digits first, so we test with valid length
      const validCEP = validateCEP('12345678');
      expect(validCEP.valid).toBe(true);
    });

    test('should handle CEP with and without formatting', () => {
      const cep = generateCEP();
      const formatted = formatCEP(cep);
      
      expect(validateCEP(cep).valid).toBe(true);
      expect(validateCEP(formatted).valid).toBe(true);
    });
  });

  describe('Phone utilities', () => {
    test('should generate phone with correct length', () => {
      const phone = generatePhone();
      expect(phone).toHaveLength(10);
      expect(/^\d{10}$/.test(phone)).toBe(true);
    });

    test('should generate phone with mask when specified', () => {
      const phone = generatePhone(true);
      expect(/^\(\d{2}\) \d{4}-\d{4}$/.test(phone)).toBe(true);
    });

    test('should generate mobile numbers (5-9 as third digit)', () => {
      for (let i = 0; i < 10; i++) {
        const phone = generatePhone(false);
        const thirdDigit = parseInt(phone[2]);
        expect(thirdDigit).toBeGreaterThanOrEqual(5);
        expect(thirdDigit).toBeLessThanOrEqual(9);
      }
    });

    test('should format phone correctly', () => {
      expect(formatPhone('1123456789')).toBe('(11) 2345-6789');
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
      expect(formatPhone('(11) 2345-6789')).toBe('(11) 2345-6789');
      expect(formatPhone('123')).toBe('123'); // Invalid length should return as-is
    });

    test('should validate phone correctly', () => {
      const validPhone = generatePhone();
      const result = validatePhone(validPhone);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate phone with detailed error messages', () => {
      const shortPhone = validatePhone('123');
      expect(shortPhone.valid).toBe(false);
      expect(shortPhone.error).toBe('Phone must have 10 or 11 digits');

      const invalidDDD = validatePhone('0912345678');
      expect(invalidDDD.valid).toBe(false);
      expect(invalidDDD.error).toBe('Invalid area code (must be between 11 and 99)');

      const invalidMobile = validatePhone('11412345678');
      expect(invalidMobile.valid).toBe(false);
      expect(invalidMobile.error).toBe('Mobile number must start with 5, 6, 7, 8 or 9');
    });

    test('should validate both landline and mobile numbers', () => {
      expect(validatePhone('1112345678').valid).toBe(true); // Landline
      expect(validatePhone('11987654321').valid).toBe(true); // Mobile
    });

    test('should handle phone with and without formatting', () => {
      const phone = generatePhone();
      const formatted = formatPhone(phone);
      
      expect(validatePhone(phone).valid).toBe(true);
      expect(validatePhone(formatted).valid).toBe(true);
    });
  });

  describe('License Plate utilities', () => {
    test('should generate Mercosul license plate by default', () => {
      const plate = generateLicensePlate();
      expect(/^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate)).toBe(true);
    });

    test('should generate old format license plate when specified', () => {
      const plate = generateLicensePlate(false);
      expect(/^[A-Z]{3}-\d{4}$/.test(plate)).toBe(true);
    });

    test('should generate Mercosul format when explicitly requested', () => {
      const plate = generateLicensePlate(true);
      expect(/^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate)).toBe(true);
    });

    test('should validate Mercosul license plates', () => {
      const mercosulPlate = 'ABC1D23';
      const result = validateLicensePlate(mercosulPlate);
      expect(result.valid).toBe(true);
      expect(result.type).toBe('mercosul');
    });

    test('should validate old format license plates', () => {
      const oldPlate = 'ABC-1234';
      const result = validateLicensePlate(oldPlate);
      expect(result.valid).toBe(true);
      expect(result.type).toBe('antiga');
    });

    test('should validate license plates without formatting', () => {
      const mercosul = validateLicensePlate('ABC1D23');
      expect(mercosul.valid).toBe(true);
      expect(mercosul.type).toBe('mercosul');

      const old = validateLicensePlate('ABC1234');
      expect(old.valid).toBe(true);
      expect(old.type).toBe('antiga');
    });

    test('should reject invalid license plates', () => {
      const invalid1 = validateLicensePlate('ABC123');
      expect(invalid1.valid).toBe(false);
      expect(invalid1.error).toBe('License plate must follow the pattern ABC1234 or ABC1D23');

      const invalid2 = validateLicensePlate('12345678');
      expect(invalid2.valid).toBe(false);
      expect(invalid2.error).toBe('License plate must follow the pattern ABC1234 or ABC1D23');
    });

    test('should handle case insensitive validation', () => {
      const lowerCase = validateLicensePlate('abc1d23');
      expect(lowerCase.valid).toBe(true);
      expect(lowerCase.type).toBe('mercosul');

      const mixedCase = validateLicensePlate('AbC-1234');
      expect(mixedCase.valid).toBe(true);
      expect(mixedCase.type).toBe('antiga');
    });

    test('should generate different license plates', () => {
      const plate1 = generateLicensePlate();
      const plate2 = generateLicensePlate();
      expect(plate1).not.toBe(plate2);
    });
  });
});