
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import AlertCard, { Alert } from "@/components/dashboard/AlertCard";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import TodoCalendar from "@/components/dashboard/TodoCalendar";
import SearchFilter from "@/components/dashboard/SearchFilter";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  FileText, 
  Users, 
  GraduationCap, 
  Building2, 
  Home,
  ClipboardList
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getDashboardStatistics, getRecentActivities } from "@/lib/dashboard-api";
import { getTodoTaskStatistics } from "@/lib/todo-api";
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

interface Activity {
  first_name: string;
  last_name: string;
  created_at: string;
}

const activityColumns = [
  { 
    header: "Student Name", 
    accessorKey: "first_name" as keyof Activity,
    cell: (row: Activity) => `${row.first_name} ${row.last_name}`
  },
  { 
    header: "Date Enrolled", 
    accessorKey: "created_at" as keyof Activity,
    cell: (row: Activity) => new Date(row.created_at).toLocaleDateString()
  },
];

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalAgents: 0,
    totalUniversities: 0,
    activeApplications: 0,
    totalRevenue: 0,
    pendingTasks: 0,
  });
  const [todoStats, setTodoStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
  });
  const [cashFlowData, setCashFlowData] = useState<ChartData[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [stats, todoStatistics, activities] = await Promise.all([
        getDashboardStatistics(),
        getTodoTaskStatistics(),
        getRecentActivities(),
      ]);

      setDashboardStats(stats);
      setTodoStats(todoStatistics);
      setRecentActivities(activities);

      // Generate chart data (last 6 months)
      const chartData: ChartData[] = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      months.forEach(month => {
        chartData.push({
          name: month,
          income: Math.floor(stats.totalRevenue / 6 + Math.random() * 2000),
          expense: Math.floor((stats.totalRevenue * 0.7) / 6 + Math.random() * 1000),
        });
      });
      setCashFlowData(chartData);

      // Generate source data
      const sources = [
        { name: "Fee Collections", income: stats.totalRevenue * 0.6 },
        { name: "Hostel Fees", income: stats.totalRevenue * 0.25 },
        { name: "Other Services", income: stats.totalRevenue * 0.15 },
      ];
      setSourceData(sources);

      // Generate alerts
      const dashboardAlerts: Alert[] = [
        {
          id: "1",
          title: "Pending Applications",
          description: `${stats.activeApplications} applications awaiting review`,
          type: "warning",
        },
        {
          id: "2",
          title: "Pending Tasks",
          description: `${stats.pendingTasks} tasks need attention`,
          type: "reminder",
        },
        {
          id: "3",
          title: "High Priority Tasks",
          description: `${todoStatistics.highPriority} high priority tasks`,
          type: "warning",
        },
      ];
      setAlerts(dashboardAlerts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // Implement search functionality
  };

  const handleFilterChange = (filterType: string, value: string) => {
    console.log(`Filter ${filterType}:`, value);
    // Implement filter functionality
  };

  const handleDateRangeChange = (range: any) => {
    console.log("Date range:", range);
    // Implement date filter functionality
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard Overview" 
        description="Complete overview of your educational institution management system"
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
            <Button variant="default" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </>
        }
      />
      
      {/* Search and Filter */}
      <SearchFilter 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
      />
      
      {/* Primary Stats Overview */}
      <div className="dashboard-grid mb-6">
        <StatCard
          title="Total Students"
          value={dashboardStats.totalStudents.toLocaleString()}
          icon={<GraduationCap className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title="Active Agents"
          value={dashboardStats.totalAgents.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title="Universities"
          value={dashboardStats.totalUniversities.toLocaleString()}
          icon={<Building2 className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Financial & Task Stats */}
      <div className="dashboard-grid mb-6">
        <StatCard
          title="Total Revenue"
          value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          variant="income"
        />
        <StatCard
          title="Pending Applications"
          value={dashboardStats.activeApplications.toLocaleString()}
          icon={<AlertCircle className="h-5 w-5" />}
          variant="due"
        />
        <StatCard
          title="Pending Tasks"
          value={dashboardStats.pendingTasks.toLocaleString()}
          icon={<ClipboardList className="h-5 w-5" />}
          variant="due"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <ChartCard
          title="Monthly Revenue Trend"
          description="Revenue vs Expenses"
          type="line"
          data={cashFlowData}
        />
        <ChartCard
          title="Revenue by Source"
          description="Breakdown by category"
          type="bar"
          data={sourceData}
        />
      </div>

      {/* Calendar-based Todo List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Task Management Calendar</h2>
        <TodoCalendar />
      </div>
      
      {/* Alerts and Recent Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AlertCard title="Important Alerts" alerts={alerts} />
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Recent Student Enrollments</h3>
            {recentActivities.length > 0 ? (
              <DataTable columns={activityColumns} data={recentActivities} />
            ) : (
              <p className="text-muted-foreground">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
