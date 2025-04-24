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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          meme_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meme_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_meme_id_fkey"
            columns: ["meme_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          id: string
          meme_id: string
          user_id: string
        }
        Insert: {
          id?: string
          meme_id: string
          user_id: string
        }
        Update: {
          id?: string
          meme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_meme_id_fkey"
            columns: ["meme_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      memes: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          image_url: string
          likes_count: number
          tags: string[]
          title: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          image_url: string
          likes_count?: number
          tags?: string[]
          title: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          image_url?: string
          likes_count?: number
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "memes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          joined_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          id: string
          joined_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          id?: string
          joined_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}