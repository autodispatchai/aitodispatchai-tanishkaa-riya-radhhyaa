// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          user_id: string
          name: string | null
          subscription_status: 'active' | 'trialing' | 'canceled' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          subscription_status?: 'active' | 'trialing' | 'canceled' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          subscription_status?: 'active' | 'trialing' | 'canceled' | null
          created_at?: string
        }
      }
    }
  }
}