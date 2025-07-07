
import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Eye, Edit, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import DetailViewModal from "@/components/shared/DetailViewModal";
import StudentProfileModal from "@/components/students/StudentProfileModal";
import StudentSuccessModal from "@/components/students/StudentSuccessModal";
import EditModal from "@/components/shared/EditModal";
import ComprehensiveStudentForm, { ComprehensiveStudentFormData } from "@/components/forms/ComprehensiveStudentForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { universitiesAPI, coursesAPI, academicSessionsAPI } from "@/lib/supabase-database";
import { generateCOLLetter } from "@/lib/colLetterGenerator";

interface AgentStudent {
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
  photo_url?: string;
  passport_copy_url?: string;
  aadhaar_copy_url?: string;
  twelfth_certificate_url?: string;
  agent_id?: number;
  created_at: string;
  updated_at: string;
  // Display fields
  university_name?: string;
  course_name?: string;
  session_name?: string;
  agent_name?: string;
}

const AgentStudents = () => {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<AgentStudent[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [academicSessions, setAcademicSessions] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<AgentStudent | null>(null);
  const [newlyAddedStudent, setNewlyAddedStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCOL, setIsGeneratingCOL] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [user]);

  const loadStudents = useCallback(async () => {
    if (!user || universities.length === 0 || courses.length === 0 || academicSessions.length === 0) return;
    
    try {
      let query = supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (user.role === 'agent') {
        // Get the agent record for the current user
        const { data: agentData } = await supabase
          .from('agents')
          .select('id')
          .eq('email', user.email)
          .single();

        if (agentData) {
          query = query.eq('agent_id', agentData.id);
        } else {
          // If no agent record found, show no students
          setStudents([]);
          return;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: "Failed to load students. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Enrich student data with display names
      const enrichedStudents = data?.map(student => ({
        ...student,
        university_name: universities.find(u => u.id === student.university_id)?.name || 'Unknown',
        course_name: courses.find(c => c.id === student.course_id)?.name || 'Unknown',
        session_name: academicSessions.find(s => s.id === student.academic_session_id)?.session_name || 'Unknown',
        agent_name: agents.find(a => a.id === student.agent_id)?.name || (student.agent_id ? 'Unknown Agent' : 'Direct'),
      })) || [];

      setStudents(enrichedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, universities, courses, academicSessions, agents]);

  // Load students when reference data is available
  useEffect(() => {
    if (universities.length > 0 && courses.length > 0 && academicSessions.length > 0 && agents.length > 0) {
      loadStudents();
    }
  }, [universities, courses, academicSessions, agents, loadStudents]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load reference data
      const [universitiesData, coursesData, sessionsData, agentsData] = await Promise.all([
        universitiesAPI.getAll(),
        coursesAPI.getAll(),
        academicSessionsAPI.getAll(),
        supabase.from('agents').select('*')
      ]);

      setUniversities(universitiesData);
      setCourses(coursesData);
      setAcademicSessions(sessionsData);
      setAgents(agentsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.university_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewStudent = (student: AgentStudent) => {
    setCurrentStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEditStudent = (student: AgentStudent) => {
    setCurrentStudent(student);
    setIsEditModalOpen(true);
  };

  const handleAddStudent = () => {
    setIsAddModalOpen(true);
  };

  const handleGenerateTANLX = (student: AgentStudent) => {
    // Placeholder for TANLX generation logic
    toast({
      title: "TANLX Generation",
      description: `TANLX generation for ${student.first_name} ${student.last_name} will be implemented soon.`,
    });
  };

  const handleSaveStudent = async (formData: ComprehensiveStudentFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get agent ID for current user if they're an agent
      let agentId = formData.agent_id;
      if (user?.role === 'agent' && !agentId) {
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (agentError) {
          console.error('Error fetching agent:', agentError);
          toast({
            title: "Error",
            description: "Could not find agent record. Please contact administrator.",
            variant: "destructive",
          });
          return;
        }
        agentId = agentData?.id;
      }

      // Prepare student data for apply_students table
      const studentData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        date_of_birth: formData.date_of_birth,
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        university_id: formData.university_id,
        course_id: formData.course_id,
        academic_session_id: formData.academic_session_id,
        status: 'pending',
        city: formData.city || null,
        country: formData.country || null,
        address: formData.address || null,
        aadhaar_number: formData.aadhaar_number || null,
        passport_number: formData.passport_number || null,
        scores: formData.scores || null,
        twelfth_marks: formData.twelfth_marks || null,
        photo_url: formData.photo_url || null,
        passport_copy_url: formData.passport_copy_url || null,
        aadhaar_copy_url: formData.aadhaar_copy_url || null,
        twelfth_certificate_url: formData.twelfth_certificate_url || null,
        parents_phone_number: formData.parents_phone_number || null,
        tenth_passing_year: formData.tenth_passing_year || null,
        twelfth_passing_year: formData.twelfth_passing_year || null,
        neet_passing_year: formData.neet_passing_year || null,
        tenth_marksheet_number: formData.tenth_marksheet_number || null,
        pcb_average: formData.pcb_average || null,
        neet_roll_number: formData.neet_roll_number || null,
        qualification_status: formData.qualification_status || null,
        neet_score_card_url: formData.neet_score_card_url || null,
        tenth_marksheet_url: formData.tenth_marksheet_url || null,
        affidavit_paper_url: formData.affidavit_paper_url || null,
        agent_id: agentId,
      };

      if (formData.id) {
        // Update existing student
        const { error } = await supabase
          .from('apply_students')
          .update({
            ...studentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);

        if (error) {
          console.error('Error updating student:', error);
          toast({
            title: "Error",
            description: `Failed to update applicant: ${error.message}`,
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Applicant Updated",
          description: `${formData.first_name} ${formData.last_name} has been updated successfully.`,
        });
        
        setIsEditModalOpen(false);
      } else {
        // Add new student to apply_students table
        const { data, error } = await supabase
          .from('apply_students')
          .insert([studentData])
          .select();

        if (error) {
          console.error('Error creating student:', error);
          toast({
            title: "Error",
            description: `Failed to add applicant: ${error.message}`,
            variant: "destructive",
          });
          return;
        }
        
        // Get the enriched student data for COL generation
        const enrichedStudent = {
          ...data[0],
          university_name: universities.find(u => u.id === data[0].university_id)?.name,
          course_name: courses.find(c => c.id === data[0].course_id)?.name,
        };
        
        setNewlyAddedStudent(enrichedStudent);
        setIsSuccessModalOpen(true);
        setIsAddModalOpen(false);
      }
      
      // Reload students data
      await loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: "Failed to save applicant. Please try again.",
        variant: "destructive",
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

  const handleGenerateCOL = async () => {
    if (!newlyAddedStudent) return;
    
    setIsGeneratingCOL(true);
    try {
      await generateCOLLetter(newlyAddedStudent);
      toast({
        title: "COL Letter Generated",
        description: `COL Letter for ${newlyAddedStudent.first_name} ${newlyAddedStudent.last_name} has been generated and downloaded.`,
      });
    } catch (error) {
      console.error('Error generating COL letter:', error);
      toast({
        title: "Error",
        description: "Failed to generate COL letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCOL(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setNewlyAddedStudent(null);
  };

  const columns = [
    { 
      header: "Student Name", 
      accessorKey: "first_name",
      cell: (row: AgentStudent) => `${row.first_name} ${row.last_name}`
    },
    { header: "Admission No.", accessorKey: "admission_number" },
    { header: "University", accessorKey: "university_name" },
    { header: "Course", accessorKey: "course_name" },
    { header: "Session", accessorKey: "session_name" },
    ...(isAdmin ? [{ header: "Agent", accessorKey: "agent_name" }] : []),
    { header: "Phone", accessorKey: "phone_number" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.status === "active"
              ? "bg-blue-100 text-blue-800"
              : row.status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: AgentStudent) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleViewStudent(row)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          {(isAdmin || (user?.role === 'agent' && row.agent_id && agents.find(a => a.email === user.email)?.id === row.agent_id)) && (
            <Button variant="outline" size="sm" onClick={() => handleEditStudent(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {user?.role === 'agent' && (
            <Button variant="outline" size="sm" onClick={() => handleGenerateTANLX(row)}>
              <FileText className="mr-2 h-4 w-4" />
              Generate TANLX
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title={user?.role === 'agent' ? "My Students" : "Agent Students"}
        description={
          user?.role === 'agent' 
            ? "Manage your referred student records and commissions" 
            : "Manage all agent-referred student records and commissions"
        }
        actions={
          <>
            {isAdmin && (
              <>
                <Button variant="outline" size="sm" onClick={handleImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </>
            )}
            <Button variant="default" size="sm" onClick={handleAddStudent}>
              <Plus className="mr-2 h-4 w-4" />
              {user?.role === 'agent' ? 'Add Applicants' : 'Add Student'}
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Search by student name, university or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <DataTable columns={columns} data={filteredData} />
        </div>
      )}
      
      {/* Add Student Modal */}
      <EditModal
        title="Add New Student"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <ComprehensiveStudentForm 
          onSubmit={handleSaveStudent}
          isSubmitting={isSubmitting}
        />
      </EditModal>
      
      {/* View Student Modal */}
      <StudentProfileModal
        student={currentStudent}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        showAgentInfo={isAdmin}
      />
      
      {/* Success Modal */}
      <StudentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        student={newlyAddedStudent}
        onGenerateCOL={handleGenerateCOL}
        isGeneratingCOL={isGeneratingCOL}
      />
      
      {/* Edit Student Modal */}
      {currentStudent && (
        <EditModal
          title={`Edit Student: ${currentStudent.first_name} ${currentStudent.last_name}`}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <ComprehensiveStudentForm 
            initialData={{
              id: currentStudent.id,
              first_name: currentStudent.first_name,
              last_name: currentStudent.last_name,
              father_name: currentStudent.father_name,
              mother_name: currentStudent.mother_name,
              date_of_birth: currentStudent.date_of_birth,
              phone_number: currentStudent.phone_number,
              email: currentStudent.email,
              university_id: currentStudent.university_id,
              course_id: currentStudent.course_id,
              academic_session_id: currentStudent.academic_session_id,
              status: currentStudent.status as "active" | "inactive" | "completed",
              city: currentStudent.city,
              country: currentStudent.country,
              address: currentStudent.address,
              aadhaar_number: currentStudent.aadhaar_number,
              passport_number: currentStudent.passport_number,
              scores: currentStudent.scores,
              twelfth_marks: currentStudent.twelfth_marks,
              photo_url: currentStudent.photo_url,
              passport_copy_url: currentStudent.passport_copy_url,
              aadhaar_copy_url: currentStudent.aadhaar_copy_url,
              twelfth_certificate_url: currentStudent.twelfth_certificate_url,
              agent_id: currentStudent.agent_id,
            }}
            onSubmit={handleSaveStudent}
            isSubmitting={isSubmitting}
          />
        </EditModal>
      )}
    </MainLayout>
  );
};

export default AgentStudents;
