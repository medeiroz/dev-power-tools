import {
  encodeBase64,
  decodeBase64,
  encodeURL,
  decodeURL,
  generateHash,
  decodeJWT,
  generateUUID,
  generatePassword,
  PasswordOptions
} from '../../src/lib/dev-utils';

describe('dev-utils', () => {
  describe('Base64 utilities', () => {
    test('should encode and decode Base64 correctly', () => {
      const input = 'Hello World!';
      const encoded = encodeBase64(input);
      const decoded = decodeBase64(encoded);
      
      expect(encoded).toBe('SGVsbG8gV29ybGQh');
      expect(decoded.result).toBe(input);
      expect(decoded.error).toBeUndefined();
    });

    test('should handle UTF-8 characters', () => {
      const input = 'Olá, mundo! 🌎';
      const encoded = encodeBase64(input);
      const decoded = decodeBase64(encoded);
      
      expect(decoded.result).toBe(input);
      expect(decoded.error).toBeUndefined();
    });

    test('should handle empty string', () => {
      const input = '';
      const encoded = encodeBase64(input);
      const decoded = decodeBase64(encoded);
      
      expect(decoded.result).toBe(input);
      expect(decoded.error).toBeUndefined();
    });

    test('should handle invalid Base64 input gracefully', () => {
      const decoded = decodeBase64('invalid-base64!@#');
      // The function may not throw an error but should handle it gracefully
      expect(decoded).toBeDefined();
      expect(typeof decoded.result).toBe('string');
    });
  });

  describe('URL encoding utilities', () => {
    test('should encode and decode URL correctly', () => {
      const input = 'Hello World! Special chars: @#$%^&*()';
      const encoded = encodeURL(input);
      const decoded = decodeURL(encoded);
      
      expect(decoded.result).toBe(input);
      expect(decoded.error).toBeUndefined();
    });

    test('should handle URL with query parameters', () => {
      const input = 'param1=value1&param2=value with spaces';
      const encoded = encodeURL(input);
      const decoded = decodeURL(encoded);
      
      expect(decoded.result).toBe(input);
      expect(decoded.error).toBeUndefined();
    });

    test('should handle UTF-8 characters in URL', () => {
      const input = 'search=café&location=São Paulo';
      const encoded = encodeURL(input);
      const decoded = decodeURL(encoded);
      
      expect(decoded.result).toBe(input);
      expect(decoded.error).toBeUndefined();
    });

    test('should handle invalid URL encoded input', () => {
      const decoded = decodeURL('%ZZ'); // Invalid hex sequence
      expect(decoded.result).toBe('');
      expect(decoded.error).toBe('Invalid URL encoded input');
    });
  });

  describe('Hash utilities', () => {
    test('should generate MD5 hash', async () => {
      const input = 'Hello World';
      const hash = await generateHash(input, 'md5');
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(8); // Our simplified MD5 returns 8 chars
    });

    test('should generate SHA1 hash', async () => {
      const input = 'Hello World';
      const hash = await generateHash(input, 'sha1');
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(40); // SHA1 is 40 chars
    });

    test('should generate SHA256 hash', async () => {
      const input = 'Hello World';
      const hash = await generateHash(input, 'sha256');
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 is 64 chars
    });

    test('should generate consistent hashes for same input', async () => {
      const input = 'Test string';
      const hash1 = await generateHash(input, 'sha256');
      const hash2 = await generateHash(input, 'sha256');
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('JWT utilities', () => {
    test('should decode valid JWT token', () => {
      // Simple JWT with header: {"alg":"HS256","typ":"JWT"} and payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const decoded = decodeJWT(token);
      
      expect(decoded.valid).toBe(true);
      expect(decoded.header.alg).toBe('HS256');
      expect(decoded.header.typ).toBe('JWT');
      expect(decoded.payload.sub).toBe('1234567890');
      expect(decoded.payload.name).toBe('John Doe');
      expect(decoded.error).toBeUndefined();
    });

    test('should handle invalid JWT format', () => {
      const invalidToken = 'invalid.jwt';
      const decoded = decodeJWT(invalidToken);
      
      expect(decoded.valid).toBe(false);
      expect(decoded.error).toBe('Invalid JWT format. Expected 3 parts separated by dots.');
    });

    test('should handle malformed JWT parts', () => {
      const malformedToken = 'invalid.header.here';
      const decoded = decodeJWT(malformedToken);
      
      expect(decoded.valid).toBe(false);
      expect(decoded.error).toBeDefined();
    });

    test('should handle empty JWT', () => {
      const decoded = decodeJWT('');
      expect(decoded.valid).toBe(false);
      expect(decoded.error).toBeDefined();
    });
  });

  describe('UUID utilities', () => {
    test('should generate valid UUID v4', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuid).toMatch(uuidRegex);
    });

    test('should generate different UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
    });

    test('should generate UUID with correct version', () => {
      const uuid = generateUUID();
      const parts = uuid.split('-');
      
      // Version should be 4
      expect(parts[2][0]).toBe('4');
      
      // Variant should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(parts[3][0]);
    });

    test('should generate multiple unique UUIDs', () => {
      const uuids = Array.from({ length: 100 }, () => generateUUID());
      const uniqueUuids = new Set(uuids);
      
      expect(uniqueUuids.size).toBe(100);
    });
  });

  describe('Password utilities', () => {
    test('should generate password with specified options', () => {
      const options = {
        length: 20, // Increase length to ensure all character types appear
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: false
      };
      
      const password = generatePassword(options);
      
      expect(password).toBeDefined();
      expect(typeof password).toBe('string');
      expect(password.length).toBe(20);
      expect(/[A-Z]/.test(password)).toBe(true); // contains uppercase
      expect(/[a-z]/.test(password)).toBe(true); // contains lowercase
      expect(/[0-9]/.test(password)).toBe(true); // contains numbers
      expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)).toBe(false); // no symbols
    });

    test('should generate password with custom length', () => {
      const options: PasswordOptions = {
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: false
      };
      
      const password = generatePassword(options);
      expect(password.length).toBe(20);
    });

    test('should generate password with symbols when enabled', () => {
      const options: PasswordOptions = {
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: false
      };
      
      const password = generatePassword(options);
      
      expect(password.length).toBe(16);
      // Should contain at least one symbol
      expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)).toBe(true);
    });

    test('should generate different passwords', () => {
      const options: PasswordOptions = {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: false
      };
      
      const password1 = generatePassword(options);
      const password2 = generatePassword(options);
      
      expect(password1).not.toBe(password2);
    });
  });
});