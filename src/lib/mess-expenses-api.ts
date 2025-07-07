
import { supabase } from "@/integrations/supabase/client";

export interface MessExpense {
  id: number;
  hostel_id?: number;
  expense_type: string;
  description?: string;
  amount: number;
  expense_date: string;
  category: 'Food' | 'Kitchen Equipment' | 'Staff' | 'Utilities' | 'Supplies' | 'Maintenance' | 'General';
  payment_method: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Card';
  receipt_number?: string;
  vendor_name?: string;
  notes?: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  created_at: string;
  updated_at: string;
  hostels?: {
    name: string;
  };
}

export interface MessExpenseFormData {
  id?: number;
  hostel_id: string;
  expense_type: string;
  description: string;
  amount: string;
  expense_date: string;
  category: 'Food' | 'Kitchen Equipment' | 'Staff' | 'Utilities' | 'Supplies' | 'Maintenance' | 'General';
  payment_method: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Card';
  receipt_number: string;
  vendor_name: string;
  notes: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
}

export const messExpensesAPI = {
  getAll: async (): Promise<MessExpense[]> => {
    const { data, error } = await supabase
      .from('mess_expenses')
      .select(`
        *,
        hostels (
          name
        )
      `)
      .order('expense_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching mess expenses:', error);
      throw error;
    }
    
    return (data || []).map(expense => ({
      ...expense,
      category: expense.category as MessExpense['category'],
      payment_method: expense.payment_method as MessExpense['payment_method'],
      status: expense.status as MessExpense['status']
    }));
  },

  create: async (expenseData: Omit<MessExpenseFormData, 'id'>): Promise<MessExpense> => {
    const { data, error } = await supabase
      .from('mess_expenses')
      .insert([{
        hostel_id: expenseData.hostel_id ? parseInt(expenseData.hostel_id) : null,
        expense_type: expenseData.expense_type,
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        expense_date: expenseData.expense_date,
        category: expenseData.category,
        payment_method: expenseData.payment_method,
        receipt_number: expenseData.receipt_number,
        vendor_name: expenseData.vendor_name,
        notes: expenseData.notes,
        status: expenseData.status,
      }])
      .select(`
        *,
        hostels (
          name
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating mess expense:', error);
      throw error;
    }
    
    return {
      ...data,
      category: data.category as MessExpense['category'],
      payment_method: data.payment_method as MessExpense['payment_method'],
      status: data.status as MessExpense['status']
    };
  },

  update: async (id: number, expenseData: Partial<Omit<MessExpenseFormData, 'id'>>): Promise<MessExpense> => {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (expenseData.hostel_id) updateData.hostel_id = parseInt(expenseData.hostel_id);
    if (expenseData.expense_type) updateData.expense_type = expenseData.expense_type;
    if (expenseData.description !== undefined) updateData.description = expenseData.description;
    if (expenseData.amount) updateData.amount = parseFloat(expenseData.amount);
    if (expenseData.expense_date) updateData.expense_date = expenseData.expense_date;
    if (expenseData.category) updateData.category = expenseData.category;
    if (expenseData.payment_method) updateData.payment_method = expenseData.payment_method;
    if (expenseData.receipt_number !== undefined) updateData.receipt_number = expenseData.receipt_number;
    if (expenseData.vendor_name !== undefined) updateData.vendor_name = expenseData.vendor_name;
    if (expenseData.notes !== undefined) updateData.notes = expenseData.notes;
    if (expenseData.status) updateData.status = expenseData.status;

    const { data, error } = await supabase
      .from('mess_expenses')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        hostels (
          name
        )
      `)
      .single();
    
    if (error) {
      console.error('Error updating mess expense:', error);
      throw error;
    }
    
    return {
      ...data,
      category: data.category as MessExpense['category'],
      payment_method: data.payment_method as MessExpense['payment_method'],
      status: data.status as MessExpense['status']
    };
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('mess_expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting mess expense:', error);
      throw error;
    }
  },
};
