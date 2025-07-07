import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  visa_info?: StudentVisa;
}

interface StudentVisa {
  id: number;
  student_id: number;
  visa_type: string;
  visa_number: string;
  issue_date: string;
  expiration_date: string;
  application_submitted: boolean;
  visa_interview: boolean;
  visa_approved: boolean;
  residency_registration: boolean;
  residency_deadline: string;
  residency_address: string;
  local_id_number: string;
}

interface VisaFormProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function VisaForm({ student, open, onOpenChange, onSuccess }: VisaFormProps) {
  const [formData, setFormData] = useState({
    visa_type: "Student Visa",
    visa_number: "",
    issue_date: null as Date | null,
    expiration_date: null as Date | null,
    application_submitted: false,
    visa_interview: false,
    visa_approved: false,
    residency_registration: false,
    residency_deadline: null as Date | null,
    residency_address: "",
    local_id_number: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (student.visa_info) {
      setFormData({
        visa_type: student.visa_info.visa_type || "Student Visa",
        visa_number: student.visa_info.visa_number || "",
        issue_date: student.visa_info.issue_date ? new Date(student.visa_info.issue_date) : null,
        expiration_date: student.visa_info.expiration_date ? new Date(student.visa_info.expiration_date) : null,
        application_submitted: student.visa_info.application_submitted || false,
        visa_interview: student.visa_info.visa_interview || false,
        visa_approved: student.visa_info.visa_approved || false,
        residency_registration: student.visa_info.residency_registration || false,
        residency_deadline: student.visa_info.residency_deadline ? new Date(student.visa_info.residency_deadline) : null,
        residency_address: student.visa_info.residency_address || "",
        local_id_number: student.visa_info.local_id_number || "",
      });
    } else {
      setFormData({
        visa_type: "Student Visa",
        visa_number: "",
        issue_date: null,
        expiration_date: null,
        application_submitted: false,
        visa_interview: false,
        visa_approved: false,
        residency_registration: false,
        residency_deadline: null,
        residency_address: "",
        local_id_number: "",
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const visaData = {
        student_id: student.id,
        visa_type: formData.visa_type,
        visa_number: formData.visa_number,
        issue_date: formData.issue_date ? format(formData.issue_date, 'yyyy-MM-dd') : null,
        expiration_date: formData.expiration_date ? format(formData.expiration_date, 'yyyy-MM-dd') : null,
        application_submitted: formData.application_submitted,
        visa_interview: formData.visa_interview,
        visa_approved: formData.visa_approved,
        residency_registration: formData.residency_registration,
        residency_deadline: formData.residency_deadline ? format(formData.residency_deadline, 'yyyy-MM-dd') : null,
        residency_address: formData.residency_address,
        local_id_number: formData.local_id_number,
      };

      if (student.visa_info) {
        // Update existing visa record
        const { error } = await supabase
          .from('student_visa')
          .update(visaData)
          .eq('id', student.visa_info.id);

        if (error) throw error;
      } else {
        // Create new visa record
        const { error } = await supabase
          .from('student_visa')
          .insert([visaData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Visa information saved successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving visa information:", error);
      toast({
        title: "Error",
        description: "Failed to save visa information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const DatePicker = ({ 
    date, 
    onSelect, 
    placeholder 
  }: { 
    date: Date | null; 
    onSelect: (date: Date | undefined) => void; 
    placeholder: string;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={onSelect}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Visa Information - {student.first_name} {student.last_name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Visa Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visa Details</h3>
            
            <div>
              <Label htmlFor="visa_type">Visa Type</Label>
              <Input
                id="visa_type"
                value={formData.visa_type}
                onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="visa_number">Visa Number</Label>
              <Input
                id="visa_number"
                placeholder="Enter visa number"
                value={formData.visa_number}
                onChange={(e) => setFormData({ ...formData, visa_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Date</Label>
                <DatePicker
                  date={formData.issue_date}
                  onSelect={(date) => setFormData({ ...formData, issue_date: date || null })}
                  placeholder="Select issue date"
                />
              </div>
              <div>
                <Label>Expiration Date</Label>
                <DatePicker
                  date={formData.expiration_date}
                  onSelect={(date) => setFormData({ ...formData, expiration_date: date || null })}
                  placeholder="Select expiration date"
                />
              </div>
            </div>
          </div>

          {/* Visa Status Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visa Status Steps</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="application_submitted"
                  checked={formData.application_submitted}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, application_submitted: !!checked })
                  }
                />
                <Label htmlFor="application_submitted">Application Submitted</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visa_interview"
                  checked={formData.visa_interview}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, visa_interview: !!checked })
                  }
                />
                <Label htmlFor="visa_interview">Visa Interview</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visa_approved"
                  checked={formData.visa_approved}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, visa_approved: !!checked })
                  }
                />
                <Label htmlFor="visa_approved">Visa Approved</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="residency_registration"
                  checked={formData.residency_registration}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, residency_registration: !!checked })
                  }
                />
                <Label htmlFor="residency_registration">Residency Registration</Label>
              </div>
            </div>
          </div>

          {/* Residency Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Residency Information</h3>
            
            <div>
              <Label>Residency Deadline</Label>
              <DatePicker
                date={formData.residency_deadline}
                onSelect={(date) => setFormData({ ...formData, residency_deadline: date || null })}
                placeholder="Select deadline"
              />
            </div>

            <div>
              <Label htmlFor="residency_address">Residency Address</Label>
              <Textarea
                id="residency_address"
                placeholder="Enter residency address"
                value={formData.residency_address}
                onChange={(e) => setFormData({ ...formData, residency_address: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="local_id_number">Local ID Number</Label>
              <Input
                id="local_id_number"
                placeholder="Enter local ID number"
                value={formData.local_id_number}
                onChange={(e) => setFormData({ ...formData, local_id_number: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Visa Information
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}