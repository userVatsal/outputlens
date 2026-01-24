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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_name: string
          agent_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          items_failed: number | null
          items_processed: number | null
          metadata: Json | null
          started_at: string
          status: string
        }
        Insert: {
          agent_name: string
          agent_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          metadata?: Json | null
          started_at?: string
          status: string
        }
        Update: {
          agent_name?: string
          agent_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          metadata?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      aggregated_insights: {
        Row: {
          asset: string
          avg_sentiment: number | null
          bearish_count: number | null
          bullish_count: number | null
          computed_at: string
          conflict_detected: boolean | null
          created_at: string
          data_quality_score: number | null
          expected_move_adjustment: number | null
          expires_at: string
          id: string
          market: string
          neutral_count: number | null
          probability_shift: number | null
          sentiment_stddev: number | null
          source_breakdown: Json | null
          source_diversity_score: number | null
          tail_risk_multiplier: number | null
          top_signals: Json | null
          total_signals: number | null
          volatility_adjustment: number | null
          weighted_sentiment: number | null
          window_end: string
          window_start: string
        }
        Insert: {
          asset: string
          avg_sentiment?: number | null
          bearish_count?: number | null
          bullish_count?: number | null
          computed_at?: string
          conflict_detected?: boolean | null
          created_at?: string
          data_quality_score?: number | null
          expected_move_adjustment?: number | null
          expires_at: string
          id?: string
          market?: string
          neutral_count?: number | null
          probability_shift?: number | null
          sentiment_stddev?: number | null
          source_breakdown?: Json | null
          source_diversity_score?: number | null
          tail_risk_multiplier?: number | null
          top_signals?: Json | null
          total_signals?: number | null
          volatility_adjustment?: number | null
          weighted_sentiment?: number | null
          window_end: string
          window_start: string
        }
        Update: {
          asset?: string
          avg_sentiment?: number | null
          bearish_count?: number | null
          bullish_count?: number | null
          computed_at?: string
          conflict_detected?: boolean | null
          created_at?: string
          data_quality_score?: number | null
          expected_move_adjustment?: number | null
          expires_at?: string
          id?: string
          market?: string
          neutral_count?: number | null
          probability_shift?: number | null
          sentiment_stddev?: number | null
          source_breakdown?: Json | null
          source_diversity_score?: number | null
          tail_risk_multiplier?: number | null
          top_signals?: Json | null
          total_signals?: number | null
          volatility_adjustment?: number | null
          weighted_sentiment?: number | null
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      analysis_history: {
        Row: {
          asset: string
          created_at: string
          data_sources: Json | null
          direction: string
          entry_price: number
          id: string
          live_volatility: number | null
          market: string
          results: Json
          simulation_stats: Json | null
          time_horizon: string
          user_assumptions: string | null
          user_confidence: number | null
          user_id: string
        }
        Insert: {
          asset: string
          created_at?: string
          data_sources?: Json | null
          direction: string
          entry_price: number
          id?: string
          live_volatility?: number | null
          market: string
          results: Json
          simulation_stats?: Json | null
          time_horizon: string
          user_assumptions?: string | null
          user_confidence?: number | null
          user_id: string
        }
        Update: {
          asset?: string
          created_at?: string
          data_sources?: Json | null
          direction?: string
          entry_price?: number
          id?: string
          live_volatility?: number | null
          market?: string
          results?: Json
          simulation_stats?: Json | null
          time_horizon?: string
          user_assumptions?: string | null
          user_confidence?: number | null
          user_id?: string
        }
        Relationships: []
      }
      captcha_challenges: {
        Row: {
          action: string
          challenge_token: string
          challenge_type: string | null
          expired_at: string | null
          failure_reason: string | null
          id: string
          ip_address: string
          issued_at: string | null
          metadata: Json | null
          score: number | null
          success: boolean | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          action: string
          challenge_token: string
          challenge_type?: string | null
          expired_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address: string
          issued_at?: string | null
          metadata?: Json | null
          score?: number | null
          success?: boolean | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          action?: string
          challenge_token?: string
          challenge_type?: string | null
          expired_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string
          issued_at?: string | null
          metadata?: Json | null
          score?: number | null
          success?: boolean | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      ip_reputation: {
        Row: {
          block_reason: string | null
          blocked_until: string | null
          captcha_challenges: number | null
          captcha_failures: number | null
          created_at: string | null
          failed_attempts: number | null
          first_seen_at: string | null
          id: string
          ip_address: string
          last_seen_at: string | null
          metadata: Json | null
          permanent_block: boolean | null
          reputation_score: number | null
          successful_attempts: number | null
          total_requests: number | null
          updated_at: string | null
        }
        Insert: {
          block_reason?: string | null
          blocked_until?: string | null
          captcha_challenges?: number | null
          captcha_failures?: number | null
          created_at?: string | null
          failed_attempts?: number | null
          first_seen_at?: string | null
          id?: string
          ip_address: string
          last_seen_at?: string | null
          metadata?: Json | null
          permanent_block?: boolean | null
          reputation_score?: number | null
          successful_attempts?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Update: {
          block_reason?: string | null
          blocked_until?: string | null
          captcha_challenges?: number | null
          captcha_failures?: number | null
          created_at?: string | null
          failed_attempts?: number | null
          first_seen_at?: string | null
          id?: string
          ip_address?: string
          last_seen_at?: string | null
          metadata?: Json | null
          permanent_block?: boolean | null
          reputation_score?: number | null
          successful_attempts?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_data_cache: {
        Row: {
          asset_type: string
          atr_14: number | null
          created_at: string
          expires_at: string
          fetched_at: string
          historical_prices: Json | null
          id: string
          market: string
          quote_data: Json | null
          sentiment_score: number | null
          symbol: string
          volatility_30d: number | null
        }
        Insert: {
          asset_type: string
          atr_14?: number | null
          created_at?: string
          expires_at: string
          fetched_at?: string
          historical_prices?: Json | null
          id?: string
          market: string
          quote_data?: Json | null
          sentiment_score?: number | null
          symbol: string
          volatility_30d?: number | null
        }
        Update: {
          asset_type?: string
          atr_14?: number | null
          created_at?: string
          expires_at?: string
          fetched_at?: string
          historical_prices?: Json | null
          id?: string
          market?: string
          quote_data?: Json | null
          sentiment_score?: number | null
          symbol?: string
          volatility_30d?: number | null
        }
        Relationships: []
      }
      optimization_recommendations: {
        Row: {
          action_type: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          impact_estimate: Json | null
          implemented_at: string | null
          priority: string
          result_metrics: Json | null
          status: string | null
          title: string
        }
        Insert: {
          action_type?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          impact_estimate?: Json | null
          implemented_at?: string | null
          priority: string
          result_metrics?: Json | null
          status?: string | null
          title: string
        }
        Update: {
          action_type?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          impact_estimate?: Json | null
          implemented_at?: string | null
          priority?: string
          result_metrics?: Json | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      optimization_results: {
        Row: {
          after_metrics: Json
          before_metrics: Json
          id: string
          improvement_pct: number | null
          measured_at: string | null
          recommendation_id: string | null
        }
        Insert: {
          after_metrics: Json
          before_metrics: Json
          id?: string
          improvement_pct?: number | null
          measured_at?: string | null
          recommendation_id?: string | null
        }
        Update: {
          after_metrics?: Json
          before_metrics?: Json
          id?: string
          improvement_pct?: number | null
          measured_at?: string | null
          recommendation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "optimization_results_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "optimization_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_metrics: {
        Row: {
          dimensions: Json | null
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          dimensions?: Json | null
          id?: string
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          dimensions?: Json | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      profile_audit_log: {
        Row: {
          change_source: string | null
          changed_at: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          change_source?: string | null
          changed_at?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          change_source?: string | null
          changed_at?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          consent_accepted_at: string | null
          consent_gdpr: boolean | null
          consent_privacy_version: number | null
          consent_terms_version: number | null
          contact_preferences: Json | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          full_name: string | null
          id: string
          language: string | null
          locale: string | null
          onboarding_completed: boolean | null
          plan_expires_at: string | null
          plan_started_at: string | null
          profile_updated_at: string | null
          social_handles: Json | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          subscription_tier: string
          timezone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          consent_accepted_at?: string | null
          consent_gdpr?: boolean | null
          consent_privacy_version?: number | null
          consent_terms_version?: number | null
          contact_preferences?: Json | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          locale?: string | null
          onboarding_completed?: boolean | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          profile_updated_at?: string | null
          social_handles?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_tier?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          consent_accepted_at?: string | null
          consent_gdpr?: boolean | null
          consent_privacy_version?: number | null
          consent_terms_version?: number | null
          contact_preferences?: Json | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          locale?: string | null
          onboarding_completed?: boolean | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          profile_updated_at?: string | null
          social_handles?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_tier?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      qualitative_signals: {
        Row: {
          asset: string | null
          asset_type: string | null
          author: string | null
          content: string
          content_hash: string
          created_at: string
          fetched_at: string
          id: string
          language: string | null
          metadata: Json | null
          processed: boolean | null
          processing_error: string | null
          published_at: string | null
          source_name: string
          source_type: string
          source_url: string | null
          title: string | null
        }
        Insert: {
          asset?: string | null
          asset_type?: string | null
          author?: string | null
          content: string
          content_hash: string
          created_at?: string
          fetched_at?: string
          id?: string
          language?: string | null
          metadata?: Json | null
          processed?: boolean | null
          processing_error?: string | null
          published_at?: string | null
          source_name: string
          source_type: string
          source_url?: string | null
          title?: string | null
        }
        Update: {
          asset?: string | null
          asset_type?: string | null
          author?: string | null
          content?: string
          content_hash?: string
          created_at?: string
          fetched_at?: string
          id?: string
          language?: string | null
          metadata?: Json | null
          processed?: boolean | null
          processing_error?: string | null
          published_at?: string | null
          source_name?: string
          source_type?: string
          source_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          action_taken: string | null
          created_at: string | null
          endpoint: string | null
          event_type: string
          id: string
          ip_address: string | null
          notes: string | null
          request_metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          threat_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          notes?: string | null
          request_metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threat_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          notes?: string | null
          request_metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threat_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_thresholds: {
        Row: {
          auto_tune_enabled: boolean | null
          created_at: string | null
          description: string | null
          id: string
          last_tuned_at: string | null
          max_value: number | null
          min_value: number | null
          threshold_name: string
          threshold_value: number
          tuned_by: string | null
          updated_at: string | null
        }
        Insert: {
          auto_tune_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_tuned_at?: string | null
          max_value?: number | null
          min_value?: number | null
          threshold_name: string
          threshold_value: number
          tuned_by?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_tune_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_tuned_at?: string | null
          max_value?: number | null
          min_value?: number | null
          threshold_name?: string
          threshold_value?: number
          tuned_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sentiment_scores: {
        Row: {
          asset: string
          confidence: number
          created_at: string
          entities: Json | null
          expected_impact: number | null
          id: string
          impact_timeframe: string | null
          keywords: Json | null
          model_used: string
          processed_at: string
          reasoning: string | null
          sentiment_score: number
          signal_id: string
        }
        Insert: {
          asset: string
          confidence: number
          created_at?: string
          entities?: Json | null
          expected_impact?: number | null
          id?: string
          impact_timeframe?: string | null
          keywords?: Json | null
          model_used: string
          processed_at?: string
          reasoning?: string | null
          sentiment_score: number
          signal_id: string
        }
        Update: {
          asset?: string
          confidence?: number
          created_at?: string
          entities?: Json | null
          expected_impact?: number | null
          id?: string
          impact_timeframe?: string | null
          keywords?: Json | null
          model_used?: string
          processed_at?: string
          reasoning?: string | null
          sentiment_score?: number
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sentiment_scores_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "qualitative_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          analysis_count: number
          api_call_count: number | null
          created_at: string
          extra_credits: number | null
          id: string
          month_year: string
          portfolio_analysis_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_count?: number
          api_call_count?: number | null
          created_at?: string
          extra_credits?: number | null
          id?: string
          month_year: string
          portfolio_analysis_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_count?: number
          api_call_count?: number | null
          created_at?: string
          extra_credits?: number | null
          id?: string
          month_year?: string
          portfolio_analysis_count?: number | null
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
      is_ip_blocked: { Args: { p_ip_address: string }; Returns: boolean }
      update_ip_reputation: {
        Args: { p_delta: number; p_event_type?: string; p_ip_address: string }
        Returns: {
          block_reason: string | null
          blocked_until: string | null
          captcha_challenges: number | null
          captcha_failures: number | null
          created_at: string | null
          failed_attempts: number | null
          first_seen_at: string | null
          id: string
          ip_address: string
          last_seen_at: string | null
          metadata: Json | null
          permanent_block: boolean | null
          reputation_score: number | null
          successful_attempts: number | null
          total_requests: number | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "ip_reputation"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
