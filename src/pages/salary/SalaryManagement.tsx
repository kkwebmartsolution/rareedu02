import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Eye, Trash2, Loader2, DollarSign, Users, TrendingUp, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DetailViewModal from "@/components/shared/DetailViewModal";
import EditModal from "@/components/shared/EditModal";
import SalaryForm from "@/components/forms/SalaryForm";
import { salaryAPI, type StaffSalary, type SalaryFormData } from "@/lib/salary-api";

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState<StaffSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<StaffSalary | null>(null);
  const [salaryToDelete, setSalaryToDelete] = useState<StaffSalary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSalaries();
  }, []);

  const loadSalaries = async () => {
    try {
      setLoading(true);
      const data = await salaryAPI.getAllSalaries();
      setSalaries(data);
    } catch (error) {
      console.error('Error loading salaries:', error);
      toast({
        title: "Error",
        description: "Failed to load salary data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = salaries.filter((salary) => {
    const matchesSearch = 
      salary.users?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.users?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.users?.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || salary.payment_status === selectedStatus;
    
    const matchesMonth = selectedMonth === "all" || 
      new Date(salary.salary_month).toISOString().substring(0, 7) === selectedMonth;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleViewSalary = (salary: StaffSalary) => {
    setSelectedSalary(salary);
    setViewModalOpen(true);
  };

  const handleEditSalary = (salary: StaffSalary) => {
    setSelectedSalary(salary);
    setEditModalOpen(true);
  };

  const handleAddSalary = () => {
    setAddModalOpen(true);
  };

  const handleSaveSalary = async (formData: SalaryFormData, selectedStaffIds?: string[]) => {
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        await salaryAPI.updateSalary(formData.id, formData);
        toast({
          title: "Salary Updated",
          description: "Salary record has been updated successfully.",
        });
      } else if (selectedStaffIds && selectedStaffIds.length > 0) {
        await salaryAPI.createBulkSalaries(selectedStaffIds, formData);
        toast({
          title: "Salaries Added",
          description: `Salary records have been added successfully for ${selectedStaffIds.length} staff members.`,
        });
      } else {
        await salaryAPI.createSalary(formData);
        toast({
          title: "Salary Added",
          description: "Salary record has been added successfully.",
        });
      }
      
      await loadSalaries();
      setAddModalOpen(false);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error saving salary:', error);
      toast({
        title: "Error",
        description: "Failed to save salary data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSalary = (salary: StaffSalary) => {
    setSalaryToDelete(salary);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSalary = async () => {
    if (!salaryToDelete) return;
    
    try {
      await salaryAPI.deleteSalary(salaryToDelete.id);
      toast({
        title: "Salary Deleted",
        description: "Salary record has been deleted successfully.",
      });
      await loadSalaries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete salary record.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSalaryToDelete(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Staff Name", "Role", "Salary Month", "Basic Salary", "Allowances", "Deductions", "Gross Salary", "Net Salary", "Payment Status", "Payment Method", "Payment Date"],
      ...filteredData.map(salary => [
        `${salary.users?.first_name} ${salary.users?.last_name}`,
        salary.users?.role || '',
        new Date(salary.salary_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        `$${salary.basic_salary.toFixed(2)}`,
        `$${salary.allowances.toFixed(2)}`,
        `$${salary.deductions.toFixed(2)}`,
        `$${salary.gross_salary.toFixed(2)}`,
        `$${salary.net_salary.toFixed(2)}`,
        salary.payment_status,
        salary.payment_method,
        salary.payment_date ? new Date(salary.payment_date).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salary_records.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    totalStaff: new Set(salaries.map(s => s.staff_id)).size,
    totalPayroll: salaries.reduce((sum, s) => sum + s.net_salary, 0),
    pendingPayments: salaries.filter(s => s.payment_status === 'pending').length,
    currentMonth: salaries.filter(s => 
      new Date(s.salary_month).toISOString().substring(0, 7) === 
      new Date().toISOString().substring(0, 7)
    ).length
  };

  const uniqueMonths = [...new Set(salaries.map(s => 
    new Date(s.salary_month).toISOString().substring(0, 7)
  ))].sort().reverse();

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const columns = [
    { 
      header: "Staff Name", 
      accessorKey: "users" as keyof StaffSalary,
      cell: (row: StaffSalary) => `${row.users?.first_name} ${row.users?.last_name}`
    },
    { 
      header: "Role", 
      accessorKey: "users" as keyof StaffSalary,
      cell: (row: StaffSalary) => row.users?.role || 'N/A'
    },
    { 
      header: "Month", 
      accessorKey: "salary_month" as keyof StaffSalary,
      cell: (row: StaffSalary) => formatMonth(row.salary_month)
    },
    { 
      header: "Basic Salary", 
      accessorKey: "basic_salary" as keyof StaffSalary,
      cell: (row: StaffSalary) => formatCurrency(row.basic_salary)
    },
    { 
      header: "Allowances", 
      accessorKey: "allowances" as keyof StaffSalary,
      cell: (row: StaffSalary) => formatCurrency(row.allowances)
    },
    { 
      header: "Deductions", 
      accessorKey: "deductions" as keyof StaffSalary,
      cell: (row: StaffSalary) => formatCurrency(row.deductions)
    },
    { 
      header: "Net Salary", 
      accessorKey: "net_salary" as keyof StaffSalary,
      cell: (row: StaffSalary) => formatCurrency(row.net_salary)
    },
    {
      header: "Status",
      accessorKey: "payment_status" as keyof StaffSalary,
      cell: (row: StaffSalary) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.payment_status === "paid"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : row.payment_status === "processing"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              : row.payment_status === "pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {row.payment_status.charAt(0).toUpperCase() + row.payment_status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as "actions",
      cell: (row: StaffSalary) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewSalary(row)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => handleDeleteSalary(row)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading salary data...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Salary Management"
        description="Manage staff salaries, track payments, and generate payroll reports"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="default" size="sm" onClick={handleAddSalary}>
              <Plus className="mr-2 h-4 w-4" />
              Add Salary
            </Button>
          </>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Active staff members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              All time payroll
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentMonth}</div>
            <p className="text-xs text-muted-foreground">
              Records this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {uniqueMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* Add Salary Modal */}
      <EditModal
        title="Add Salary Record"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      >
        <SalaryForm 
          onSubmit={handleSaveSalary}
          isSubmitting={isSubmitting}
        />
      </EditModal>

      {/* View Modal */}
      {selectedSalary && (
        <DetailViewModal
          title={`Salary Details - ${selectedSalary.users?.first_name} ${selectedSalary.users?.last_name}`}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        >
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedSalary.users?.first_name} {selectedSalary.users?.last_name}
                  </h3>
                  <p className="text-muted-foreground">{selectedSalary.users?.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Net Salary</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectedSalary.net_salary)}</p>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Month</p>
                    <p className="text-xl font-semibold text-foreground">{formatMonth(selectedSalary.salary_month)}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Basic Salary</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedSalary.basic_salary)}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Allowances</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedSalary.allowances)}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deductions</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedSalary.deductions)}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-red-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">Payment Information</h4>
                <div className="flex gap-2">
                  {selectedSalary.payment_status !== 'paid' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={async () => {
                        try {
                          await salaryAPI.updateSalary(selectedSalary.id, {
                            payment_status: 'paid',
                            payment_date: new Date().toISOString().split('T')[0]
                          });
                          toast({
                            title: "Status Updated",
                            description: "Payment status changed to Paid",
                          });
                          await loadSalaries();
                          setViewModalOpen(false);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update status",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Mark as Paid
                    </Button>
                  )}
                  {selectedSalary.payment_status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                      onClick={async () => {
                        try {
                          await salaryAPI.updateSalary(selectedSalary.id, {
                            payment_status: 'pending',
                            payment_date: ''
                          });
                          toast({
                            title: "Status Updated",
                            description: "Payment status changed to Pending",
                          });
                          await loadSalaries();
                          setViewModalOpen(false);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update status",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Mark as Pending
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedSalary.payment_status === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : selectedSalary.payment_status === "processing"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        : selectedSalary.payment_status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {selectedSalary.payment_status.charAt(0).toUpperCase() + selectedSalary.payment_status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="text-lg text-foreground">{selectedSalary.payment_method.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                  <p className="text-lg text-foreground">
                    {selectedSalary.payment_date ? new Date(selectedSalary.payment_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedSalary.notes && (
              <div className="bg-muted/30 rounded-lg p-4 border">
                <h4 className="font-semibold text-foreground mb-3">Notes</h4>
                <p className="text-foreground">{selectedSalary.notes}</p>
              </div>
            )}
          </div>
        </DetailViewModal>
      )}

      {/* Edit Modal */}
      {selectedSalary && (
        <EditModal
          title={`Edit Salary - ${selectedSalary.users?.first_name} ${selectedSalary.users?.last_name}`}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        >
          <SalaryForm 
            defaultValues={{
              id: selectedSalary.id,
              staff_id: selectedSalary.staff_id.toString(),
              basic_salary: selectedSalary.basic_salary.toString(),
              allowances: selectedSalary.allowances.toString(),
              deductions: selectedSalary.deductions.toString(),
              salary_month: selectedSalary.salary_month.substring(0, 7), // Convert YYYY-MM-DD to YYYY-MM
              payment_status: selectedSalary.payment_status,
              payment_date: selectedSalary.payment_date || '',
              payment_method: selectedSalary.payment_method,
              notes: selectedSalary.notes || '',
            }}
            onSubmit={handleSaveSalary}
            isSubmitting={isSubmitting}
          />
        </EditModal>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the salary record for{" "}
              <strong>
                {salaryToDelete?.users?.first_name} {salaryToDelete?.users?.last_name}
              </strong>{" "}
              for {salaryToDelete && formatMonth(salaryToDelete.salary_month)}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSalary}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default SalaryManagement;