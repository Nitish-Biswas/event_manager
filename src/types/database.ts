export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          city: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          city: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          city?: string
          created_by?: string
          created_at?: string
        }
      }
      rsvps: {
        Row: {
          id: string
          user_id: string
          event_id: string
          status: 'Yes' | 'No' | 'Maybe'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          status: 'Yes' | 'No' | 'Maybe'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          status?: 'Yes' | 'No' | 'Maybe'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      event_rsvp_summary: {
        Row: {
          event_id: string
          title: string
          city: string
          date: string
          organizer: string
          total_rsvps: number
          confirmed_attendees: number
          maybe_attendees: number
          declined_attendees: number
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type RSVP = Database['public']['Tables']['rsvps']['Row']
export type EventSummary = Database['public']['Views']['event_rsvp_summary']['Row']

export interface EventWithOrganizer extends Event {
  organizer: User
  rsvp_count?: {
    total: number
    yes: number
    maybe: number
    no: number
  }
  user_rsvp?: RSVP
}