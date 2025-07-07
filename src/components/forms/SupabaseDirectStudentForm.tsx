import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, User, GraduationCap, Phone, Mail, Users, MapPin, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { universitiesAPI, coursesAPI, academicSessionsAPI, University, Course, AcademicSession } from "@/lib/supabase-database";

export interface SupabaseDirectStudentFormData {
  id?: number;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  university_id: number;
  course_id: number;
  academic_session_id: number;
  status: "active" | "inactive" | "completed";
  admission_number?: string;
  city?: string;
  country?: string;
  address?: string;
  aadhaar_number?: string;
  passport_number?: string;
  seat_number?: string;
  scores?: string;
  twelfth_marks?: number;
  agent_id?: number;
  photo_url?: string;
  passport_copy_url?: string;
  aadhaar_copy_url?: string;
  twelfth_certificate_url?: string;
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

interface SupabaseDirectStudentFormProps {
  initialData?: SupabaseDirectStudentFormData;
  onSubmit: (data: SupabaseDirectStudentFormData) => void;
  isSubmitting?: boolean;
}

const SupabaseDirectStudentForm: React.FC<SupabaseDirectStudentFormProps> = ({
  initialData = {
    first_name: "",
    last_name: "",
    father_name: "",
    mother_name: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
    university_id: 0,
    course_id: 0,
    academic_session_id: 0,
    status: "active",
    admission_number: "",
    city: "",
    country: "",
    address: "",
    aadhaar_number: "",
    passport_number: "",
    seat_number: "",
    scores: "",
    twelfth_marks: 0,
    agent_id: 0,
    parents_phone_number: "",
    tenth_passing_year: "",
    twelfth_passing_year: "",
    neet_passing_year: "",
    tenth_marksheet_number: "",
    pcb_average: 0,
    neet_roll_number: "",
    qualification_status: "qualified",
  },
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<SupabaseDirectStudentFormData>(initialData);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [files, setFiles] = useState({
    studentImage: null as File | null,
    passportCopy: null as File | null,
    aadhaarCopy: null as File | null,
    twelfthCertificate: null as File | null,
    neetScoreCard: null as File | null,
    tenthMarksheet: null as File | null,
    affidavitPaper: null as File | null,
  });

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      setLoading(true);
      const [universitiesData, coursesData, sessionsData] = await Promise.all([
        universitiesAPI.getAll(),
        coursesAPI.getAll(),
        academicSessionsAPI.getAll(),
      ]);

      setUniversities(universitiesData);
      setCourses(coursesData);
      setAcademicSessions(sessionsData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'twelfth_marks' || name === 'agent_id' || name === 'pcb_average' ? 
        (value === '' ? undefined : parseFloat(value)) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name.includes('_id') ? parseInt(value) : value 
    }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let updatedFormData = { ...formData };
      
      // For now, just notify about file uploads (Firebase upload will be added later)
      if (files.studentImage || files.passportCopy || files.aadhaarCopy || files.twelfthCertificate || files.neetScoreCard || files.tenthMarksheet || files.affidavitPaper) {
        toast({
          title: "Note",
          description: "File upload functionality will be available soon. Form data saved without files.",
        });
      }
      
      onSubmit(updatedFormData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading form data...</div>;
  }

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="university_id">University *</Label>
              <Select
                value={formData.university_id.toString()}
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
              <Label htmlFor="course_id">Course *</Label>
              <Select
                value={formData.course_id.toString()}
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
              <Label htmlFor="academic_session_id">Academic Session *</Label>
              <Select
                value={formData.academic_session_id.toString()}
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

            <div className="space-y-2">
              <Label htmlFor="admission_number">Admission Number</Label>
              <Input
                id="admission_number"
                name="admission_number"
                value={formData.admission_number || ""}
                onChange={handleChange}
                placeholder="Auto-generated or enter manually"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seat_number">Seat Number</Label>
              <Input
                id="seat_number"
                name="seat_number"
                value={formData.seat_number || ""}
                onChange={handleChange}
                placeholder="Enter seat number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

            <div className="space-y-2 md:col-span-2">
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

            <div className="space-y-2">
              <Label htmlFor="agent_id">Agent ID</Label>
              <Input
                id="agent_id"
                name="agent_id"
                type="number"
                value={formData.agent_id || ""}
                onChange={handleChange}
                placeholder="Enter agent ID (if applicable)"
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

      <Button type="submit" disabled={isSubmitting || uploadingFiles}>
        {uploadingFiles ? "Uploading Documents..." : isSubmitting ? "Saving..." : "Save Applicant"}
      </Button>
    </form>
  );
};

export default SupabaseDirectStudentForm;
