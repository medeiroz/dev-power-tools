import { 
  flattenJson, 
  unflattenJson, 
  safeJsonParse, 
  beautifyJson, 
  minifyJson, 
  escapeJson, 
  unescapeJson, 
  serializeToJson, 
  deserializeJson, 
  compareJson, 
  generateRandomJson 
} from '../../src/lib/json-utils';

describe('json-utils', () => {
  describe('flattenJson', () => {
    test('should handle primitive values', () => {
      expect(flattenJson('name')).toBe('name');
      expect(flattenJson(42)).toBe(42);
      expect(flattenJson(true)).toBe(true);
      expect(flattenJson(null)).toBe(null);
    });

    test('should flatten simple objects', () => {
      const input = { key: 'value', number: 123 };
      const expected = { key: 'value', number: 123 };
      expect(flattenJson(input)).toEqual(expected);
    });

    test('should flatten nested objects', () => {
      const input = {
        a: {
          b: {
            c: 'deep'
          }
        },
        d: 'shallow'
      };
      const expected = {
        'a.b.c': 'deep',
        'd': 'shallow'
      };
      expect(flattenJson(input)).toEqual(expected);
    });

    test('should flatten arrays correctly', () => {
      const input = [{ key_a: 478 }];
      const expected = { '0.key_a': 478 };
      expect(flattenJson(input)).toEqual(expected);

      const complexArray = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ];
      const expectedComplex = {
        '0.name': 'Alice',
        '0.age': 30,
        '1.name': 'Bob',
        '1.age': 25
      };
      expect(flattenJson(complexArray)).toEqual(expectedComplex);
    });
  });

  describe('unflattenJson', () => {
    test('should handle primitive values', () => {
      expect(unflattenJson('name')).toBe('name');
      expect(unflattenJson(42)).toBe(42);
      expect(unflattenJson(true)).toBe(true);
      expect(unflattenJson(null)).toBe(null);
    });

    test('should unflatten to arrays when keys are numeric', () => {
      const input = { '0.key_a': 478 };
      const expected = [{ key_a: 478 }];
      expect(unflattenJson(input)).toEqual(expected);

      const complexInput = {
        '0.name': 'Alice',
        '0.age': 30,
        '1.name': 'Bob',
        '1.age': 25
      };
      const expectedComplex = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ];
      expect(unflattenJson(complexInput)).toEqual(expectedComplex);
    });

    test('should unflatten nested objects', () => {
      const input = {
        'a.b.c': 'deep',
        'd': 'shallow'
      };
      const expected = {
        a: {
          b: {
            c: 'deep'
          }
        },
        d: 'shallow'
      };
      expect(unflattenJson(input)).toEqual(expected);
    });

    test('should handle round-trip consistency', () => {
      const testCases = [
        'name',
        42,
        true,
        null,
        { key: 'value' },
        [{ key_a: 478 }],
        { a: { b: [1, 2, { c: 3 }] }, d: 4 },
        [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
      ];

      testCases.forEach(testCase => {
        const flattened = flattenJson(testCase);
        const unflattened = unflattenJson(flattened);
        expect(unflattened).toEqual(testCase);
      });
    });
  });

  describe('safeJsonParse', () => {
    test('should parse valid JSON successfully', () => {
      const validJson = '{"name": "test", "value": 123}';
      const result = safeJsonParse(validJson);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'test', value: 123 });
      expect(result.error).toBeUndefined();
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidJson = '{"name": "test", "value":}';
      const result = safeJsonParse(invalidJson);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    test('should parse arrays correctly', () => {
      const arrayJson = '[1, "two", {"three": 3}]';
      const result = safeJsonParse(arrayJson);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, "two", {"three": 3}]);
    });

    test('should handle primitive values', () => {
      const testCases = [
        { input: 'null', expected: null },
        { input: 'true', expected: true },
        { input: 'false', expected: false },
        { input: '42', expected: 42 },
        { input: '"string"', expected: "string" }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = safeJsonParse(input);
        expect(result.success).toBe(true);
        expect(result.data).toBe(expected);
      });
    });
  });

  describe('beautifyJson', () => {
    test('should beautify JSON with default options', () => {
      const input = '{"name":"test","nested":{"value":123}}';
      const result = beautifyJson(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toContain('{\n  "name": "test",\n');
      expect(result.data).toContain('  "nested": {\n    "value": 123\n  }\n}');
    });

    test('should handle custom indent', () => {
      const input = '{"a":1}';
      const result = beautifyJson(input, { indent: 4 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('{\n    "a": 1\n}');
    });

    test('should handle tab indentation', () => {
      const input = '{"a":1}';
      const result = beautifyJson(input, { indentType: 'tab' });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('{\n\t"a": 1\n}');
    });

    test('should handle invalid JSON', () => {
      const input = '{"invalid": json}';
      const result = beautifyJson(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('minifyJson', () => {
    test('should minify formatted JSON', () => {
      const input = `{
        "name": "test",
        "nested": {
          "value": 123,
          "array": [1, 2, 3]
        }
      }`;
      const result = minifyJson(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('{"name":"test","nested":{"value":123,"array":[1,2,3]}}');
    });

    test('should handle already minified JSON', () => {
      const input = '{"name":"test","value":123}';
      const result = minifyJson(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('{"name":"test","value":123}');
    });

    test('should handle invalid JSON', () => {
      const input = '{"invalid": json}';
      const result = minifyJson(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('escapeJson and unescapeJson', () => {
    test('should escape special characters', () => {
      const input = 'String with "quotes", \nlines, \ttabs, and \\backslashes';
      const result = escapeJson(input);
      
      expect(result).toBe('String with \\"quotes\\", \\nlines, \\ttabs, and \\\\backslashes');
    });

    test('should unescape special characters', () => {
      const input = 'String with \\"quotes\\", \\nlines, \\ttabs, and \\\\backslashes';
      const result = unescapeJson(input);
      
      expect(result).toBe('String with "quotes", \nlines, \ttabs, and \\backslashes');
    });

    test('should be reversible', () => {
      const original = 'Test "quotes" \n new lines \t tabs \\ slashes';
      const escaped = escapeJson(original);
      const unescaped = unescapeJson(escaped);
      
      expect(unescaped).toBe(original);
    });
  });

  describe('serializeToJson', () => {
    test('should serialize object to formatted JSON', () => {
      const obj = { name: 'test', value: 123, nested: { key: 'value' } };
      const result = serializeToJson(obj);
      
      expect(result).toContain('{\n  "name": "test",');
      expect(result).toContain('  "value": 123,');
      expect(result).toContain('  "nested": {\n    "key": "value"\n  }\n}');
    });

    test('should handle arrays', () => {
      const arr = [1, 'test', { key: 'value' }];
      const result = serializeToJson(arr);
      
      expect(result).toContain('[\n  1,\n  "test",');
      expect(result).toContain('  {\n    "key": "value"\n  }\n]');
    });

    test('should handle primitive values', () => {
      expect(serializeToJson('string')).toBe('"string"');
      expect(serializeToJson(123)).toBe('123');
      expect(serializeToJson(true)).toBe('true');
      expect(serializeToJson(null)).toBe('null');
    });
  });

  describe('deserializeJson', () => {
    test('should deserialize valid JSON', () => {
      const jsonString = '{"name": "test", "value": 123}';
      const result = deserializeJson(jsonString);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'test', value: 123 });
    });

    test('should handle invalid JSON', () => {
      const invalidJson = '{"name": "test", "value":}';
      const result = deserializeJson(invalidJson);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle arrays', () => {
      const arrayJson = '[1, "test", {"key": "value"}]';
      const result = deserializeJson(arrayJson);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, "test", {"key": "value"}]);
    });
  });

  describe('compareJson', () => {
    test('should detect no differences in identical JSON', () => {
      const json1 = '{"name": "test", "value": 123}';
      const json2 = '{"name": "test", "value": 123}';
      const result = compareJson(json1, json2);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('should detect value changes', () => {
      const json1 = '{"name": "test", "value": 123}';
      const json2 = '{"name": "test", "value": 456}';
      const result = compareJson(json1, json2);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        type: 'changed',
        path: 'value.',
        value1: 123,
        value2: 456
      });
    });

    test('should detect added properties', () => {
      const json1 = '{"name": "test"}';
      const json2 = '{"name": "test", "value": 123}';
      const result = compareJson(json1, json2);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        type: 'added',
        path: 'value',
        value2: 123
      });
    });

    test('should detect removed properties', () => {
      const json1 = '{"name": "test", "value": 123}';
      const json2 = '{"name": "test"}';
      const result = compareJson(json1, json2);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        type: 'removed',
        path: 'value',
        value1: 123
      });
    });

    test('should handle invalid JSON', () => {
      const json1 = '{"valid": "json"}';
      const json2 = '{"invalid": json}';
      const result = compareJson(json1, json2);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Second JSON:');
    });
  });

  describe('generateRandomJson', () => {
    test('should generate valid JSON', () => {
      const result = generateRandomJson();
      const parseResult = safeJsonParse(result);
      
      expect(parseResult.success).toBe(true);
      expect(typeof result).toBe('string');
    });

    test('should respect depth option', () => {
      const result = generateRandomJson({ depth: 0 });
      const parseResult = safeJsonParse(result);
      
      expect(parseResult.success).toBe(true);
      // With depth 0, should generate primitive values
      const data = parseResult.data;
      const isPrimitive = data === null || 
                         typeof data === 'string' || 
                         typeof data === 'number' || 
                         typeof data === 'boolean';
      expect(isPrimitive).toBe(true);
    });

    test('should generate different results on multiple calls', () => {
      const result1 = generateRandomJson();
      const result2 = generateRandomJson();
      
      // While there's a tiny chance they could be the same, 
      // practically they should be different
      expect(result1).not.toBe(result2);
    });

    test('should respect object keys option', () => {
      const result = generateRandomJson({ objectKeys: 1, depth: 1 });
      const parseResult = safeJsonParse(result);
      
      expect(parseResult.success).toBe(true);
      if (typeof parseResult.data === 'object' && parseResult.data !== null && !Array.isArray(parseResult.data)) {
        expect(Object.keys(parseResult.data).length).toBeLessThanOrEqual(1);
      }
    });
  });
});