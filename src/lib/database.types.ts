// src/lib/database.types.ts - Types TypeScript générés
export interface Database {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string;
            name: string | null;
            email: string | null;
            avatar_url: string | null;
            subscription: 'free' | 'pro' | 'premium';
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id: string;
            name?: string | null;
            email?: string | null;
            avatar_url?: string | null;
            subscription?: 'free' | 'pro' | 'premium';
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            name?: string | null;
            email?: string | null;
            avatar_url?: string | null;
            subscription?: 'free' | 'pro' | 'premium';
            updated_at?: string;
          };
        };
        presets: {
          Row: {
            id: string;
            name: string;
            description: string | null;
            user_id: string;
            user_name: string;
            is_public: boolean;
            votes: number;
            downvotes: number;
            usage_count: number;
            tags: string[];
            style_data: Record<string, any>;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            description?: string | null;
            user_id: string;
            user_name: string;
            is_public?: boolean;
            votes?: number;
            downvotes?: number;
            usage_count?: number;
            tags?: string[];
            style_data: Record<string, any>;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            description?: string | null;
            user_id?: string;
            user_name?: string;
            is_public?: boolean;
            votes?: number;
            downvotes?: number;
            usage_count?: number;
            tags?: string[];
            style_data?: Record<string, any>;
            updated_at?: string;
          };
        };
        preset_votes: {
          Row: {
            id: string;
            preset_id: string;
            user_id: string;
            vote_type: 'up' | 'down';
            created_at: string;
          };
          Insert: {
            id?: string;
            preset_id: string;
            user_id: string;
            vote_type: 'up' | 'down';
            created_at?: string;
          };
          Update: {
            id?: string;
            preset_id?: string;
            user_id?: string;
            vote_type?: 'up' | 'down';
          };
        };
        video_projects: {
          Row: {
            id: string;
            user_id: string;
            name: string;
            video_url: string;
            video_duration: number;
            width: number;
            height: number;
            fps: number;
            subtitles: Record<string, any>[];
            style: Record<string, any>;
            status: 'processing' | 'completed' | 'error';
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            name: string;
            video_url: string;
            video_duration: number;
            width: number;
            height: number;
            fps?: number;
            subtitles?: Record<string, any>[];
            style: Record<string, any>;
            status?: 'processing' | 'completed' | 'error';
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            user_id?: string;
            name?: string;
            video_url?: string;
            video_duration?: number;
            width?: number;
            height?: number;
            fps?: number;
            subtitles?: Record<string, any>[];
            style?: Record<string, any>;
            status?: 'processing' | 'completed' | 'error';
            updated_at?: string;
          };
        };
      };
      Views: {
        [_ in never]: never;
      };
      Functions: {
        vote_preset: {
          Args: {
            preset_id: string;
            user_id: string;
            vote_type: 'up' | 'down';
          };
          Returns: void;
        };
      };
      Enums: {
        subscription_type: 'free' | 'pro' | 'premium';
        vote_type: 'up' | 'down';
        project_status: 'processing' | 'completed' | 'error';
      };
    };
  }