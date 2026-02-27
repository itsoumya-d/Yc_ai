export type Product = {
  id: string;
  user_id: string;
  name: string;
  sku: string;
  barcode: string | null;
  category: string | null;
  description: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  cost_price: number | null;
  retail_price: number | null;
  supplier: string | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ScanLog = {
  id: string;
  user_id: string;
  product_id: string | null;
  barcode: string;
  action: "add" | "remove" | "set" | "lookup";
  quantity_change: number | null;
  previous_quantity: number | null;
  new_quantity: number | null;
  note: string | null;
  created_at: string;
  products?: { name: string; sku: string } | null;
};

export type ScanResultData = {
  found: boolean;
  barcode: string;
  product?: Product;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  aiSuggestion?: Partial<Product> | null;
  message?: string;
  error?: string;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, "id" | "user_id" | "created_at">>;
      };
      scan_logs: {
        Row: ScanLog;
        Insert: Omit<ScanLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ScanLog, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
