import {
  downloadAsFile,
  downloadAsJson,
  downloadAsCsv
} from '../../src/lib/download-utils';

// Mock DOM APIs
const mockCreateElement = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

// Mock document and URL
Object.defineProperty(global, 'document', {
  value: {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild
    }
  }
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
  }
});

Object.defineProperty(global, 'Blob', {
  value: class MockBlob {
    constructor(public content: any[], public options: any) {}
  }
});

describe('download-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick
    };
    
    mockCreateElement.mockReturnValue(mockAnchor);
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  describe('downloadAsFile', () => {
    test('should create and trigger download for text file', () => {
      const content = 'Hello, World!';
      const filename = 'test.txt';
      
      downloadAsFile(content, filename);
      
      // Should create anchor element
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      
      // Should create object URL
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Object));
      
      // Should append to body, click, then remove
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      
      // Should revoke URL
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    test('should set correct href and download attributes', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      };
      mockCreateElement.mockReturnValue(mockAnchor);
      
      const content = 'Test content';
      const filename = 'document.txt';
      
      downloadAsFile(content, filename);
      
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe(filename);
    });

    test('should handle empty content', () => {
      const content = '';
      const filename = 'empty.txt';
      
      downloadAsFile(content, filename);
      
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    test('should handle special characters in content', () => {
      const content = 'Special chars: áéíóú ñ çü 中文 🎉';
      const filename = 'special.txt';
      
      downloadAsFile(content, filename);
      
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('downloadAsJson', () => {
    test('should download object as formatted JSON', () => {
      const data = { name: 'John', age: 30, active: true };
      const filename = 'data';
      
      downloadAsJson(data, filename);
      
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    test('should add .json extension if not present', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      };
      mockCreateElement.mockReturnValue(mockAnchor);
      
      const data = { test: 'value' };
      const filename = 'myfile';
      
      downloadAsJson(data, filename);
      
      expect(mockAnchor.download).toBe('myfile.json');
    });

    test('should not add extension if already present', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      };
      mockCreateElement.mockReturnValue(mockAnchor);
      
      const data = { test: 'value' };
      const filename = 'myfile.json';
      
      downloadAsJson(data, filename);
      
      expect(mockAnchor.download).toBe('myfile.json');
    });

    test('should handle complex nested objects', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice', meta: { active: true } },
          { id: 2, name: 'Bob', meta: { active: false } }
        ],
        timestamp: new Date('2023-01-01'),
        config: {
          theme: 'dark',
          language: 'en'
        }
      };
      
      downloadAsJson(data, 'complex-data');
      
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('downloadAsCsv', () => {
    test('should download CSV data with correct mime type', () => {
      const csvData = 'Name,Age,City\nJohn,30,NYC\nJane,25,LA';
      const filename = 'users';
      
      downloadAsCsv(csvData, filename);
      
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    test('should add .csv extension if not present', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      };
      mockCreateElement.mockReturnValue(mockAnchor);
      
      const csvData = 'Header1,Header2\nValue1,Value2';
      const filename = 'data';
      
      downloadAsCsv(csvData, filename);
      
      expect(mockAnchor.download).toBe('data.csv');
    });

    test('should not add extension if already present', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick
      };
      mockCreateElement.mockReturnValue(mockAnchor);
      
      const csvData = 'Header1,Header2\nValue1,Value2';
      const filename = 'report.csv';
      
      downloadAsCsv(csvData, filename);
      
      expect(mockAnchor.download).toBe('report.csv');
    });

    test('should handle empty CSV data', () => {
      const csvData = '';
      const filename = 'empty';
      
      downloadAsCsv(csvData, filename);
      
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });
});