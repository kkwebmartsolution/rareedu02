
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Eye, Edit, Trash2, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DetailViewModal from "@/components/shared/DetailViewModal";
import EditModal from "@/components/shared/EditModal";
import { hostelsAPI, Hostel } from "@/lib/hostels-api";
import { messExpensesAPI, MessExpense, MessExpenseFormData } from "@/lib/mess-expenses-api";
import MessExpenseForm from "@/components/forms/MessExpenseForm";
import MessBudgetCard from "@/components/mess/MessBudgetCard";

const MessManagement = () => {
  const [selectedHostel, setSelectedHostel] = useState<string>("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<MessExpense | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch mess expenses
  const { data: messExpenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['mess-expenses'],
    queryFn: messExpensesAPI.getAll,
  });

  // Fetch hostels
  const { data: hostels = [], isLoading: isLoadingHostels } = useQuery({
    queryKey: ['hostels'],
    queryFn: hostelsAPI.getAll,
  });

  // Create mess expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: messExpensesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['hostels'] }); // Refresh hostels to update budget
      setAddModalOpen(false);
      toast({
        title: "Success",
        description: "Mess expense created successfully. Budget has been updated automatically.",
      });
    },
    onError: (error) => {
      console.error('Error creating mess expense:', error);
      toast({
        title: "Error",
        description: "Failed to create mess expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mess expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MessExpenseFormData> }) =>
      messExpensesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['hostels'] }); // Refresh hostels to update budget
      setEditModalOpen(false);
      setSelectedExpense(null);
      toast({
        title: "Success",
        description: "Mess expense updated successfully. Budget has been adjusted automatically.",
      });
    },
    onError: (error) => {
      console.error('Error updating mess expense:', error);
      toast({
        title: "Error",
        description: "Failed to update mess expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mess expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: messExpensesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['hostels'] }); // Refresh hostels to update budget
      toast({
        title: "Success",
        description: "Mess expense deleted successfully. Budget has been restored automatically.",
      });
    },
    onError: (error) => {
      console.error('Error deleting mess expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete mess expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredData = selectedHostel === "all" 
    ? messExpenses
    : messExpenses.filter(expense => expense.hostel_id?.toString() === selectedHostel);

  const handleViewExpense = (expense: MessExpense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: MessExpense) => {
    setSelectedExpense(expense);
    setEditModalOpen(true);
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setAddModalOpen(true);
  };

  const handleDeleteExpense = (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense? This will automatically restore the amount to the hostel's mess budget.")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const handleCreateExpense = (data: MessExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  const handleUpdateExpense = (data: MessExpenseFormData) => {
    if (selectedExpense) {
      updateExpenseMutation.mutate({
        id: selectedExpense.id,
        data,
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be available shortly.",
    });
  };

  const handleBudgetUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['hostels'] });
  };

  // Calculate summary statistics
  const totalExpenses = messExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudgetAllocated = hostels.reduce((sum, hostel) => sum + (hostel.mess_budget || 0), 0);
  const totalBudgetRemaining = hostels.reduce((sum, hostel) => sum + (hostel.mess_budget_remaining || 0), 0);
  const budgetUtilization = totalBudgetAllocated > 0 ? ((totalBudgetAllocated - totalBudgetRemaining) / totalBudgetAllocated * 100) : 0;

  const columns = [
    { 
      header: "Hostel", 
      accessorKey: "hostel_name" as keyof MessExpense,
      cell: (row: MessExpense) => row.hostels?.name || "N/A"
    },
    { header: "Expense Type", accessorKey: "expense_type" as keyof MessExpense },
    { header: "Description", accessorKey: "description" as keyof MessExpense },
    { 
      header: "Amount", 
      accessorKey: "amount" as keyof MessExpense,
      cell: (row: MessExpense) => `₹${row.amount.toLocaleString()}`
    },
    { header: "Date", accessorKey: "expense_date" as keyof MessExpense },
    { header: "Category", accessorKey: "category" as keyof MessExpense },
    { header: "Payment Method", accessorKey: "payment_method" as keyof MessExpense },
    {
      header: "Status",
      accessorKey: "status" as keyof MessExpense,
      cell: (row: MessExpense) => (
        <Badge
          variant={
            row.status === "Paid"
              ? "default"
              : row.status === "Pending"
              ? "secondary"
              : "outline"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as "actions",
      cell: (row: MessExpense) => (
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteExpense(row.id)}
            disabled={deleteExpenseMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoadingExpenses || isLoadingHostels) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading mess expenses...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Mess Management"
        description="Manage hostel mess expenses and track budget utilization in real-time"
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

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalBudgetAllocated.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalBudgetRemaining.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{budgetUtilization.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Hostel Budget Management Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Hostel Mess Budgets</h2>
            <p className="text-sm text-muted-foreground">Set and manage annual mess budgets for each hostel</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => (
            <MessBudgetCard
              key={hostel.id}
              hostel={hostel}
              onUpdate={handleBudgetUpdate}
            />
          ))}
        </div>
        
        {hostels.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No hostels found. Please add hostels first to manage their mess budgets.
            </p>
          </div>
        )}
      </div>

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
                <SelectItem key={hostel.id} value={hostel.id.toString()}>
                  {hostel.name} (Budget: ₹{(hostel.mess_budget_remaining || 0).toLocaleString()} remaining)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* View Modal */}
      {selectedExpense && (
        <DetailViewModal
          title={`Mess Expense Details - ${selectedExpense.hostels?.name || 'N/A'}`}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hostel</p>
              <p className="text-lg">{selectedExpense.hostels?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expense Type</p>
              <p className="text-lg">{selectedExpense.expense_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-lg">{selectedExpense.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg">₹{selectedExpense.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-lg">{selectedExpense.expense_date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
              <p className="text-lg">{selectedExpense.payment_method}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receipt Number</p>
              <p className="text-lg">{selectedExpense.receipt_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendor Name</p>
              <p className="text-lg">{selectedExpense.vendor_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge
                variant={
                  selectedExpense.status === "Paid"
                    ? "default"
                    : selectedExpense.status === "Pending"
                    ? "secondary"
                    : "outline"
                }
              >
                {selectedExpense.status}
              </Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-lg">{selectedExpense.description || "N/A"}</p>
            </div>
            {selectedExpense.notes && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="text-lg">{selectedExpense.notes}</p>
              </div>
            )}
          </div>
        </DetailViewModal>
      )}

      {/* Add Expense Modal */}
      <EditModal
        title="Add Mess Expense"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      >
        <MessExpenseForm
          hostels={hostels}
          onSubmit={handleCreateExpense}
          isSubmitting={createExpenseMutation.isPending}
        />
      </EditModal>

      {/* Edit Expense Modal */}
      <EditModal
        title="Edit Mess Expense"
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedExpense(null);
        }}
      >
        {selectedExpense && (
          <MessExpenseForm
            hostels={hostels}
            onSubmit={handleUpdateExpense}
            initialData={{
              hostel_id: selectedExpense.hostel_id?.toString() || "",
              expense_type: selectedExpense.expense_type,
              description: selectedExpense.description || "",
              amount: selectedExpense.amount.toString(),
              expense_date: selectedExpense.expense_date,
              category: selectedExpense.category,
              payment_method: selectedExpense.payment_method,
              receipt_number: selectedExpense.receipt_number || "",
              vendor_name: selectedExpense.vendor_name || "",
              notes: selectedExpense.notes || "",
              status: selectedExpense.status,
            }}
            isSubmitting={updateExpenseMutation.isPending}
          />
        )}
      </EditModal>
    </MainLayout>
  );
};

export default MessManagement;
