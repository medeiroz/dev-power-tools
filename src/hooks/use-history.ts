import { useState, useCallback, useEffect } from 'react';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  tool: string;
  operation: string;
  input: string;
  output: string;
  options?: Record<string, any>;
  error?: string;
}

const STORAGE_KEY = 'devtools-history';
const MAX_HISTORY_ENTRIES = 1000;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, MAX_HISTORY_ENTRIES));
        }
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  }, [history]);

  const addHistoryEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const newHistory = [newEntry, ...prev];
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