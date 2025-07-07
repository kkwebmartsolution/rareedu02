
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Edit, Users, CreditCard, TrendingUp, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EditModal from "@/components/shared/EditModal";
import UniversityForm, { UniversityFormData } from "@/components/forms/UniversityForm";
import { toast } from "@/hooks/use-toast";
import UniversityPieChart from "@/components/dashboard/UniversityPieChart";

// Sample university data
const universitiesData = {
  tashkent: {
    id: "1",
    name: "Tashkent State Medical University",
    studentCount: 42,
    totalFeesExpected: "$630,000",
    amountPaid: "$420,000",
    amountPending: "$210,000",
    lastPayment: "2025-05-01",
    status: "Active",
    location: "Tashkent, Uzbekistan",
    contactPerson: "Dr. Alisher Navoiy",
    email: "admin@tsmu.edu.uz",
    phone: "+998 71 123 4567",
    foundedYear: "1920",
    programs: ["MBBS", "BDS", "Pharmacy", "Nursing"],
    accreditation: ["WHO", "MCI", "ECFMG"],
    rankingPosition: "Top 10 in Central Asia"
  },
  samarkand: {
    id: "2",
    name: "Samarkand State Medical University",
    studentCount: 35,
    totalFeesExpected: "$525,000",
    amountPaid: "$350,000",
    amountPending: "$175,000",
    lastPayment: "2025-04-28",
    status: "Active",
    location: "Samarkand, Uzbekistan",
    contactPerson: "Dr. Bobur Mirzayev",
    email: "admin@sammi.uz",
    phone: "+998 66 234 5678",
    foundedYear: "1930",
    programs: ["MBBS", "BDS", "Pediatrics"],
    accreditation: ["WHO", "MCI"],
    rankingPosition: "Top 15 in Central Asia"
  },
  bukhara: {
    id: "3",
    name: "Bukhara State Medical Institute",
    studentCount: 28,
    totalFeesExpected: "$420,000",
    amountPaid: "$420,000",
    amountPending: "$0",
    lastPayment: "2025-04-15",
    status: "Paid",
    location: "Bukhara, Uzbekistan",
    contactPerson: "Dr. Nodira Azizova",
    email: "admin@bsmi.uz",
    phone: "+998 65 223 4455",
    foundedYear: "1990",
    programs: ["MBBS", "Nursing", "Pharmacy"],
    accreditation: ["WHO", "NMC"],
    rankingPosition: "Top 20 in Central Asia"
  },
  qarshi: {
    id: "4",
    name: "Qarshi State University",
    studentCount: 22,
    totalFeesExpected: "$330,000",
    amountPaid: "$220,000",
    amountPending: "$110,000",
    lastPayment: "2025-04-10",
    status: "Active",
    location: "Qarshi, Uzbekistan",
    contactPerson: "Prof. Aziza Karimova",
    email: "admin@qsu.uz",
    phone: "+998 75 221 3344",
    foundedYear: "1992",
    programs: ["Medicine", "Biology", "Chemistry"],
    accreditation: ["Ministry of Education"],
    rankingPosition: "Regional University"
  }
};

const UniversityDetail = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Get university data based on the URL parameter
  const university = universitiesData[universityId as keyof typeof universitiesData];
  
  if (!university) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-bold mb-4">University Not Found</h2>
          <Button onClick={() => navigate("/universities")}>Go Back to Universities</Button>
        </div>
      </MainLayout>
    );
  }
  
  const handleEditUniversity = () => {
    setIsEditModalOpen(true);
  };
  
  const handleSaveUniversity = (formData: UniversityFormData) => {
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      toast({
        title: "University Updated",
        description: `${formData.name} has been updated successfully.`,
      });
      
      setIsSubmitting(false);
      setIsEditModalOpen(false);
    }, 1000);
  };
  
  // Calculate percentage for the progress indicator
  const totalFees = parseInt(university.totalFeesExpected.replace(/[^\d]/g, ''));
  const paidAmount = parseInt(university.amountPaid.replace(/[^\d]/g, ''));
  const pendingAmount = parseInt(university.amountPending.replace(/[^\d]/g, ''));
  const paymentPercentage = Math.round((paidAmount / totalFees) * 100);
  
  // Create data for the pie chart
  const paymentStatusData = [
    { 
      name: "Amount Paid", 
      value: paidAmount, 
      color: "#4CAF50" 
    },
    { 
      name: "Amount Pending", 
      value: pendingAmount, 
      color: "#FF9800" 
    },
  ];
  
  return (
    <MainLayout>
      <PageHeader
        title={university.name}
        description={`${university.location} - Established ${university.foundedYear}`}
        actions={
          <Button variant="default" size="sm" onClick={handleEditUniversity}>
            <Edit className="mr-2 h-4 w-4" />
            Edit University
          </Button>
        }
      />
      
      {/* University Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{university.studentCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 text-green-500 mr-2" />
              <div className="text-2xl font-bold">{university.totalFeesExpected}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Expected revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">{university.amountPending}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">To be collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-purple-500 mr-2" />
              <div className="text-2xl font-bold">{new Date(university.lastPayment).toLocaleDateString()}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Transaction date</p>
          </CardContent>
        </Card>
      </div>
      
      {/* University Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>University Information</CardTitle>
            <CardDescription>Detailed information about {university.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Contact Person:</span>
                    <p>{university.contactPerson}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <p>{university.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <p>{university.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <p>{university.location}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Academic Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Founded:</span>
                    <p>{university.foundedYear}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Ranking:</span>
                    <p>{university.rankingPosition}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Accreditation:</span>
                    <p>{university.accreditation.join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Programs Offered</h3>
              <div className="flex flex-wrap gap-2">
                {university.programs.map((program) => (
                  <span 
                    key={program} 
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {program}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Fee collection progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mb-4">
              <UniversityPieChart
                title=""
                data={paymentStatusData}
                className="border-0 shadow-none p-0"
              />
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Expected:</span>
                <span className="font-medium">{university.totalFeesExpected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount Paid:</span>
                <span className="font-medium">{university.amountPaid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount Pending:</span>
                <span className="font-medium">{university.amountPending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                  university.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {university.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit University Modal */}
      <EditModal
        title={`Edit University: ${university.name}`}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <UniversityForm 
          initialData={{
            id: university.id,
            name: university.name,
            location: university.location,
            contactPerson: university.contactPerson,
            email: university.email,
            phone: university.phone,
            status: university.status as "Active" | "Paid" | "Inactive",
          }}
          onSubmit={handleSaveUniversity}
          isSubmitting={isSubmitting}
        />
      </EditModal>
    </MainLayout>
  );
};

export default UniversityDetail;
