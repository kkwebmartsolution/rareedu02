
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
import { messExpensesAPI, MessExpense, MessExpenseFormData } from "@/lib/mess-expenses-api";

const MessExpenses = () => {
  const [selectedHostel, setSelectedHostel] = useState<string>("all");
  const [expenses, setExpenses] = useState<MessExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<MessExpense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await messExpensesAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading mess expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load mess expenses data.",
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

  const handleViewExpense = (expense: MessExpense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: MessExpense) => {
    setSelectedExpense(expense);
    setEditModalOpen(true);
  };

  const handleAddExpense = () => {
    setAddModalOpen(true);
  };

  const handleSaveExpense = async (formData: MessExpenseFormData) => {
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        await messExpensesAPI.update(formData.id, formData);
        toast({
          title: "Expense Updated",
          description: "Mess expense has been updated successfully.",
        });
      } else {
        await messExpensesAPI.create(formData);
        toast({
          title: "Expense Added",
          description: "Mess expense has been added successfully.",
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
      accessorKey: "hostels" as keyof MessExpense,
      cell: (row: MessExpense) => row.hostels?.name || 'N/A'
    },
    { header: "Expense Type", accessorKey: "expense_type" as keyof MessExpense },
    { header: "Category", accessorKey: "category" as keyof MessExpense },
    { 
      header: "Amount", 
      accessorKey: "amount" as keyof MessExpense,
      cell: (row: MessExpense) => `$${row.amount.toFixed(2)}`
    },
    { header: "Date", accessorKey: "expense_date" as keyof MessExpense },
    {
      header: "Status",
      accessorKey: "status" as keyof MessExpense,
      cell: (row: MessExpense) => (
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
        title="Mess Expenses"
        description="Track and manage all mess-related expenses"
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
        title="Add Mess Expense"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      >
        <ExpenseForm 
          onSubmit={handleSaveExpense}
          isSubmitting={isSubmitting}
          expenseType="mess"
        />
      </EditModal>

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
              <p className="text-lg">{selectedExpense.hostels?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expense Type</p>
              <p className="text-lg">{selectedExpense.expense_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg">${selectedExpense.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-lg">{selectedExpense.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-lg">{selectedExpense.expense_date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg">{selectedExpense.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
              <p className="text-lg">{selectedExpense.payment_method}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendor</p>
              <p className="text-lg">{selectedExpense.vendor_name || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-lg">{selectedExpense.description || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-lg">{selectedExpense.notes || 'N/A'}</p>
            </div>
          </div>
        </DetailViewModal>
      )}

      {/* Edit Modal */}
      {selectedExpense && (
        <EditModal
          title={`Edit Mess Expense - ${selectedExpense.hostels?.name || 'N/A'}`}
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
            expenseType="mess"
          />
        </EditModal>
      )}
    </MainLayout>
  );
};

export default MessExpenses;
