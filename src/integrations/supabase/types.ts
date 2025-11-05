export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      asset_specs: {
        Row: {
          asset_class: string
          base_commission: number | null
          commission_type: string | null
          created_at: string | null
          is_tradable: boolean | null
          leverage: number | null
          max_quantity: number | null
          min_quantity: number | null
          pip_size: number | null
          symbol: string
        }
        Insert: {
          asset_class: string
          base_commission?: number | null
          commission_type?: string | null
          created_at?: string | null
          is_tradable?: boolean | null
          leverage?: number | null
          max_quantity?: number | null
          min_quantity?: number | null
          pip_size?: number | null
          symbol: string
        }
        Update: {
          asset_class?: string
          base_commission?: number | null
          commission_type?: string | null
          created_at?: string | null
          is_tradable?: boolean | null
          leverage?: number | null
          max_quantity?: number | null
          min_quantity?: number | null
          pip_size?: number | null
          symbol?: string
        }
        Relationships: []
      }
      fills: {
        Row: {
          commission: number
          executed_at: string | null
          id: string
          order_id: string
          price: number
          quantity: number
          symbol: string
          user_id: string
        }
        Insert: {
          commission: number
          executed_at?: string | null
          id?: string
          order_id: string
          price: number
          quantity: number
          symbol: string
          user_id: string
        }
        Update: {
          commission?: number
          executed_at?: string | null
          id?: string
          order_id?: string
          price?: number
          quantity?: number
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fills_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_path: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyc_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_path: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_path?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commission: number | null
          created_at: string | null
          fill_price: number | null
          filled_at: string | null
          id: string
          idempotency_key: string
          order_type: Database["public"]["Enums"]["order_type"]
          price: number | null
          quantity: number
          side: Database["public"]["Enums"]["order_side"]
          status: Database["public"]["Enums"]["order_status"] | null
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          user_id: string
        }
        Insert: {
          commission?: number | null
          created_at?: string | null
          fill_price?: number | null
          filled_at?: string | null
          id?: string
          idempotency_key: string
          order_type: Database["public"]["Enums"]["order_type"]
          price?: number | null
          quantity: number
          side: Database["public"]["Enums"]["order_side"]
          status?: Database["public"]["Enums"]["order_status"] | null
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          user_id: string
        }
        Update: {
          commission?: number | null
          created_at?: string | null
          fill_price?: number | null
          filled_at?: string | null
          id?: string
          idempotency_key?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          price?: number | null
          quantity?: number
          side?: Database["public"]["Enums"]["order_side"]
          status?: Database["public"]["Enums"]["order_status"] | null
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          closed_at: string | null
          current_price: number | null
          entry_price: number
          id: string
          margin_used: number
          opened_at: string | null
          quantity: number
          realized_pnl: number | null
          side: Database["public"]["Enums"]["order_side"]
          status: Database["public"]["Enums"]["position_status"] | null
          symbol: string
          unrealized_pnl: number | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          current_price?: number | null
          entry_price: number
          id?: string
          margin_used: number
          opened_at?: string | null
          quantity: number
          realized_pnl?: number | null
          side: Database["public"]["Enums"]["order_side"]
          status?: Database["public"]["Enums"]["position_status"] | null
          symbol: string
          unrealized_pnl?: number | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          current_price?: number | null
          entry_price?: number
          id?: string
          margin_used?: number
          opened_at?: string | null
          quantity?: number
          realized_pnl?: number | null
          side?: Database["public"]["Enums"]["order_side"]
          status?: Database["public"]["Enums"]["position_status"] | null
          symbol?: string
          unrealized_pnl?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"] | null
          balance: number
          country: string | null
          created_at: string | null
          email: string
          equity: number
          free_margin: number | null
          full_name: string | null
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          margin_level: number | null
          margin_used: number
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          balance?: number
          country?: string | null
          created_at?: string | null
          email: string
          equity?: number
          free_margin?: number | null
          full_name?: string | null
          id: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          margin_level?: number | null
          margin_used?: number
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          balance?: number
          country?: string | null
          created_at?: string | null
          email?: string
          equity?: number
          free_margin?: number | null
          full_name?: string | null
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          margin_level?: number | null
          margin_used?: number
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_order_atomic: {
        Args: {
          p_current_price: number
          p_idempotency_key: string
          p_order_type: Database["public"]["Enums"]["order_type"]
          p_price: number
          p_quantity: number
          p_side: Database["public"]["Enums"]["order_side"]
          p_slippage?: number
          p_stop_loss: number
          p_symbol: string
          p_take_profit: number
          p_user_id: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "closed"
      app_role: "admin" | "user"
      kyc_status: "pending" | "approved" | "rejected" | "resubmitted"
      order_side: "buy" | "sell"
      order_status: "pending" | "filled" | "partial" | "cancelled" | "rejected"
      order_type: "market" | "limit" | "stop" | "stop_limit"
      position_status: "open" | "closed"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "commission"
        | "profit"
        | "loss"
        | "swap"
        | "adjustment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended", "closed"],
      app_role: ["admin", "user"],
      kyc_status: ["pending", "approved", "rejected", "resubmitted"],
      order_side: ["buy", "sell"],
      order_status: ["pending", "filled", "partial", "cancelled", "rejected"],
      order_type: ["market", "limit", "stop", "stop_limit"],
      position_status: ["open", "closed"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "commission",
        "profit",
        "loss",
        "swap",
        "adjustment",
      ],
    },
  },
} as const
