import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  FileText, 
  Calendar,
  CreditCard,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ApplyStudent {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  phone_number?: string;
  email?: string;
  university_id?: number;
  course_id?: number;
  academic_session_id?: number;
  status: string;
  application_status: string;
  city?: string;
  country?: string;
  address?: string;
  aadhaar_number?: string;
  passport_number?: string;
  twelfth_marks?: number;
  seat_number?: string;
  scores?: string;
  photo_url?: string;
  passport_copy_url?: string;
  aadhaar_copy_url?: string;
  twelfth_certificate_url?: string;
  created_at: string;
  updated_at: string;
}

interface StudentDetailModalProps {
  student: ApplyStudent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentDetailModal({ student, isOpen, onClose }: StudentDetailModalProps) {
  const [universityName, setUniversityName] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [sessionName, setSessionName] = useState<string>("");

  useEffect(() => {
    if (student) {
      loadAcademicData();
    }
  }, [student]);

  const loadAcademicData = async () => {
    if (!student) return;

    try {
      // Load university name
      if (student.university_id) {
        const { data: university } = await supabase
          .from('universities')
          .select('name')
          .eq('id', student.university_id)
          .single();
        if (university) setUniversityName(university.name);
      }

      // Load course name
      if (student.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('name')
          .eq('id', student.course_id)
          .single();
        if (course) setCourseName(course.name);
      }

      // Load session name
      if (student.academic_session_id) {
        const { data: session } = await supabase
          .from('academic_sessions')
          .select('session_name')
          .eq('id', student.academic_session_id)
          .single();
        if (session) setSessionName(session.session_name);
      }
    } catch (error) {
      console.error('Error loading academic data:', error);
    }
  };

  if (!student) return null;

  const statusOptions = [
    { value: "pending", label: "Pending", variant: "secondary" as const, icon: Clock },
    { value: "under_review", label: "Under Review", variant: "outline" as const, icon: FileText },
    { value: "approved", label: "Approved", variant: "default" as const, icon: CheckCircle },
    { value: "rejected", label: "Rejected", variant: "destructive" as const, icon: XCircle },
  ];

  const statusOption = statusOptions.find(opt => opt.value === student.status);
  const StatusIcon = statusOption?.icon || Clock;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const DocumentStatus = ({ url, label }: { url?: string; label: string }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {url ? (
          <>
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Uploaded
            </Badge>
            <Download className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Not Uploaded
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Application Details
          </DialogTitle>
          <DialogDescription>
            Complete profile and application details for {student.first_name} {student.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 ring-2 ring-border">
                  <AvatarImage 
                    src={student.photo_url || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face`} 
                    alt={`${student.first_name} ${student.last_name}`} 
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(student.first_name, student.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{student.first_name} {student.last_name}</h2>
                      <p className="text-muted-foreground">Application ID: #{student.id}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Applied on {formatDate(student.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <Badge variant={statusOption?.variant || "secondary"}>
                        {statusOption?.label || student.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <p className="text-sm font-medium">{student.first_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <p className="text-sm font-medium">{student.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                    <p className="text-sm font-medium">{student.father_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                    <p className="text-sm font-medium">{student.mother_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-sm font-medium">{formatDate(student.date_of_birth)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <p className="text-sm font-medium">{student.phone_number || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                      <p className="text-sm font-medium">{student.email || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-sm font-medium">
                        {student.address || "Not provided"}
                        {student.city && `, ${student.city}`}
                        {student.country && `, ${student.country}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">University</label>
                    <p className="text-sm font-medium">{universityName || `University ID: ${student.university_id || 'N/A'}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Course</label>
                    <p className="text-sm font-medium">{courseName || `Course ID: ${student.course_id || 'N/A'}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Academic Session</label>
                    <p className="text-sm font-medium">{sessionName || `Session ID: ${student.academic_session_id || 'N/A'}`}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">12th Marks</label>
                      <p className="text-sm font-medium">{student.twelfth_marks ? `${student.twelfth_marks}%` : "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Seat Number</label>
                      <p className="text-sm font-medium">{student.seat_number || "Not assigned"}</p>
                    </div>
                  </div>
                  {student.scores && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Test Scores</label>
                      <p className="text-sm font-medium">{student.scores}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Identity Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Identity Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Aadhaar Number</label>
                    <p className="text-sm font-medium font-mono">{student.aadhaar_number || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                    <p className="text-sm font-medium font-mono">{student.passport_number || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentStatus url={student.photo_url} label="Student Photo" />
                <DocumentStatus url={student.passport_copy_url} label="Passport Copy" />
                <DocumentStatus url={student.aadhaar_copy_url} label="Aadhaar Copy" />
                <DocumentStatus url={student.twelfth_certificate_url} label="12th Certificate" />
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Application Submitted</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(student.created_at)}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Updated</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(student.updated_at)}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Status</span>
                  </div>
                  <Badge variant={statusOption?.variant || "secondary"}>
                    {statusOption?.label || student.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}