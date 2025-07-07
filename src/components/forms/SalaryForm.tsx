import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Users } from "lucide-react";
import { salaryAPI, type SalaryFormData, type StaffMember } from "@/lib/salary-api";

interface SalaryFormProps {
  onSubmit: (data: SalaryFormData, selectedStaffIds?: string[]) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: Partial<SalaryFormData>;
}

const SalaryForm: React.FC<SalaryFormProps> = ({
  onSubmit,
  isSubmitting,
  defaultValues,
}) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(!defaultValues?.staff_id);
  const [formData, setFormData] = useState<SalaryFormData>({
    staff_id: defaultValues?.staff_id || "",
    basic_salary: defaultValues?.basic_salary || "",
    allowances: defaultValues?.allowances || "0",
    deductions: defaultValues?.deductions || "0",
    salary_month: defaultValues?.salary_month || "",
    payment_status: defaultValues?.payment_status || "pending",
    payment_date: defaultValues?.payment_date || "",
    payment_method: defaultValues?.payment_method || "bank_transfer",
    notes: defaultValues?.notes || "",
  });

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      const data = await salaryAPI.getAllStaff();
      setStaffMembers(data);
    } catch (error) {
      console.error("Error loading staff members:", error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMultiSelect && selectedStaffIds.length > 0) {
      await onSubmit(formData, selectedStaffIds);
    } else {
      await onSubmit(formData);
    }
  };

  const handleStaffSelection = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    } else {
      setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffId));
    }
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedStaffIds(staffMembers.map(staff => staff.id.toString()));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const calculateTotals = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const gross = basic + allowances;
    const net = gross - deductions;
    
    return { gross, net };
  };

  const { gross, net } = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Multi-select toggle */}
      {!defaultValues?.staff_id && (
        <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg border">
          <Checkbox
            id="multi-select"
            checked={isMultiSelect}
            onCheckedChange={(checked) => setIsMultiSelect(checked === true)}
          />
          <Label htmlFor="multi-select" className="flex items-center space-x-2 cursor-pointer">
            <Users className="h-4 w-4" />
            <span>Select multiple staff members</span>
          </Label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Staff Selection</Label>
          {loadingStaff ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading staff...</span>
            </div>
          ) : isMultiSelect ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedStaffIds.length === staffMembers.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({staffMembers.length} staff members)
                </Label>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                {staffMembers.map((staff) => (
                  <div key={staff.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`staff-${staff.id}`}
                      checked={selectedStaffIds.includes(staff.id.toString())}
                      onCheckedChange={(checked) => 
                        handleStaffSelection(staff.id.toString(), checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`staff-${staff.id}`} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {staff.first_name} {staff.last_name} - {staff.role}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedStaffIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedStaffIds.length} staff member(s)
                </p>
              )}
            </div>
          ) : (
            <Select
              value={formData.staff_id}
              onValueChange={(value) =>
                setFormData({ ...formData, staff_id: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id.toString()}>
                    {staff.first_name} {staff.last_name} - {staff.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary_month">Salary Month</Label>
          <Input
            id="salary_month"
            type="month"
            value={formData.salary_month}
            onChange={(e) =>
              setFormData({ ...formData, salary_month: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="basic_salary">Basic Salary</Label>
          <Input
            id="basic_salary"
            type="number"
            step="0.01"
            min="0"
            value={formData.basic_salary}
            onChange={(e) =>
              setFormData({ ...formData, basic_salary: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allowances">Allowances</Label>
          <Input
            id="allowances"
            type="number"
            step="0.01"
            min="0"
            value={formData.allowances}
            onChange={(e) =>
              setFormData({ ...formData, allowances: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deductions">Deductions</Label>
          <Input
            id="deductions"
            type="number"
            step="0.01"
            min="0"
            value={formData.deductions}
            onChange={(e) =>
              setFormData({ ...formData, deductions: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_status">Payment Status</Label>
          <Select
            value={formData.payment_status}
            onValueChange={(value: any) =>
              setFormData({ ...formData, payment_status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value: any) =>
              setFormData({ ...formData, payment_method: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) =>
              setFormData({ ...formData, payment_date: e.target.value })
            }
          />
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-foreground">Salary Calculation</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Gross Salary:</span>
            <p className="font-semibold text-foreground">${gross.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Deductions:</span>
            <p className="font-semibold text-red-600">-${(parseFloat(formData.deductions) || 0).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Net Salary:</span>
            <p className="font-semibold text-green-600">${net.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or comments..."
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || (isMultiSelect && selectedStaffIds.length === 0) || (!isMultiSelect && !formData.staff_id)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isMultiSelect ? (
            `Save Salary for ${selectedStaffIds.length} Staff`
          ) : (
            "Save Salary"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SalaryForm;