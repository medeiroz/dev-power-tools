/**
 * Core JSON utility functions for the developer tools
 */

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
  
  // Try to parse directly first
  let parseResult = safeJsonParse(input);
  
  // If parsing fails, try unescaping and parsing again
  if (!parseResult.success) {
    try {
      const unescapedInput = unescapeJson(input);
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
 * Minify JSON by removing all whitespace
 */
export function minifyJson(input: string): JsonParseResult {
  const parseResult = safeJsonParse(input);
  if (!parseResult.success) {
    return parseResult;
  }

  try {
    const minified = JSON.stringify(parseResult.data);
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
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Unescape JSON from string format
 */
export function unescapeJson(input: string): string {
  let processedInput = input.trim();
  
  // If the input is wrapped in quotes, remove them first
  if (processedInput.startsWith('"') && processedInput.endsWith('"')) {
    processedInput = processedInput.slice(1, -1);
  }
  
  return processedInput
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
 */
function recursiveJsonParse(obj: any): any {
  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj);
      return recursiveJsonParse(parsed);
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
  depth?: number;
  arrayLength?: number;
  objectKeys?: number;
} = {}): string {
  const { depth = 3, arrayLength = 5, objectKeys = 5 } = options;
  
  const randomValue = (currentDepth: number): any => {
    if (currentDepth <= 0) {
      const primitives = [
        Math.floor(Math.random() * 1000),
        Math.random() > 0.5,
        null,
        `string_${Math.random().toString(36).substr(2, 9)}`,
        new Date().toISOString()
      ];
      return primitives[Math.floor(Math.random() * primitives.length)];
    }
    
    const types = ['object', 'array', 'primitive'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch (type) {
      case 'object':
        const obj: any = {};
        for (let i = 0; i < Math.floor(Math.random() * objectKeys) + 1; i++) {
          obj[`key_${i}`] = randomValue(currentDepth - 1);
        }
        return obj;
        
      case 'array':
        const arr = [];
        for (let i = 0; i < Math.floor(Math.random() * arrayLength) + 1; i++) {
          arr.push(randomValue(currentDepth - 1));
        }
        return arr;
        
      default:
        return randomValue(0);
    }
  };
  
  return JSON.stringify(randomValue(depth), null, 2);
}