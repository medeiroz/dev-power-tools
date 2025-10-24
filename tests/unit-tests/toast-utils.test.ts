import {
  createToastHelper,
  ToastOptions
} from '../../src/lib/toast-utils';

describe('toast-utils', () => {
  let mockToast: jest.Mock;
  let toastHelper: ReturnType<typeof createToastHelper>;

  beforeEach(() => {
    mockToast = jest.fn();
    toastHelper = createToastHelper(mockToast);
  });

  describe('createToastHelper', () => {
    test('should create toast helper with all methods', () => {
      expect(toastHelper).toHaveProperty('success');
      expect(toastHelper).toHaveProperty('error');
      expect(toastHelper).toHaveProperty('copySuccess');
      expect(toastHelper).toHaveProperty('copyError');
      expect(toastHelper).toHaveProperty('downloadSuccess');
      expect(toastHelper).toHaveProperty('downloadError');
    });

    test('should return object with function methods', () => {
      expect(typeof toastHelper.success).toBe('function');
      expect(typeof toastHelper.error).toBe('function');
      expect(typeof toastHelper.copySuccess).toBe('function');
      expect(typeof toastHelper.copyError).toBe('function');
      expect(typeof toastHelper.downloadSuccess).toBe('function');
      expect(typeof toastHelper.downloadError).toBe('function');
    });
  });

  describe('success method', () => {
    test('should call toast with success configuration', () => {
      const title = 'Operation successful';
      const description = 'The operation completed successfully';

      toastHelper.success(title, description);

      expect(mockToast).toHaveBeenCalledWith({
        title,
        description,
        variant: 'default'
      });
    });

    test('should work with title only', () => {
      const title = 'Success!';

      toastHelper.success(title);

      expect(mockToast).toHaveBeenCalledWith({
        title,
        description: undefined,
        variant: 'default'
      });
    });

    test('should handle empty strings', () => {
      toastHelper.success('', '');

      expect(mockToast).toHaveBeenCalledWith({
        title: '',
        description: '',
        variant: 'default'
      });
    });

    test('should handle special characters', () => {
      const title = 'Sucesso! 🎉';
      const description = 'Operação realizada com êxito';

      toastHelper.success(title, description);

      expect(mockToast).toHaveBeenCalledWith({
        title,
        description,
        variant: 'default'
      });
    });
  });

  describe('error method', () => {
    test('should call toast with error configuration', () => {
      const title = 'Operation failed';
      const description = 'Something went wrong';

      toastHelper.error(title, description);

      expect(mockToast).toHaveBeenCalledWith({
        title,
        description,
        variant: 'destructive'
      });
    });

    test('should work with title only', () => {
      const title = 'Error occurred';

      toastHelper.error(title);

      expect(mockToast).toHaveBeenCalledWith({
        title,
        description: undefined,
        variant: 'destructive'
      });
    });

    test('should handle long error messages', () => {
      const title = 'Validation Error';
      const description = 'The form contains multiple validation errors. Please check all fields and try again.';

      toastHelper.error(title, description);

      expect(mockToast).toHaveBeenCalledWith({
        title,
        description,
        variant: 'destructive'
      });
    });

    test('should handle network error messages', () => {
      const title = 'Network Error';
      const description = 'Unable to connect to server. Please check your internet connection.';

      toastHelper.error(title, description);

      expect(mockToast).toHaveBeenCalledWith({
        title,
        description,
        variant: 'destructive'
      });
    });
  });

  describe('copySuccess method', () => {
    test('should show default copy success message', () => {
      toastHelper.copySuccess();

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Copied!',
        description: 'Content copied to clipboard'
      });
    });

    test('should show custom label in copy success message', () => {
      const label = 'API Key';

      toastHelper.copySuccess(label);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Copied!',
        description: 'API Key copied to clipboard'
      });
    });

    test('should handle empty label', () => {
      toastHelper.copySuccess('');

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Copied!',
        description: ' copied to clipboard'
      });
    });

    test('should handle various content types', () => {
      const testCases = ['Text', 'JSON', 'Code', 'URL', 'Password'];

      testCases.forEach(label => {
        toastHelper.copySuccess(label);
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Copied!',
          description: `${label} copied to clipboard`
        });
      });
    });
  });

  describe('copyError method', () => {
    test('should show copy error message', () => {
      toastHelper.copyError();

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    });

    test('should always show same error message regardless of calls', () => {
      toastHelper.copyError();
      toastHelper.copyError();

      expect(mockToast).toHaveBeenCalledTimes(2);
      expect(mockToast).toHaveBeenNthCalledWith(1, {
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
      expect(mockToast).toHaveBeenNthCalledWith(2, {
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    });
  });

  describe('downloadSuccess method', () => {
    test('should show download success message with filename', () => {
      const filename = 'document.pdf';

      toastHelper.downloadSuccess(filename);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Downloaded!',
        description: 'File saved as document.pdf'
      });
    });

    test('should handle various file types', () => {
      const filenames = ['data.json', 'report.csv', 'image.png', 'archive.zip'];

      filenames.forEach(filename => {
        toastHelper.downloadSuccess(filename);
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Downloaded!',
          description: `File saved as ${filename}`
        });
      });
    });

    test('should handle long filenames', () => {
      const filename = 'very-long-filename-with-many-characters-and-details.xlsx';

      toastHelper.downloadSuccess(filename);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Downloaded!',
        description: `File saved as ${filename}`
      });
    });

    test('should handle filenames with special characters', () => {
      const filename = 'arquivo_relatório-2023.pdf';

      toastHelper.downloadSuccess(filename);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Downloaded!',
        description: `File saved as ${filename}`
      });
    });
  });

  describe('downloadError method', () => {
    test('should show download error message', () => {
      toastHelper.downloadError();

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Download failed',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    });

    test('should always show same error message', () => {
      toastHelper.downloadError();
      toastHelper.downloadError();

      expect(mockToast).toHaveBeenCalledTimes(2);
      expect(mockToast).toHaveBeenNthCalledWith(1, {
        title: 'Download failed',
        description: 'Failed to download file',
        variant: 'destructive'
      });
      expect(mockToast).toHaveBeenNthCalledWith(2, {
        title: 'Download failed',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    });
  });
});