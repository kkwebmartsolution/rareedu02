import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { officeExpensesAPI, officesAPI, type OfficeExpense, type Office } from "@/lib/supabase-database";

interface OfficeExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  office_id: number;
  month: string;
  rent: number;
  utilities: number;
  internet: number;
  marketing: number;
  travel: number;
  miscellaneous: number;
}

const OfficeExpenseForm: React.FC<OfficeExpenseFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(true);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      office_id: 0,
      month: "",
      rent: 0,
      utilities: 0,
      internet: 0,
      marketing: 0,
      travel: 0,
      miscellaneous: 0,
    },
  });

  const watchedValues = watch();
  const selectedOfficeId = watch("office_id");

  // Load offices on component mount
  useEffect(() => {
    const loadOffices = async () => {
      try {
        const data = await officesAPI.getAll();
        setOffices(data.filter(office => office.status === 'Active'));
      } catch (error) {
        console.error('Error loading offices:', error);
        toast({
          title: "Error",
          description: "Failed to load offices.",
          variant: "destructive",
        });
      } finally {
        setLoadingOffices(false);
      }
    };
    loadOffices();
  }, []);

  // Calculate monthly total automatically
  const monthlyTotal = 
    (watchedValues.rent || 0) +
    (watchedValues.utilities || 0) +
    (watchedValues.internet || 0) +
    (watchedValues.marketing || 0) +
    (watchedValues.travel || 0) +
    (watchedValues.miscellaneous || 0);

  const onSubmit = async (data: FormData) => {
    try {
      const selectedOffice = offices.find(office => office.id === data.office_id);
      if (!selectedOffice) {
        toast({
          title: "Error",
          description: "Please select a valid office.",
          variant: "destructive",
        });
        return;
      }

      const expenseData: Omit<OfficeExpense, 'id' | 'created_at' | 'updated_at'> = {
        location: selectedOffice.name,
        office_id: data.office_id,
        month: data.month,
        rent: data.rent,
        utilities: data.utilities,
        internet: data.internet,
        marketing: data.marketing,
        travel: data.travel,
        miscellaneous: data.miscellaneous,
        monthly_total: monthlyTotal,
      };

      await officeExpensesAPI.create(expenseData);
      
      toast({
        title: "Success",
        description: `Office expense for ${selectedOffice.name} has been created.`,
      });
      
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: "Failed to create office expense.",
        variant: "destructive",
      });
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Office Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="office_id">Office *</Label>
              <Select
                value={selectedOfficeId ? selectedOfficeId.toString() : ""}
                onValueChange={(value) => setValue("office_id", parseInt(value))}
                disabled={loadingOffices}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOffices ? "Loading offices..." : "Select office"} />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={office.id.toString()}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedOfficeId && (
                <p className="text-sm text-destructive">Office selection is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Input
                id="month"
                type="date"
                {...register("month", { required: "Month is required" })}
              />
              {errors.month && (
                <p className="text-sm text-destructive">{errors.month.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent">Rent</Label>
              <Input
                id="rent"
                type="number"
                step="0.01"
                min="0"
                {...register("rent", { 
                  valueAsNumber: true,
                  min: { value: 0, message: "Amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.rent && (
                <p className="text-sm text-destructive">{errors.rent.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="utilities">Utilities</Label>
              <Input
                id="utilities"
                type="number"
                step="0.01"
                min="0"
                {...register("utilities", { 
                  valueAsNumber: true,
                  min: { value: 0, message: "Amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.utilities && (
                <p className="text-sm text-destructive">{errors.utilities.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internet">Internet</Label>
              <Input
                id="internet"
                type="number"
                step="0.01"
                min="0"
                {...register("internet", { 
                  valueAsNumber: true,
                  min: { value: 0, message: "Amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.internet && (
                <p className="text-sm text-destructive">{errors.internet.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marketing">Marketing</Label>
              <Input
                id="marketing"
                type="number"
                step="0.01"
                min="0"
                {...register("marketing", { 
                  valueAsNumber: true,
                  min: { value: 0, message: "Amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.marketing && (
                <p className="text-sm text-destructive">{errors.marketing.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="travel">Travel</Label>
              <Input
                id="travel"
                type="number"
                step="0.01"
                min="0"
                {...register("travel", { 
                  valueAsNumber: true,
                  min: { value: 0, message: "Amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.travel && (
                <p className="text-sm text-destructive">{errors.travel.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="miscellaneous">Miscellaneous</Label>
              <Input
                id="miscellaneous"
                type="number"
                step="0.01"
                min="0"
                {...register("miscellaneous", { 
                  valueAsNumber: true,
                  min: { value: 0, message: "Amount must be positive" }
                })}
                placeholder="0.00"
              />
              {errors.miscellaneous && (
                <p className="text-sm text-destructive">{errors.miscellaneous.message}</p>
              )}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Monthly Total:</span>
              <span className="text-lg font-bold">${monthlyTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedOfficeId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Expense'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OfficeExpenseForm;