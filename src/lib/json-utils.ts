/**
 * Core JSON utility functions for the developer tools
 */

import { faker } from '@faker-js/faker';

// Configure faker to use pt_BR locale and set seed for variation
faker.setDefaultRefDate(new Date());

export interface JsonParseResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface JsonFormatOptions {
  indent?: number;
  recursive?: boolean;
  indentType?: 'space' | 'tab';
}

/**
 * Decode Unicode escape sequences to their original characters
 * Handles:
 * - \u00A0 → space (non-breaking space converted to normal space)
 * - \u2028 → \n (line separator converted to line feed)
 * - \u2029 → \n (paragraph separator converted to line feed)
 * - \u2019 → ' (typographic apostrophe)
 * - \uXXXX\uYYYY → emoji (surrogate pairs like 😊)
 * - &quot; → "
 * 
 * Uses JSON.parse() natively to decode Unicode sequences
 */
export function decodeUnicodeChars(input: string): string {
  let result = input;
  
  // Replace HTML entities first
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&amp;/g, '&');
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  
  // Use JSON.parse to decode Unicode escapes naturally
  // Wrap in quotes to make it a valid JSON string, then parse
  try {
    // Only process if there are Unicode escapes
    if (result.includes('\\u')) {
      result = JSON.parse('"' + result.replace(/"/g, '\\"') + '"');
    }
  } catch {
    // If JSON.parse fails, fallback to manual replacement
    // This handles edge cases where the string isn't valid JSON
    result = result
      .replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => {
        const charCode = parseInt(hex, 16);
        return String.fromCharCode(charCode);
      });
  }
  
  // After decoding, convert problematic line/paragraph separators to normal line feeds
  // This prevents VS Code warnings while making them readable
  result = result.replace(/\u2028/g, '\n');
  result = result.replace(/\u2029/g, '\n');
  
  return result;
}

/**
 * Try to decode Unicode characters, but return original if it breaks JSON validity
 */
export function safeDecodeUnicode(input: string): string {
  try {
    const decoded = decodeUnicodeChars(input);
    
    // Test if the decoded version is still valid JSON by trying to parse it
    try {
      JSON.parse(decoded);
      return decoded; // If valid, return decoded version
    } catch {
      // If invalid JSON, return original
      return input;
    }
  } catch {
    // If decoding fails, return original
    return input;
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse(jsonString: string): JsonParseResult {
  try {
    const data = JSON.parse(jsonString);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown parsing error' 
    };
  }
}

/**
 * Beautify/prettify JSON with optional recursive formatting
 */
export function beautifyJson(input: string, options: JsonFormatOptions = {}): JsonParseResult {
  const { indent = 2, recursive = false, indentType = 'space' } = options;
  
  // Try to decode Unicode characters first
  const decodedInput = safeDecodeUnicode(input);
  
  // Try to parse directly first
  let parseResult = safeJsonParse(decodedInput);
  
  // If parsing fails, try unescaping and parsing again
  if (!parseResult.success) {
    try {
      const unescapedInput = unescapeJson(decodedInput);
      parseResult = safeJsonParse(unescapedInput);
    } catch {
      // If unescape fails, return the original parse error
    }
  }
  
  if (!parseResult.success) {
    return parseResult;
  }

  try {
    let result = parseResult.data;
    
    if (recursive) {
      result = recursiveJsonParse(result);
    }
    
    // Process the parsed data to decode Unicode in string values
    result = processUnicodeInObject(result);
    
    const indentString = indentType === 'tab' ? '\t' : indent;
    const formatted = JSON.stringify(result, null, indentString);
    
    return { success: true, data: formatted };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Formatting error' 
    };
  }
}

/**
 * Process an object/array to decode Unicode characters in all string values
 */
function processUnicodeInObject(obj: any): any {
  if (typeof obj === 'string') {
    return decodeUnicodeChars(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(processUnicodeInObject);
  } else if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processUnicodeInObject(value);
    }
    return result;
  }
  return obj;
}

