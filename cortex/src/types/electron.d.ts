export interface ElectronAPI {
  openFile: () => Promise<string | null>;
  getVersion: () => Promise<string>;
  platform: string;

  // Database operations
  loadCSV: (filePath: string) => Promise<{ tableName: string; columns: string[]; rowCount: number } | null>;
  loadSQLite: (filePath: string) => Promise<{ tables: string[] } | null>;
  executeSQL: (sql: string) => Promise<{ columns: string[]; rows: Record<string, unknown>[]; rowCount: number; executionTimeMs: number }>;
  getSchema: () => Promise<{ name: string; columns: { name: string; type: string; nullable: boolean; pk: boolean }[]; rowCount: number }[]>;
  dropTable: (tableName: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
