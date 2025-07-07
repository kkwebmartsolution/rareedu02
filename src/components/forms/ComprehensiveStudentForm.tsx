
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, User, GraduationCap, Phone, Mail, Users, MapPin, CreditCard } from "lucide-react";
import { universitiesAPI, coursesAPI, academicSessionsAPI } from "@/lib/supabase-database";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ComprehensiveStudentFormData {
  id?: number;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  phone_number?: string;
  email?: string;
  university_id: number | null;
  course_id: number | null;
  academic_session_id: number | null;
  status: "active" | "inactive" | "completed";
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
  parents_phone_number?: string;
  tenth_passing_year?: string;
  twelfth_passing_year?: string;
  neet_passing_year?: string;
  tenth_marksheet_number?: string;
  pcb_average?: number;
  neet_roll_number?: string;
  qualification_status?: "qualified" | "not_qualified";
  neet_score_card_url?: string;
  tenth_marksheet_url?: string;
  affidavit_paper_url?: string;
}

interface ComprehensiveStudentFormProps {
  initialData?: ComprehensiveStudentFormData;
  onSubmit: (data: ComprehensiveStudentFormData) => void;
  isSubmitting?: boolean;
}

const ComprehensiveStudentForm: React.FC<ComprehensiveStudentFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<ComprehensiveStudentFormData>(
    initialData || {
      first_name: "",
      last_name: "",
      father_name: "",
      mother_name: "",
      date_of_birth: "",
      phone_number: "",
      email: "",
      university_id: null,
      course_id: null,
      academic_session_id: null,
      status: "active",
      city: "",
      country: "",
      address: "",
      aadhaar_number: "",
      passport_number: "",
      scores: "",
      twelfth_marks: 0,
      photo_url: "",
      passport_copy_url: "",
      aadhaar_copy_url: "",
      twelfth_certificate_url: "",
      parents_phone_number: "",
      tenth_passing_year: "",
      twelfth_passing_year: "",
      neet_passing_year: "",
      tenth_marksheet_number: "",
      pcb_average: 0,
      neet_roll_number: "",
      qualification_status: "qualified",
    }
  );

  const [universities, setUniversities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [academicSessions, setAcademicSessions] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [files, setFiles] = useState({
    studentImage: null as File | null,
    passportCopy: null as File | null,
    aadhaarCopy: null as File | null,
    twelfthCertificate: null as File | null,
    neetScoreCard: null as File | null,
    tenthMarksheet: null as File | null,
    affidavitPaper: null as File | null,
  });
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [universitiesData, coursesData, sessionsData, agentsData] = await Promise.all([
          universitiesAPI.getAll(),
          coursesAPI.getAll(),
          academicSessionsAPI.getAll(),
          supabase.from('agents').select('*').eq('status', 'Active')
        ]);
        setUniversities(universitiesData);
        setCourses(coursesData);
        setAcademicSessions(sessionsData);
        setAgents(agentsData.data || []);

        // Set default values if not editing
        if (!initialData) {
          const defaultCourse = coursesData.find(c => c.name === 'MBBS');
          const defaultSession = sessionsData.find(s => s.session_name === '2025-26');
          
          setFormData(prev => ({
            ...prev,
            course_id: defaultCourse?.id || null,
            academic_session_id: defaultSession?.id || null,
          }));
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };

    loadData();
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'twelfth_marks' || name === 'pcb_average' ? (value ? parseFloat(value) : 0) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name.includes('_id') ? (value && value !== '0' ? parseInt(value) : null) : value 
    }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Information
          </CardTitle>
          <CardDescription>Select university and course details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="university_id">University</Label>
              <Select
                value={formData.university_id?.toString() || ""}
                onValueChange={(value) => handleSelectChange("university_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id.toString()}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_id">Course</Label>
              <Select
                value={formData.course_id?.toString() || ""}
                onValueChange={(value) => handleSelectChange("course_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_session_id">Academic Session</Label>
              <Select
                value={formData.academic_session_id?.toString() || ""}
                onValueChange={(value) => handleSelectChange("academic_session_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic session" />
                </SelectTrigger>
                <SelectContent>
                  {academicSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.session_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="agent_id">Agent (Optional)</Label>
                <Select
                  value={formData.agent_id?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("agent_id", value || "0")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Direct Student (No Agent)</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Enter student's personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Family Information
          </CardTitle>
          <CardDescription>Enter parent details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name *</Label>
              <Input
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                placeholder="Enter father's name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mother_name">Mother's Name *</Label>
              <Input
                id="mother_name"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                placeholder="Enter mother's name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parents_phone_number">Parents' Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="parents_phone_number"
                  name="parents_phone_number"
                  value={formData.parents_phone_number || ""}
                  onChange={handleChange}
                  placeholder="Enter parents' phone number"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Address Information
          </CardTitle>
          <CardDescription>Enter address and location details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country || ""}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Records
          </CardTitle>
          <CardDescription>Enter academic performance and exam details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenth_passing_year">Passing Year of Class 10</Label>
              <Input
                id="tenth_passing_year"
                name="tenth_passing_year"
                value={formData.tenth_passing_year || ""}
                onChange={handleChange}
                placeholder="Enter passing year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twelfth_passing_year">Passing Year of Class 12</Label>
              <Input
                id="twelfth_passing_year"
                name="twelfth_passing_year"
                value={formData.twelfth_passing_year || ""}
                onChange={handleChange}
                placeholder="Enter passing year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neet_passing_year">Passing Year of NEET</Label>
              <Input
                id="neet_passing_year"
                name="neet_passing_year"
                value={formData.neet_passing_year || ""}
                onChange={handleChange}
                placeholder="Enter NEET passing year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenth_marksheet_number">Class 10 Marksheet Number</Label>
              <Input
                id="tenth_marksheet_number"
                name="tenth_marksheet_number"
                value={formData.tenth_marksheet_number || ""}
                onChange={handleChange}
                placeholder="Enter marksheet number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pcb_average">PCB Average</Label>
              <Input
                id="pcb_average"
                name="pcb_average"
                type="number"
                value={formData.pcb_average || ""}
                onChange={handleChange}
                placeholder="Enter PCB average"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neet_roll_number">NEET Roll Number</Label>
              <Input
                id="neet_roll_number"
                name="neet_roll_number"
                value={formData.neet_roll_number || ""}
                onChange={handleChange}
                placeholder="Enter NEET roll number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twelfth_marks">12th Grade Marks (%)</Label>
              <Input
                id="twelfth_marks"
                name="twelfth_marks"
                type="number"
                value={formData.twelfth_marks || ""}
                onChange={handleChange}
                placeholder="Enter percentage"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="scores">Test Scores/Additional Qualifications</Label>
              <Textarea
                id="scores"
                name="scores"
                value={formData.scores || ""}
                onChange={handleChange}
                placeholder="Enter any test scores (NEET, SAT, etc.) or additional qualifications"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Qualification Status
          </CardTitle>
          <CardDescription>Select qualification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qualification_status">Qualification Status</Label>
              <Select
                value={formData.qualification_status || "qualified"}
                onValueChange={(value) => handleSelectChange("qualification_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="not_qualified">Not Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.qualification_status === "not_qualified" && (
              <div className="space-y-2">
                <Label htmlFor="affidavitPaper">Affidavit Paper Upload</Label>
                <div className="relative">
                  <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="affidavitPaper"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("affidavitPaper", e)}
                    className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                  />
                </div>
                {files.affidavitPaper && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {files.affidavitPaper.name}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identity Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Identity Documents
          </CardTitle>
          <CardDescription>Enter identification numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
              <Input
                id="aadhaar_number"
                name="aadhaar_number"
                value={formData.aadhaar_number || ""}
                onChange={handleChange}
                placeholder="Enter Aadhaar number"
                maxLength={12}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport_number">Passport Number</Label>
              <Input
                id="passport_number"
                name="passport_number"
                value={formData.passport_number || ""}
                onChange={handleChange}
                placeholder="Enter passport number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Document Uploads
          </CardTitle>
          <CardDescription>Upload student documents (PDF, JPG, PNG accepted)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentImage">Student Photo</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studentImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("studentImage", e)}
                  className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                />
              </div>
              {files.studentImage && (
                <p className="text-sm text-muted-foreground">
                  Selected: {files.studentImage.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportCopy">Passport Copy</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passportCopy"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("passportCopy", e)}
                  className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                />
              </div>
              {files.passportCopy && (
                <p className="text-sm text-muted-foreground">
                  Selected: {files.passportCopy.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaarCopy">Aadhaar Copy</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="aadhaarCopy"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("aadhaarCopy", e)}
                  className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                />
              </div>
              {files.aadhaarCopy && (
                <p className="text-sm text-muted-foreground">
                  Selected: {files.aadhaarCopy.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twelfthCertificate">12th Grade Certificate</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twelfthCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("twelfthCertificate", e)}
                  className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                />
              </div>
              {files.twelfthCertificate && (
                <p className="text-sm text-muted-foreground">
                  Selected: {files.twelfthCertificate.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="neetScoreCard">NEET Score Card</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="neetScoreCard"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("neetScoreCard", e)}
                  className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                />
              </div>
              {files.neetScoreCard && (
                <p className="text-sm text-muted-foreground">
                  Selected: {files.neetScoreCard.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenthMarksheet">10th Marksheet</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tenthMarksheet"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("tenthMarksheet", e)}
                  className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                />
              </div>
              {files.tenthMarksheet && (
                <p className="text-sm text-muted-foreground">
                  Selected: {files.tenthMarksheet.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (initialData ? "Updating Applicant..." : "Adding Applicant...") : (initialData ? "Update Applicant" : "Add Applicant")}
      </Button>
    </form>
  );
};

export default ComprehensiveStudentForm;
