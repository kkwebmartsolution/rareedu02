import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  phone_number?: string;
  email?: string;
  university_id: number;
  course_id: number;
  academic_session_id: number;
  status: 'active' | 'inactive' | 'completed';
  admission_number?: string;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: number;
  name: string;
  created_at: string;
}

export interface Course {
  id: number;
  name: string;
  created_at: string;
}

export interface AcademicSession {
  id: number;
  session_name: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface FeeType {
  id: number;
  name: string;
  description?: string;
  category: string;
  frequency: string;
  status: string;
  amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeeCollection {
  id: number;
  student_id: number;
  fee_type_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'cheque';
  receipt_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeeStructure {
  id: number;
  university_id: number;
  course_id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeeStructureComponent {
  id: number;
  fee_structure_id: number;
  fee_type_id: number;
  amount: number;
  frequency: 'one-time' | 'yearly' | 'semester-wise';
  created_at: string;
  updated_at: string;
}

export interface StudentFeeAssignment {
  id: number;
  student_id: number;
  fee_structure_id: number;
  assigned_at: string;
}

export interface FeePayment {
  id: number;
  student_id: number;
  fee_structure_component_id: number;
  amount_due: number;
  amount_paid: number;
  payment_status: 'pending' | 'partial' | 'paid';
  due_date?: string;
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentFeeCustomization {
  id: number;
  student_id: number;
  fee_structure_component_id: number;
  custom_amount: number;
  reason?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Students API
export const studentsAPI = {
  getAll: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
    
    return (data || []).map(student => ({
      ...student,
      status: student.status as 'active' | 'inactive' | 'completed'
    }));
  },

  create: async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'admission_number'>): Promise<Student> => {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating student:', error);
      throw error;
    }
    
    const newStudent = {
      ...data,
      status: data.status as 'active' | 'inactive' | 'completed'
    };

    // Automatically assign matching fee structures
    try {
      await studentsAPI.autoAssignFeeStructures(newStudent);
    } catch (assignError) {
      console.error('Error auto-assigning fee structures:', assignError);
      // Don't throw error here - student creation succeeded, fee assignment is secondary
    }
    
    return newStudent;
  },

  autoAssignFeeStructures: async (student: Student): Promise<void> => {
    console.log('Auto-assigning fee structures for student:', student.id);
    
    // Find matching fee structures for this student's university, course, and academic session
    const { data: matchingStructures, error: structuresError } = await supabase
      .from('fee_structures')
      .select('id')
      .eq('university_id', student.university_id)
      .eq('course_id', student.course_id)
      .eq('is_active', true);

    if (structuresError) {
      console.error('Error finding matching fee structures:', structuresError);
      throw structuresError;
    }

    if (!matchingStructures || matchingStructures.length === 0) {
      console.log('No matching fee structures found for student');
      return;
    }

    // Assign each matching fee structure to the student
    for (const structure of matchingStructures) {
      try {
        // Check if assignment already exists
        const { data: existingAssignment } = await supabase
          .from('student_fee_assignments')
          .select('id')
          .eq('student_id', student.id)
          .eq('fee_structure_id', structure.id)
          .single();

        if (!existingAssignment) {
          // Create assignment
          await supabase
            .from('student_fee_assignments')
            .insert([{
              student_id: student.id,
              fee_structure_id: structure.id
            }]);

          // Create payment records for each component
          const { data: components } = await supabase
            .from('fee_structure_components')
            .select('*')
            .eq('fee_structure_id', structure.id);

          if (components) {
            const paymentRecords = components.map(component => ({
              student_id: student.id,
              fee_structure_component_id: component.id,
              amount_due: component.amount,
              due_date: (() => {
                const now = new Date();
                switch (component.frequency) {
                  case 'one-time':
                    return new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];
                  case 'yearly':
                    return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString().split('T')[0];
                  case 'semester-wise':
                    return new Date(now.setMonth(now.getMonth() + 6)).toISOString().split('T')[0];
                  default:
                    return new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];
                }
              })()
            }));

            await supabase
              .from('fee_payments')
              .insert(paymentRecords);
          }

          console.log(`Assigned fee structure ${structure.id} to student ${student.id}`);
        }
      } catch (assignmentError) {
        console.error(`Error assigning fee structure ${structure.id}:`, assignmentError);
        // Continue with other structures even if one fails
      }
    }
  },

  update: async (id: number, studentData: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at' | 'admission_number'>>): Promise<Student> => {
    const { data, error } = await supabase
      .from('students')
      .update({ ...studentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as 'active' | 'inactive' | 'completed'
    };
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};

// Universities API
export const universitiesAPI = {
  getAll: async (): Promise<University[]> => {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching universities:', error);
      throw error;
    }
    
    return data || [];
  },
};

// Courses API
export const coursesAPI = {
  getAll: async (): Promise<Course[]> => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
    
    return data || [];
  },
};

// Academic Sessions API
export const academicSessionsAPI = {
  getAll: async (): Promise<AcademicSession[]> => {
    const { data, error } = await supabase
      .from('academic_sessions')
      .select('*')
      .order('session_name');
    
    if (error) {
      console.error('Error fetching academic sessions:', error);
      throw error;
    }
    
    return data || [];
  },
};

// Fee Types API
export const feeTypesAPI = {
  getAll: async (): Promise<FeeType[]> => {
    const { data, error } = await supabase
      .from('fee_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching fee types:', error);
      throw error;
    }
    
    return data || [];
  },

