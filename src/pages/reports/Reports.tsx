
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { reportsAPI } from "@/lib/supabase-database";

// Define report types
interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const reports: Report[] = [
    {
      id: "agent-student",
      title: "Agent-wise Student Report",
      description: "View student distribution and fees by agent",
      icon: <Users className="h-8 w-8 text-blue-500" />,
    },
    {
      id: "university-fee",
      title: "University Fee Summary",
      description: "Track university fee payments and pending amounts",
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
    },
    {
      id: "profit-loss",
      title: "Profit & Loss Report",
      description: "Monthly and annual financial performance",
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
    },
    {
      id: "hostel-expense",
      title: "Hostel Expense Summary",
      description: "Detailed breakdown of hostel expenses by university",
      icon: <FileText className="h-8 w-8 text-yellow-500" />,
    },
    {
      id: "due-payments",
      title: "Due Payment Alerts",
      description: "List of outstanding payments from students and to universities",
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
    },
    {
      id: "agent-commission",
      title: "Agent Commission Report",
      description: "Agent commission structure and pending payments",
      icon: <TrendingDown className="h-8 w-8 text-indigo-500" />,
    },
  ];

  // Query hooks for each report type
  const { data: agentStudentData, isLoading: isLoadingAgentStudent } = useQuery({
    queryKey: ['agent-student-report'],
    queryFn: reportsAPI.getAgentStudentReport,
    enabled: selectedReport === 'agent-student',
  });

  const { data: universityFeeData, isLoading: isLoadingUniversityFee } = useQuery({
    queryKey: ['university-fee-report'],
    queryFn: reportsAPI.getUniversityFeeReport,
    enabled: selectedReport === 'university-fee',
  });

  const { data: profitLossData, isLoading: isLoadingProfitLoss } = useQuery({
    queryKey: ['profit-loss-report', currentYear],
    queryFn: () => reportsAPI.getProfitLossReport(currentYear),
    enabled: selectedReport === 'profit-loss',
  });

  const { data: hostelExpenseData, isLoading: isLoadingHostelExpense } = useQuery({
    queryKey: ['hostel-expense-report'],
    queryFn: reportsAPI.getHostelExpenseReport,
    enabled: selectedReport === 'hostel-expense',
  });

  const { data: duePaymentData, isLoading: isLoadingDuePayment } = useQuery({
    queryKey: ['due-payment-report'],
    queryFn: reportsAPI.getDuePaymentReport,
    enabled: selectedReport === 'due-payments',
  });

  const { data: agentCommissionData, isLoading: isLoadingAgentCommission } = useQuery({
    queryKey: ['agent-commission-report'],
    queryFn: reportsAPI.getAgentCommissionReport,
    enabled: selectedReport === 'agent-commission',
  });

  const handleViewReport = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => 
        typeof val === 'string' ? `"${val}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderAgentStudentReport = () => {
    if (isLoadingAgentStudent) return <div>Loading...</div>;
    
    const columns: Column<any>[] = [
      { header: "Agent Name", accessorKey: "name" },
      { header: "Contact", accessorKey: "contact_person" },
      { header: "Student Count", accessorKey: "students", cell: (agent) => agent.students?.length || 0 },
      { header: "Total Due", accessorKey: "totalDue", cell: (agent) => `$${(agent.totalDue || 0).toLocaleString()}` },
      { header: "Total Paid", accessorKey: "totalPaid", cell: (agent) => `$${(agent.totalPaid || 0).toLocaleString()}` },
      { header: "Pending", accessorKey: "totalPending", cell: (agent) => 
        <span className={agent.totalPending > 0 ? "text-red-600 font-medium" : "text-green-600"}>
          ${(agent.totalPending || 0).toLocaleString()}
        </span>
      },
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agent-wise Student Report</CardTitle>
              <CardDescription>Student distribution and fee collection by agent</CardDescription>
            </div>
            <Button onClick={() => exportToCSV(agentStudentData || [], 'agent-student-report')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={agentStudentData || []} />
        </CardContent>
      </Card>
    );
  };

  const renderUniversityFeeReport = () => {
    if (isLoadingUniversityFee) return <div>Loading...</div>;
    
    const columns: Column<any>[] = [
      { header: "University", accessorKey: "name" },
      { header: "Students", accessorKey: "studentCount" },
      { header: "Total Due", accessorKey: "totalDue", cell: (uni) => `$${(uni.totalDue || 0).toLocaleString()}` },
      { header: "Total Paid", accessorKey: "totalPaid", cell: (uni) => `$${(uni.totalPaid || 0).toLocaleString()}` },
      { header: "Pending", accessorKey: "totalPending", cell: (uni) => 
        <span className={uni.totalPending > 0 ? "text-red-600 font-medium" : "text-green-600"}>
          ${(uni.totalPending || 0).toLocaleString()}
        </span>
      },
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>University Fee Summary</CardTitle>
              <CardDescription>Fee collection status by university</CardDescription>
            </div>
            <Button onClick={() => exportToCSV(universityFeeData || [], 'university-fee-report')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={universityFeeData || []} />
        </CardContent>
      </Card>
    );
  };

  const renderProfitLossReport = () => {
    if (isLoadingProfitLoss) return <div>Loading...</div>;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Profit & Loss Report - {currentYear}</CardTitle>
                <CardDescription>Annual financial performance summary</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentYear(currentYear - 1)}>
                  Previous Year
                </Button>
                <Button variant="outline" onClick={() => setCurrentYear(currentYear + 1)}>
                  Next Year
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    ${(profitLossData?.totalIncome || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    ${(profitLossData?.totalExpenses || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className={`text-2xl font-bold ${(profitLossData?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(profitLossData?.netProfit || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {profitLossData?.netProfit && profitLossData?.totalIncome ? 
                      ((profitLossData.netProfit / profitLossData.totalIncome) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderHostelExpenseReport = () => {
    if (isLoadingHostelExpense) return <div>Loading...</div>;
    
    const columns: Column<any>[] = [
      { header: "Hostel", accessorKey: "name" },
      { header: "University", accessorKey: "universities", cell: (hostel) => hostel.universities?.name || 'N/A' },
      { header: "Total Expenses", accessorKey: "totalExpenses", cell: (hostel) => `$${(hostel.totalExpenses || 0).toLocaleString()}` },
      { header: "Paid", accessorKey: "paidExpenses", cell: (hostel) => `$${(hostel.paidExpenses || 0).toLocaleString()}` },
      { header: "Pending", accessorKey: "pendingExpenses", cell: (hostel) => 
        <span className={hostel.pendingExpenses > 0 ? "text-red-600 font-medium" : "text-green-600"}>
          ${(hostel.pendingExpenses || 0).toLocaleString()}
        </span>
      },
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Hostel Expense Summary</CardTitle>
              <CardDescription>Breakdown of hostel expenses by university</CardDescription>
            </div>
            <Button onClick={() => exportToCSV(hostelExpenseData || [], 'hostel-expense-report')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={hostelExpenseData || []} />
        </CardContent>
      </Card>
    );
  };

  const renderDuePaymentReport = () => {
    if (isLoadingDuePayment) return <div>Loading...</div>;
    
    const columns: Column<any>[] = [
      { 
        header: "Student", 
        accessorKey: "students",
        cell: (payment) => (
          <div>
            <p className="font-medium">{payment.students?.first_name} {payment.students?.last_name}</p>
            <p className="text-sm text-muted-foreground">{payment.students?.admission_number}</p>
          </div>
        )
      },
      { header: "Fee Type", accessorKey: "fee_structure_components", cell: (payment) => payment.fee_structure_components?.fee_types?.name || 'N/A' },
      { header: "Amount Due", accessorKey: "amount_due", cell: (payment) => `$${payment.amount_due.toLocaleString()}` },
      { header: "Balance", accessorKey: "balance", cell: (payment) => 
        <span className="text-red-600 font-medium">
          ${payment.balance.toLocaleString()}
        </span>
      },
      { header: "Days Overdue", accessorKey: "daysOverdue", cell: (payment) => 
        <Badge variant={payment.daysOverdue > 30 ? "destructive" : "secondary"}>
          {payment.daysOverdue} days
        </Badge>
      },
      { header: "Contact", accessorKey: "students", cell: (payment) => payment.students?.phone_number || payment.students?.email || 'N/A' },
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Due Payment Alerts</CardTitle>
              <CardDescription>Outstanding payments from students</CardDescription>
            </div>
            <Button onClick={() => exportToCSV(duePaymentData || [], 'due-payment-report')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={duePaymentData || []} />
        </CardContent>
      </Card>
    );
  };

  const renderAgentCommissionReport = () => {
    if (isLoadingAgentCommission) return <div>Loading...</div>;
    
    const columns: Column<any>[] = [
      { header: "Agent Name", accessorKey: "name" },
      { header: "Students", accessorKey: "students_count" },
      { header: "Commission Rate", accessorKey: "commission_rate", cell: (agent) => `${agent.commission_rate}%` },
      { header: "Total Received", accessorKey: "total_received", cell: (agent) => `$${(agent.total_received || 0).toLocaleString()}` },
      { header: "Commission Due", accessorKey: "commission_due", cell: (agent) => 
        <span className={agent.commission_due > 0 ? "text-red-600 font-medium" : "text-green-600"}>
          ${(agent.commission_due || 0).toLocaleString()}
        </span>
      },
      { header: "Payment Status", accessorKey: "payment_status", cell: (agent) => 
        <Badge variant={agent.payment_status === 'Paid' ? "default" : "destructive"}>
          {agent.payment_status}
        </Badge>
      },
    ];

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agent Commission Report</CardTitle>
              <CardDescription>Agent commission structure and pending payments</CardDescription>
            </div>
            <Button onClick={() => exportToCSV(agentCommissionData || [], 'agent-commission-report')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={agentCommissionData || []} />
        </CardContent>
      </Card>
    );
  };

  const renderSelectedReport = () => {
    switch (selectedReport) {
      case 'agent-student':
        return renderAgentStudentReport();
      case 'university-fee':
        return renderUniversityFeeReport();
      case 'profit-loss':
        return renderProfitLossReport();
      case 'hostel-expense':
        return renderHostelExpenseReport();
      case 'due-payments':
        return renderDuePaymentReport();
      case 'agent-commission':
        return renderAgentCommissionReport();
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Reports"
        description="Generate and view comprehensive financial and operational reports"
      />

      {!selectedReport ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md cursor-pointer"
              onClick={() => handleViewReport(report.id)}
            >
              <div className="mb-4 flex items-center justify-center">
                {report.icon}
              </div>
              <h3 className="mb-2 text-center text-lg font-medium">{report.title}</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                {report.description}
              </p>
              <div className="flex justify-center gap-2">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  View Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              ← Back to Reports
            </Button>
          </div>
          {renderSelectedReport()}
        </div>
      )}
    </MainLayout>
  );
};

export default Reports;
