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
      academic_sessions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: number
          is_active: boolean | null
          session_name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          session_name: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          session_name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      agent_notifications: {
        Row: {
          agent_id: number
          created_at: string | null
          id: number
          message: string
          read: boolean | null
          student_id: number | null
          student_name: string
        }
        Insert: {
          agent_id: number
          created_at?: string | null
          id?: number
          message: string
          read?: boolean | null
          student_id?: number | null
          student_name: string
        }
        Update: {
          agent_id?: number
          created_at?: string | null
          id?: number
          message?: string
          read?: boolean | null
          student_id?: number | null
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_notifications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_students: {
        Row: {
          agent_id: number
          created_at: string | null
          id: number
          student_id: number
        }
        Insert: {
          agent_id: number
          created_at?: string | null
          id?: number
          student_id: number
        }
        Update: {
          agent_id?: number
          created_at?: string | null
          id?: number
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_students_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          commission_due: number | null
          commission_rate: number | null
          contact_person: string
          created_at: string | null
          email: string
          id: number
          location: string | null
          name: string
          payment_status: string | null
          phone: string | null
          status: string | null
          students_count: number | null
          total_received: number | null
          updated_at: string | null
        }
        Insert: {
          commission_due?: number | null
          commission_rate?: number | null
          contact_person: string
          created_at?: string | null
          email: string
          id?: number
          location?: string | null
          name: string
          payment_status?: string | null
          phone?: string | null
          status?: string | null
          students_count?: number | null
          total_received?: number | null
          updated_at?: string | null
        }
        Update: {
          commission_due?: number | null
          commission_rate?: number | null
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: number
          location?: string | null
          name?: string
          payment_status?: string | null
          phone?: string | null
          status?: string | null
          students_count?: number | null
          total_received?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      apply_students: {
        Row: {
          aadhaar_copy_url: string | null
          aadhaar_number: string | null
          academic_session_id: number | null
          address: string | null
          admission_letter_confirmed: boolean | null
          admission_number: string | null
          affidavit_paper_url: string | null
          agent_id: number | null
          application_status: string | null
          city: string | null
          col_letter_generated: boolean | null
          country: string | null
          course_id: number | null
          created_at: string | null
          date_of_birth: string
          email: string | null
          father_name: string
          first_name: string
          id: number
          last_name: string
          mother_name: string
          neet_passing_year: string | null
          neet_roll_number: string | null
          neet_score_card_url: string | null
          parents_phone_number: string | null
          passport_copy_url: string | null
          passport_number: string | null
          pcb_average: number | null
          phone_number: string | null
          photo_url: string | null
          qualification_status: string | null
          scores: string | null
          seat_number: string | null
          status: string | null
          tanlx_requested: boolean | null
          tenth_marksheet_number: string | null
          tenth_marksheet_url: string | null
          tenth_passing_year: string | null
          twelfth_certificate_url: string | null
          twelfth_marks: number | null
          twelfth_passing_year: string | null
          university_id: number | null
          updated_at: string | null
        }
        Insert: {
          aadhaar_copy_url?: string | null
          aadhaar_number?: string | null
          academic_session_id?: number | null
          address?: string | null
          admission_letter_confirmed?: boolean | null
          admission_number?: string | null
          affidavit_paper_url?: string | null
          agent_id?: number | null
          application_status?: string | null
          city?: string | null
          col_letter_generated?: boolean | null
          country?: string | null
          course_id?: number | null
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          father_name: string
          first_name: string
          id?: number
          last_name: string
          mother_name: string
          neet_passing_year?: string | null
          neet_roll_number?: string | null
          neet_score_card_url?: string | null
          parents_phone_number?: string | null
          passport_copy_url?: string | null
          passport_number?: string | null
          pcb_average?: number | null
          phone_number?: string | null
          photo_url?: string | null
          qualification_status?: string | null
          scores?: string | null
          seat_number?: string | null
          status?: string | null
          tanlx_requested?: boolean | null
          tenth_marksheet_number?: string | null
          tenth_marksheet_url?: string | null
          tenth_passing_year?: string | null
          twelfth_certificate_url?: string | null
          twelfth_marks?: number | null
          twelfth_passing_year?: string | null
          university_id?: number | null
          updated_at?: string | null
        }
        Update: {
          aadhaar_copy_url?: string | null
          aadhaar_number?: string | null
          academic_session_id?: number | null
          address?: string | null
          admission_letter_confirmed?: boolean | null
          admission_number?: string | null
          affidavit_paper_url?: string | null
          agent_id?: number | null
          application_status?: string | null
          city?: string | null
          col_letter_generated?: boolean | null
          country?: string | null
          course_id?: number | null
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          father_name?: string
          first_name?: string
          id?: number
          last_name?: string
          mother_name?: string
          neet_passing_year?: string | null
          neet_roll_number?: string | null
          neet_score_card_url?: string | null
          parents_phone_number?: string | null
          passport_copy_url?: string | null
          passport_number?: string | null
          pcb_average?: number | null
          phone_number?: string | null
          photo_url?: string | null
          qualification_status?: string | null
          scores?: string | null
          seat_number?: string | null
          status?: string | null
          tanlx_requested?: boolean | null
          tenth_marksheet_number?: string | null
          tenth_marksheet_url?: string | null
          tenth_passing_year?: string | null
          twelfth_certificate_url?: string | null
          twelfth_marks?: number | null
          twelfth_passing_year?: string | null
          university_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apply_students_academic_session_id_fkey"
            columns: ["academic_session_id"]
            isOneToOne: false
            referencedRelation: "academic_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apply_students_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apply_students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apply_students_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      apply_students_backup: {
        Row: {
          aadhaar_copy_url: string | null
          aadhaar_number: string | null
          academic_session_id: number | null
          address: string | null
          admission_number: string | null
          application_status: string | null
          city: string | null
          country: string | null
          course_id: number | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          father_name: string | null
          first_name: string | null
          id: number | null
          last_name: string | null
          mother_name: string | null
          passport_copy_url: string | null
          passport_number: string | null
          phone_number: string | null
          photo_url: string | null
          scores: string | null
          seat_number: string | null
          status: string | null
          twelfth_certificate_url: string | null
          twelfth_marks: number | null
          university_id: number | null
          updated_at: string | null
        }
        Insert: {
          aadhaar_copy_url?: string | null
          aadhaar_number?: string | null
          academic_session_id?: number | null
          address?: string | null
          admission_number?: string | null
          application_status?: string | null
          city?: string | null
          country?: string | null
          course_id?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          father_name?: string | null
          first_name?: string | null
          id?: number | null
          last_name?: string | null
          mother_name?: string | null
          passport_copy_url?: string | null
          passport_number?: string | null
          phone_number?: string | null
          photo_url?: string | null
          scores?: string | null
          seat_number?: string | null
          status?: string | null
          twelfth_certificate_url?: string | null
          twelfth_marks?: number | null
          university_id?: number | null
          updated_at?: string | null
        }
        Update: {
          aadhaar_copy_url?: string | null
          aadhaar_number?: string | null
          academic_session_id?: number | null
          address?: string | null
          admission_number?: string | null
          application_status?: string | null
          city?: string | null
          country?: string | null
          course_id?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          father_name?: string | null
          first_name?: string | null
          id?: number | null
          last_name?: string | null
          mother_name?: string | null
          passport_copy_url?: string | null
          passport_number?: string | null
          phone_number?: string | null
          photo_url?: string | null
          scores?: string | null
          seat_number?: string | null
          status?: string | null
          twelfth_certificate_url?: string | null
          twelfth_marks?: number | null
          university_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      character_issues: {
        Row: {
          complaint: string
          created_at: string
          created_by: string | null
          fine_amount: number
          fine_collected: boolean
          id: number
          resolved_at: string | null
          student_id: number
          updated_at: string
        }
        Insert: {
          complaint: string
          created_at?: string
          created_by?: string | null
          fine_amount?: number
          fine_collected?: boolean
          id?: number
          resolved_at?: string | null
          student_id: number
          updated_at?: string
        }
        Update: {
          complaint?: string
          created_at?: string
          created_by?: string | null
          fine_amount?: number
          fine_collected?: boolean
          id?: number
          resolved_at?: string | null
          student_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_character_issues_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      fee_collections: {
        Row: {
          amount_paid: number
          created_at: string | null
          fee_type_id: number
          id: number
          notes: string | null
          payment_date: string
          payment_method: string | null
          receipt_number: string | null
          student_id: number
          updated_at: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          fee_type_id: number
          id?: number
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
          student_id: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          fee_type_id?: number
          id?: number
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
          student_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_collections_fee_type_id_fkey"
            columns: ["fee_type_id"]
            isOneToOne: false
            referencedRelation: "fee_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_collections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string | null
          due_date: string | null
          fee_structure_component_id: number
          id: number
          last_payment_date: string | null
          payment_status: string | null
          student_id: number
          updated_at: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string | null
          due_date?: string | null
          fee_structure_component_id: number
          id?: number
          last_payment_date?: string | null
          payment_status?: string | null
          student_id: number
          updated_at?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string | null
          due_date?: string | null
          fee_structure_component_id?: number
          id?: number
          last_payment_date?: string | null
          payment_status?: string | null
          student_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_fee_structure_component_id_fkey"
            columns: ["fee_structure_component_id"]
            isOneToOne: false
            referencedRelation: "fee_structure_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure_components: {
        Row: {
          amount: number
          created_at: string | null
          fee_structure_id: number
          fee_type_id: number
          frequency: string
          id: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee_structure_id: number
          fee_type_id: number
          frequency?: string
          id?: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee_structure_id?: number
          fee_type_id?: number
          frequency?: string
          id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_components_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structure_components_fee_type_id_fkey"
            columns: ["fee_type_id"]
            isOneToOne: false
            referencedRelation: "fee_types"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          course_id: number
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          university_id: number
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          university_id: number
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          university_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_types: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          frequency: string
          id: number
          is_active: boolean | null
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          frequency?: string
          id?: number
          is_active?: boolean | null
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          frequency?: string
          id?: number
          is_active?: boolean | null
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hostel_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          expense_date: string
          expense_type: string
          hostel_id: number
          id: number
          notes: string | null
          payment_method: string | null
          receipt_number: string | null
          status: string | null
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type: string
          hostel_id: number
          id?: number
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type?: string
          hostel_id?: number
          id?: number
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_expenses_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string | null
          capacity: number
          contact_person: string | null
          created_at: string | null
          current_occupancy: number | null
          email: string | null
          facilities: string | null
          id: number
          location: string
          mess_budget: number | null
          mess_budget_remaining: number | null
          mess_budget_year: number | null
          monthly_rent: number
          name: string
          phone: string | null
          status: string | null
          university_id: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number
          contact_person?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          email?: string | null
          facilities?: string | null
          id?: number
          location: string
          mess_budget?: number | null
          mess_budget_remaining?: number | null
          mess_budget_year?: number | null
          monthly_rent?: number
          name: string
          phone?: string | null
          status?: string | null
          university_id?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number
          contact_person?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          email?: string | null
          facilities?: string | null
          id?: number
          location?: string
          mess_budget?: number | null
          mess_budget_remaining?: number | null
          mess_budget_year?: number | null
          monthly_rent?: number
          name?: string
          phone?: string | null
          status?: string | null
          university_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostels_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      mess_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          expense_date: string
          expense_type: string
          hostel_id: number | null
          id: number
          notes: string | null
          payment_method: string | null
          receipt_number: string | null
          status: string | null
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type: string
          hostel_id?: number | null
          id?: number
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type?: string
          hostel_id?: number | null
          id?: number
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mess_expenses_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      office_expenses: {
        Row: {
          created_at: string
          id: number
          internet: number
          location: string
          marketing: number
          miscellaneous: number
          month: string
          monthly_total: number
          office_id: number | null
          rent: number
          travel: number
          updated_at: string
          utilities: number
        }
        Insert: {
          created_at?: string
          id?: number
          internet?: number
          location: string
          marketing?: number
          miscellaneous?: number
          month: string
          monthly_total?: number
          office_id?: number | null
          rent?: number
          travel?: number
          updated_at?: string
          utilities?: number
        }
        Update: {
          created_at?: string
          id?: number
          internet?: number
          location?: string
          marketing?: number
          miscellaneous?: number
          month?: string
          monthly_total?: number
          office_id?: number | null
          rent?: number
          travel?: number
          updated_at?: string
          utilities?: number
        }
        Relationships: [
          {
            foreignKeyName: "office_expenses_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: number
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_expenses: {
        Row: {
          amount: number
          category_id: number
          created_at: string
          description: string
          expense_date: string
          has_receipt: boolean
          id: number
          notes: string | null
          payment_mode: string
          receipt_url: string | null
          updated_at: string
          user_id: number
        }
        Insert: {
          amount: number
          category_id: number
          created_at?: string
          description: string
          expense_date?: string
          has_receipt?: boolean
          id?: number
          notes?: string | null
          payment_mode?: string
          receipt_url?: string | null
          updated_at?: string
          user_id: number
        }
        Update: {
          amount?: number
          category_id?: number
          created_at?: string
          description?: string
          expense_date?: string
          has_receipt?: boolean
          id?: number
          notes?: string | null
          payment_mode?: string
          receipt_url?: string | null
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "personal_expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salaries: {
        Row: {
          allowances: number
          basic_salary: number
          created_at: string
          deductions: number
          gross_salary: number | null
          id: number
          net_salary: number | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          salary_month: string
          staff_id: number
          updated_at: string
        }
        Insert: {
          allowances?: number
          basic_salary?: number
          created_at?: string
          deductions?: number
          gross_salary?: number | null
          id?: number
          net_salary?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          salary_month: string
          staff_id: number
          updated_at?: string
        }
        Update: {
          allowances?: number
          basic_salary?: number
          created_at?: string
          deductions?: number
          gross_salary?: number | null
          id?: number
          net_salary?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          salary_month?: string
          staff_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_salaries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salary_structures: {
        Row: {
          allowances: number
          basic_salary: number
          created_at: string
          effective_from: string
          effective_to: string | null
          id: number
          is_active: boolean
          position: string
          staff_id: number
          updated_at: string
        }
        Insert: {
          allowances?: number
          basic_salary?: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: number
          is_active?: boolean
          position: string
          staff_id: number
          updated_at?: string
        }
        Update: {
          allowances?: number
          basic_salary?: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: number
          is_active?: boolean
          position?: string
          staff_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_salary_structures_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_credentials: {
        Row: {
          created_at: string | null
          id: number
          password: string
          student_id: number
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          password: string
          student_id: number
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          password?: string
          student_id?: number
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_credentials_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_assignments: {
        Row: {
          assigned_at: string | null
          fee_structure_id: number
          id: number
          student_id: number
        }
        Insert: {
          assigned_at?: string | null
          fee_structure_id: number
          id?: number
          student_id: number
        }
        Update: {
          assigned_at?: string | null
          fee_structure_id?: number
          id?: number
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_assignments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_customizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_amount: number
          fee_structure_component_id: number
          id: number
          reason: string | null
          student_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_amount: number
          fee_structure_component_id: number
          id?: number
          reason?: string | null
          student_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_amount?: number
          fee_structure_component_id?: number
          id?: number
          reason?: string | null
          student_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      student_fees: {
        Row: {
          academic_session_id: number | null
          amount: number
          created_at: string | null
          due_date: string | null
          fee_type: string
          id: number
          is_mandatory: boolean | null
          student_id: number
          updated_at: string | null
        }
        Insert: {
          academic_session_id?: number | null
          amount: number
          created_at?: string | null
          due_date?: string | null
          fee_type: string
          id?: number
          is_mandatory?: boolean | null
          student_id: number
          updated_at?: string | null
        }
        Update: {
          academic_session_id?: number | null
          amount?: number
          created_at?: string | null
          due_date?: string | null
          fee_type?: string
          id?: number
          is_mandatory?: boolean | null
          student_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_academic_session_id_fkey"
            columns: ["academic_session_id"]
            isOneToOne: false
            referencedRelation: "academic_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_hostel_assignments: {
        Row: {
          assigned_date: string
          created_at: string | null
          hostel_id: number
          id: number
          status: string
          student_id: number
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string
          created_at?: string | null
          hostel_id: number
          id?: number
          status?: string
          student_id: number
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string
          created_at?: string | null
          hostel_id?: number
          id?: number
          status?: string
          student_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_hostel_assignments_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_hostel_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          fee_id: number | null
          id: number
          payment_date: string
          payment_method: string
          receipt_url: string | null
          status: string | null
          student_id: number
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          fee_id?: number | null
          id?: number
          payment_date: string
          payment_method: string
          receipt_url?: string | null
          status?: string | null
          student_id: number
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          fee_id?: number | null
          id?: number
          payment_date?: string
          payment_method?: string
          receipt_url?: string | null
          status?: string | null
          student_id?: number
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_payments_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_visa: {
        Row: {
          application_step_completed: boolean | null
          application_submitted: boolean | null
          approval_step_completed: boolean | null
          created_at: string | null
          expiration_date: string | null
          id: number
          interview_step_completed: boolean | null
          issue_date: string | null
          local_id_number: string | null
          residency_address: string | null
          residency_deadline: string | null
          residency_registration: boolean | null
          residency_step_completed: boolean | null
          student_id: number
          updated_at: string | null
          visa_approved: boolean | null
          visa_interview: boolean | null
          visa_number: string | null
          visa_type: string
        }
        Insert: {
          application_step_completed?: boolean | null
          application_submitted?: boolean | null
          approval_step_completed?: boolean | null
          created_at?: string | null
          expiration_date?: string | null
          id?: number
          interview_step_completed?: boolean | null
          issue_date?: string | null
          local_id_number?: string | null
          residency_address?: string | null
          residency_deadline?: string | null
          residency_registration?: boolean | null
          residency_step_completed?: boolean | null
          student_id: number
          updated_at?: string | null
          visa_approved?: boolean | null
          visa_interview?: boolean | null
          visa_number?: string | null
          visa_type?: string
        }
        Update: {
          application_step_completed?: boolean | null
          application_submitted?: boolean | null
          approval_step_completed?: boolean | null
          created_at?: string | null
          expiration_date?: string | null
          id?: number
          interview_step_completed?: boolean | null
          issue_date?: string | null
          local_id_number?: string | null
          residency_address?: string | null
          residency_deadline?: string | null
          residency_registration?: boolean | null
          residency_step_completed?: boolean | null
          student_id?: number
          updated_at?: string | null
          visa_approved?: boolean | null
          visa_interview?: boolean | null
          visa_number?: string | null
          visa_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_visa_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          aadhaar_copy_url: string | null
          aadhaar_number: string | null
          academic_session_id: number | null
          address: string | null
          admission_letter_uploaded_at: string | null
          admission_letter_url: string | null
          admission_number: string | null
          affidavit_paper_url: string | null
          agent_id: number | null
          city: string | null
          country: string | null
          course_id: number | null
          created_at: string | null
          date_of_birth: string
          email: string | null
          father_name: string
          first_name: string
          id: number
          last_name: string
          mother_name: string
          neet_passing_year: string | null
          neet_roll_number: string | null
          neet_score_card_url: string | null
          parents_phone_number: string | null
          passport_copy_url: string | null
          passport_number: string | null
          pcb_average: number | null
          phone_number: string | null
          photo_url: string | null
          qualification_status: string | null
          scores: string | null
          seat_number: string | null
          status: string | null
          tenth_marksheet_number: string | null
          tenth_marksheet_url: string | null
          tenth_passing_year: string | null
          twelfth_certificate_url: string | null
          twelfth_marks: number | null
          twelfth_passing_year: string | null
          university_id: number | null
          updated_at: string | null
        }
        Insert: {
          aadhaar_copy_url?: string | null
          aadhaar_number?: string | null
          academic_session_id?: number | null
          address?: string | null
          admission_letter_uploaded_at?: string | null
          admission_letter_url?: string | null
          admission_number?: string | null
          affidavit_paper_url?: string | null
          agent_id?: number | null
          city?: string | null
          country?: string | null
          course_id?: number | null
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          father_name: string
          first_name: string
          id?: number
          last_name: string
          mother_name: string
          neet_passing_year?: string | null
          neet_roll_number?: string | null
          neet_score_card_url?: string | null
          parents_phone_number?: string | null
          passport_copy_url?: string | null
          passport_number?: string | null
          pcb_average?: number | null
          phone_number?: string | null
          photo_url?: string | null
          qualification_status?: string | null
          scores?: string | null
          seat_number?: string | null
          status?: string | null
          tenth_marksheet_number?: string | null
          tenth_marksheet_url?: string | null
          tenth_passing_year?: string | null
          twelfth_certificate_url?: string | null
          twelfth_marks?: number | null
          twelfth_passing_year?: string | null
          university_id?: number | null
          updated_at?: string | null
        }
        Update: {
          aadhaar_copy_url?: string | null
          aadhaar_number?: string | null
          academic_session_id?: number | null
          address?: string | null
          admission_letter_uploaded_at?: string | null
          admission_letter_url?: string | null
          admission_number?: string | null
          affidavit_paper_url?: string | null
          agent_id?: number | null
          city?: string | null
          country?: string | null
          course_id?: number | null
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          father_name?: string
          first_name?: string
          id?: number
          last_name?: string
          mother_name?: string
          neet_passing_year?: string | null
          neet_roll_number?: string | null
          neet_score_card_url?: string | null
          parents_phone_number?: string | null
          passport_copy_url?: string | null
          passport_number?: string | null
          pcb_average?: number | null
          phone_number?: string | null
          photo_url?: string | null
          qualification_status?: string | null
          scores?: string | null
          seat_number?: string | null
          status?: string | null
          tenth_marksheet_number?: string | null
          tenth_marksheet_url?: string | null
          tenth_passing_year?: string | null
          twelfth_certificate_url?: string | null
          twelfth_marks?: number | null
          twelfth_passing_year?: string | null
          university_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_academic_session_id_fkey"
            columns: ["academic_session_id"]
            isOneToOne: false
            referencedRelation: "academic_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      todo_tasks: {
        Row: {
          assigned_to: number | null
          created_at: string
          created_by: number
          description: string | null
          due_date: string
          id: number
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: number | null
          created_at?: string
          created_by: number
          description?: string | null
          due_date: string
          id?: number
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: number | null
          created_at?: string
          created_by?: number
          description?: string | null
          due_date?: string
          id?: number
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "todo_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todo_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          action: string
          created_at: string | null
          id: number
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: number
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: number
          resource?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: number
          token: string
          user_id: number
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: number
          token: string
          user_id: number
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: number
          token?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_sessions_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: number
          is_active: boolean
          last_name: string
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: number
          is_active?: boolean
          last_name: string
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: number
          is_active?: boolean
          last_name?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_student_fee_customizations: {
        Args: {
          p_student_id: number
          p_fee_structure_component_id: number
          p_custom_amount: number
        }
        Returns: undefined
      }
      approve_student_application: {
        Args: { application_id: number }
        Returns: undefined
      }
      assign_fee_structure_to_students: {
        Args: { structure_id: number }
        Returns: number
      }
      authenticate_user: {
        Args: { email_param: string; password_param: string }
        Returns: {
          user_id: number
          email: string
          first_name: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean
        }[]
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_staff_member: {
        Args: {
          email_param: string
          password_param: string
          first_name_param: string
          last_name_param: string
          role_param: Database["public"]["Enums"]["user_role"]
          agent_name_param?: string
          agent_phone_param?: string
          agent_location_param?: string
        }
        Returns: number
      }
      create_student_credentials: {
        Args: { student_id_param: number }
        Returns: undefined
      }
      create_user_session: {
        Args: { user_id_param: number }
        Returns: string
      }
      generate_admission_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_random_password: {
        Args: { length?: number }
        Returns: string
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_student_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_student_username: {
        Args: { student_id_param: number }
        Returns: string
      }
      generate_username: {
        Args: { first_name: string; last_name: string; student_id: number }
        Returns: string
      }
      get_student_financial_summary: {
        Args: { input_student_id: number }
        Returns: {
          total_fees: number
          paid_amount: number
          pending_amount: number
          next_payment_amount: number
          next_payment_date: string
        }[]
      }
      get_student_payment_history: {
        Args: { input_student_id: number }
        Returns: {
          id: number
          description: string
          amount: number
          payment_date: string
          status: string
          payment_method: string
          receipt_url: string
        }[]
      }
      get_student_upcoming_payments: {
        Args: { input_student_id: number }
        Returns: {
          id: number
          description: string
          amount: number
          due_date: string
          status: string
        }[]
      }
      logout_user: {
        Args: { token_param: string }
        Returns: undefined
      }
      recalculate_all_hostel_occupancies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_staff_password: {
        Args: { staff_id_param: number }
        Returns: string
      }
      resolve_character_issue: {
        Args: { issue_id: number }
        Returns: undefined
      }
      update_application_status: {
        Args: { application_id: number; new_status: string }
        Returns: {
          id: number
          status: string
        }[]
      }
      validate_session: {
        Args: { token_param: string }
        Returns: {
          user_id: number
          email: string
          first_name: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean
        }[]
      }
      verify_student_login: {
        Args: { input_username: string; input_password: string }
        Returns: {
          student_id: number
          username: string
          first_name: string
          last_name: string
          email: string
          admission_number: string
        }[]
      }
    }
    Enums: {
      user_role: "admin" | "agent" | "hostel_team" | "finance" | "staff"
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
      user_role: ["admin", "agent", "hostel_team", "finance", "staff"],
    },
  },
} as const