  create: async (feeTypeData: Omit<FeeType, 'id' | 'created_at' | 'updated_at'>): Promise<FeeType> => {
    const { data, error } = await supabase
      .from('fee_types')
      .insert([feeTypeData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating fee type:', error);
      throw error;
    }
    
    return data;
  },

  update: async (id: number, feeTypeData: Partial<Omit<FeeType, 'id' | 'created_at' | 'updated_at'>>): Promise<FeeType> => {
    const { data, error } = await supabase
      .from('fee_types')
      .update({ ...feeTypeData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fee type:', error);
      throw error;
    }
    
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('fee_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting fee type:', error);
      throw error;
    }
  },
};

// Fee Collections API
export const feeCollectionsAPI = {
  getAll: async (): Promise<FeeCollection[]> => {
    const { data, error } = await supabase
      .from('fee_collections')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching fee collections:', error);
      throw error;
    }
    
    return (data || []).map(collection => ({
      ...collection,
      payment_method: collection.payment_method as 'cash' | 'card' | 'bank_transfer' | 'cheque'
    }));
  },

  getByStudent: async (studentId: number): Promise<FeeCollection[]> => {
    const { data, error } = await supabase
      .from('fee_collections')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching student fee collections:', error);
      throw error;
    }
    
    return (data || []).map(collection => ({
      ...collection,
      payment_method: collection.payment_method as 'cash' | 'card' | 'bank_transfer' | 'cheque'
    }));
  },

  create: async (feeCollectionData: Omit<FeeCollection, 'id' | 'created_at' | 'updated_at' | 'receipt_number'>): Promise<FeeCollection> => {
    const { data, error } = await supabase
      .from('fee_collections')
      .insert([feeCollectionData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating fee collection:', error);
      throw error;
    }
    
    return {
      ...data,
      payment_method: data.payment_method as 'cash' | 'card' | 'bank_transfer' | 'cheque'
    };
  },

  update: async (id: number, feeCollectionData: Partial<Omit<FeeCollection, 'id' | 'created_at' | 'updated_at' | 'receipt_number'>>): Promise<FeeCollection> => {
    const { data, error } = await supabase
      .from('fee_collections')
      .update({ ...feeCollectionData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fee collection:', error);
      throw error;
    }
    
    return {
      ...data,
      payment_method: data.payment_method as 'cash' | 'card' | 'bank_transfer' | 'cheque'
    };
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('fee_collections')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting fee collection:', error);
      throw error;
    }
  },
};

// Fee Structures API
export const feeStructuresAPI = {
  getAll: async (): Promise<FeeStructure[]> => {
    const { data, error } = await supabase
      .from('fee_structures')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching fee structures:', error);
      throw error;
    }
    
    return data || [];
  },

  getByUniversityAndCourse: async (universityId: number, courseId: number): Promise<FeeStructure[]> => {
    const { data, error } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('university_id', universityId)
      .eq('course_id', courseId)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching fee structures:', error);
      throw error;
    }
    
    return data || [];
  },

  create: async (feeStructureData: Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>): Promise<FeeStructure> => {
    const { data, error } = await supabase
      .from('fee_structures')
      .insert([feeStructureData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating fee structure:', error);
      throw error;
    }
    
    return data;
  },

  update: async (id: number, feeStructureData: Partial<Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>>): Promise<FeeStructure> => {
    const { data, error } = await supabase
      .from('fee_structures')
      .update({ ...feeStructureData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fee structure:', error);
      throw error;
    }
    
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('fee_structures')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting fee structure:', error);
      throw error;
    }
  },

  assignToStudents: async (structureId: number): Promise<number> => {
    console.log('Assigning fee structure:', structureId);
    
    const { data, error } = await supabase.rpc('assign_fee_structure_to_students', {
      structure_id: structureId
    });

    if (error) {
      console.error('Error assigning fee structure:', error);
      throw error;
    }

    console.log('Assigned count:', data);
    return data || 0;
  },
};

