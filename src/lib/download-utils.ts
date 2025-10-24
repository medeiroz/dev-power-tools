/**
 * Utility functions for file downloads
 */

export const downloadAsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadAsJson = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  downloadAsFile(jsonString, filename.endsWith('.json') ? filename : `${filename}.json`);
};

export const downloadAsCsv = (data: string, filename: string) => {
  const blob = new Blob([data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};