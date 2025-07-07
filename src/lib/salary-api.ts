import { supabase } from "@/integrations/supabase/client";

export interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface StaffSalary {
  id: number;
  staff_id: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  gross_salary: number;
  net_salary: number;
  salary_month: string;
  payment_status: 'pending' | 'paid' | 'processing' | 'cancelled';
  payment_date?: string;
  payment_method: 'bank_transfer' | 'cash' | 'cheque' | 'upi';
  notes?: string;
  created_at: string;
  updated_at: string;
  users?: StaffMember;
}

export interface StaffSalaryStructure {
  id: number;
  staff_id: number;
  position: string;
  basic_salary: number;
  allowances: number;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
  users?: StaffMember;
}

export interface SalaryFormData {
  id?: number;
  staff_id: string;
  basic_salary: string;
  allowances: string;
  deductions: string;
  salary_month: string;
  payment_status: 'pending' | 'paid' | 'processing' | 'cancelled';
  payment_date: string;
  payment_method: 'bank_transfer' | 'cash' | 'cheque' | 'upi';
  notes: string;
}

export interface SalaryStructureFormData {
  id?: number;
  staff_id: string;
  position: string;
  basic_salary: string;
  allowances: string;
  effective_from: string;
  effective_to: string;
  is_active: boolean;
}

