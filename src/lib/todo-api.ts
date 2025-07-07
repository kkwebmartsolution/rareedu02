import { supabase } from "@/integrations/supabase/client";

export interface TodoTask {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  priority: string;
  status: string;
  assigned_to?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    first_name: string;
    last_name: string;
  };
  creator?: {
    first_name: string;
    last_name: string;
  };
}

export interface CreateTodoTaskData {
  title: string;
  description?: string;
  due_date: string;
  priority: string;
  assigned_to?: number;
}

export interface UpdateTodoTaskData {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  assigned_to?: number;
}

// Get all todo tasks
export const getTodoTasks = async (): Promise<TodoTask[]> => {
  const { data, error } = await supabase
    .from('todo_tasks')
    .select('*')
    .order('due_date');

  if (error) {
    console.error('Error fetching todo tasks:', error);
    throw error;
  }

  return data || [];
};

// Get tasks by date range
export const getTodoTasksByDateRange = async (startDate: string, endDate: string): Promise<TodoTask[]> => {
  const { data, error } = await supabase
    .from('todo_tasks')
    .select('*')
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .order('due_date');

  if (error) {
    console.error('Error fetching todo tasks by date range:', error);
    throw error;
  }

  return data || [];
};

// Get tasks for a specific user
export const getTodoTasksForUser = async (userId: number): Promise<TodoTask[]> => {
  const { data, error } = await supabase
    .from('todo_tasks')
    .select('*')
    .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
    .order('due_date');

  if (error) {
    console.error('Error fetching todo tasks for user:', error);
    throw error;
  }

  return data || [];
};

// Create a new todo task
export const createTodoTask = async (
  createdBy: number,
  taskData: CreateTodoTaskData
): Promise<TodoTask> => {
  const { data, error } = await supabase
    .from('todo_tasks')
    .insert({
      created_by: createdBy,
      ...taskData
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating todo task:', error);
    throw error;
  }

  return data;
};

// Update a todo task
export const updateTodoTask = async (
  taskId: number,
  taskData: UpdateTodoTaskData
): Promise<TodoTask> => {
  const { data, error } = await supabase
    .from('todo_tasks')
    .update(taskData)
    .eq('id', taskId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating todo task:', error);
    throw error;
  }

  return data;
};

// Delete a todo task
export const deleteTodoTask = async (taskId: number): Promise<void> => {
  const { error } = await supabase
    .from('todo_tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting todo task:', error);
    throw error;
  }
};

// Get task statistics
export const getTodoTaskStatistics = async () => {
  const { data, error } = await supabase
    .from('todo_tasks')
    .select('status, priority');

  if (error) {
    console.error('Error fetching todo task statistics:', error);
    throw error;
  }

  const stats = {
    total: data?.length || 0,
    pending: data?.filter(task => task.status === 'pending').length || 0,
    inProgress: data?.filter(task => task.status === 'in_progress').length || 0,
    completed: data?.filter(task => task.status === 'completed').length || 0,
    highPriority: data?.filter(task => task.priority === 'high' || task.priority === 'urgent').length || 0,
  };

  return stats;
};