/**
 * Utility functions for clipboard operations
 */

export interface ClipboardResult {
  success: boolean;
  error?: string;
}

export const copyToClipboard = async (text: string): Promise<ClipboardResult> => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const readFromClipboard = async (): Promise<string | null> => {
  try {
    return await navigator.clipboard.readText();
  } catch (error) {
    console.error('Failed to read from clipboard:', error);
    return null;
  }
};

export const copyObjectToClipboard = async (obj: any): Promise<ClipboardResult> => {
  try {
    const jsonString = JSON.stringify(obj, null, 2);
    return await copyToClipboard(jsonString);
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to stringify object' 
    };
  }
};