export const salaryAPI = {
  // Get all staff members
  getAllStaff: async (): Promise<StaffMember[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, is_active')
      .eq('is_active', true)
      .order('first_name');

    if (error) {
      console.error('Error fetching staff members:', error);
      throw error;
    }

    return data || [];
  },

  // Get all salaries with staff information
  getAllSalaries: async (): Promise<StaffSalary[]> => {
    const { data, error } = await supabase
      .from('staff_salaries')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          role,
          is_active
        )
      `)
      .order('salary_month', { ascending: false });

    if (error) {
      console.error('Error fetching salaries:', error);
      throw error;
    }

    return (data || []).map(salary => ({
      ...salary,
      payment_status: salary.payment_status as StaffSalary['payment_status'],
      payment_method: salary.payment_method as StaffSalary['payment_method']
    }));
  },

  // Get salary structures
  getAllSalaryStructures: async (): Promise<StaffSalaryStructure[]> => {
    const { data, error } = await supabase
      .from('staff_salary_structures')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          role,
          is_active
        )
      `)
      .eq('is_active', true)
      .order('effective_from', { ascending: false });

    if (error) {
      console.error('Error fetching salary structures:', error);
      throw error;
    }

    return data || [];
  },

  // Create salary record
  createSalary: async (salaryData: Omit<SalaryFormData, 'id'>): Promise<StaffSalary> => {
    const salaryMonth = salaryData.salary_month.includes('-01') ? salaryData.salary_month : salaryData.salary_month + '-01';
    
    // Check if salary already exists for this staff and month
    const { data: existing } = await supabase
      .from('staff_salaries')
      .select('id')
      .eq('staff_id', parseInt(salaryData.staff_id))
      .eq('salary_month', salaryMonth)
      .single();

    if (existing) {
      throw new Error(`Salary record already exists for this staff member for ${new Date(salaryMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    }

    const { data, error } = await supabase
      .from('staff_salaries')
      .insert([{
        staff_id: parseInt(salaryData.staff_id),
        basic_salary: parseFloat(salaryData.basic_salary),
        allowances: parseFloat(salaryData.allowances),
        deductions: parseFloat(salaryData.deductions),
        salary_month: salaryMonth,
        payment_status: salaryData.payment_status,
        payment_date: salaryData.payment_date || null,
        payment_method: salaryData.payment_method,
        notes: salaryData.notes || null,
      }])
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          role,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error('Error creating salary:', error);
      throw error;
    }

    return {
      ...data,
      payment_status: data.payment_status as StaffSalary['payment_status'],
      payment_method: data.payment_method as StaffSalary['payment_method']
    };
  },

  // Update salary record
  updateSalary: async (id: number, salaryData: Partial<Omit<SalaryFormData, 'id'>>): Promise<StaffSalary> => {
    console.log('UpdateSalary called with:', { id, salaryData });
    
    // Get current record to have fallback staff_id
    const { data: currentRecord, error: fetchError } = await supabase
      .from('staff_salaries')
      .select('staff_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current record:', fetchError);
      throw fetchError;
    }

    const updateData: any = {};
    const staffId = salaryData.staff_id ? parseInt(salaryData.staff_id) : currentRecord?.staff_id;
    console.log('Current record:', currentRecord, 'Staff ID:', staffId);

    if (salaryData.staff_id) updateData.staff_id = parseInt(salaryData.staff_id);
    if (salaryData.basic_salary) updateData.basic_salary = parseFloat(salaryData.basic_salary);
    if (salaryData.allowances) updateData.allowances = parseFloat(salaryData.allowances);
    if (salaryData.deductions) updateData.deductions = parseFloat(salaryData.deductions);
    if (salaryData.salary_month) {
      const salaryMonth = salaryData.salary_month.includes('-01') ? salaryData.salary_month : salaryData.salary_month + '-01';
      
      // Check if another salary record exists for this staff and month (excluding current record)
      const { data: existing } = await supabase
        .from('staff_salaries')
        .select('id')
        .eq('staff_id', staffId)
        .eq('salary_month', salaryMonth)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        throw new Error(`Salary record already exists for this staff member for ${new Date(salaryMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
      }
      
      updateData.salary_month = salaryMonth;
    }
    if (salaryData.payment_status) updateData.payment_status = salaryData.payment_status;
    if (salaryData.payment_date !== undefined) updateData.payment_date = salaryData.payment_date || null;
    if (salaryData.payment_method) updateData.payment_method = salaryData.payment_method;
    if (salaryData.notes !== undefined) updateData.notes = salaryData.notes || null;

    const { data, error } = await supabase
      .from('staff_salaries')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          role,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error('Error updating salary:', error);
      throw error;
    }

    return {
      ...data,
      payment_status: data.payment_status as StaffSalary['payment_status'],
      payment_method: data.payment_method as StaffSalary['payment_method']
    };
  },

  // Delete salary record
  deleteSalary: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('staff_salaries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting salary:', error);
      throw error;
    }
  },

  // Create salary structure
  createSalaryStructure: async (structureData: Omit<SalaryStructureFormData, 'id'>): Promise<StaffSalaryStructure> => {
    const { data, error } = await supabase
      .from('staff_salary_structures')
      .insert([{
        staff_id: parseInt(structureData.staff_id),
        position: structureData.position,
        basic_salary: parseFloat(structureData.basic_salary),
        allowances: parseFloat(structureData.allowances),
        effective_from: structureData.effective_from,
        effective_to: structureData.effective_to || null,
        is_active: structureData.is_active,
      }])
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          role,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error('Error creating salary structure:', error);
      throw error;
    }

    return data;
  },

  // Update salary structure
  updateSalaryStructure: async (id: number, structureData: Partial<Omit<SalaryStructureFormData, 'id'>>): Promise<StaffSalaryStructure> => {
    const updateData: any = {};

    if (structureData.staff_id) updateData.staff_id = parseInt(structureData.staff_id);
    if (structureData.position) updateData.position = structureData.position;
    if (structureData.basic_salary) updateData.basic_salary = parseFloat(structureData.basic_salary);
    if (structureData.allowances) updateData.allowances = parseFloat(structureData.allowances);
    if (structureData.effective_from) updateData.effective_from = structureData.effective_from;
    if (structureData.effective_to !== undefined) updateData.effective_to = structureData.effective_to || null;
    if (structureData.is_active !== undefined) updateData.is_active = structureData.is_active;

    const { data, error } = await supabase
      .from('staff_salary_structures')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          role,
          is_active
        )
      `)
      .single();

    if (error) {
      console.error('Error updating salary structure:', error);
      throw error;
    }

    return data;
  },

  // Create bulk salary records
  createBulkSalaries: async (staffIds: string[], salaryData: Omit<SalaryFormData, 'id' | 'staff_id'>): Promise<StaffSalary[]> => {
    const salaryMonth = salaryData.salary_month.includes('-01') ? salaryData.salary_month : salaryData.salary_month + '-01';
    
    // Check for existing salary records
    const { data: existingRecords } = await supabase
      .from('staff_salaries')
      .select('staff_id')
      .in('staff_id', staffIds.map(id => parseInt(id)))
      .eq('salary_month', salaryMonth);

    if (existingRecords && existingRecords.length > 0) {
      const existingStaffIds = existingRecords.map(record => record.staff_id);
      throw new Error(`Salary records already exist for some staff members for ${new Date(salaryMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Please remove those staff members from selection.`);
    }

    const bulkInserts = staffIds.map(staffId => ({
      staff_id: parseInt(staffId),
      basic_salary: parseFloat(salaryData.basic_salary),
      allowances: parseFloat(salaryData.allowances),
      deductions: parseFloat(salaryData.deductions),
      salary_month: salaryMonth,
      payment_status: salaryData.payment_status,
      payment_date: salaryData.payment_date || null,
      payment_method: salaryData.payment_method,
      notes: salaryData.notes || null,
    }));

    const { data, error } = await supabase
      .from('staff_salaries')
      .insert(bulkInserts)
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          role,
          is_active
        )
      `);

    if (error) {
      console.error('Error creating bulk salaries:', error);
      throw error;
    }

    return (data || []).map(salary => ({
      ...salary,
      payment_status: salary.payment_status as StaffSalary['payment_status'],
      payment_method: salary.payment_method as StaffSalary['payment_method']
    }));
  },
};