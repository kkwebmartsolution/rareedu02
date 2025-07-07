
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import StudentProfileModal from "@/components/students/StudentProfileModal";
import EditModal from "@/components/shared/EditModal";
import ComprehensiveStudentForm, { ComprehensiveStudentFormData } from "@/components/forms/ComprehensiveStudentForm";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Eye } from "lucide-react";
import { universitiesAPI, coursesAPI, academicSessionsAPI, University, Course, AcademicSession } from "@/lib/supabase-database";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  phone_number?: string;
  email?: string;
  university_id: number;
  course_id: number;
  academic_session_id: number;
  status: string;
  admission_number?: string;
  city?: string;
  country?: string;
  address?: string;
  aadhaar_number?: string;
  passport_number?: string;
  scores?: string;
  twelfth_marks?: number;
  agent_id?: number;
  photo_url?: string;
  passport_copy_url?: string;
  aadhaar_copy_url?: string;
  twelfth_certificate_url?: string;
  created_at?: string;
  updated_at?: string;
}

const DirectStudents = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, universitiesData, coursesData, sessionsData] = await Promise.all([
        supabase.from('students').select('*'),
        universitiesAPI.getAll(),
        coursesAPI.getAll(),
        academicSessionsAPI.getAll(),
      ]);

      if (studentsData.error) throw studentsData.error;

      setStudents(studentsData.data || []);
      setUniversities(universitiesData);
      setCourses(coursesData);
      setAcademicSessions(sessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load students data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: ComprehensiveStudentFormData) => {
    try {
      setIsSubmitting(true);
      
      // Get default course and session IDs
      const defaultCourse = courses.find(c => c.name === 'MBBS');
      const defaultSession = academicSessions.find(s => s.session_name === '2025-26');
      
      const dataToInsert = {
        ...studentData,
        university_id: studentData.university_id || undefined,
        course_id: studentData.course_id || defaultCourse?.id || undefined,
        academic_session_id: studentData.academic_session_id || defaultSession?.id || undefined,
        status: 'active'
      };

      const { data: newStudent, error } = await supabase
        .from('students')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => [newStudent, ...prev]);
      toast({
        title: "Student Added",
        description: `${newStudent.first_name} ${newStudent.last_name} has been added successfully.`,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (studentData: ComprehensiveStudentFormData) => {
    if (!selectedStudent) return;
    
    try {
      setIsSubmitting(true);
      
      const { data: updatedStudent, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', selectedStudent.id)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => prev.map(student => 
        student.id === selectedStudent.id ? updatedStudent : student
      ));
      toast({
        title: "Student Updated",
        description: `${updatedStudent.first_name} ${updatedStudent.last_name} has been updated successfully.`,
      });
      setIsEditModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== id));
      toast({
        title: "Student Deleted",
        description: "Student has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const getUniversityName = (id: number) => {
    return universities.find(u => u.id === id)?.name || 'Unknown';
  };

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name || 'Unknown';
  };

  const getSessionName = (id: number) => {
    return academicSessions.find(s => s.id === id)?.session_name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, color: "text-green-600" },
      inactive: { variant: "secondary" as const, color: "text-gray-600" },
      completed: { variant: "outline" as const, color: "text-blue-600" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const columns: Column<Student>[] = [
    { 
      header: "Student ID", 
      accessorKey: "id",
      cell: (student: Student) => (
        <span className="font-mono text-sm">#{student.id}</span>
      )
    },
    { 
      header: "Name", 
      accessorKey: "first_name",
      cell: (student: Student) => `${student.first_name} ${student.last_name}`
    },
    { 
      header: "Father's Name", 
      accessorKey: "father_name" 
    },
    { 
      header: "University", 
      accessorKey: "university_id",
      cell: (student: Student) => getUniversityName(student.university_id)
    },
    { 
      header: "Course", 
      accessorKey: "course_id",
      cell: (student: Student) => getCourseName(student.course_id)
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (student: Student) => getStatusBadge(student.status)
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (student: Student) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(student)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditClick(student)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteStudent(student.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <MainLayout>
        <PageHeader
          title="Access Denied"
          description="You don't have permission to access this page."
        />
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <PageHeader
          title="All Students"
          description="Manage enrolled students"
        />
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="All Students"
        description="Manage enrolled students"
      />
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                All enrolled students in the system
              </CardDescription>
            </div>
            <Button onClick={() => {
              setSelectedStudent(null);
              setIsEditModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={students} />
        </CardContent>
      </Card>

      <StudentProfileModal
        student={selectedStudent ? {
          ...selectedStudent,
          university_name: getUniversityName(selectedStudent.university_id),
          course_name: getCourseName(selectedStudent.course_id),
          session_name: getSessionName(selectedStudent.academic_session_id)
        } : null}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <EditModal
        title={selectedStudent ? "Edit Student" : "Add New Student"}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
      >
        <ComprehensiveStudentForm
          initialData={selectedStudent ? {
            id: selectedStudent.id,
            first_name: selectedStudent.first_name,
            last_name: selectedStudent.last_name,
            father_name: selectedStudent.father_name,
            mother_name: selectedStudent.mother_name,
            date_of_birth: selectedStudent.date_of_birth,
            phone_number: selectedStudent.phone_number || "",
            email: selectedStudent.email || "",
            university_id: selectedStudent.university_id,
            course_id: selectedStudent.course_id,
            academic_session_id: selectedStudent.academic_session_id,
            status: selectedStudent.status as "active" | "inactive" | "completed",
            city: selectedStudent.city,
            country: selectedStudent.country,
            address: selectedStudent.address,
            aadhaar_number: selectedStudent.aadhaar_number,
            passport_number: selectedStudent.passport_number,
            scores: selectedStudent.scores,
            twelfth_marks: selectedStudent.twelfth_marks,
            agent_id: selectedStudent.agent_id,
            photo_url: selectedStudent.photo_url,
            passport_copy_url: selectedStudent.passport_copy_url,
            aadhaar_copy_url: selectedStudent.aadhaar_copy_url,
            twelfth_certificate_url: selectedStudent.twelfth_certificate_url,
          } : undefined}
          onSubmit={selectedStudent ? handleEditStudent : handleAddStudent}
          isSubmitting={isSubmitting}
        />
      </EditModal>
    </MainLayout>
  );
};

export default DirectStudents;
