
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hostelsAPI } from "@/lib/hostels-api";

interface ExpenseFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  expenseType?: 'hostel' | 'mess';
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  expenseType = 'hostel'
}) => {
  const [hostels, setHostels] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    hostel_id: defaultValues?.hostel_id?.toString() || "",
    expense_type: defaultValues?.expense_type || "",
    description: defaultValues?.description || "",
    amount: defaultValues?.amount?.toString() || "",
    expense_date: defaultValues?.expense_date || new Date().toISOString().split('T')[0],
    category: defaultValues?.category || (expenseType === 'mess' ? 'Food' : 'General'),
    payment_method: defaultValues?.payment_method || "Cash",
    receipt_number: defaultValues?.receipt_number || "",
    vendor_name: defaultValues?.vendor_name || "",
    notes: defaultValues?.notes || "",
    status: defaultValues?.status || "Pending",
    ...defaultValues,
  });

  useEffect(() => {
    loadHostels();
  }, []);

  const loadHostels = async () => {
    try {
      const data = await hostelsAPI.getAll();
      setHostels(data);
    } catch (error) {
      console.error('Error loading hostels:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hostelCategories = ['Rent', 'Utilities', 'Maintenance', 'Food', 'Staff', 'Supplies', 'General'];
  const messCategories = ['Food', 'Kitchen Equipment', 'Staff', 'Utilities', 'Supplies', 'Maintenance', 'General'];
  const categories = expenseType === 'mess' ? messCategories : hostelCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hostel_id">Hostel</Label>
          <Select value={formData.hostel_id} onValueChange={(value) => handleChange("hostel_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select hostel" />
            </SelectTrigger>
            <SelectContent>
              {hostels.map(hostel => (
                <SelectItem key={hostel.id} value={hostel.id.toString()}>
                  {hostel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense_type">Expense Type *</Label>
          <Input
            id="expense_type"
            value={formData.expense_type}
            onChange={(e) => handleChange("expense_type", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense_date">Expense Date *</Label>
          <Input
            id="expense_date"
            type="date"
            value={formData.expense_date}
            onChange={(e) => handleChange("expense_date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(value) => handleChange("payment_method", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt_number">Receipt Number</Label>
          <Input
            id="receipt_number"
            value={formData.receipt_number}
            onChange={(e) => handleChange("receipt_number", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor_name">Vendor Name</Label>
          <Input
            id="vendor_name"
            value={formData.vendor_name}
            onChange={(e) => handleChange("vendor_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : defaultValues?.id ? "Update Expense" : "Add Expense"}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
