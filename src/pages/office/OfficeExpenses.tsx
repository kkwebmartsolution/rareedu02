import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { officeExpensesAPI, type OfficeExpense } from "@/lib/supabase-database";
import OfficeExpenseForm from "@/components/forms/OfficeExpenseForm";

const OfficeExpenses = () => {
  const [expenses, setExpenses] = useState<OfficeExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<OfficeExpense | null>(null);
  const [editedExpense, setEditedExpense] = useState<OfficeExpense | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await officeExpensesAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load office expenses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData =
    selectedLocation === "all"
      ? expenses
      : expenses.filter((expense) => expense.location === selectedLocation);

  const handleViewExpense = (expense: OfficeExpense) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: OfficeExpense) => {
    setSelectedExpense(expense);
    setEditedExpense({...expense});
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedExpense) return;

    try {
      setSaving(true);
      await officeExpensesAPI.update(editedExpense.id, {
        location: editedExpense.location,
        month: editedExpense.month,
        rent: editedExpense.rent,
        utilities: editedExpense.utilities,
        internet: editedExpense.internet,
        marketing: editedExpense.marketing,
        travel: editedExpense.travel,
        miscellaneous: editedExpense.miscellaneous,
        monthly_total: editedExpense.monthly_total,
      });
      
      toast({
        title: "Success",
        description: `Office expense for ${editedExpense.location} has been updated.`,
      });
      
      setEditModalOpen(false);
      loadExpenses(); // Reload data
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update office expense.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpense = () => {
    setAddModalOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ["Location", "Month", "Rent", "Utilities", "Internet", "Marketing", "Travel", "Miscellaneous", "Monthly Total"],
      ...filteredData.map(expense => [
        expense.location,
        new Date(expense.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        `$${expense.rent.toFixed(2)}`,
        `$${expense.utilities.toFixed(2)}`,
        `$${expense.internet.toFixed(2)}`,
        `$${expense.marketing.toFixed(2)}`,
        `$${expense.travel.toFixed(2)}`,
        `$${expense.miscellaneous.toFixed(2)}`,
        `$${expense.monthly_total.toFixed(2)}`
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "office_expenses.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const locations = [...new Set(expenses.map((item) => item.location))];

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Correctly typed columns with the actions column
  const columns = [
    { header: "Office Location", accessorKey: "location" as const },
    { 
      header: "Month", 
      accessorKey: "month" as const,
      cell: (row: OfficeExpense) => formatMonth(row.month)
    },
    { 
      header: "Rent", 
      accessorKey: "rent" as const,
      cell: (row: OfficeExpense) => formatCurrency(row.rent)
    },
    { 
      header: "Utilities", 
      accessorKey: "utilities" as const,
      cell: (row: OfficeExpense) => formatCurrency(row.utilities)
    },
    { 
      header: "Internet", 
      accessorKey: "internet" as const,
      cell: (row: OfficeExpense) => formatCurrency(row.internet)
    },
    { 
      header: "Marketing", 
      accessorKey: "marketing" as const,
      cell: (row: OfficeExpense) => formatCurrency(row.marketing)
    },
    { 
      header: "Travel", 
      accessorKey: "travel" as const,
      cell: (row: OfficeExpense) => formatCurrency(row.travel)
    },
    { 
      header: "Miscellaneous", 
      accessorKey: "miscellaneous" as const,
      cell: (row: OfficeExpense) => formatCurrency(row.miscellaneous)
    },
    { 
      header: "Monthly Total", 
      accessorKey: "monthly_total" as const,
      cell: (row: OfficeExpense) => formatCurrency(row.monthly_total)
    },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: (row: OfficeExpense) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewExpense(row)}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditExpense(row)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Office Expenses"
        description="Track and manage all office-related expenses by location"
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
            value={selectedLocation}
            onValueChange={setSelectedLocation}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Office Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading expenses...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>

      {/* View Modal */}
      {selectedExpense && (
        <DetailViewModal
          title={`Office Expense Details`}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        >
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedExpense.location}</h3>
                  <p className="text-muted-foreground">{formatMonth(selectedExpense.month)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectedExpense.monthly_total)}</p>
                </div>
              </div>
            </div>

            {/* Expense Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rent</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedExpense.rent)}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilities</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedExpense.utilities)}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-green-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Internet</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedExpense.internet)}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-purple-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Marketing</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedExpense.marketing)}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-orange-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Travel</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedExpense.travel)}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-teal-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Miscellaneous</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedExpense.miscellaneous)}</p>
                  </div>
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-pink-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DetailViewModal>
      )}

      {/* Add Expense Form */}
      <OfficeExpenseForm
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={loadExpenses}
      />

      {/* Edit Modal */}
      {editedExpense && (
        <EditModal
          title={`Edit Office Expense - ${editedExpense.location}`}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Office Location</Label>
              <Input 
                id="location" 
                value={editedExpense.location} 
                onChange={(e) => setEditedExpense({...editedExpense, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month (YYYY-MM-DD)</Label>
              <Input 
                id="month" 
                type="date"
                value={editedExpense.month} 
                onChange={(e) => setEditedExpense({...editedExpense, month: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent">Rent</Label>
              <Input 
                id="rent" 
                type="number"
                step="0.01"
                value={editedExpense.rent} 
                onChange={(e) => setEditedExpense({...editedExpense, rent: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utilities">Utilities</Label>
              <Input 
                id="utilities" 
                type="number"
                step="0.01"
                value={editedExpense.utilities} 
                onChange={(e) => setEditedExpense({...editedExpense, utilities: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internet">Internet</Label>
              <Input 
                id="internet" 
                type="number"
                step="0.01"
                value={editedExpense.internet} 
                onChange={(e) => setEditedExpense({...editedExpense, internet: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketing">Marketing</Label>
              <Input 
                id="marketing" 
                type="number"
                step="0.01"
                value={editedExpense.marketing} 
                onChange={(e) => setEditedExpense({...editedExpense, marketing: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travel">Travel</Label>
              <Input 
                id="travel" 
                type="number"
                step="0.01"
                value={editedExpense.travel} 
                onChange={(e) => setEditedExpense({...editedExpense, travel: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="miscellaneous">Miscellaneous</Label>
              <Input 
                id="miscellaneous" 
                type="number"
                step="0.01"
                value={editedExpense.miscellaneous} 
                onChange={(e) => setEditedExpense({...editedExpense, miscellaneous: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_total">Monthly Total</Label>
              <Input 
                id="monthly_total" 
                type="number"
                step="0.01"
                value={editedExpense.monthly_total} 
                onChange={(e) => setEditedExpense({...editedExpense, monthly_total: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </EditModal>
      )}
    </MainLayout>
  );
};

export default OfficeExpenses;
