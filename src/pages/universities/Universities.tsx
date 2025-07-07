import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import EditModal from "@/components/shared/EditModal";
import UniversityForm, { UniversityFormData } from "@/components/forms/UniversityForm";
import UniversityPieChart from "@/components/dashboard/UniversityPieChart";
import { universitiesAPI } from "@/lib/supabase-database";
import { supabase } from "@/integrations/supabase/client";

interface UniversityData {
  id: number;
  name: string;
  studentCount: number;
  totalFeesExpected: number;
  amountPaid: number;
  amountPending: number;
  lastPayment: string;
  status: string;
}

const Universities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatusData, setPaymentStatusData] = useState<any[]>([]);
  const [universityPaymentData, setUniversityPaymentData] = useState<any[]>([]);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUniversity, setCurrentUniversity] = useState<UniversityData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      
      // Fetch universities
      const universitiesData = await universitiesAPI.getAll();
      
      // Fetch student counts per university
      const { data: studentCounts } = await supabase
        .from('students')
        .select('university_id')
        .eq('status', 'active');

      // Count students per university
      const universityCounts: Record<number, number> = {};
      studentCounts?.forEach(student => {
        if (student.university_id) {
          universityCounts[student.university_id] = (universityCounts[student.university_id] || 0) + 1;
        }
      });

      // Fetch fee payments data
      const { data: feePayments } = await supabase
        .from('fee_payments')
        .select(`
          amount_due,
          amount_paid,
          payment_status,
          last_payment_date,
          students!inner(university_id)
        `);

      // Calculate fee statistics per university
      const universityFeeStats: Record<number, { totalExpected: number; amountPaid: number; lastPayment: string }> = {};
      
      feePayments?.forEach(payment => {
        const universityId = payment.students.university_id;
        if (!universityFeeStats[universityId]) {
          universityFeeStats[universityId] = { totalExpected: 0, amountPaid: 0, lastPayment: '' };
        }
        
        universityFeeStats[universityId].totalExpected += payment.amount_due || 0;
        universityFeeStats[universityId].amountPaid += payment.amount_paid || 0;
        
        if (payment.last_payment_date && payment.last_payment_date > universityFeeStats[universityId].lastPayment) {
          universityFeeStats[universityId].lastPayment = payment.last_payment_date;
        }
      });

      // Transform universities data
      const transformedUniversities: UniversityData[] = universitiesData.map(university => {
        const studentCount = universityCounts[university.id] || 0;
        const feeStats = universityFeeStats[university.id] || { totalExpected: 0, amountPaid: 0, lastPayment: '' };
        const amountPending = feeStats.totalExpected - feeStats.amountPaid;
        
        return {
          id: university.id,
          name: university.name,
          studentCount,
          totalFeesExpected: feeStats.totalExpected,
          amountPaid: feeStats.amountPaid,
          amountPending,
          lastPayment: feeStats.lastPayment || '-',
          status: amountPending <= 0 ? 'Paid' : 'Active'
        };
      });

      setUniversities(transformedUniversities);

      // Calculate payment status data for pie chart
      const totalPaid = transformedUniversities.reduce((sum, uni) => sum + uni.amountPaid, 0);
      const totalPending = transformedUniversities.reduce((sum, uni) => sum + uni.amountPending, 0);
      
      setPaymentStatusData([
        { name: "Paid", value: totalPaid, color: "#4CAF50" },
        { name: "Pending", value: totalPending, color: "#FF9800" }
      ]);

      // Calculate university payment data for pie chart
      const colors = ["#1E88E5", "#7E57C2", "#43A047", "#F9A825", "#FF5722", "#9C27B0"];
      setUniversityPaymentData(
        transformedUniversities
          .filter(uni => uni.amountPaid > 0)
          .map((uni, index) => ({
            name: uni.name.split(' ')[0], // Use first word of university name
            value: uni.amountPaid,
            color: colors[index % colors.length]
          }))
      );

    } catch (error) {
      console.error('Error loading universities:', error);
      toast({
        title: "Error",
        description: "Failed to load universities data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = universities.filter(
    (university) =>
      university.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUniversity = (university: UniversityData) => {
    navigate(`/universities/${university.id}`);
  };

  const handleEditUniversity = (university: UniversityData) => {
    setCurrentUniversity(university);
    setIsEditModalOpen(true);
  };

  const handleAddUniversity = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveUniversity = async (formData: UniversityFormData) => {
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        // Update existing university (only name can be updated in current schema)
        const { error } = await supabase
          .from('universities')
          .update({ name: formData.name })
          .eq('id', parseInt(formData.id));

        if (error) throw error;

        toast({
          title: "University Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Add new university
        const { error } = await supabase
          .from('universities')
          .insert([{ name: formData.name }]);

        if (error) throw error;

        toast({
          title: "University Added",
          description: `${formData.name} has been added successfully.`,
        });
      }
      
      // Reload data
      await loadUniversities();
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving university:', error);
      toast({
        title: "Error",
        description: "Failed to save university.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Import functionality will be available shortly.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be available shortly.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns = [
    { 
      header: "University Name", 
      accessorKey: "name",
      cell: (row: any) => (
        <span 
          className="text-primary hover:underline cursor-pointer"
          onClick={() => handleViewUniversity(row)}
        >
          {row.name}
        </span>
      )
    },
    { header: "Student Count", accessorKey: "studentCount" },
    { 
      header: "Total Fees Expected", 
      accessorKey: "totalFeesExpected",
      cell: (row: any) => formatCurrency(row.totalFeesExpected)
    },
    { 
      header: "Amount Paid", 
      accessorKey: "amountPaid",
      cell: (row: any) => formatCurrency(row.amountPaid)
    },
    { 
      header: "Amount Pending", 
      accessorKey: "amountPending",
      cell: (row: any) => formatCurrency(row.amountPending)
    },
    { header: "Last Payment", accessorKey: "lastPayment" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.status === "Paid"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: UniversityData) => (
        <Button variant="outline" size="sm" onClick={() => handleEditUniversity(row)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading universities...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="University Management"
        description="Track university fees, payments, and student records"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="default" size="sm" onClick={handleAddUniversity}>
              <Plus className="mr-2 h-4 w-4" />
              Add University
            </Button>
          </>
        }
      />

      {paymentStatusData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          <UniversityPieChart 
            title="Payment Status"
            description="Paid vs Pending Amounts"
            data={paymentStatusData}
          />
          {universityPaymentData.length > 0 && (
            <UniversityPieChart 
              title="University Payments"
              description="Amount Paid to Each University"
              data={universityPaymentData}
            />
          )}
        </div>
      )}

      <div className="mb-6">
        <Input
          placeholder="Search by university name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <DataTable columns={columns} data={filteredData} />
      </div>
      
      {/* Add University Modal */}
      <EditModal
        title="Add New University"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <UniversityForm 
          onSubmit={handleSaveUniversity}
          isSubmitting={isSubmitting}
        />
      </EditModal>
      
      {/* Edit University Modal */}
      {currentUniversity && (
        <EditModal
          title={`Edit University: ${currentUniversity.name}`}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <UniversityForm 
            initialData={{
              id: currentUniversity.id.toString(),
              name: currentUniversity.name,
              location: '',
              contactPerson: '',
              email: '',
              phone: '',
              status: currentUniversity.status as "Active" | "Paid" | "Inactive",
            }}
            onSubmit={handleSaveUniversity}
            isSubmitting={isSubmitting}
          />
        </EditModal>
      )}
    </MainLayout>
  );
};

export default Universities;