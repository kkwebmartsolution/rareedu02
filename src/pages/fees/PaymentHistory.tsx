
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Receipt, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  feePaymentsAPI
} from "@/lib/supabase-database";

interface PaymentHistoryData {
  id: number;
  amount_paid: number;
  last_payment_date: string;
  payment_status: string;
  students: {
    first_name: string;
    last_name: string;
    admission_number: string;
    phone_number?: string;
  };
  fee_structure_components: {
    fee_types: { name: string };
    fee_structures: { name: string };
  };
  created_at: string;
  updated_at: string;
}

const PaymentHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");

  const { data: paymentHistory = [], refetch, isLoading } = useQuery({
    queryKey: ['paymentHistory', dateRange, paymentMethodFilter, user?.role, user?.email],
    queryFn: () => feePaymentsAPI.getPaymentHistory(dateRange, paymentMethodFilter, user?.role, user?.email),
  });

  const filteredHistory = paymentHistory.filter((payment: PaymentHistoryData) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${payment.students.first_name} ${payment.students.last_name}`.toLowerCase();
    const admissionNumber = payment.students.admission_number?.toLowerCase() || '';
    const feeType = payment.fee_structure_components?.fee_types?.name?.toLowerCase() || '';
    
    return studentName.includes(searchLower) || 
           admissionNumber.includes(searchLower) || 
           feeType.includes(searchLower);
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "pending": { variant: "destructive" as const, color: "text-red-600" },
      "partial": { variant: "secondary" as const, color: "text-yellow-600" },
      "paid": { variant: "default" as const, color: "text-green-600" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalCollected = filteredHistory
    .filter((payment: PaymentHistoryData) => payment.amount_paid > 0)
    .reduce((sum, payment) => sum + payment.amount_paid, 0);

  const columns: Column<PaymentHistoryData>[] = [
    {
      header: "Date",
      accessorKey: "last_payment_date",
      cell: (payment: PaymentHistoryData) => 
        payment.last_payment_date ? new Date(payment.last_payment_date).toLocaleDateString() : "N/A"
    },
    {
      header: "Student",
      accessorKey: "students",
      cell: (payment: PaymentHistoryData) => (
        <div>
          <p className="font-medium">{payment.students.first_name} {payment.students.last_name}</p>
          <p className="text-sm text-muted-foreground">{payment.students.admission_number}</p>
        </div>
      )
    },
    {
      header: "Fee Type",
      accessorKey: "fee_structure_components",
      cell: (payment: PaymentHistoryData) => (
        <div>
          <p className="font-medium">{payment.fee_structure_components?.fee_types?.name || "N/A"}</p>
          <p className="text-sm text-muted-foreground">{payment.fee_structure_components?.fee_structures?.name || ""}</p>
        </div>
      )
    },
    {
      header: "Amount Paid",
      accessorKey: "amount_paid",
      cell: (payment: PaymentHistoryData) => (
        <span className="font-semibold text-green-600">
          ${payment.amount_paid.toLocaleString()}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "payment_status",
      cell: (payment: PaymentHistoryData) => getStatusBadge(payment.payment_status)
    },
    {
      header: "Phone Number",
      accessorKey: "students",
      cell: (payment: PaymentHistoryData) => payment.students.phone_number || "N/A"
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (payment: PaymentHistoryData) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Receipt className="h-4 w-4 mr-1" />
            Receipt
          </Button>
        </div>
      )
    }
  ];

  const exportToCSV = () => {
    const csvData = filteredHistory.map((payment: PaymentHistoryData) => ({
      'Date': payment.last_payment_date || '',
      'Student Name': `${payment.students.first_name} ${payment.students.last_name}`,
      'Admission Number': payment.students.admission_number || '',
      'Fee Type': payment.fee_structure_components?.fee_types?.name || '',
      'Fee Structure': payment.fee_structure_components?.fee_structures?.name || '',
      'Amount Paid': payment.amount_paid,
      'Status': payment.payment_status,
      'Phone Number': payment.students.phone_number || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Payment History"
        description="Track and manage all fee payment transactions"
      />
      
      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">${totalCollected.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-1">
            From {filteredHistory.filter(p => p.amount_paid > 0).length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                Complete history of all fee payments received
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, admission number, or fee type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From Date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="To Date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-40"
              />
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading payment history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payment history found.</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredHistory} />
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default PaymentHistory;
