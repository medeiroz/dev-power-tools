import {
  copyToClipboard,
  readFromClipboard,
  copyObjectToClipboard,
  ClipboardResult
} from '../../src/lib/clipboard-utils';

// Mock navigator.clipboard for testing
const mockClipboard = {
  writeText: jest.fn(),
  readText: jest.fn()
};

Object.assign(navigator, {
  clipboard: mockClipboard
});

describe('clipboard-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyToClipboard', () => {
    test('should copy text to clipboard successfully', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const result = await copyToClipboard('Hello World');
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello World');
    });

    test('should handle clipboard write failure', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard not available'));
      
      const result = await copyToClipboard('Hello World');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Clipboard not available');
    });

    test('should copy empty string', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const result = await copyToClipboard('');
      
      expect(result.success).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('');
    });

    test('should handle unknown error types', async () => {
      mockClipboard.writeText.mockRejectedValue('String error');
      
      const result = await copyToClipboard('test');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('readFromClipboard', () => {
    test('should read text from clipboard successfully', async () => {
      mockClipboard.readText.mockResolvedValue('Clipboard content');
      
      const result = await readFromClipboard();
      
      expect(result).toBe('Clipboard content');
      expect(mockClipboard.readText).toHaveBeenCalled();
    });

    test('should handle empty clipboard', async () => {
      mockClipboard.readText.mockResolvedValue('');
      
      const result = await readFromClipboard();
      
      expect(result).toBe('');
    });
  });

  describe('copyObjectToClipboard', () => {
    test('should copy object to clipboard as formatted JSON', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const testObject = { name: 'John', age: 30, active: true };
      const result = await copyObjectToClipboard(testObject);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      
      const expectedJson = JSON.stringify(testObject, null, 2);
      expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedJson);
    });

    test('should handle complex nested objects', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const complexObject = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ],
        meta: {
          total: 2,
          timestamp: new Date('2021-01-01')
        }
      };
      
      const result = await copyObjectToClipboard(complexObject);
      
      expect(result.success).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    test('should handle arrays', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const testArray = [1, 2, 3, { name: 'test' }];
      const result = await copyObjectToClipboard(testArray);
      
      expect(result.success).toBe(true);
      const expectedJson = JSON.stringify(testArray, null, 2);
      expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedJson);
    });

    test('should handle objects with circular references', async () => {
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject; // Create circular reference
      
      const result = await copyObjectToClipboard(circularObject);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Converting circular structure to JSON');
    });

    test('should handle clipboard write failure for objects', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
      
      const testObject = { test: 'value' };
      const result = await copyObjectToClipboard(testObject);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Clipboard error');
    });

    test('should handle null and undefined values', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const nullResult = await copyObjectToClipboard(null);
      expect(nullResult.success).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('null');
      
      const undefinedResult = await copyObjectToClipboard(undefined);
      expect(undefinedResult.success).toBe(true);
    });

    test('should handle primitive values', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const stringResult = await copyObjectToClipboard('test string');
      expect(stringResult.success).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('"test string"');
      
      const numberResult = await copyObjectToClipboard(42);
      expect(numberResult.success).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('42');
      
      const booleanResult = await copyObjectToClipboard(true);
      expect(booleanResult.success).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('true');
    });
  });
});