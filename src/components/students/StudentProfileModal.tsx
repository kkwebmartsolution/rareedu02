import React from "react";
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
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BookOpen
} from "lucide-react";
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
  university_id?: number;
  course_id?: number;
  academic_session_id?: number;
  status: string;
  admission_number?: string;
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
  created_at?: string;
  updated_at?: string;
  // For joined data
  university_name?: string;
  course_name?: string;
  session_name?: string;
  agent_name?: string;
  agent_id?: number;
  username?: string;
  password?: string;
}

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  showAgentInfo?: boolean;
}

export default function StudentProfileModal({ 
  student, 
  isOpen, 
  onClose, 
  showAgentInfo = false 
}: StudentProfileModalProps) {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';
  
  if (!student) return null;

  const statusOptions = [
    { value: "active", label: "Active", variant: "default" as const, icon: CheckCircle },
    { value: "inactive", label: "Inactive", variant: "secondary" as const, icon: Clock },
    { value: "completed", label: "Completed", variant: "outline" as const, icon: CheckCircle },
    { value: "pending", label: "Pending", variant: "secondary" as const, icon: Clock },
    { value: "graduated", label: "Graduated", variant: "default" as const, icon: GraduationCap },
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Profile
          </DialogTitle>
          <DialogDescription>
            Complete profile details for {student.first_name} {student.last_name}
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
                      {student.admission_number && (
                        <p className="text-muted-foreground font-mono">
                          Admission: {student.admission_number}
                        </p>
                      )}
                      {student.created_at && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Enrolled on {formatDate(student.created_at)}
                        </p>
                      )}
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

            {/* Family Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                  <p className="text-sm font-medium">{student.father_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mother's Name</label>
                  <p className="text-sm font-medium">{student.mother_name}</p>
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
                    <p className="text-sm font-medium">{student.university_name || `University ID: ${student.university_id || 'N/A'}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Course</label>
                    <p className="text-sm font-medium">{student.course_name || `Course ID: ${student.course_id || 'N/A'}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Academic Session</label>
                    <p className="text-sm font-medium">{student.session_name || `Session ID: ${student.academic_session_id || 'N/A'}`}</p>
                  </div>
                  {student.twelfth_marks && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">12th Marks</label>
                      <p className="text-sm font-medium">{student.twelfth_marks}%</p>
                    </div>
                  )}
                  {student.seat_number && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Seat Number</label>
                      <p className="text-sm font-medium">{student.seat_number}</p>
                    </div>
                  )}
                  {student.scores && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Test Scores</label>
                      <p className="text-sm font-medium">{student.scores}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Agent Information (if enabled) */}
            {showAgentInfo && student.agent_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Agent Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agent Name</label>
                    <p className="text-sm font-medium">{student.agent_name}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Login Credentials */}
            {(student.username || student.password) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Login Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Username</label>
                      <p className="text-sm font-medium font-mono">{student.username || "Not generated"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Password</label>
                      <p className="text-sm font-medium font-mono">{student.password || "Not generated"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Identity Documents */}
            {(student.aadhaar_number || student.passport_number) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Identity Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {student.aadhaar_number && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Aadhaar Number</label>
                        <p className="text-sm font-medium font-mono">{student.aadhaar_number}</p>
                      </div>
                    )}
                    {student.passport_number && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                        <p className="text-sm font-medium font-mono">{student.passport_number}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}