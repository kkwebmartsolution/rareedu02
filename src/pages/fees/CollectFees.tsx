
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, Search, Users } from "lucide-react";
import InvoiceGenerator from "@/components/fees/InvoiceGenerator";
import { useAuth } from "@/contexts/AuthContext";
import {
  feePaymentsAPI,
  universitiesAPI,
  coursesAPI,
  academicSessionsAPI,
  type University,
  type Course,
  type AcademicSession
} from "@/lib/supabase-database";

interface StudentWithFees {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  phone_number?: string;
  universities: { name: string };
  courses: { name: string };
  academic_sessions: { session_name: string };
  fee_payments: Array<{
    id: number;
    amount_due: number;
    amount_paid: number;
    payment_status: 'pending' | 'partial' | 'paid';
    due_date: string;
    fee_structure_components: {
      fee_types: { name: string };
      fee_structures: { name: string };
      amount: number;
      frequency: string;
    };
  }>;
}

interface PaymentData {
  feePaymentId: number;
  amount: number;
}

const CollectFees = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: studentsWithFees = [], refetch, isLoading } = useQuery({
    queryKey: ['studentsWithFeeStructures', user?.role, user?.email],
    queryFn: () => feePaymentsAPI.getStudentsWithFeeStructures(user?.role, user?.email),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: () => universitiesAPI.getAll(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.getAll(),
  });

  const { data: academicSessions = [] } = useQuery({
    queryKey: ['academicSessions'],
    queryFn: () => academicSessionsAPI.getAll(),
  });

  // Filter students based on search term
  const filteredStudents = studentsWithFees.filter((student: StudentWithFees) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const studentName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const admissionNumber = student.admission_number?.toLowerCase() || '';
    
    return studentName.includes(searchLower) || admissionNumber.includes(searchLower);
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "pending": { variant: "destructive" as const, color: "text-red-600" },
      "partial": { variant: "secondary" as const, color: "text-yellow-600" },
      "paid": { variant: "default" as const, color: "text-green-600" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleCollectFees = (student: StudentWithFees) => {
    setSelectedStudent(student);
    
    // Initialize payment data with empty amounts (no auto-fill)
    const initialPaymentData = student.fee_payments
      .filter(payment => payment.payment_status !== 'paid')
      .map(payment => ({
        feePaymentId: payment.id,
        amount: 0 // Changed: Don't auto-fill with balance
      }));
    
    setPaymentData(initialPaymentData);
    setIsPaymentModalOpen(true);
  };

  const updatePaymentAmount = (feePaymentId: number, amount: number) => {
    setPaymentData(prev => 
      prev.map(payment => 
        payment.feePaymentId === feePaymentId 
          ? { ...payment, amount: Math.max(0, amount) }
          : payment
      )
    );
  };

  const handleSubmitPayments = async () => {
    if (!selectedStudent) return;

    try {
      setIsSubmitting(true);

      // Process each payment
      for (const payment of paymentData) {
        if (payment.amount > 0) {
          const feePayment = selectedStudent.fee_payments.find(fp => fp.id === payment.feePaymentId);
          if (feePayment) {
            const newAmountPaid = feePayment.amount_paid + payment.amount;
            const newStatus = newAmountPaid >= feePayment.amount_due ? 'paid' : 
                            newAmountPaid > 0 ? 'partial' : 'pending';

            await feePaymentsAPI.updatePayment(payment.feePaymentId, newAmountPaid, newStatus);
          }
        }
      }

      toast({
        title: "Payments Collected",
        description: `Fees have been collected successfully for ${selectedStudent.first_name} ${selectedStudent.last_name}.`,
      });

      setIsPaymentModalOpen(false);
      setSelectedStudent(null);
      setPaymentData([]);
      refetch();
    } catch (error) {
      console.error('Error processing payments:', error);
      toast({
        title: "Error",
        description: "Failed to process payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalAmount = () => {
    return paymentData.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const columns: Column<StudentWithFees>[] = [
    {
      header: "Student",
      accessorKey: "first_name",
      cell: (student: StudentWithFees) => (
        <div>
          <p className="font-medium">{student.first_name} {student.last_name}</p>
          <p className="text-sm text-muted-foreground">{student.admission_number}</p>
        </div>
      )
    },
    {
      header: "University",
      accessorKey: "universities",
      cell: (student: StudentWithFees) => student.universities?.name || "N/A"
    },
    {
      header: "Course",
      accessorKey: "courses",
      cell: (student: StudentWithFees) => student.courses?.name || "N/A"
    },
    {
      header: "Total Due",
      accessorKey: "fee_payments",
      cell: (student: StudentWithFees) => {
        if (user?.role === 'agent') {
          // For agents, exclude one-time fees from calculations
          const filteredPayments = student.fee_payments.filter(payment => 
            !payment.fee_structure_components.fee_types.name.toLowerCase().includes('one-time')
          );
          const totalDue = filteredPayments.reduce((sum, payment) => sum + payment.amount_due, 0);
          return `$${totalDue.toLocaleString()}`;
        }
        const totalDue = student.fee_payments.reduce((sum, payment) => sum + payment.amount_due, 0);
        return `$${totalDue.toLocaleString()}`;
      }
    },
    {
      header: "Total Paid",
      accessorKey: "fee_payments",
      cell: (student: StudentWithFees) => {
        if (user?.role === 'agent') {
          // For agents, exclude one-time fees from calculations
          const filteredPayments = student.fee_payments.filter(payment => 
            !payment.fee_structure_components.fee_types.name.toLowerCase().includes('one-time')
          );
          const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount_paid, 0);
          return `$${totalPaid.toLocaleString()}`;
        }
        const totalPaid = student.fee_payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
        return `$${totalPaid.toLocaleString()}`;
      }
    },
    {
      header: "Balance",
      accessorKey: "fee_payments",
      cell: (student: StudentWithFees) => {
        if (user?.role === 'agent') {
          // For agents, exclude one-time fees from calculations
          const filteredPayments = student.fee_payments.filter(payment => 
            !payment.fee_structure_components.fee_types.name.toLowerCase().includes('one-time')
          );
          const totalDue = filteredPayments.reduce((sum, payment) => sum + payment.amount_due, 0);
          const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount_paid, 0);
          const balance = totalDue - totalPaid;
          return (
            <span className={balance > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
              ${balance.toLocaleString()}
            </span>
          );
        }
        const totalDue = student.fee_payments.reduce((sum, payment) => sum + payment.amount_due, 0);
        const totalPaid = student.fee_payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
        const balance = totalDue - totalPaid;
        return (
          <span className={balance > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            ${balance.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (student: StudentWithFees) => {
        const hasOutstanding = student.fee_payments.some(payment => 
          payment.payment_status === 'pending' || payment.payment_status === 'partial'
        );
        
        return (
          <Button
            size="sm"
            onClick={() => handleCollectFees(student)}
            disabled={!hasOutstanding}
            className="bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Collect Fees
          </Button>
        );
      }
    }
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Collect Fees"
        description="Process fee payments from students"
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
            <CardTitle className="text-sm font-medium">Students with Dues</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.filter(student => 
                student.fee_payments.some(payment => 
                  payment.payment_status === 'pending' || payment.payment_status === 'partial'
                )
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${filteredStudents.reduce((total, student) => {
                if (user?.role === 'agent') {
                  // For agents, exclude one-time fees from calculations
                  const filteredPayments = student.fee_payments.filter(payment => 
                    !payment.fee_structure_components.fee_types.name.toLowerCase().includes('one-time')
                  );
                  const studentBalance = filteredPayments.reduce((sum, payment) => 
                    sum + (payment.amount_due - payment.amount_paid), 0
                  );
                  return total + studentBalance;
                }
                const studentBalance = student.fee_payments.reduce((sum, payment) => 
                  sum + (payment.amount_due - payment.amount_paid), 0
                );
                return total + studentBalance;
              }, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students with Fee Assignments</CardTitle>
          <CardDescription>
            Select students to collect fee payments
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

      {/* Payment Collection Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              Collect Fees - {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-6 p-1">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Number</p>
                  <p className="font-medium">{selectedStudent?.admission_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{selectedStudent?.universities?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{selectedStudent?.courses?.name}</p>
                </div>
              </div>

              {/* Fee Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Fee Payment Details</h3>
                {selectedStudent?.fee_payments
                  .filter(payment => payment.payment_status !== 'paid')
                  .map((feePayment) => {
                    const paymentItem = paymentData.find(p => p.feePaymentId === feePayment.id);
                    const balance = feePayment.amount_due - feePayment.amount_paid;
                    const isOneTimeFee = feePayment.fee_structure_components?.fee_types?.name.toLowerCase().includes('one-time');
                    const isAgent = user?.role === 'agent';
                    
                    return (
                      <Card key={feePayment.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Fee Type</p>
                            <p className="font-medium">{feePayment.fee_structure_components?.fee_types?.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isAgent && isOneTimeFee ? "Status" : "Total Due"}
                            </p>
                            {isAgent && isOneTimeFee ? (
                              getStatusBadge(feePayment.payment_status)
                            ) : (
                              <p className="font-medium">${feePayment.amount_due.toLocaleString()}</p>
                            )}
                          </div>
                          <div>
                            {isAgent && isOneTimeFee ? (
                              <div>
                                <p className="text-sm text-muted-foreground">View Only</p>
                                <p className="text-sm text-muted-foreground">No Amount Access</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-muted-foreground">Balance</p>
                                <p className="font-medium text-red-600">${balance.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            {isAgent && isOneTimeFee ? (
                              <div>
                                <p className="text-sm text-muted-foreground">Not Available</p>
                                <p className="text-sm text-muted-foreground">Contact Admin</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-muted-foreground">Collect Amount</p>
                                <Input
                                  type="number"
                                  min="0"
                                  max={balance}
                                  value={paymentItem?.amount || ''}
                                  onChange={(e) => updatePaymentAmount(feePayment.id, parseFloat(e.target.value) || 0)}
                                  className="w-full"
                                  placeholder="0"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            {paymentItem && paymentItem.amount > 0 && !(isAgent && isOneTimeFee) && (
                              <InvoiceGenerator
                                invoiceData={{
                                  student: {
                                    id: selectedStudent!.id,
                                    first_name: selectedStudent!.first_name,
                                    last_name: selectedStudent!.last_name,
                                    phone_number: selectedStudent!.phone_number,
                                    universities: selectedStudent!.universities,
                                    courses: selectedStudent!.courses,
                                    academic_sessions: selectedStudent!.academic_sessions
                                  },
                                  payment: {
                                    id: feePayment.id,
                                    amount_paid: paymentItem.amount,
                                    fee_structure_components: feePayment.fee_structure_components
                                  },
                                  receiptNumber: `REC-${Date.now()}-${feePayment.id}`
                                }}
                                onGenerateInvoice={() => {
                                  toast({
                                    title: "Invoice Generated",
                                    description: "Invoice has been generated successfully.",
                                  });
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Summary */}
              <Card className="p-4 bg-blue-50">
                <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Collecting</p>
                    <p className="text-xl font-bold text-green-600">${getTotalAmount().toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{paymentMethod.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium">{selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPayments} 
              disabled={isSubmitting || getTotalAmount() === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Processing..." : `Collect $${getTotalAmount().toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CollectFees;
