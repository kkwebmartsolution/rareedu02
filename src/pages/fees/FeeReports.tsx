
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable, { Column } from "@/components/ui/DataTable";
import { CalendarIcon, Download, Filter, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  feePaymentsAPI,
  type FeePayment
} from "@/lib/supabase-database";

interface FeeReportData {
  id: number;
  amount_due: number;
  amount_paid: number | null;
  created_at: string | null;
  due_date: string | null;
  fee_structure_component_id: number;
  last_payment_date: string | null;
  payment_status: string | null;
  student_id: number;
  updated_at: string | null;
  students: {
    first_name: string;
    last_name: string;
    admission_number: string;
    phone_number?: string;
  };
  fee_structure_components: {
    fee_types: { name: string };
    fee_structures: { name: string };
    amount: number;
    frequency: string;
  };
}

const FeeReports = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: feeReports = [], refetch, isLoading } = useQuery({
    queryKey: ['feeReports', dateRange, statusFilter, user?.role, user?.email],
    queryFn: () => feePaymentsAPI.getFeeReports(dateRange, statusFilter, user?.role, user?.email),
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    
    const statusConfig = {
      "pending": { variant: "destructive" as const, color: "text-red-600" },
      "partial": { variant: "secondary" as const, color: "text-yellow-600" },
      "paid": { variant: "default" as const, color: "text-green-600" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { variant: "secondary" as const, color: "text-gray-600" };
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredReports = feeReports.filter((report: FeeReportData) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${report.students.first_name} ${report.students.last_name}`.toLowerCase();
    const admissionNumber = report.students.admission_number?.toLowerCase() || '';
    const feeType = report.fee_structure_components?.fee_types?.name?.toLowerCase() || '';
    
    return studentName.includes(searchLower) || 
           admissionNumber.includes(searchLower) || 
           feeType.includes(searchLower);
  });

  const totalStats = {
    totalDue: filteredReports.reduce((sum, report) => sum + report.amount_due, 0),
    totalPaid: filteredReports.reduce((sum, report) => sum + (report.amount_paid || 0), 0),
    totalPending: filteredReports.reduce((sum, report) => sum + (report.amount_due - (report.amount_paid || 0)), 0),
  };

  const columns: Column<FeeReportData>[] = [
    {
      header: "Student Name",
      accessorKey: "students",
      cell: (report: FeeReportData) => (
        <div>
          <p className="font-medium">{report.students.first_name} {report.students.last_name}</p>
          <p className="text-sm text-muted-foreground">{report.students.admission_number}</p>
        </div>
      )
    },
    {
      header: "Fee Type",
      accessorKey: "fee_structure_components",
      cell: (report: FeeReportData) => report.fee_structure_components?.fee_types?.name || "N/A"
    },
    {
      header: "Amount Due",
      accessorKey: "amount_due",
      cell: (report: FeeReportData) => `$${report.amount_due.toLocaleString()}`
    },
    {
      header: "Amount Paid",
      accessorKey: "amount_paid",
      cell: (report: FeeReportData) => `$${(report.amount_paid || 0).toLocaleString()}`
    },
    {
      header: "Balance",
      accessorKey: "actions",
      cell: (report: FeeReportData) => {
        const balance = report.amount_due - (report.amount_paid || 0);
        return (
          <span className={balance > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            ${balance.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: "Due Date",
      accessorKey: "due_date",
      cell: (report: FeeReportData) => 
        report.due_date ? new Date(report.due_date).toLocaleDateString() : "N/A"
    },
    {
      header: "Status",
      accessorKey: "payment_status",
      cell: (report: FeeReportData) => getStatusBadge(report.payment_status)
    },
    {
      header: "Last Payment",
      accessorKey: "last_payment_date",
      cell: (report: FeeReportData) => 
        report.last_payment_date ? new Date(report.last_payment_date).toLocaleDateString() : "N/A"
    }
  ];

  const exportToCSV = () => {
    const csvData = filteredReports.map(report => ({
      'Student Name': `${report.students.first_name} ${report.students.last_name}`,
      'Admission Number': report.students.admission_number || '',
      'Fee Type': report.fee_structure_components?.fee_types?.name || '',
      'Amount Due': report.amount_due,
      'Amount Paid': report.amount_paid || 0,
      'Balance': report.amount_due - (report.amount_paid || 0),
      'Due Date': report.due_date || '',
      'Status': report.payment_status || '',
      'Last Payment Date': report.last_payment_date || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Fee Reports"
        description="Comprehensive reports and analytics for fee collections"
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalDue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalStats.totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalStats.totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Fee Collection Reports</CardTitle>
              <CardDescription>
                Detailed reports of all fee collections and outstanding payments
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, admission number, or fee type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From Date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="To Date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredReports} />
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default FeeReports;
