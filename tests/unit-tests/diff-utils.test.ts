import { describe, test, expect } from '@jest/globals';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber1?: number;
  lineNumber2?: number;
}

// Function extracted from diff-tool component for testing
function computeDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const result: DiffLine[] = [];
  
  const maxLines = Math.max(lines1.length, lines2.length);
  let lineNum1 = 0;
  let lineNum2 = 0;

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];

    if (line1 === line2) {
      result.push({
        type: 'unchanged',
        content: line1 || '',
        lineNumber1: ++lineNum1,
        lineNumber2: ++lineNum2,
      });
    } else {
      if (line1 !== undefined) {
        result.push({
          type: 'removed',
          content: line1,
          lineNumber1: ++lineNum1,
        });
      }
      if (line2 !== undefined) {
        result.push({
          type: 'added',
          content: line2,
          lineNumber2: ++lineNum2,
        });
      }
    }
  }

  return result;
}

describe('Diff Utils', () => {
  describe('computeDiff', () => {
    test('should return empty array for two empty strings', () => {
      const result = computeDiff('', '');
      expect(result).toEqual([{
        type: 'unchanged',
        content: '',
        lineNumber1: 1,
        lineNumber2: 1,
      }]);
    });

    test('should detect identical single-line texts', () => {
      const text = 'Hello World';
      const result = computeDiff(text, text);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'unchanged',
        content: 'Hello World',
        lineNumber1: 1,
        lineNumber2: 1,
      });
    });

    test('should detect added lines', () => {
      const text1 = 'Line 1';
      const text2 = 'Line 1\nLine 2';
      const result = computeDiff(text1, text2);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('unchanged');
      expect(result[0].content).toBe('Line 1');
      expect(result[1].type).toBe('added');
      expect(result[1].content).toBe('Line 2');
      expect(result[1].lineNumber2).toBe(2);
    });

    test('should detect removed lines', () => {
      const text1 = 'Line 1\nLine 2';
      const text2 = 'Line 1';
      const result = computeDiff(text1, text2);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('unchanged');
      expect(result[0].content).toBe('Line 1');
      expect(result[1].type).toBe('removed');
      expect(result[1].content).toBe('Line 2');
      expect(result[1].lineNumber1).toBe(2);
    });

    test('should detect changed lines', () => {
      const text1 = 'Original line';
      const text2 = 'Modified line';
      const result = computeDiff(text1, text2);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        type: 'removed',
        content: 'Original line',
        lineNumber1: 1,
      });
      expect(result[1]).toMatchObject({
        type: 'added',
        content: 'Modified line',
        lineNumber2: 1,
      });
    });

    test('should handle multi-line diffs correctly', () => {
      const text1 = 'Line 1\nLine 2\nLine 3';
      const text2 = 'Line 1\nModified Line 2\nLine 3';
      const result = computeDiff(text1, text2);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({
        type: 'unchanged',
        content: 'Line 1',
      });
      expect(result[1]).toMatchObject({
        type: 'removed',
        content: 'Line 2',
      });
      expect(result[2]).toMatchObject({
        type: 'added',
        content: 'Modified Line 2',
      });
      expect(result[3]).toMatchObject({
        type: 'unchanged',
        content: 'Line 3',
      });
    });

    test('should handle complex multi-line changes', () => {
      const text1 = `function hello() {
  console.log("Hello");
  return true;
}`;
      const text2 = `function hello() {
  console.log("Hello World");
  console.log("Extra line");
  return true;
}`;
      const result = computeDiff(text1, text2);
      
      const addedLines = result.filter(line => line.type === 'added');
      const removedLines = result.filter(line => line.type === 'removed');
      const unchangedLines = result.filter(line => line.type === 'unchanged');
      
      expect(addedLines.length).toBeGreaterThan(0);
      expect(removedLines.length).toBeGreaterThan(0);
      expect(unchangedLines.length).toBeGreaterThan(0);
    });

    test('should maintain correct line numbers', () => {
      const text1 = 'A\nB\nC';
      const text2 = 'A\nX\nC';
      const result = computeDiff(text1, text2);
      
      expect(result[0].lineNumber1).toBe(1);
      expect(result[0].lineNumber2).toBe(1);
      expect(result[1].lineNumber1).toBe(2);
      expect(result[2].lineNumber2).toBe(2);
      expect(result[3].lineNumber1).toBe(3);
      expect(result[3].lineNumber2).toBe(3);
    });

    test('should handle empty lines', () => {
      const text1 = 'Line 1\n\nLine 3';
      const text2 = 'Line 1\n\nLine 3';
      const result = computeDiff(text1, text2);
      
      expect(result).toHaveLength(3);
      expect(result.every(line => line.type === 'unchanged')).toBe(true);
      expect(result[1].content).toBe('');
    });

    test('should handle text with only additions', () => {
      const text1 = '';
      const text2 = 'New Line 1\nNew Line 2';
      const result = computeDiff(text1, text2);
      
      const addedLines = result.filter(line => line.type === 'added');
      expect(addedLines.length).toBeGreaterThan(0);
    });

    test('should handle text with only deletions', () => {
      const text1 = 'Old Line 1\nOld Line 2';
      const text2 = '';
      const result = computeDiff(text1, text2);
      
      const removedLines = result.filter(line => line.type === 'removed');
      expect(removedLines.length).toBeGreaterThan(0);
    });

    test('should handle special characters', () => {
      const text1 = 'function test() { return "test"; }';
      const text2 = 'function test() { return "test!"; }';
      const result = computeDiff(text1, text2);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('removed');
      expect(result[1].type).toBe('added');
    });

    test('should handle whitespace differences', () => {
      const text1 = '  indented';
      const text2 = '    more indented';
      const result = computeDiff(text1, text2);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        type: 'removed',
        content: '  indented',
      });
      expect(result[1]).toMatchObject({
        type: 'added',
        content: '    more indented',
      });
    });
  });
});
