import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VisaForm from "@/components/forms/VisaForm";
import StudentSearch from "@/components/fees/StudentSearch";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  email: string;
  phone_number: string;
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

export default function Visa() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Get students with their visa information
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active')
        .order('first_name');

      if (studentsError) throw studentsError;

      // Get visa information for all students
      const { data: visaData, error: visaError } = await supabase
        .from('student_visa')
        .select('*');

      if (visaError) throw visaError;

      // Combine students with their visa info
      const studentsWithVisa = studentsData.map(student => ({
        ...student,
        visa_info: visaData.find(visa => visa.student_id === student.id)
      }));

      setStudents(studentsWithVisa);
      setFilteredStudents(studentsWithVisa);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedStudent(null);
    loadStudents();
  };

  const getVisaStatus = (student: Student) => {
    if (!student.visa_info) return "pending";
    
    // Check if all 4 steps are completed for approval
    const allStepsCompleted = 
      student.visa_info.application_submitted &&
      student.visa_info.visa_interview &&
      student.visa_info.visa_approved &&
      student.visa_info.residency_registration;
    
    return allStepsCompleted ? "approved" : "pending";
  };

  const getProgressSteps = (visa: StudentVisa | undefined) => {
    if (!visa) return 0;
    let steps = 0;
    if (visa.application_submitted) steps++;
    if (visa.visa_interview) steps++;
    if (visa.visa_approved) steps++;
    if (visa.residency_registration) steps++;
    return steps;
  };

  // Handle search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const pendingStudents = filteredStudents.filter(student => getVisaStatus(student) === "pending");
  const approvedStudents = filteredStudents.filter(student => getVisaStatus(student) === "approved");

  const StudentCard = ({ student }: { student: Student }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStudentClick(student)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{student.first_name} {student.last_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{student.admission_number}</p>
          </div>
          <Badge variant={getVisaStatus(student) === "approved" ? "default" : "secondary"}>
            {getVisaStatus(student)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <span>{student.email}</span>
          </div>
          {student.phone_number && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{student.phone_number}</span>
            </div>
          )}
          {student.visa_info && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Progress: {getProgressSteps(student.visa_info)}/4 steps</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading students...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Student Visa Management"
          description="Track and manage student visa applications and statuses"
        />

        <StudentSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingStudents.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedStudents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
            {pendingStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending visa applications found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
            {approvedStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No approved visas found.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedStudent && (
          <VisaForm
            student={selectedStudent}
            open={formOpen}
            onOpenChange={setFormOpen}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </MainLayout>
  );
}