/**
 * Minify JSON by removing all whitespace
 */
export function minifyJson(input: string): JsonParseResult {
  // Try to decode Unicode characters first
  const decodedInput = safeDecodeUnicode(input);
  
  const parseResult = safeJsonParse(decodedInput);
  if (!parseResult.success) {
    return parseResult;
  }

  try {
    // Process the parsed data to decode Unicode in string values
    const result = processUnicodeInObject(parseResult.data);
    const minified = JSON.stringify(result);
    
    return { success: true, data: minified };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Minification error' 
    };
  }
}

/**
 * Escape JSON for embedding in strings
 */
export function escapeJson(input: string): string {
  // Try to decode Unicode characters first
  const decodedInput = decodeUnicodeChars(input);
  
  // Use JSON.stringify to properly escape the string
  // Remove the outer quotes added by stringify
  return JSON.stringify(decodedInput).slice(1, -1);
}

/**
 * Unescape JSON from string format
 */
export function unescapeJson(input: string): string {
  // Try to decode Unicode characters first
  const decodedInput = decodeUnicodeChars(input);
  const trimmed = decodedInput.trim();
  
  // If the input is a JSON string (wrapped in quotes), parse it
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // If parse fails, fall back to manual unescape
    }
  }
  
  // Manual unescape for non-quoted strings
  return trimmed
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
}

/**
 * Serialize object to JSON with optional recursive serialization
 */
export function serializeToJson(obj: any, recursive = false): string {
  if (recursive) {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    }, 2);
  }
  return JSON.stringify(obj, null, 2);
}

/**
 * Deserialize JSON with optional recursive deserialization
 */
export function deserializeJson(input: string, recursive = false): JsonParseResult {
  const parseResult = safeJsonParse(input);
  if (!parseResult.success) {
    return parseResult;
  }

  try {
    let result = parseResult.data;
    
    if (recursive) {
      result = recursiveJsonParse(result);
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Deserialization error' 
    };
  }
}

/**
 * Recursively parse JSON strings within an object
 * Only parses strings that are valid JSON objects or arrays, not primitives
 */
function recursiveJsonParse(obj: any): any {
  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj);
      // Only recursively parse if the result is an object or array, not primitives
      if (parsed !== null && (typeof parsed === 'object')) {
        return recursiveJsonParse(parsed);
      }
      // If it's a primitive (number, boolean, null), return the original string
      return obj;
    } catch {
      return obj;
    }
  } else if (Array.isArray(obj)) {
    return obj.map(recursiveJsonParse);
  } else if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = recursiveJsonParse(value);
    }
    return result;
  }
  return obj;
}

/**
 * Flatten JSON object with dot notation
 */
