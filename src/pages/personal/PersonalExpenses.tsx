
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Edit, Trash2 } from "lucide-react";
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
import PersonalExpenseForm from "@/components/forms/PersonalExpenseForm";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPersonalExpenses,
  getExpenseCategories,
  deletePersonalExpense,
  type PersonalExpense,
  type PersonalExpenseCategory,
} from "@/lib/personal-expenses-api";

const PersonalExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [categories, setCategories] = useState<PersonalExpenseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<PersonalExpense | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        getPersonalExpenses(Number(user!.id)),
        getExpenseCategories(),
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load personal expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData =
    selectedCategory === "all"
      ? expenses
      : expenses.filter(
          (expense) => expense.category_id.toString() === selectedCategory
        );

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: PersonalExpense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = (expense: PersonalExpense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deletePersonalExpense(expenseToDelete.id);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleFormSubmit = () => {
    loadData();
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Category", "Amount", "Description", "Payment Mode", "Receipt", "Notes"],
      ...filteredData.map((expense) => [
        expense.expense_date,
        expense.category?.name || "",
        expense.amount.toString(),
        expense.description,
        expense.payment_mode,
        expense.has_receipt ? "Yes" : "No",
        expense.notes || "",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personal-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Expenses exported successfully",
    });
  };

  const columns = [
    { 
      header: "Date", 
      accessorKey: "expense_date" as keyof PersonalExpense,
      cell: (row: PersonalExpense) => new Date(row.expense_date).toLocaleDateString()
    },
    { 
      header: "Category", 
      accessorKey: "category_id" as keyof PersonalExpense,
      cell: (row: PersonalExpense) => row.category?.name || "Unknown"
    },
    { 
      header: "Amount", 
      accessorKey: "amount" as keyof PersonalExpense,
      cell: (row: PersonalExpense) => `$${row.amount.toFixed(2)}`
    },
    { header: "Description", accessorKey: "description" as keyof PersonalExpense },
    { header: "Payment Mode", accessorKey: "payment_mode" as keyof PersonalExpense },
    {
      header: "Receipt",
      accessorKey: "has_receipt" as keyof PersonalExpense,
      cell: (row: PersonalExpense) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.has_receipt
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {row.has_receipt ? "Available" : "Not Available"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as "actions",
      cell: (row: PersonalExpense) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditExpense(row)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteExpense(row)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Please log in to view personal expenses.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Personal Expense Tracker"
        description="Track and manage your personal expenses by category"
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
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* Form Modal */}
      <PersonalExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        expense={editingExpense}
        userId={Number(user.id)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default PersonalExpenses;
