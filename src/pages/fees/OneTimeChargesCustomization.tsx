import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Edit, DollarSign, Search, Users } from "lucide-react";
import {
  studentFeeCustomizationsAPI,
  feePaymentsAPI,
  type StudentFeeCustomization
} from "@/lib/supabase-database";

interface StudentWithOneTimeCharges {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  universities: { name: string };
  courses: { name: string };
  fee_payments: Array<{
    id: number;
    amount_due: number;
    amount_paid: number;
    payment_status: string;
    fee_structure_components: {
      id: number;
      amount: number;
      fee_types: { id: number; name: string };
    };
  }>;
  customizations: StudentFeeCustomization[];
}

interface CustomAmountForm {
  studentId: number;
  studentName: string;
  feeStructureComponentId: number;
  currentAmount: number;
  customAmount: string;
  reason: string;
}

const OneTimeChargesCustomization = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<CustomAmountForm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch students with one-time charges
  const { data: studentsWithCharges = [], refetch, isLoading } = useQuery({
    queryKey: ['studentsWithOneTimeCharges'],
    queryFn: () => studentFeeCustomizationsAPI.getStudentsWithOneTimeCharges(),
  });

  // Apply custom amount mutation
  const applyCustomAmountMutation = useMutation({
    mutationFn: async ({ studentId, feeStructureComponentId, customAmount, reason }: {
      studentId: number;
      feeStructureComponentId: number;
      customAmount: number;
      reason?: string;
    }) => {
      await studentFeeCustomizationsAPI.applyCustomAmount(
        studentId,
        feeStructureComponentId,
        customAmount,
        reason
      );
    },
    onSuccess: () => {
      toast({
        title: "Custom Amount Applied",
        description: "The custom amount has been applied successfully.",
      });
      setIsDialogOpen(false);
      setSelectedStudent(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['studentsWithFeeStructures'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to apply custom amount. Please try again.",
        variant: "destructive",
      });
      console.error('Apply custom amount error:', error);
    },
  });

  const filteredStudents = studentsWithCharges.filter((student: StudentWithOneTimeCharges) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const admissionNumber = student.admission_number?.toLowerCase() || '';
    
    return studentName.includes(searchLower) || admissionNumber.includes(searchLower);
  });

  const handleCustomizeAmount = (student: StudentWithOneTimeCharges) => {
    // Find the one-time charges fee payment
    const oneTimeChargePayment = student.fee_payments.find(payment =>
      payment.fee_structure_components.fee_types.name === 'One-Time Charges (Medical Checkup, Transport, etc.)'
    );

    if (oneTimeChargePayment) {
      // Check if there's already a customization
      const existingCustomization = student.customizations.find(c =>
        c.fee_structure_component_id === oneTimeChargePayment.fee_structure_components.id
      );

      setSelectedStudent({
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        feeStructureComponentId: oneTimeChargePayment.fee_structure_components.id,
        currentAmount: oneTimeChargePayment.amount_due,
        customAmount: existingCustomization?.custom_amount.toString() || oneTimeChargePayment.amount_due.toString(),
        reason: existingCustomization?.reason || ''
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmitCustomAmount = () => {
    if (!selectedStudent) return;

    const customAmount = parseFloat(selectedStudent.customAmount);
    if (isNaN(customAmount) || customAmount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    applyCustomAmountMutation.mutate({
      studentId: selectedStudent.studentId,
      feeStructureComponentId: selectedStudent.feeStructureComponentId,
      customAmount,
      reason: selectedStudent.reason.trim() || undefined
    });
  };

  const columns: Column<StudentWithOneTimeCharges>[] = [
    {
      header: "Student",
      accessorKey: "first_name",
      cell: (student: StudentWithOneTimeCharges) => (
        <div>
          <p className="font-medium">{student.first_name} {student.last_name}</p>
          <p className="text-sm text-muted-foreground">{student.admission_number}</p>
        </div>
      )
    },
    {
      header: "University",
      accessorKey: "universities",
      cell: (student: StudentWithOneTimeCharges) => student.universities?.name || "N/A"
    },
    {
      header: "Course",
      accessorKey: "courses",
      cell: (student: StudentWithOneTimeCharges) => student.courses?.name || "N/A"
    },
    {
      header: "Current Amount",
      accessorKey: "fee_payments",
      cell: (student: StudentWithOneTimeCharges) => {
        const oneTimeChargePayment = student.fee_payments.find(payment =>
          payment.fee_structure_components.fee_types.name === 'One-Time Charges (Medical Checkup, Transport, etc.)'
        );
        return oneTimeChargePayment ? `$${oneTimeChargePayment.amount_due.toLocaleString()}` : "N/A";
      }
    },
    {
      header: "Custom Amount",
      accessorKey: "customizations",
      cell: (student: StudentWithOneTimeCharges) => {
        const oneTimeChargePayment = student.fee_payments.find(payment =>
          payment.fee_structure_components.fee_types.name === 'One-Time Charges (Medical Checkup, Transport, etc.)'
        );
        
        if (!oneTimeChargePayment) return "N/A";
        
        const customization = student.customizations.find(c =>
          c.fee_structure_component_id === oneTimeChargePayment.fee_structure_components.id
        );
        
        return customization ? (
          <span className="text-blue-600 font-medium">
            ${customization.custom_amount.toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground">Not customized</span>
        );
      }
    },
    {
      header: "Payment Status",
      accessorKey: "fee_payments",
      cell: (student: StudentWithOneTimeCharges) => {
        const oneTimeChargePayment = student.fee_payments.find(payment =>
          payment.fee_structure_components.fee_types.name === 'One-Time Charges (Medical Checkup, Transport, etc.)'
        );
        
        if (!oneTimeChargePayment) return "N/A";
        
        const status = oneTimeChargePayment.payment_status;
        const statusConfig = {
          "pending": { variant: "destructive" as const, color: "text-red-600" },
          "partial": { variant: "secondary" as const, color: "text-yellow-600" },
          "paid": { variant: "default" as const, color: "text-green-600" }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (student: StudentWithOneTimeCharges) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleCustomizeAmount(student)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Customize
        </Button>
      )
    }
  ];

  return (
    <MainLayout>
      <PageHeader
        title="One-Time Charges Customization"
        description="Set custom amounts for one-time charges for individual students"
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customized Amounts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.filter(student => 
                student.customizations.some(c => {
                  const oneTimePayment = student.fee_payments.find(p =>
                    p.fee_structure_components.fee_types.name === 'One-Time Charges (Medical Checkup, Transport, etc.)'
                  );
                  return oneTimePayment && c.fee_structure_component_id === oneTimePayment.fee_structure_components.id;
                })
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredStudents.filter(student => 
                student.fee_payments.some(payment => 
                  payment.fee_structure_components.fee_types.name === 'One-Time Charges (Medical Checkup, Transport, etc.)' &&
                  payment.payment_status !== 'paid'
                )
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students with One-Time Charges</CardTitle>
          <CardDescription>
            Customize the amount for one-time charges for individual students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredStudents} />
          )}
        </CardContent>
      </Card>

      {/* Custom Amount Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize One-Time Charges Amount</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Student</Label>
                <p className="font-medium">{selectedStudent.studentName}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Current Amount</Label>
                <p className="font-medium">${selectedStudent.currentAmount.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customAmount">Custom Amount ($) *</Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedStudent.customAmount}
                  onChange={(e) => setSelectedStudent({
                    ...selectedStudent,
                    customAmount: e.target.value
                  })}
                  placeholder="Enter custom amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Customization</Label>
                <Textarea
                  id="reason"
                  value={selectedStudent.reason}
                  onChange={(e) => setSelectedStudent({
                    ...selectedStudent,
                    reason: e.target.value
                  })}
                  placeholder="Enter reason for this custom amount (optional)"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitCustomAmount}
                  disabled={applyCustomAmountMutation.isPending}
                >
                  {applyCustomAmountMutation.isPending ? "Applying..." : "Apply Custom Amount"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default OneTimeChargesCustomization;