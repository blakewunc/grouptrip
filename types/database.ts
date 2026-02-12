export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SplitType = 'equal' | 'custom' | 'none'
export type TripStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled'
export type MemberRole = 'organizer' | 'member'
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'maybe'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          description: string | null
          budget_total: number | null
          status: TripStatus
          created_by: string
          invite_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          destination: string
          start_date: string
          end_date: string
          description?: string | null
          budget_total?: number | null
          status?: TripStatus
          created_by: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          destination?: string
          start_date?: string
          end_date?: string
          description?: string | null
          budget_total?: number | null
          status?: TripStatus
          created_by?: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          role: MemberRole
          rsvp_status: RsvpStatus
          joined_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          role?: MemberRole
          rsvp_status?: RsvpStatus
          joined_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          role?: MemberRole
          rsvp_status?: RsvpStatus
          joined_at?: string
        }
      }
      budget_categories: {
        Row: {
          id: string
          trip_id: string
          name: string
          estimated_cost: number
          split_type: SplitType
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          name: string
          estimated_cost?: number
          split_type?: SplitType
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          name?: string
          estimated_cost?: number
          split_type?: SplitType
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      budget_splits: {
        Row: {
          id: string
          category_id: string
          user_id: string
          amount: number
        }
        Insert: {
          id?: string
          category_id: string
          user_id: string
          amount?: number
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string
          amount?: number
        }
      }
      itinerary_items: {
        Row: {
          id: string
          trip_id: string
          date: string
          time: string | null
          title: string
          description: string | null
          location: string | null
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          date: string
          time?: string | null
          title: string
          description?: string | null
          location?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          date?: string
          time?: string | null
          title?: string
          description?: string | null
          location?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          itinerary_item_id: string
          user_id: string
          text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          itinerary_item_id: string
          user_id: string
          text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          itinerary_item_id?: string
          user_id?: string
          text?: string
          created_at?: string
          updated_at?: string
        }
      }
      shared_expenses: {
        Row: {
          id: string
          trip_id: string
          paid_by: string
          amount: number
          description: string
          category: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          paid_by: string
          amount: number
          description: string
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          paid_by?: string
          amount?: number
          description?: string
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount: number
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount: number
        }
        Update: {
          id?: string
          expense_id?: string
          user_id?: string
          amount?: number
        }
      }
      availability: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          available_from: string
          available_to: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          available_from: string
          available_to: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          available_from?: string
          available_to?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_trip_member_count: {
        Args: { trip_id: string }
        Returns: number
      }
      calculate_expense_balances: {
        Args: { p_trip_id: string }
        Returns: {
          user_id: string
          user_name: string
          total_paid: number
          total_owed: number
          balance: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
