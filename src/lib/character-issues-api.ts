import { supabase } from "@/integrations/supabase/client";

export interface CharacterIssue {
  id: number;
  student_id: number;
  complaint: string;
  fine_amount: number;
  fine_collected: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  resolved_at?: string;
  students?: {
    first_name: string;
    last_name: string;
    admission_number: string;
    email: string;
  };
}

export interface CreateCharacterIssueRequest {
  student_id: number;
  complaint: string;
  fine_amount: number;
  created_by?: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
}

export const characterIssuesAPI = {
  getAll: async (): Promise<CharacterIssue[]> => {
    const { data, error } = await supabase
      .from('character_issues')
      .select(`
        *,
        students (
          first_name,
          last_name,
          admission_number,
          email
        )
      `)
      .eq('fine_collected', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching character issues:', error);
      throw error;
    }

    return data || [];
  },

  create: async (issueData: CreateCharacterIssueRequest): Promise<CharacterIssue> => {
    const { data, error } = await supabase
      .from('character_issues')
      .insert([issueData])
      .select(`
        *,
        students (
          first_name,
          last_name,
          admission_number,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating character issue:', error);
      throw error;
    }

    return data;
  },

  resolveFine: async (id: number): Promise<void> => {
    const { error } = await supabase.rpc('resolve_character_issue', {
      issue_id: id
    });

    if (error) {
      console.error('Error resolving character issue:', error);
      throw error;
    }
  },

  update: async (id: number, updates: Partial<CharacterIssue>): Promise<CharacterIssue> => {
    const { data, error } = await supabase
      .from('character_issues')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        students (
          first_name,
          last_name,
          admission_number,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating character issue:', error);
      throw error;
    }

    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('character_issues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting character issue:', error);
      throw error;
    }
  },

  getStudents: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, admission_number')
      .eq('status', 'active')
      .order('first_name');

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    return data || [];
  }
};