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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
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
      compatibility_scores: {
        Row: {
          behavior_score: number
          created_at: string
          goal_compatibility: number
          id: string
          interests_score: number
          last_calculated: string
          location_score: number
          overall_score: number
          preference_score: number
          user1_id: string
          user2_id: string
          zodiac_score: number
        }
        Insert: {
          behavior_score?: number
          created_at?: string
          goal_compatibility?: number
          id?: string
          interests_score?: number
          last_calculated?: string
          location_score?: number
          overall_score?: number
          preference_score?: number
          user1_id: string
          user2_id: string
          zodiac_score?: number
        }
        Update: {
          behavior_score?: number
          created_at?: string
          goal_compatibility?: number
          id?: string
          interests_score?: number
          last_calculated?: string
          location_score?: number
          overall_score?: number
          preference_score?: number
          user1_id?: string
          user2_id?: string
          zodiac_score?: number
        }
        Relationships: []
      }
      crossed_paths: {
        Row: {
          average_distance: number | null
          created_at: string
          crossing_count: number | null
          first_crossing_time: string
          id: string
          last_crossing_time: string
          locations: Json | null
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          average_distance?: number | null
          created_at?: string
          crossing_count?: number | null
          first_crossing_time?: string
          id?: string
          last_crossing_time?: string
          locations?: Json | null
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          average_distance?: number | null
          created_at?: string
          crossing_count?: number | null
          first_crossing_time?: string
          id?: string
          last_crossing_time?: string
          locations?: Json | null
          updated_at?: string
          user1_id?: string
          user2_id?: string
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
      friend_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      group_events: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          is_public: boolean | null
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
          is_public?: boolean | null
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
          is_public?: boolean | null
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
      location_history: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
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
          birthdate: string | null
          body_type: string | null
          children: string | null
          company_name: string | null
          created_at: string
          dealbreakers: string[] | null
          drinking: string | null
          education: string | null
          education_level: string | null
          exercise: string | null
          gender: string | null
          height: string | null
          height_cm: number | null
          height_feet: number | null
          id: string
          incognito: boolean | null
          job: string | null
          job_title: string | null
          languages_spoken: string[] | null
          last_active: string | null
          latitude: number | null
          lifestyle: Json | null
          location: string | null
          longitude: number | null
          love_languages: string[] | null
          name: string
          orientation: string[] | null
          personality_type: string | null
          preferences: Json | null
          premium_expires_at: string | null
          premium_status: string | null
          privacy_level: string | null
          relationship_type: string | null
          religion: string | null
          show_distance: boolean | null
          show_last_active: boolean | null
          show_me: string[] | null
          smoking: string | null
          terms_agreement: boolean | null
          updated_at: string
          user_id: string
          verified: boolean | null
          video_intro_url: string | null
          zodiac_sign: string | null
        }
        Insert: {
          age: number
          bio?: string | null
          birthdate?: string | null
          body_type?: string | null
          children?: string | null
          company_name?: string | null
          created_at?: string
          dealbreakers?: string[] | null
          drinking?: string | null
          education?: string | null
          education_level?: string | null
          exercise?: string | null
          gender?: string | null
          height?: string | null
          height_cm?: number | null
          height_feet?: number | null
          id?: string
          incognito?: boolean | null
          job?: string | null
          job_title?: string | null
          languages_spoken?: string[] | null
          last_active?: string | null
          latitude?: number | null
          lifestyle?: Json | null
          location?: string | null
          longitude?: number | null
          love_languages?: string[] | null
          name: string
          orientation?: string[] | null
          personality_type?: string | null
          preferences?: Json | null
          premium_expires_at?: string | null
          premium_status?: string | null
          privacy_level?: string | null
          relationship_type?: string | null
          religion?: string | null
          show_distance?: boolean | null
          show_last_active?: boolean | null
          show_me?: string[] | null
          smoking?: string | null
          terms_agreement?: boolean | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          video_intro_url?: string | null
          zodiac_sign?: string | null
        }
        Update: {
          age?: number
          bio?: string | null
          birthdate?: string | null
          body_type?: string | null
          children?: string | null
          company_name?: string | null
          created_at?: string
          dealbreakers?: string[] | null
          drinking?: string | null
          education?: string | null
          education_level?: string | null
          exercise?: string | null
          gender?: string | null
          height?: string | null
          height_cm?: number | null
          height_feet?: number | null
          id?: string
          incognito?: boolean | null
          job?: string | null
          job_title?: string | null
          languages_spoken?: string[] | null
          last_active?: string | null
          latitude?: number | null
          lifestyle?: Json | null
          location?: string | null
          longitude?: number | null
          love_languages?: string[] | null
          name?: string
          orientation?: string[] | null
          personality_type?: string | null
          preferences?: Json | null
          premium_expires_at?: string | null
          premium_status?: string | null
          privacy_level?: string | null
          relationship_type?: string | null
          religion?: string | null
          show_distance?: boolean | null
          show_last_active?: boolean | null
          show_me?: string[] | null
          smoking?: string | null
          terms_agreement?: boolean | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          video_intro_url?: string | null
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          read: boolean | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string
          friend_request_count: number | null
          id: string
          is_active: boolean | null
          is_anonymous: boolean | null
          like_count: number | null
          relationship_mode: string | null
          super_like_count: number | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string
          friend_request_count?: number | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          like_count?: number | null
          relationship_mode?: string | null
          super_like_count?: number | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string
          friend_request_count?: number | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          like_count?: number | null
          relationship_mode?: string | null
          super_like_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      story_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          message: string | null
          status: string | null
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          message?: string | null
          status?: string | null
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          message?: string | null
          status?: string | null
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_interactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          media_url: string
          position: number
          story_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          media_url: string
          position?: number
          story_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          position?: number
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_media_story_id_fkey"
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
          relationship_intent: string | null
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          relationship_intent?: string | null
          swiped_id: string
          swiper_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          relationship_intent?: string | null
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
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          activity_level: string | null
          created_at: string
          daily_streak: number | null
          engagement_score: number | null
          id: string
          last_activity: string | null
          profile_completeness_score: number | null
          total_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          created_at?: string
          daily_streak?: number | null
          engagement_score?: number | null
          id?: string
          last_activity?: string | null
          profile_completeness_score?: number | null
          total_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string | null
          created_at?: string
          daily_streak?: number | null
          engagement_score?: number | null
          id?: string
          last_activity?: string | null
          profile_completeness_score?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_zodiac_compatibility: {
        Args: { sign1: string; sign2: string }
        Returns: number
      }
      expire_old_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_user_blocked: {
        Args: { blocked_id: string; blocker_id: string }
        Returns: boolean
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
