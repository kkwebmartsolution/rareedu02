
import { supabase } from "@/integrations/supabase/client";

export interface StudentHostelAssignment {
  id: number;
  student_id: number;
  hostel_id: number;
  assigned_date: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface StudentHostelAssignmentFormData {
  student_id: number;
  hostel_id: number;
  status: 'Active' | 'Inactive';
}

export const studentHostelAssignmentsAPI = {
  getAll: async (): Promise<StudentHostelAssignment[]> => {
    const { data, error } = await supabase
      .from('student_hostel_assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching student hostel assignments:', error);
      throw error;
    }
    
    return (data || []).map(assignment => ({
      ...assignment,
      status: assignment.status as 'Active' | 'Inactive'
    }));
  },

  getByHostelId: async (hostelId: number): Promise<StudentHostelAssignment[]> => {
    const { data, error } = await supabase
      .from('student_hostel_assignments')
      .select('*')
      .eq('hostel_id', hostelId)
      .eq('status', 'Active')
      .order('assigned_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching assignments for hostel:', error);
      throw error;
    }
    
    return (data || []).map(assignment => ({
      ...assignment,
      status: assignment.status as 'Active' | 'Inactive'
    }));
  },

  create: async (assignmentData: StudentHostelAssignmentFormData): Promise<StudentHostelAssignment> => {
    const { data, error } = await supabase
      .from('student_hostel_assignments')
      .insert([assignmentData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating student hostel assignment:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as 'Active' | 'Inactive'
    };
  },

  update: async (id: number, assignmentData: Partial<StudentHostelAssignmentFormData>): Promise<StudentHostelAssignment> => {
    const { data, error } = await supabase
      .from('student_hostel_assignments')
      .update({
        ...assignmentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating student hostel assignment:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as 'Active' | 'Inactive'
    };
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('student_hostel_assignments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting student hostel assignment:', error);
      throw error;
    }
  },

  recalculateOccupancies: async (): Promise<void> => {
    const { error } = await supabase.rpc('recalculate_all_hostel_occupancies');
    
    if (error) {
      console.error('Error recalculating hostel occupancies:', error);
      throw error;
    }
  }
};
