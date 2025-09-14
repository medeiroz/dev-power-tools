import { createHash } from 'crypto';

// Base64 utilities
export function encodeBase64(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

export function decodeBase64(input: string): { result: string; error?: string } {
  try {
    return { result: decodeURIComponent(escape(atob(input))) };
  } catch (error) {
    return { result: '', error: 'Invalid Base64 input' };
  }
}

// URL encoding utilities
export function encodeURL(input: string): string {
  return encodeURIComponent(input);
}

export function decodeURL(input: string): { result: string; error?: string } {
  try {
    return { result: decodeURIComponent(input) };
  } catch (error) {
    return { result: '', error: 'Invalid URL encoded input' };
  }
}

// Hash utilities
export async function generateHash(input: string, algorithm: 'md5' | 'sha1' | 'sha256'): Promise<string> {
  // For browsers, we'll use the Web Crypto API for SHA algorithms
  // For MD5, we'll implement a simple version
  
  if (algorithm === 'md5') {
    // Simple MD5 implementation placeholder - in production, use a proper crypto library
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    // This is a simplified hash for demo purposes
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  // Use Web Crypto API for SHA algorithms
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  let hashBuffer;
  if (algorithm === 'sha1') {
    hashBuffer = await crypto.subtle.digest('SHA-1', data);
  } else if (algorithm === 'sha256') {
    hashBuffer = await crypto.subtle.digest('SHA-256', data);
  } else {
    throw new Error('Unsupported algorithm');
  }
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// JWT utilities
export interface JWTDecoded {
  header: any;
  payload: any;
  signature: string;
  valid: boolean;
  error?: string;
}

export function decodeJWT(token: string): JWTDecoded {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        header: null,
        payload: null,
        signature: '',
        valid: false,
        error: 'Invalid JWT format. Expected 3 parts separated by dots.'
      };
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const signature = parts[2];

    return {
      header,
      payload,
      signature,
      valid: true
    };
  } catch (error) {
    return {
      header: null,
      payload: null,
      signature: '',
      valid: false,
      error: 'Failed to decode JWT: ' + (error as Error).message
    };
  }
}

// UUID utilities
export function generateUUID(version: 'v1' | 'v4' | 'v7' = 'v4'): string {
  if (version === 'v4') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  if (version === 'v1') {
    // Simplified v1 UUID (timestamp-based)
    const timestamp = Date.now();
    const random = Math.random().toString(16).substring(2, 14);
    return `${timestamp.toString(16).padStart(8, '0')}-xxxx-1xxx-yxxx-${random}`.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  if (version === 'v7') {
    // UUID v7 (timestamp + random)
    const timestamp = BigInt(Date.now());
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const random = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    return `${timestampHex.substring(0, 8)}-${timestampHex.substring(8, 12)}-7${random.substring(0, 3)}-${(parseInt(random[3], 16) & 0x3 | 0x8).toString(16)}${random.substring(4, 7)}-${random.substring(7, 19)}`;
  }

  return generateUUID('v4');
}

// Timestamp utilities
export function timestampToDate(timestamp: string): { result: string; error?: string } {
  try {
    const num = parseInt(timestamp);
    if (isNaN(num)) {
      return { result: '', error: 'Invalid timestamp format' };
    }
    
    // Handle both seconds and milliseconds
    const date = new Date(num > 1e10 ? num : num * 1000);
    if (isNaN(date.getTime())) {
      return { result: '', error: 'Invalid timestamp value' };
    }
    
    return { result: date.toISOString() };
  } catch (error) {
    return { result: '', error: 'Failed to convert timestamp' };
  }
}

export function dateToTimestamp(date: string): { result: string; error?: string } {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return { result: '', error: 'Invalid date format' };
    }
    
    return { result: Math.floor(d.getTime() / 1000).toString() };
  } catch (error) {
    return { result: '', error: 'Failed to convert date' };
  }
}

// Password generator
export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

export function generatePassword(options: PasswordOptions): string {
  let chars = '';
  
  if (options.includeUppercase) {
    chars += options.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (options.includeLowercase) {
    chars += options.excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (options.includeNumbers) {
    chars += options.excludeSimilar ? '23456789' : '0123456789';
  }
  
  if (options.includeSymbols) {
    chars += options.excludeSimilar ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  if (!chars) {
    return '';
  }
  
  return Array.from({ length: options.length }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// Lorem Ipsum generator
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

export function generateLoremIpsum(type: 'words' | 'sentences' | 'paragraphs', count: number): string {
  if (type === 'words') {
    return Array.from({ length: count }, () => 
      LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
    ).join(' ');
  }
  
  if (type === 'sentences') {
    return Array.from({ length: count }, () => {
      const wordCount = Math.floor(Math.random() * 10) + 5;
      const words = Array.from({ length: wordCount }, () => 
        LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
      );
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      return words.join(' ') + '.';
    }).join(' ');
  }
  
  if (type === 'paragraphs') {
    return Array.from({ length: count }, () => {
      const sentenceCount = Math.floor(Math.random() * 5) + 3;
      return generateLoremIpsum('sentences', sentenceCount);
    }).join('\n\n');
  }
  
  return '';
}

// Email validator
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}

// Credit card validator (Luhn algorithm)
export function validateCreditCard(number: string): { valid: boolean; error?: string; type?: string } {
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, error: 'Credit card number must be between 13 and 19 digits' };
  }
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  const isValid = sum % 10 === 0;
  
  if (!isValid) {
    return { valid: false, error: 'Invalid credit card number (fails Luhn check)' };
  }
  
  // Determine card type
  let type = 'Unknown';
  if (/^4/.test(cleaned)) type = 'Visa';
  else if (/^5[1-5]/.test(cleaned)) type = 'Mastercard';
  else if (/^3[47]/.test(cleaned)) type = 'American Express';
  else if (/^6(?:011|5)/.test(cleaned)) type = 'Discover';
  
  return { valid: true, type };
}