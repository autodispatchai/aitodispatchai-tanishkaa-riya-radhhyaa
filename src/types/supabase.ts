// src/types/supabase.ts (FINAL ✅)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Tuhade actual tables (jaise loads, users) baad vich add karo. Hun ke liye empty rakh do.
      [key: string]: any;
    };
    Views: { [key: string]: any };
    Functions: { [key: string]: any };
    Enums: { [key: string]: any };
  };
}