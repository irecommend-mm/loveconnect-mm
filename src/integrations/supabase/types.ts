export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      conversation_starters: {
        Row: {
          based_on: Json | null
          created_at: string
          id: string
          is_used: boolean | null
          match_id: string | null
          suggestion: string
        }
        Insert: {
          based_on?: Json | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          match_id?: string | null
          suggestion: string
        }
        Update: {
          based_on?: Json | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          match_id?: string | null
          suggestion?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_starters_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          description: string
          id: string
          is_active: boolean | null
          prompt_question: string | null
          reward_type: string | null
          title: string
        }
        Insert: {
          challenge_date?: string
          challenge_type: string
          description: string
          id?: string
          is_active?: boolean | null
          prompt_question?: string | null
          reward_type?: string | null
          title: string
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          description?: string
          id?: string
          is_active?: boolean | null
          prompt_question?: string | null
          reward_type?: string | null
          title?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string
          status: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
        ]
      }
      group_events: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          location: string
          max_attendees: number
          title: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          location: string
          max_attendees?: number
          title: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location?: string
          max_attendees?: number
          title?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          created_at: string
          id: string
          interest: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
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
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          position: number | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          position?: number | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          position?: number | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          bio: string | null
          boost_active_until: string | null
          children: string | null
          created_at: string
          daily_swipes_reset_date: string | null
          daily_swipes_used: number | null
          drinking: string | null
          education: string | null
          exercise: string | null
          height: string | null
          id: string
          incognito: boolean | null
          incognito_mode: boolean | null
          is_video_verified: boolean | null
          job: string | null
          last_active: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          premium_tier: string | null
          relationship_type: string | null
          smoking: string | null
          updated_at: string
          user_id: string
          verification_video_url: string | null
          verified: boolean | null
          video_count: number | null
          video_intro_url: string | null
          zodiac_sign: string | null
        }
        Insert: {
          age: number
          bio?: string | null
          boost_active_until?: string | null
          children?: string | null
          created_at?: string
          daily_swipes_reset_date?: string | null
          daily_swipes_used?: number | null
          drinking?: string | null
          education?: string | null
          exercise?: string | null
          height?: string | null
          id?: string
          incognito?: boolean | null
          incognito_mode?: boolean | null
          is_video_verified?: boolean | null
          job?: string | null
          last_active?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          premium_tier?: string | null
          relationship_type?: string | null
          smoking?: string | null
          updated_at?: string
          user_id: string
          verification_video_url?: string | null
          verified?: boolean | null
          video_count?: number | null
          video_intro_url?: string | null
          zodiac_sign?: string | null
        }
        Update: {
          age?: number
          bio?: string | null
          boost_active_until?: string | null
          children?: string | null
          created_at?: string
          daily_swipes_reset_date?: string | null
          daily_swipes_used?: number | null
          drinking?: string | null
          education?: string | null
          exercise?: string | null
          height?: string | null
          id?: string
          incognito?: boolean | null
          incognito_mode?: boolean | null
          is_video_verified?: boolean | null
          job?: string | null
          last_active?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          premium_tier?: string | null
          relationship_type?: string | null
          smoking?: string | null
          updated_at?: string
          user_id?: string
          verification_video_url?: string | null
          verified?: boolean | null
          video_count?: number | null
          video_intro_url?: string | null
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          user_id: string
          video_url: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          user_id: string
          video_url: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          user_id?: string
          video_url?: string
          view_count?: number | null
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string | null
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id?: string | null
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string | null
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          action: string
          created_at: string
          id: string
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          swiped_id: string
          swiper_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_completions: {
        Row: {
          challenge_id: string | null
          completed_at: string
          id: string
          submission_url: string | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string
          id?: string
          submission_url?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string
          id?: string
          submission_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          evidence_urls: string[] | null
          id: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          report_type?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      video_messages: {
        Row: {
          content: string | null
          created_at: string
          delivered_at: string | null
          disappears_at: string | null
          duration_seconds: number | null
          id: string
          is_disappearing: boolean | null
          match_id: string | null
          media_url: string | null
          message_type: string
          read_at: string | null
          reply_to_message_id: string | null
          sender_id: string
          thumbnail_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          disappears_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_disappearing?: boolean | null
          match_id?: string | null
          media_url?: string | null
          message_type: string
          read_at?: string | null
          reply_to_message_id?: string | null
          sender_id: string
          thumbnail_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          disappears_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_disappearing?: boolean | null
          match_id?: string | null
          media_url?: string | null
          message_type?: string
          read_at?: string | null
          reply_to_message_id?: string | null
          sender_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "video_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      video_profiles: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          is_primary: boolean | null
          moderation_flags: Json | null
          moderation_status: string | null
          position: number | null
          prompt_question: string | null
          thumbnail_url: string | null
          user_id: string
          video_type: string
          video_url: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_primary?: boolean | null
          moderation_flags?: Json | null
          moderation_status?: string | null
          position?: number | null
          prompt_question?: string | null
          thumbnail_url?: string | null
          user_id: string
          video_type: string
          video_url: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_primary?: boolean | null
          moderation_flags?: Json | null
          moderation_status?: string | null
          position?: number | null
          prompt_question?: string | null
          thumbnail_url?: string | null
          user_id?: string
          video_type?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
      cleanup_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_daily_swipe_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
