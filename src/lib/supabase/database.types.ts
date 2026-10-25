export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      loyalty_accounts: {
        Row: {
          created_at: string;
          current_points: number;
          deleted_at: string | null;
          id: number;
          last_earned_at: string | null;
          total_points_earned: number;
          total_points_redeemed: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_points?: number;
          deleted_at?: string | null;
          id?: number;
          last_earned_at?: string | null;
          total_points_earned?: number;
          total_points_redeemed?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_points?: number;
          deleted_at?: string | null;
          id?: number;
          last_earned_at?: string | null;
          total_points_earned?: number;
          total_points_redeemed?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'loyalty_accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          email: string;
          external_uid: string | null;
          id: string;
          name: string;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          email: string;
          external_uid?: string | null;
          id: string;
          name: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          external_uid?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      redemptions: {
        Row: {
          confirmed_at: string;
          confirmed_by_staff_id: string;
          created_at: string;
          customer_id: string;
          id: number;
          jti: string;
          points_cost: number;
          reward_id: number;
        };
        Insert: {
          confirmed_at?: string;
          confirmed_by_staff_id: string;
          created_at?: string;
          customer_id: string;
          id?: number;
          jti: string;
          points_cost: number;
          reward_id: number;
        };
        Update: {
          confirmed_at?: string;
          confirmed_by_staff_id?: string;
          created_at?: string;
          customer_id?: string;
          id?: number;
          jti?: string;
          points_cost?: number;
          reward_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'redemptions_confirmed_by_staff_id_fkey';
            columns: ['confirmed_by_staff_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'redemptions_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'redemptions_reward_id_fkey';
            columns: ['reward_id'];
            isOneToOne: false;
            referencedRelation: 'rewards';
            referencedColumns: ['id'];
          },
        ];
      };
      rewards: {
        Row: {
          active: boolean;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          id: number;
          name: string;
          points_required: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          name: string;
          points_required: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: number;
          name?: string;
          points_required?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number | null;
          created_at: string;
          id: number;
          note: string | null;
          points: number;
          redemption_id: number | null;
          staff_id: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          points: number;
          redemption_id?: number | null;
          staff_id?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          id?: number;
          note?: string | null;
          points?: number;
          redemption_id?: number | null;
          staff_id?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_redemption_id_fkey';
            columns: ['redemption_id'];
            isOneToOne: false;
            referencedRelation: 'redemptions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_staff_id_fkey';
            columns: ['staff_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      allocate_points_atomic: {
        Args: {
          p_amount: number;
          p_customer_id: string;
          p_note?: string;
          p_points: number;
          p_staff_id: string;
        };
        Returns: Json;
      };
      confirm_redemption_atomic: {
        Args: {
          p_customer_id: string;
          p_jti: string;
          p_reward_id: number;
          p_staff_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
