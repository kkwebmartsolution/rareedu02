
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Eye, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import DetailViewModal from "@/components/shared/DetailViewModal";
import EditModal from "@/components/shared/EditModal";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { hostelExpensesAPI, HostelExpense, HostelExpenseFormData } from "@/lib/hostel-expenses-api";

const HostelExpenses = () => {
  const [selectedHostel, setSelectedHostel] = useState<string>("all");
  const [expenses, setExpenses] = useState<HostelExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<HostelExpense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await hostelExpensesAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading hostel expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load hostel expenses data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredData = selectedHostel === "all" 
    ? expenses
    : expenses.filter(expense => 
        expense.hostel_id?.toString() === selectedHostel
      );

  const handleViewExpense = (expense: HostelExpense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: HostelExpense) => {
    setSelectedExpense(expense);
    setEditModalOpen(true);
  };

  const handleAddExpense = () => {
    setAddModalOpen(true);
  };

  const handleSaveExpense = async (formData: HostelExpenseFormData) => {
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        await hostelExpensesAPI.update(formData.id, formData);
        toast({
          title: "Expense Updated",
          description: "Hostel expense has been updated successfully.",
        });
      } else {
        await hostelExpensesAPI.create(formData);
        toast({
          title: "Expense Added",
          description: "Hostel expense has been added successfully.",
        });
      }
      
      await loadExpenses();
      setAddModalOpen(false);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be available shortly.",
    });
  };

  const hostels = [...new Set(expenses.map(item => item.hostels?.name).filter(Boolean))];

  const columns = [
    { 
      header: "Hostel", 
      accessorKey: "hostels" as keyof HostelExpense,
      cell: (row: HostelExpense) => row.hostels?.name || 'N/A'
    },
    { header: "Expense Type", accessorKey: "expense_type" as keyof HostelExpense },
    { header: "Category", accessorKey: "category" as keyof HostelExpense },
    { 
      header: "Amount", 
      accessorKey: "amount" as keyof HostelExpense,
      cell: (row: HostelExpense) => `$${row.amount.toFixed(2)}`
    },
    { header: "Date", accessorKey: "expense_date" as keyof HostelExpense },
    {
      header: "Status",
      accessorKey: "status" as keyof HostelExpense,
      cell: (row: HostelExpense) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.status === "Paid"
              ? "bg-green-100 text-green-800"
              : row.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as "actions",
      cell: (row: HostelExpense) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewExpense(row)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditExpense(row)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading expenses...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Hostel Expenses"
        description="Track and manage all hostel-related expenses"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="default" size="sm" onClick={handleAddExpense}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <div className="flex gap-4">
          <Select 
            value={selectedHostel} 
            onValueChange={setSelectedHostel}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Hostel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostels</SelectItem>
              {hostels.map(hostel => (
                <SelectItem key={hostel} value={hostel || ''}>
                  {hostel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* Add Expense Modal */}
      <EditModal
        title="Add Hostel Expense"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      >
        <ExpenseForm 
          onSubmit={handleSaveExpense}
          isSubmitting={isSubmitting}
          expenseType="hostel"
        />
      </EditModal>

      {/* View Modal */}
      {selectedExpense && (
        <DetailViewModal
          title={`Hostel Expense Details`}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        >
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedExpense.hostels?.name || 'N/A'}</h3>
                  <p className="text-muted-foreground">{selectedExpense.expense_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-primary">${selectedExpense.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-xl font-semibold text-foreground">{selectedExpense.category}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <p className="text-xl font-semibold text-foreground">{new Date(selectedExpense.expense_date).toLocaleDateString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-green-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedExpense.status === "Paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : selectedExpense.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {selectedExpense.status}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-purple-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="text-xl font-semibold text-foreground">{selectedExpense.payment_method}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-orange-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(selectedExpense.vendor_name || selectedExpense.receipt_number) && (
              <div className="bg-muted/30 rounded-lg p-4 border">
                <h4 className="font-semibold text-foreground mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedExpense.vendor_name && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                      <p className="text-lg text-foreground">{selectedExpense.vendor_name}</p>
                    </div>
                  )}
                  {selectedExpense.receipt_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Receipt Number</p>
                      <p className="text-lg text-foreground">{selectedExpense.receipt_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description and Notes */}
            {(selectedExpense.description || selectedExpense.notes) && (
              <div className="bg-muted/30 rounded-lg p-4 border">
                <h4 className="font-semibold text-foreground mb-3">Additional Details</h4>
                <div className="space-y-4">
                  {selectedExpense.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-foreground">{selectedExpense.description}</p>
                    </div>
                  )}
                  {selectedExpense.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-foreground">{selectedExpense.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DetailViewModal>
      )}

      {/* Edit Modal */}
      {selectedExpense && (
        <EditModal
          title={`Edit Expense - ${selectedExpense.hostels?.name || 'N/A'}`}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        >
          <ExpenseForm 
            defaultValues={{
              id: selectedExpense.id,
              hostel_id: selectedExpense.hostel_id?.toString(),
              expense_type: selectedExpense.expense_type,
              description: selectedExpense.description,
              amount: selectedExpense.amount.toString(),
              expense_date: selectedExpense.expense_date,
              category: selectedExpense.category,
              payment_method: selectedExpense.payment_method,
              receipt_number: selectedExpense.receipt_number,
              vendor_name: selectedExpense.vendor_name,
              notes: selectedExpense.notes,
              status: selectedExpense.status,
            }}
            onSubmit={handleSaveExpense}
            isSubmitting={isSubmitting}
            expenseType="hostel"
          />
        </EditModal>
      )}
    </MainLayout>
  );
};

export default HostelExpenses;