export function flattenJson(obj: any, prefix = ''): any {
  // Handle primitive values at root level (string, number, boolean, null)
  if (obj === null || typeof obj !== 'object') {
    // If there's no prefix, return the value directly
    if (!prefix) {
      return obj;
    }
    // If there's a prefix, return as key-value pair
    return { [prefix]: obj };
  }
  
  const flattened: Record<string, any> = {};
  
  // Handle arrays
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const newKey = prefix ? `${prefix}.${i}` : `${i}`;
      
      if (obj[i] !== null && typeof obj[i] === 'object') {
        Object.assign(flattened, flattenJson(obj[i], newKey));
      } else {
        flattened[newKey] = obj[i];
      }
    }
    return flattened;
  }
  
  // Handle objects
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (Array.isArray(obj[key])) {
        // Handle arrays
        for (let i = 0; i < obj[key].length; i++) {
          const arrayKey = `${newKey}.${i}`;
          if (obj[key][i] !== null && typeof obj[key][i] === 'object') {
            Object.assign(flattened, flattenJson(obj[key][i], arrayKey));
          } else {
            flattened[arrayKey] = obj[key][i];
          }
        }
      } else if (obj[key] !== null && typeof obj[key] === 'object') {
        // Handle nested objects
        Object.assign(flattened, flattenJson(obj[key], newKey));
      } else {
        // Handle primitive values
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

/**
 * Unflatten JSON object from dot notation
 */
export function unflattenJson(flatObj: any): any {
  // Handle primitive values (already flattened values)
  if (flatObj === null || typeof flatObj !== 'object' || Array.isArray(flatObj)) {
    return flatObj;
  }
  
  // Check if it's an empty object
  const keys = Object.keys(flatObj);
  if (keys.length === 0) {
    return {};
  }
  
  const result: any = {};
  
  // Check if all keys are numeric indices (indicating a root array)
  const allKeysAreIndices = keys.every(key => {
    const firstPart = key.split('.')[0];
    return /^\d+$/.test(firstPart);
  });
  
  if (allKeysAreIndices) {
    // Handle root array case
    const rootArray: any[] = [];
    for (const key in flatObj) {
      const keys = key.split('.');
      let current: any = rootArray;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i];
        const nextKey = keys[i + 1];
        const index = parseInt(currentKey, 10);
        
        if (!current[index]) {
          // Check if next key is a number (array index)
          const isArrayIndex = /^\d+$/.test(nextKey);
          current[index] = isArrayIndex ? [] : {};
        }
        current = current[index];
      }
      
      const lastKey = keys[keys.length - 1];
      if (/^\d+$/.test(lastKey)) {
        const index = parseInt(lastKey, 10);
        current[index] = flatObj[key];
      } else {
        current[lastKey] = flatObj[key];
      }
    }
    return rootArray;
  }
  
  // Handle regular object case
  for (const key in flatObj) {
    const keys = key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i];
      const nextKey = keys[i + 1];
      
      if (!(currentKey in current)) {
        // Check if next key is a number (array index)
        const isArrayIndex = /^\d+$/.test(nextKey);
        current[currentKey] = isArrayIndex ? [] : {};
      }
      current = current[currentKey];
    }
    
    const lastKey = keys[keys.length - 1];
    // Handle array indices
    if (/^\d+$/.test(lastKey)) {
      const index = parseInt(lastKey, 10);
      if (!Array.isArray(current)) {
        current = [];
      }
      current[index] = flatObj[key];
    } else {
      current[lastKey] = flatObj[key];
    }
  }
  
  return result;
}

/**
 * Compare two JSON objects and return differences
 */
export function compareJson(json1: string, json2: string): JsonParseResult {
  const parse1 = safeJsonParse(json1);
  const parse2 = safeJsonParse(json2);
  
  if (!parse1.success) return { success: false, error: `First JSON: ${parse1.error}` };
  if (!parse2.success) return { success: false, error: `Second JSON: ${parse2.error}` };
  
  const differences = findDifferences(parse1.data, parse2.data);
  return { success: true, data: differences };
}

/**
 * Find differences between two objects
 */
function findDifferences(obj1: any, obj2: any, path = ''): any[] {
  const differences: any[] = [];
  
  // Helper to add difference
  const addDiff = (type: string, key: string, value1?: any, value2?: any) => {
    differences.push({
      type,
      path: path ? `${path}.${key}` : key,
      value1,
      value2
    });
  };
  
  // Compare objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object' && obj1 !== null && obj2 !== null) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);
    
    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj1)) {
        addDiff('added', key, undefined, obj2[key]);
      } else if (!(key in obj2)) {
        addDiff('removed', key, obj1[key], undefined);
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        differences.push(...findDifferences(obj1[key], obj2[key], newPath));
      }
    }
  } else if (obj1 !== obj2) {
    addDiff('changed', '', obj1, obj2);
  }
  
  return differences;
}

/**
 * Generate random JSON for testing
 */
