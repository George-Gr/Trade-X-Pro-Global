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
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
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
      daily_pnl_tracking: {
        Row: {
          breached_daily_limit: boolean
          created_at: string
          id: string
          realized_pnl: number
          trade_count: number
          trading_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          breached_daily_limit?: boolean
          created_at?: string
          id?: string
          realized_pnl?: number
          trade_count?: number
          trading_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          breached_daily_limit?: boolean
          created_at?: string
          id?: string
          realized_pnl?: number
          trade_count?: number
          trading_date?: string
          updated_at?: string
          user_id?: string
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
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          kyc_notifications: boolean
          margin_notifications: boolean
          order_notifications: boolean
          pnl_notifications: boolean
          price_alert_notifications: boolean
          risk_notifications: boolean
          toast_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          kyc_notifications?: boolean
          margin_notifications?: boolean
          order_notifications?: boolean
          pnl_notifications?: boolean
          price_alert_notifications?: boolean
          risk_notifications?: boolean
          toast_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          kyc_notifications?: boolean
          margin_notifications?: boolean
          order_notifications?: boolean
          pnl_notifications?: boolean
          price_alert_notifications?: boolean
          risk_notifications?: boolean
          toast_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          sent_email: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          sent_email?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          sent_email?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      position_lots: {
        Row: {
          commission: number
          created_at: string | null
          entry_price: number
          fill_id: string
          id: string
          order_id: string
          position_id: string
          quantity: number
          remaining_quantity: number
          side: Database["public"]["Enums"]["order_side"]
          symbol: string
          user_id: string
        }
        Insert: {
          commission?: number
          created_at?: string | null
          entry_price: number
          fill_id: string
          id?: string
          order_id: string
          position_id: string
          quantity: number
          remaining_quantity: number
          side: Database["public"]["Enums"]["order_side"]
          symbol: string
          user_id: string
        }
        Update: {
          commission?: number
          created_at?: string | null
          entry_price?: number
          fill_id?: string
          id?: string
          order_id?: string
          position_id?: string
          quantity?: number
          remaining_quantity?: number
          side?: Database["public"]["Enums"]["order_side"]
          symbol?: string
          user_id?: string
        }
        Relationships: []
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
      price_alerts: {
        Row: {
          condition: string
          created_at: string
          id: string
          symbol: string
          target_price: number
          triggered: boolean
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          id?: string
          symbol: string
          target_price: number
          triggered?: boolean
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          symbol?: string
          target_price?: number
          triggered?: boolean
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      risk_events: {
        Row: {
          created_at: string
          description: string
          details: Json | null
          event_type: string
          id: string
          resolved: boolean
          severity: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          details?: Json | null
          event_type: string
          id?: string
          resolved?: boolean
          severity: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          details?: Json | null
          event_type?: string
          id?: string
          resolved?: boolean
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_settings: {
        Row: {
          created_at: string
          daily_loss_limit: number
          daily_trade_limit: number
          enforce_stop_loss: boolean
          id: string
          margin_call_level: number
          max_position_size: number
          max_positions: number
          max_total_exposure: number
          min_stop_loss_distance: number
          stop_out_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_loss_limit?: number
          daily_trade_limit?: number
          enforce_stop_loss?: boolean
          id?: string
          margin_call_level?: number
          max_position_size?: number
          max_positions?: number
          max_total_exposure?: number
          min_stop_loss_distance?: number
          stop_out_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_loss_limit?: number
          daily_trade_limit?: number
          enforce_stop_loss?: boolean
          id?: string
          margin_call_level?: number
          max_position_size?: number
          max_positions?: number
          max_total_exposure?: number
          min_stop_loss_distance?: number
          stop_out_level?: number
          updated_at?: string
          user_id?: string
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
      watchlist_items: {
        Row: {
          created_at: string
          id: string
          order_index: number
          symbol: string
          watchlist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          symbol: string
          watchlist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          symbol?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_max_requests: number
          p_user_id: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      close_position_atomic: {
        Args: {
          p_close_quantity: number
          p_current_price: number
          p_idempotency_key: string
          p_position_id: string
          p_slippage?: number
          p_user_id: string
        }
        Returns: Json
      }
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
