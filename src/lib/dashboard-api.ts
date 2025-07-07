import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalStudents: number;
  totalAgents: number;
  totalUniversities: number;
  activeApplications: number;
  totalRevenue: number;
  pendingTasks: number;
}

export const getDashboardStatistics = async (): Promise<DashboardStats> => {
  try {
    // Get all statistics in parallel
    const [
      studentsResult,
      agentsResult,
      universitiesResult,
      applicationsResult,
      revenueResult,
      tasksResult
    ] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact' }),
      supabase.from('agents').select('id', { count: 'exact' }),
      supabase.from('universities').select('id', { count: 'exact' }),
      supabase.from('apply_students').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('fee_collections').select('amount_paid'),
      supabase.from('todo_tasks').select('id', { count: 'exact' }).eq('status', 'pending')
    ]);

    // Calculate total revenue
    const totalRevenue = revenueResult.data?.reduce((sum, fee) => sum + Number(fee.amount_paid), 0) || 0;

    return {
      totalStudents: studentsResult.count || 0,
      totalAgents: agentsResult.count || 0,
      totalUniversities: universitiesResult.count || 0,
      activeApplications: applicationsResult.count || 0,
      totalRevenue,
      pendingTasks: tasksResult.count || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};

export const getRecentActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};