// Fee Structure Components API
export const feeStructureComponentsAPI = {
  getByStructure: async (feeStructureId: number): Promise<FeeStructureComponent[]> => {
    const { data, error } = await supabase
      .from('fee_structure_components')
      .select('*')
      .eq('fee_structure_id', feeStructureId)
      .order('created_at');
    
    if (error) {
      console.error('Error fetching fee structure components:', error);
      throw error;
    }
    
    return (data || []).map(component => ({
      ...component,
      frequency: component.frequency as 'one-time' | 'yearly' | 'semester-wise'
    }));
  },

  create: async (componentData: Omit<FeeStructureComponent, 'id' | 'created_at' | 'updated_at'>): Promise<FeeStructureComponent> => {
    const { data, error } = await supabase
      .from('fee_structure_components')
      .insert([componentData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating fee structure component:', error);
      throw error;
    }
    
    return {
      ...data,
      frequency: data.frequency as 'one-time' | 'yearly' | 'semester-wise'
    };
  },

  update: async (id: number, componentData: Partial<Omit<FeeStructureComponent, 'id' | 'created_at' | 'updated_at'>>): Promise<FeeStructureComponent> => {
    const { data, error } = await supabase
      .from('fee_structure_components')
      .update({ ...componentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fee structure component:', error);
      throw error;
    }
    
    return {
      ...data,
      frequency: data.frequency as 'one-time' | 'yearly' | 'semester-wise'
    };
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('fee_structure_components')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting fee structure component:', error);
      throw error;
    }
  },
};

// Fee Payments API (updated to use new table name)
export const feePaymentsAPI = {
  getByStudent: async (studentId: number): Promise<FeePayment[]> => {
    const { data, error } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching student fee payments:', error);
      throw error;
    }
    
    return (data || []).map(payment => ({
      ...payment,
      payment_status: payment.payment_status as 'pending' | 'partial' | 'paid'
    }));
  },

  updatePayment: async (id: number, amountPaid: number, paymentStatus: 'pending' | 'partial' | 'paid'): Promise<FeePayment> => {
    const { data, error } = await supabase
      .from('fee_payments')
      .update({
        amount_paid: amountPaid,
        payment_status: paymentStatus,
        last_payment_date: paymentStatus !== 'pending' ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fee payment:', error);
      throw error;
    }
    
    return {
      ...data,
      payment_status: data.payment_status as 'pending' | 'partial' | 'paid'
    };
  },

  getStudentsWithFeeStructures: async (userRole?: string, userEmail?: string): Promise<any[]> => {
    console.log('Fetching students with fee structures...');
    
    let studentsQuery = supabase
      .from('students')
      .select(`
        *,
        universities(name),
        courses(name),
        academic_sessions(session_name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // If user is an agent, filter by their agent_id
    if (userRole === 'agent' && userEmail) {
      // First get the agent's ID from their email
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (agentError) {
        console.error('Error fetching agent:', agentError);
        throw agentError;
      }

      if (agent) {
        studentsQuery = studentsQuery.eq('agent_id', agent.id);
      } else {
        // If no agent found for this email, return empty array
        return [];
      }
    }
    
    const { data: students, error: studentsError } = await studentsQuery;
    
    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw studentsError;
    }

    console.log('Fetched students:', students);

    // Then get fee payments for each student with related data
    const studentsWithPayments = [];
    
    for (const student of students || []) {
      const { data: payments, error: paymentsError } = await supabase
        .from('fee_payments')
        .select(`
          *,
          fee_structure_components(
            *,
            fee_types(name),
            fee_structures(name)
          )
        `)
        .eq('student_id', student.id);

      if (paymentsError) {
        console.error('Error fetching payments for student:', student.id, paymentsError);
        continue;
      }

      // Only include students who have fee payments
      if (payments && payments.length > 0) {
        studentsWithPayments.push({
          ...student,
          fee_payments: payments.map(payment => ({
            ...payment,
            payment_status: payment.payment_status as 'pending' | 'partial' | 'paid'
          }))
        });
      }
    }
    
    console.log('Students with fee payments:', studentsWithPayments);
    
    return studentsWithPayments;
  },

  async getFeeReports(dateRange?: { from: string; to: string }, statusFilter?: string, userRole?: string, userEmail?: string) {
    let query = supabase
      .from('fee_payments')
      .select(`
        *,
        students (
          first_name,
          last_name,
          admission_number,
          phone_number,
          agent_id
        ),
        fee_structure_components (
          fee_types (name),
          fee_structures (name),
          amount,
          frequency
        )
      `)
      .order('created_at', { ascending: false });

    if (dateRange?.from && dateRange?.to) {
      query = query
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to);
    }

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('payment_status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching fee reports:', error);
      throw error;
    }

    let filteredData = data || [];

    // If user is an agent, filter by their agent_id
    if (userRole === 'agent' && userEmail) {
      // First get the agent's ID from their email
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (agentError) {
        console.error('Error fetching agent:', agentError);
        throw agentError;
      }

      if (agent) {
        filteredData = filteredData.filter(payment => 
          payment.students?.agent_id === agent.id
        );
      } else {
        // If no agent found for this email, return empty array
        return [];
      }
    }

    return filteredData;
  },

  async getPaymentHistory(dateRange?: { from: string; to: string }, paymentMethodFilter?: string, userRole?: string, userEmail?: string) {
    let query = supabase
      .from('fee_payments')
      .select(`
        *,
        students (
          first_name,
          last_name,
          admission_number,
          phone_number,
          agent_id
        ),
        fee_structure_components (
          fee_types (name),
          fee_structures (name)
        )
      `)
      .gt('amount_paid', 0)
      .order('last_payment_date', { ascending: false });

    if (dateRange?.from && dateRange?.to) {
      query = query
        .gte('last_payment_date', dateRange.from)
        .lte('last_payment_date', dateRange.to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }

    let filteredData = data || [];

    // If user is an agent, filter by their agent_id
    if (userRole === 'agent' && userEmail) {
      // First get the agent's ID from their email
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (agentError) {
        console.error('Error fetching agent:', agentError);
        throw agentError;
      }

      if (agent) {
        filteredData = filteredData.filter(payment => 
          payment.students?.agent_id === agent.id
        );
      } else {
        // If no agent found for this email, return empty array
        return [];
      }
    }

    return filteredData;
  }
};

// Reports API
export const reportsAPI = {
  // Agent-wise Student Report
  getAgentStudentReport: async () => {
    const { data, error } = await supabase
      .from('agents')
      .select(`
        *,
        agent_students!inner (
          students!inner (
            id,
            first_name,
            last_name,
            admission_number,
            status,
            universities (name),
            courses (name)
          )
        )
      `)
      .eq('status', 'Active');

    if (error) {
      console.error('Error fetching agent student report:', error);
      throw error;
    }

    // Get fee data for each agent's students
    const agentReports = await Promise.all(
      (data || []).map(async (agent) => {
        const studentIds = agent.agent_students.map((as: any) => as.students.id);
        
        if (studentIds.length === 0) {
          return {
            ...agent,
            students: [],
            totalDue: 0,
            totalPaid: 0,
            totalPending: 0
          };
        }

        const { data: payments } = await supabase
          .from('fee_payments')
          .select('amount_due, amount_paid')
          .in('student_id', studentIds);

        const totalDue = payments?.reduce((sum, p) => sum + p.amount_due, 0) || 0;
        const totalPaid = payments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

        return {
          ...agent,
          students: agent.agent_students.map((as: any) => as.students),
          totalDue,
          totalPaid,
          totalPending: totalDue - totalPaid
        };
      })
    );

    return agentReports;
  },

  // University Fee Summary
  getUniversityFeeReport: async () => {
    const { data, error } = await supabase
      .from('universities')
      .select(`
        *,
        students!inner (
          id,
          first_name,
          last_name,
          admission_number
        )
      `);

    if (error) {
      console.error('Error fetching university fee report:', error);
      throw error;
    }

    const universityReports = await Promise.all(
      (data || []).map(async (university) => {
        const studentIds = university.students.map((s: any) => s.id);
        
        if (studentIds.length === 0) {
          return {
            ...university,
            studentCount: 0,
            totalDue: 0,
            totalPaid: 0,
            totalPending: 0
          };
        }

        const { data: payments } = await supabase
          .from('fee_payments')
          .select('amount_due, amount_paid, payment_status')
          .in('student_id', studentIds);

        const totalDue = payments?.reduce((sum, p) => sum + p.amount_due, 0) || 0;
        const totalPaid = payments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

        return {
          ...university,
          studentCount: university.students.length,
          totalDue,
          totalPaid,
          totalPending: totalDue - totalPaid
        };
      })
    );

    return universityReports;
  },

  // Profit & Loss Report
  getProfitLossReport: async (year?: number) => {
    const currentYear = year || new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    // Get all fee collections (income)
    const { data: feeCollections, error: feeError } = await supabase
      .from('fee_collections')
      .select('amount_paid, payment_date')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate);

    if (feeError) {
      console.error('Error fetching fee collections:', feeError);
      throw feeError;
    }

    // Get all hostel expenses
    const { data: hostelExpenses, error: hostelError } = await supabase
      .from('hostel_expenses')
      .select('amount, expense_date, category')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .eq('status', 'Paid');

    if (hostelError) {
      console.error('Error fetching hostel expenses:', hostelError);
      throw hostelError;
    }

    // Get all mess expenses
    const { data: messExpenses, error: messError } = await supabase
      .from('mess_expenses')
      .select('amount, expense_date, category')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .eq('status', 'Paid');

    if (messError) {
      console.error('Error fetching mess expenses:', messError);
      throw messError;
    }

    const totalIncome = feeCollections?.reduce((sum, f) => sum + f.amount_paid, 0) || 0;
    const totalHostelExpenses = hostelExpenses?.reduce((sum, h) => sum + h.amount, 0) || 0;
    const totalMessExpenses = messExpenses?.reduce((sum, m) => sum + m.amount, 0) || 0;
    const totalExpenses = totalHostelExpenses + totalMessExpenses;

    return {
      year: currentYear,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      hostelExpenses: totalHostelExpenses,
      messExpenses: totalMessExpenses,
      monthlyData: Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthStart = `${currentYear}-${month.toString().padStart(2, '0')}-01`;
        const monthEnd = `${currentYear}-${month.toString().padStart(2, '0')}-31`;

        const monthIncome = feeCollections?.filter(f => 
          f.payment_date >= monthStart && f.payment_date <= monthEnd
        ).reduce((sum, f) => sum + f.amount_paid, 0) || 0;

        const monthExpenses = (hostelExpenses?.filter(h => 
          h.expense_date >= monthStart && h.expense_date <= monthEnd
        ).reduce((sum, h) => sum + h.amount, 0) || 0) + 
        (messExpenses?.filter(m => 
          m.expense_date >= monthStart && m.expense_date <= monthEnd
        ).reduce((sum, m) => sum + m.amount, 0) || 0);

        return {
          month,
          income: monthIncome,
          expenses: monthExpenses,
          profit: monthIncome - monthExpenses
        };
      })
    };
  },

  // Hostel Expense Summary
  getHostelExpenseReport: async () => {
    const { data, error } = await supabase
      .from('hostels')
      .select(`
        *,
        universities (name),
        hostel_expenses (
          amount,
          expense_date,
          category,
          expense_type,
          status
        )
      `);

    if (error) {
      console.error('Error fetching hostel expense report:', error);
      throw error;
    }

    return (data || []).map(hostel => {
      const expenses = hostel.hostel_expenses || [];
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const paidExpenses = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
      const pendingExpenses = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

      return {
        ...hostel,
        totalExpenses,
        paidExpenses,
        pendingExpenses,
        expensesByCategory: expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>)
      };
    });
  },

  // Due Payment Alerts
  getDuePaymentReport: async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('fee_payments')
      .select(`
        *,
        students (
          first_name,
          last_name,
          admission_number,
          phone_number,
          email
        ),
        fee_structure_components (
          fee_types (name),
          fee_structures (name)
        )
      `)
      .neq('payment_status', 'paid')
      .lte('due_date', today);

    if (error) {
      console.error('Error fetching due payment report:', error);
      throw error;
    }

    return (data || []).map(payment => ({
      ...payment,
      balance: payment.amount_due - (payment.amount_paid || 0),
      daysOverdue: Math.floor((new Date().getTime() - new Date(payment.due_date || '').getTime()) / (1000 * 60 * 60 * 24))
    }));
  },

  // Agent Commission Report
  getAgentCommissionReport: async () => {
    const { data, error } = await supabase.functions.invoke('calculate-agent-commissions');
    
    if (error) {
      console.error('Error fetching agent commission report:', error);
      throw error;
    }

    return data || [];
  }
};

export interface OfficeExpense {
  id: number;
  location: string;
  office_id?: number;
  month: string;
  rent: number;
  utilities: number;
  internet: number;
  marketing: number;
  travel: number;
  miscellaneous: number;
  monthly_total: number;
  created_at: string;
  updated_at: string;
}

// Office Expenses API
export const officeExpensesAPI = {
  getAll: async (): Promise<OfficeExpense[]> => {
    const { data, error } = await supabase
      .from('office_expenses')
      .select('*')
      .order('month', { ascending: false });
    
    if (error) {
      console.error('Error fetching office expenses:', error);
      throw error;
    }
    
    return data || [];
  },

  create: async (expenseData: Omit<OfficeExpense, 'id' | 'created_at' | 'updated_at'>): Promise<OfficeExpense> => {
    const { data, error } = await supabase
      .from('office_expenses')
      .insert([expenseData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating office expense:', error);
      throw error;
    }
    
    return data;
  },

  update: async (id: number, expenseData: Partial<Omit<OfficeExpense, 'id' | 'created_at' | 'updated_at'>>): Promise<OfficeExpense> => {
    const { data, error } = await supabase
      .from('office_expenses')
      .update({ ...expenseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating office expense:', error);
      throw error;
    }
    
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('office_expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting office expense:', error);
      throw error;
    }
  },
};

// Office Interface
export interface Office {
  id: number;
  name: string;
  address: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Offices API
export const officesAPI = {
  getAll: async (): Promise<Office[]> => {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getById: async (id: number): Promise<Office | null> => {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (office: Omit<Office, 'id' | 'created_at' | 'updated_at'>): Promise<Office> => {
    const { data, error } = await supabase
      .from('offices')
      .insert(office)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: number, office: Partial<Office>): Promise<Office> => {
    const { data, error } = await supabase
      .from('offices')
      .update(office)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('offices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Student Fee Customizations API
export const studentFeeCustomizationsAPI = {
  getByStudent: async (studentId: number): Promise<StudentFeeCustomization[]> => {
    const { data, error } = await supabase
      .from('student_fee_customizations')
      .select('*')
      .eq('student_id', studentId);
    
    if (error) {
      console.error('Error fetching student fee customizations:', error);
      throw error;
    }
    
    return data || [];
  },

  applyCustomAmount: async (studentId: number, feeStructureComponentId: number, customAmount: number, reason?: string): Promise<void> => {
    const { error } = await supabase.rpc('apply_student_fee_customizations', {
      p_student_id: studentId,
      p_fee_structure_component_id: feeStructureComponentId,
      p_custom_amount: customAmount
    });

    if (error) {
      console.error('Error applying custom fee amount:', error);
      throw error;
    }

    // Also record the reason if provided
    if (reason) {
      await supabase
        .from('student_fee_customizations')
        .update({ reason })
        .eq('student_id', studentId)
        .eq('fee_structure_component_id', feeStructureComponentId);
    }
  },

  getStudentsWithOneTimeCharges: async (): Promise<any[]> => {
    // Get students with one-time charges fee type
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        universities(name),
        courses(name),
        fee_payments!inner(
          id,
          amount_due,
          amount_paid,
          payment_status,
          fee_structure_components!inner(
            id,
            amount,
            fee_types!inner(
              id,
              name
            )
          )
        )
      `)
      .eq('fee_payments.fee_structure_components.fee_types.name', 'One-Time Charges (Medical Checkup, Transport, etc.)')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching students with one-time charges:', error);
      throw error;
    }

    // Get customizations for these students
    const result = [];
    for (const student of students || []) {
      const { data: customizations } = await supabase
        .from('student_fee_customizations')
        .select('*')
        .eq('student_id', student.id);

      result.push({
        ...student,
        customizations: customizations || []
      });
    }

    return result;
  }
};

// For backward compatibility, keep the old API name
export const studentFeePaymentsAPI = feePaymentsAPI;
