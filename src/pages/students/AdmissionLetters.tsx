import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number?: string;
  admission_letter_url?: string;
  admission_letter_uploaded_at?: string;
  agent_id?: number;
}

const AdmissionLetters = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [user]);

  const loadStudents = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('students')
        .select('id, first_name, last_name, admission_number, admission_letter_url, admission_letter_uploaded_at, agent_id')
        .order('created_at', { ascending: false });

      // If user is an agent, only show their students
      if (user.role === 'agent') {
        const { data: agentData } = await supabase
          .from('agents')
          .select('id')
          .eq('email', user.email)
          .single();

        if (agentData) {
          query = query.eq('agent_id', agentData.id);
        } else {
          setStudents([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: "Failed to load students.",
          variant: "destructive",
        });
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type (only PDFs)
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedStudent) {
      toast({
        title: "Missing Information",
        description: "Please select a student and a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const student = students.find(s => s.id.toString() === selectedStudent);
      if (!student) {
        throw new Error('Student not found');
      }

      // Create file path
      const fileExtension = file.name.split('.').pop();
      const fileName = `${student.admission_number || student.id}_admission_letter.${fileExtension}`;
      const filePath = `${student.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('admission-letters')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('admission-letters')
        .getPublicUrl(filePath);

      // Update student record with admission letter URL
      const { error: updateError } = await supabase
        .from('students')
        .update({
          admission_letter_url: urlData.publicUrl,
          admission_letter_uploaded_at: new Date().toISOString()
        })
        .eq('id', student.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Admission letter uploaded successfully.",
      });

      // Refresh students list
      await loadStudents();
      
      // Reset form
      setSelectedStudent("");
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload admission letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewLetter = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadLetter = async (student: Student) => {
    if (!student.admission_letter_url) return;
    
    try {
      const response = await fetch(student.admission_letter_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.first_name}_${student.last_name}_admission_letter.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Error",
        description: "Failed to download admission letter.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-8">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Admission Letters"
        description={
          isAdmin 
            ? "Upload and manage admission letters for students" 
            : "View admission letters for your students"
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section - Only for Admins */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Admission Letter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="student-select">Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.first_name} {student.last_name} 
                        {student.admission_number && ` (${student.admission_number})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file-input">Admission Letter (PDF only)</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={uploading || !file || !selectedStudent}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Admission Letter'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students with Admission Letters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.filter(student => student.admission_letter_url).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      {student.first_name} {student.last_name}
                    </h4>
                    {student.admission_number && (
                      <p className="text-sm text-muted-foreground">
                        Admission No: {student.admission_number}
                      </p>
                    )}
                    {student.admission_letter_uploaded_at && (
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(student.admission_letter_uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLetter(student.admission_letter_url!)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadLetter(student)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
              
              {students.filter(student => student.admission_letter_url).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No admission letters uploaded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdmissionLetters;