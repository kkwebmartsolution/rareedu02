import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download, FileText, Edit } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StudentDetailModal from "@/components/students/StudentDetailModal";
import COLLetterModal from "@/components/students/COLLetterModal";
import EditModal from "@/components/shared/EditModal";
import AgentApplicationEditForm from "@/components/students/AgentApplicationEditForm";
import { useAuth } from "@/contexts/AuthContext";
import { generateCOLLetter } from "@/lib/colLetterGenerator";
import type { Tables } from "@/integrations/supabase/types";

type ApplyStudent = Tables<"apply_students">;

const statusOptions = [
  { value: "pending", label: "Pending", variant: "secondary" as const },
  { value: "under_review", label: "Under Review", variant: "outline" as const },
  { value: "approved", label: "Approved", variant: "default" as const },
  { value: "rejected", label: "Rejected", variant: "destructive" as const },
];

export default function Application() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<ApplyStudent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCOLModalOpen, setIsCOLModalOpen] = useState(false);
  const [colStudent, setCOLStudent] = useState<ApplyStudent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<ApplyStudent | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["apply-students"],
    queryFn: async () => {
      let query = supabase
        .from("apply_students")
        .select("*")
        .order("created_at", { ascending: false });

      // If user is an agent, only show their applications
      if (user?.role === 'agent') {
        // Get agent record to find agent_id
        const { data: agentData } = await supabase
          .from('agents')
          .select('id')
          .eq('email', user.email)
          .single();

        if (agentData) {
          query = query.eq('agent_id', agentData.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as ApplyStudent[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log("Using function to update ID:", id, "with status:", status);
      const { data, error } = await supabase
        .rpc('update_application_status', {
          application_id: id,
          new_status: status
        });

      console.log("Function response:", { data, error });
      if (error) throw error;

      // If status is approved, send notification to agent
      if (status === 'approved') {
        const application = applications.find(app => app.id === id);
        if (application?.agent_id) {
          await supabase
            .from('agent_notifications')
            .insert({
              agent_id: application.agent_id,
              message: `Application for ${application.first_name} ${application.last_name} has been approved`,
              student_name: `${application.first_name} ${application.last_name}`,
              student_id: application.id
            });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apply-students"] });
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
      console.error("Error updating status:", error);
    },
  });

  const updateStagesMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: boolean }) => {
      const { data, error } = await supabase
        .from('apply_students')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apply-students"] });
      toast({
        title: "Stage Updated",
        description: "Application stage has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update application stage.",
        variant: "destructive",
      });
      console.error("Error updating stage:", error);
    },
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can change application status.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Updating status for ID:", id, "to:", newStatus);
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleStageToggle = (id: number, field: string, currentValue: boolean) => {
    updateStagesMutation.mutate({ id, field, value: !currentValue });
  };

  const handleViewStudent = (student: ApplyStudent) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleGenerateCOL = (student: ApplyStudent) => {
    setCOLStudent(student);
    setIsCOLModalOpen(true);
  };

  const handleEditApplication = (application: ApplyStudent) => {
    setEditingApplication(application);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingApplication(null);
    queryClient.invalidateQueries({ queryKey: ["apply-students"] });
  };

  const handleExportCOL = async (student: ApplyStudent) => {
    try {
      // Get additional data needed for COL generation
      const [universitiesData, coursesData] = await Promise.all([
        supabase.from('universities').select('*'),
        supabase.from('courses').select('*')
      ]);

      const enrichedStudent = {
        ...student,
        university_name: universitiesData.data?.find(u => u.id === student.university_id)?.name,
        course_name: coursesData.data?.find(c => c.id === student.course_id)?.name,
      };

      await generateCOLLetter(enrichedStudent);
      toast({
        title: "COL Letter Generated",
        description: `COL Letter for ${student.first_name} ${student.last_name} has been generated and downloaded.`,
      });
    } catch (error) {
      console.error('Error generating COL letter:', error);
      toast({
        title: "Error",
        description: "Failed to generate COL letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      header: "Application ID",
      accessorKey: "id" as keyof ApplyStudent,
    },
    {
      header: "Name",
      accessorKey: "first_name" as keyof ApplyStudent,
      cell: (row: ApplyStudent) => (
        <div>
          <div className="font-medium">{`${row.first_name} ${row.last_name}`}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Father's Name",
      accessorKey: "father_name" as keyof ApplyStudent,
    },
    {
      header: "Phone",
      accessorKey: "phone_number" as keyof ApplyStudent,
    },
    {
      header: "City/Country",
      accessorKey: "city" as keyof ApplyStudent,
      cell: (row: ApplyStudent) => (
        <div>
          <div>{row.city}</div>
          <div className="text-sm text-muted-foreground">{row.country}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof ApplyStudent,
      cell: (row: ApplyStudent) => {
        const status = row.status;
        const statusOption = statusOptions.find(opt => opt.value === status);
        
        if (!isAdmin) {
          return (
            <Badge variant={statusOption?.variant || "secondary"}>
              {statusOption?.label || status}
            </Badge>
          );
        }
        
        return (
          <Select
            value={status || "pending"}
            onValueChange={(newStatus) => handleStatusChange(row.id, newStatus)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                <Badge variant={statusOption?.variant || "secondary"}>
                  {statusOption?.label || status}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <Badge variant={option.variant}>{option.label}</Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    ...(user?.role === 'agent' ? [{
      header: "Stages",
      accessorKey: "stages" as keyof ApplyStudent,
      cell: (row: ApplyStudent) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={row.admission_letter_confirmed || false}
              onChange={() => handleStageToggle(row.id, 'admission_letter_confirmed', row.admission_letter_confirmed || false)}
              className="rounded"
            />
            <span className="text-xs">Admission Letter</span>
          </div>
          {row.admission_letter_confirmed && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={row.tanlx_requested || false}
                onChange={() => handleStageToggle(row.id, 'tanlx_requested', row.tanlx_requested || false)}
                className="rounded"
              />
              <span className="text-xs">TANLX Requested</span>
            </div>
          )}
        </div>
      ),
    }] : []),
    {
      header: "Applied Date",
      accessorKey: "created_at" as keyof ApplyStudent,
      cell: (row: ApplyStudent) => {
        return new Date(row.created_at || '').toLocaleDateString();
      },
    },
    {
      header: "Actions",
      accessorKey: "actions" as keyof ApplyStudent,
      cell: (row: ApplyStudent) => (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleViewStudent(row)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {user?.role === 'agent' && (
            <Button variant="outline" size="sm" onClick={() => handleEditApplication(row)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {user?.role === 'agent' && row.status === 'approved' && (
            <Button variant="outline" size="sm" onClick={() => handleGenerateCOL(row)}>
              <FileText className="h-4 w-4 mr-1" />
              COL Letter
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => handleExportCOL(row)}>
            <Download className="h-4 w-4 mr-1" />
            Export COL
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Student Applications"
          description={user?.role === 'agent' ? "Manage your student applications" : "Manage and review student applications"}
        />

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              {user?.role === 'agent' 
                ? "Review and manage your student applications. Update stages as needed."
                : "Review and manage student applications. Update status as needed."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading applications...</div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={applications}
              />
            )}
          </CardContent>
        </Card>

        <StudentDetailModal
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        <COLLetterModal
          student={colStudent}
          isOpen={isCOLModalOpen}
          onClose={() => setIsCOLModalOpen(false)}
        />

        <EditModal
          title="Edit Application"
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingApplication(null);
          }}
        >
          {editingApplication && (
            <AgentApplicationEditForm
              application={editingApplication}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingApplication(null);
              }}
            />
          )}
        </EditModal>
      </div>
    </MainLayout>
  );
}
