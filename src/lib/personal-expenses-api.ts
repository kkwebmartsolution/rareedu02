import { supabase } from "@/integrations/supabase/client";

export interface PersonalExpenseCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalExpense {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  description: string;
  expense_date: string;
  payment_mode: string;
  receipt_url?: string;
  has_receipt: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: PersonalExpenseCategory;
}

export interface CreatePersonalExpenseData {
  category_id: number;
  amount: number;
  description: string;
  expense_date: string;
  payment_mode: string;
  has_receipt?: boolean;
  notes?: string;
}

export interface UpdatePersonalExpenseData {
  category_id?: number;
  amount?: number;
  description?: string;
  expense_date?: string;
  payment_mode?: string;
  has_receipt?: boolean;
  notes?: string;
}

// Get all expense categories
export const getExpenseCategories = async (): Promise<PersonalExpenseCategory[]> => {
  const { data, error } = await supabase
    .from('personal_expense_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }

  return data || [];
};

// Get personal expenses for a user
export const getPersonalExpenses = async (userId: number): Promise<PersonalExpense[]> => {
  const { data, error } = await supabase
    .from('personal_expenses')
    .select(`
      *,
      category:personal_expense_categories(*)
    `)
    .eq('user_id', userId)
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching personal expenses:', error);
    throw error;
  }

  return data || [];
};

// Get personal expenses by category
export const getPersonalExpensesByCategory = async (
  userId: number, 
  categoryId: number
): Promise<PersonalExpense[]> => {
  const { data, error } = await supabase
    .from('personal_expenses')
    .select(`
      *,
      category:personal_expense_categories(*)
    `)
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching personal expenses by category:', error);
    throw error;
  }

  return data || [];
};

// Create a new personal expense
export const createPersonalExpense = async (
  userId: number,
  expenseData: CreatePersonalExpenseData
): Promise<PersonalExpense> => {
  const { data, error } = await supabase
    .from('personal_expenses')
    .insert({
      user_id: userId,
      ...expenseData
    })
    .select(`
      *,
      category:personal_expense_categories(*)
    `)
    .single();

  if (error) {
    console.error('Error creating personal expense:', error);
    throw error;
  }

  return data;
};

// Update a personal expense
export const updatePersonalExpense = async (
  expenseId: number,
  expenseData: UpdatePersonalExpenseData
): Promise<PersonalExpense> => {
  const { data, error } = await supabase
    .from('personal_expenses')
    .update(expenseData)
    .eq('id', expenseId)
    .select(`
      *,
      category:personal_expense_categories(*)
    `)
    .single();

  if (error) {
    console.error('Error updating personal expense:', error);
    throw error;
  }

  return data;
};

// Delete a personal expense
export const deletePersonalExpense = async (expenseId: number): Promise<void> => {
  const { error } = await supabase
    .from('personal_expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Error deleting personal expense:', error);
    throw error;
  }
};

// Get expense summary by category for a user
export const getExpenseSummaryByCategory = async (userId: number) => {
  const { data, error } = await supabase
    .from('personal_expenses')
    .select(`
      category_id,
      amount,
      category:personal_expense_categories(name)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching expense summary:', error);
    throw error;
  }

  // Group by category and sum amounts
  const summary = data?.reduce((acc, expense) => {
    const categoryName = expense.category?.name || 'Unknown';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  return summary || {};
};

// Get monthly expense summary
export const getMonthlyExpenseSummary = async (userId: number, year: number, month: number) => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  const { data, error } = await supabase
    .from('personal_expenses')
    .select('amount, expense_date')
    .eq('user_id', userId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);

  if (error) {
    console.error('Error fetching monthly expense summary:', error);
    throw error;
  }

  const totalAmount = data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  
  return {
    totalAmount,
    expenseCount: data?.length || 0
  };
};