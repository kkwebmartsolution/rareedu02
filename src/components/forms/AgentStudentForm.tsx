import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export interface AgentStudentFormData {
  id?: string;
  studentName: string;
  agentName: string;
  university: string;
  course: string;
  totalFee: string;
  paidAmount: string;
  dueAmount: string;
  commission: string;
  commissionDue: string;
  status: "Active" | "Completed" | "Inactive";
  remarks?: string;
}

interface AgentStudentFormProps {
  agentName: string;
  initialData?: AgentStudentFormData;
  onSubmit: (data: AgentStudentFormData) => void;
  isSubmitting?: boolean;
}

const AgentStudentForm: React.FC<AgentStudentFormProps> = ({
  agentName,
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<AgentStudentFormData>(
    initialData || {
      studentName: "",
      agentName,
      university: "",
      course: "",
      totalFee: "",
      paidAmount: "",
      dueAmount: "",
      commission: "",
      commissionDue: "",
      status: "Active",
      remarks: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student Name</Label>
          <Input
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            placeholder="Enter student name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agentName">Agent Name</Label>
          <Input
            id="agentName"
            name="agentName"
            value={formData.agentName}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="Enter university name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Input
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="Enter course name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalFee">Total Fee</Label>
          <Input
            id="totalFee"
            name="totalFee"
            value={formData.totalFee}
            onChange={handleChange}
            placeholder="Enter total fee (e.g., $10,000)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paidAmount">Paid Amount</Label>
          <Input
            id="paidAmount"
            name="paidAmount"
            value={formData.paidAmount}
            onChange={handleChange}
            placeholder="Enter paid amount (e.g., $5,000)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueAmount">Due Amount</Label>
          <Input
            id="dueAmount"
            name="dueAmount"
            value={formData.dueAmount}
            onChange={handleChange}
            placeholder="Enter due amount (e.g., $5,000)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission">Commission</Label>
          <Input
            id="commission"
            name="commission"
            value={formData.commission}
            onChange={handleChange}
            placeholder="Enter commission amount (e.g., $1,000)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commissionDue">Commission Due</Label>
          <Input
            id="commissionDue"
            name="commissionDue"
            value={formData.commissionDue}
            onChange={handleChange}
            placeholder="Enter commission due (e.g., $500)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter any remarks or notes"
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding Student..." : "Add Student"}
      </Button>
    </form>
  );
};

export default AgentStudentForm;
