/**
 * Utility functions for toast notifications
 */

import { useToast } from "@/hooks/use-toast";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const createToastHelper = (toast: ReturnType<typeof useToast>['toast']) => {
  return {
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "default",
      });
    },

    error: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "destructive",
      });
    },

    copySuccess: (label: string = "Content") => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    },

    copyError: () => {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    },

    downloadSuccess: (filename: string) => {
      toast({
        title: "Downloaded!",
        description: `File saved as ${filename}`,
      });
    },

    downloadError: () => {
      toast({
        title: "Download failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    },
  };
};