export function generateRandomJson(options: {
  depthMin?: number;
  depthMax?: number;
  arrayLengthMin?: number;
  arrayLengthMax?: number;
  objectKeysMin?: number;
  objectKeysMax?: number;
  includeNulls?: boolean;
  includeDates?: boolean;
  includeNumbers?: boolean;
  includeStrings?: boolean;
  includeBooleans?: boolean;
} = {}): string {
  const { 
    depthMin = 2, 
    depthMax = 4, 
    arrayLengthMin = 3, 
    arrayLengthMax = 7, 
    objectKeysMin = 3, 
    objectKeysMax = 7,
    includeNulls = true,
    includeDates = true,
    includeNumbers = true,
    includeStrings = true,
    includeBooleans = true
  } = options;
  
  const randomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Realistic key names with data generators
  const keyGenerators: Record<string, () => any> = {
    // Personal Info
    'id': () => faker.string.uuid(),
    'name': () => faker.person.fullName(),
    'firstName': () => faker.person.firstName(),
    'lastName': () => faker.person.lastName(),
    'email': () => faker.internet.email(),
    'username': () => faker.internet.username(),
    'password': () => faker.internet.password(),
    'avatar': () => faker.image.avatar(),
    'bio': () => faker.person.bio(),
    'jobTitle': () => faker.person.jobTitle(),
    'company': () => faker.company.name(),
    
    // Contact
    'phone': () => faker.phone.number('(##) #####-####'),
    'mobile': () => faker.phone.number('(##) 9####-####'),
    'cpf': () => faker.phone.number('###.###.###-##'),
    'cnpj': () => faker.phone.number('##.###.###/####-##'),
    
    // Address (BR)
    'address': () => faker.location.streetAddress(),
    'street': () => faker.location.street(),
    'city': () => faker.location.city(),
    'state': () => faker.location.state({ abbreviated: true }),
    'zipCode': () => faker.location.zipCode('#####-###'),
    'cep': () => faker.location.zipCode('#####-###'),
    'country': () => 'Brasil',
    'neighborhood': () => faker.location.county(),
    
    // Dates
    'date': () => faker.date.past().toISOString(),
    'createdAt': () => faker.date.past().toISOString(),
    'updatedAt': () => faker.date.recent().toISOString(),
    'birthDate': () => faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
    'timestamp': () => faker.date.recent().getTime(),
    
    // Numbers
    'age': () => faker.number.int({ min: 18, max: 80 }),
    'price': () => parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    'amount': () => faker.number.int({ min: 1, max: 1000 }),
    'quantity': () => faker.number.int({ min: 1, max: 100 }),
    'total': () => faker.number.float({ min: 10, max: 10000, precision: 0.01 }),
    'rating': () => faker.number.float({ min: 1, max: 5, precision: 0.1 }),
    'score': () => faker.number.int({ min: 0, max: 100 }),
    
    // Booleans
    'isActive': () => faker.datatype.boolean(),
    'isVerified': () => faker.datatype.boolean(),
    'isPremium': () => faker.datatype.boolean(),
    'isPublic': () => faker.datatype.boolean(),
    'isEnabled': () => faker.datatype.boolean(),
    
    // Commerce
    'product': () => faker.commerce.productName(),
    'productName': () => faker.commerce.productName(),
    'category': () => faker.commerce.department(),
    'department': () => faker.commerce.department(),
    'sku': () => faker.commerce.isbn(),
    
    // Web
    'url': () => faker.internet.url(),
    'website': () => faker.internet.url(),
    'domain': () => faker.internet.domainName(),
    'ip': () => faker.internet.ip(),
    'userAgent': () => faker.internet.userAgent(),
    
    // Text
    'title': () => faker.lorem.sentence(),
    'description': () => faker.lorem.paragraph(),
    'content': () => faker.lorem.paragraphs(2),
    'message': () => faker.lorem.sentence(),
    'comment': () => faker.lorem.sentences(2),
    'note': () => faker.lorem.sentence(),
    
    // Status
    'status': () => faker.helpers.arrayElement(['active', 'inactive', 'pending', 'approved', 'rejected']),
    'type': () => faker.helpers.arrayElement(['standard', 'premium', 'basic', 'pro']),
    'priority': () => faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
    'role': () => faker.helpers.arrayElement(['admin', 'user', 'moderator', 'guest']),
    
    // Finance (BR)
    'currency': () => 'BRL',
    'balance': () => faker.number.float({ min: 100, max: 100000, precision: 0.01 }),
    'salary': () => faker.number.float({ min: 1500, max: 50000, precision: 0.01 }),
    
    // IDs
    'code': () => faker.string.alphanumeric(8).toUpperCase(),
    'token': () => faker.string.alphanumeric(32),
    'uuid': () => faker.string.uuid(),
    'hash': () => faker.git.commitSha(),
  };

  const keyNames = Object.keys(keyGenerators);
  const usedKeys = new Set<string>();
  
  const getRandomKey = (): string => {
    let key = keyNames[Math.floor(Math.random() * keyNames.length)];
    let counter = 1;
    const originalKey = key;
    while (usedKeys.has(key)) {
      key = `${originalKey}${counter}`;
      counter++;
    }
    usedKeys.add(key);
    return key;
  };
  
  const getValueForKey = (key: string): any => {
    // Remove numbers from the end to get base key
    const baseKey = key.replace(/\d+$/, '');
    if (keyGenerators[baseKey]) {
      return keyGenerators[baseKey]();
    }
    // Fallback to generic string
    return faker.lorem.word();
  };
  
  const targetDepth = randomInRange(depthMin, depthMax);
  
  const randomValue = (currentDepth: number, parentKey?: string, forceType?: string): any => {
    if (currentDepth <= 0) {
      // If we have a parent key, use its generator
      if (parentKey) {
        return getValueForKey(parentKey);
      }
      
      const primitives = [];
      
      if (includeNumbers) primitives.push(faker.number.int({ min: 1, max: 1000 }));
      if (includeBooleans) primitives.push(faker.datatype.boolean());
      if (includeNulls) primitives.push(null);
      if (includeStrings) primitives.push(faker.lorem.word());
      if (includeDates) primitives.push(faker.date.recent().toISOString());
      
      // Fallback if no types enabled
      if (primitives.length === 0) {
        return faker.lorem.word();
      }
      
      return primitives[Math.floor(Math.random() * primitives.length)];
    }
    
    // Prioritize objects and arrays at higher depths (80% chance)
    // At root level or high depth, almost always create objects/arrays
    let types: string[];
    if (forceType) {
      types = [forceType];
    } else if (currentDepth >= targetDepth - 1) {
      // Root level: 90% object, 10% array
      types = Math.random() < 0.9 ? ['object'] : ['array'];
    } else if (currentDepth > targetDepth / 2) {
      // Higher levels: prioritize structure (60% object, 30% array, 10% primitive)
      const rand = Math.random();
      if (rand < 0.6) types = ['object'];
      else if (rand < 0.9) types = ['array'];
      else types = ['primitive'];
    } else {
      // Lower levels: more balanced
      const rand = Math.random();
      if (rand < 0.4) types = ['object'];
      else if (rand < 0.7) types = ['array'];
      else types = ['primitive'];
    }
    
    const type = types[0];
    
    switch (type) {
      case 'object':
        const obj: any = {};
        const numKeys = randomInRange(objectKeysMin, objectKeysMax);
        usedKeys.clear(); // Reset for each object
        for (let i = 0; i < numKeys; i++) {
          const key = getRandomKey();
          obj[key] = randomValue(currentDepth - 1, key);
        }
        return obj;
        
      case 'array':
        const arr = [];
        const arrLength = randomInRange(arrayLengthMin, arrayLengthMax);
        
        // 70% chance to create array of objects instead of mixed types
        const shouldBeObjectArray = Math.random() < 0.7 && currentDepth > 1;
        
        for (let i = 0; i < arrLength; i++) {
          if (shouldBeObjectArray) {
            arr.push(randomValue(currentDepth - 1, parentKey, 'object'));
          } else {
            arr.push(randomValue(currentDepth - 1, parentKey));
          }
        }
        return arr;
        
      default:
        return randomValue(0, parentKey);
    }
  };
  
  return JSON.stringify(randomValue(targetDepth), null, 2);
}