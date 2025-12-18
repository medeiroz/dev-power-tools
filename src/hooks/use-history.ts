import { useState, useCallback, useEffect } from 'react';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  tool: string;
  operation: string;
  input: string | any;
  output: string;
  options?: Record<string, any>;
  error?: string;
}

const STORAGE_KEY = 'devtools-history';
const MAX_HISTORY_ENTRIES = 1000;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    // Initialize state from localStorage immediately
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_HISTORY_ENTRIES);
        }
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error);
    }
    return [];
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('history-updated'));
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  }, [history]);

  // Listen for history updates from other components
  useEffect(() => {
    const handleHistoryUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistory(parsed.slice(0, MAX_HISTORY_ENTRIES));
          }
        }
      } catch (error) {
        console.warn('Failed to sync history from localStorage:', error);
      }
    };

    window.addEventListener('history-updated', handleHistoryUpdate);
    return () => window.removeEventListener('history-updated', handleHistoryUpdate);
  }, []);

  const addHistoryEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove entries with same input and output to avoid duplicates
      const filteredHistory = prev.filter(existingEntry => {
        try {
          // Compare input and output
          const sameInput = existingEntry.input === entry.input;
          const sameOutput = existingEntry.output === entry.output;
          const sameTool = existingEntry.tool === entry.tool;
          
          // Keep entry if it's different (not a duplicate)
          return !(sameInput && sameOutput && sameTool);
        } catch (error) {
          // If comparison fails, keep the entry to be safe
          console.warn('Error comparing history entries:', error);
          return true;
        }
      });

      const newHistory = [newEntry, ...filteredHistory];
      return newHistory.slice(0, MAX_HISTORY_ENTRIES);
    });

    return newEntry.id;
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeHistoryEntry = useCallback((id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const getHistoryByTool = useCallback((tool: string) => {
    return history.filter(entry => entry.tool === tool);
  }, [history]);

  return {
    history,
    addHistoryEntry,
    clearHistory,
    removeHistoryEntry,
    getHistoryByTool,
  };
}