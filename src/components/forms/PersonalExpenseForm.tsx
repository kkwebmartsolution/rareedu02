import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  getExpenseCategories, 
  createPersonalExpense, 
  updatePersonalExpense,
  type PersonalExpense,
  type PersonalExpenseCategory 
} from "@/lib/personal-expenses-api";

interface PersonalExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  expense?: PersonalExpense | null;
  userId: number;
}

const PersonalExpenseForm: React.FC<PersonalExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expense,
  userId,
}) => {
  const [categories, setCategories] = useState<PersonalExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    description: "",
    expense_date: "",
    payment_mode: "Cash",
    has_receipt: false,
    notes: "",
  });

  const paymentModes = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "UPI",
    "Cheque",
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (expense) {
        setFormData({
          category_id: expense.category_id.toString(),
          amount: expense.amount.toString(),
          description: expense.description,
          expense_date: expense.expense_date,
          payment_mode: expense.payment_mode,
          has_receipt: expense.has_receipt,
          notes: expense.notes || "",
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, expense]);

  const loadCategories = async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load expense categories",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      amount: "",
      description: "",
      expense_date: new Date().toISOString().split('T')[0],
      payment_mode: "Cash",
      has_receipt: false,
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.amount || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        description: formData.description,
        expense_date: formData.expense_date,
        payment_mode: formData.payment_mode,
        has_receipt: formData.has_receipt,
        notes: formData.notes || undefined,
      };

      if (expense) {
        await updatePersonalExpense(expense.id, expenseData);
        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        await createPersonalExpense(userId, expenseData);
        toast({
          title: "Success", 
          description: "Expense created successfully",
        });
      }

      onSubmit();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${expense ? 'update' : 'create'} expense`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter expense description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense_date">Expense Date</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) =>
                  setFormData({ ...formData, expense_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="payment_mode">Payment Mode</Label>
              <Select
                value={formData.payment_mode}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_mode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="has_receipt"
              checked={formData.has_receipt}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, has_receipt: checked })
              }
            />
            <Label htmlFor="has_receipt">Receipt Available</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : expense ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalExpenseForm;