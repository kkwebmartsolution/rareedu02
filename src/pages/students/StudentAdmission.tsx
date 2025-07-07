
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Upload, User, GraduationCap, Phone, Mail, Users, FileText, MapPin, CreditCard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const StudentAdmission = () => {
  const [formData, setFormData] = useState({
    university: "",
    course: "",
    academicSession: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: null as Date | null,
    fatherName: "",
    motherName: "",
    city: "",
    country: "",
    address: "",
    aadhaarNumber: "",
    passportNumber: "",
    twelfthMarks: "",
    seatNumber: "",
    scores: "",
    studentImage: null as File | null,
    passportCopy: null as File | null,
    aadhaarCopy: null as File | null,
    twelfthCertificate: null as File | null,
  });

  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const universities = [
    { id: "1", name: "Tashkent State Medical University" },
    { id: "2", name: "Samarkand State Medical University" },
    { id: "3", name: "Bukhara State Medical Institute" },
    { id: "4", name: "Qarshi State University" },
  ];

  const courses = [
    { id: "1", name: "MBBS" },
    { id: "2", name: "BDS" },
    { id: "3", name: "Pharmacy" },
    { id: "4", name: "Nursing" },
    { id: "5", name: "Pediatrics" },
  ];

  const academicSessions = [
    { id: "1", name: "2025-26" },
    { id: "2", name: "2024-25" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // For now, return empty string - file upload can be implemented later
    console.log('File upload placeholder for:', file.name);
    return '';
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, dateOfBirth: date || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.university || !formData.course || !formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      setUploadingDocuments(true);
      
      // Upload documents to Cloudinary (or your preferred service)
      const documentUrls = {
        photo_url: '',
        passport_copy_url: '',
        aadhaar_copy_url: '',
        twelfth_certificate_url: '',
      };

      if (formData.studentImage) {
        documentUrls.photo_url = await uploadToCloudinary(formData.studentImage);
      }
      if (formData.passportCopy) {
        documentUrls.passport_copy_url = await uploadToCloudinary(formData.passportCopy);
      }
      if (formData.aadhaarCopy) {
        documentUrls.aadhaar_copy_url = await uploadToCloudinary(formData.aadhaarCopy);
      }
      if (formData.twelfthCertificate) {
        documentUrls.twelfth_certificate_url = await uploadToCloudinary(formData.twelfthCertificate);
      }

      setUploadingDocuments(false);

      // Submit to Supabase
      const { error } = await supabase
        .from('apply_students')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          father_name: formData.fatherName,
          mother_name: formData.motherName,
          date_of_birth: formData.dateOfBirth?.toISOString().split('T')[0],
          phone_number: formData.phoneNumber,
          email: formData.email,
          university_id: parseInt(formData.university),
          course_id: parseInt(formData.course),
          academic_session_id: parseInt(formData.academicSession || "1"),
          city: formData.city,
          country: formData.country,
          address: formData.address,
          aadhaar_number: formData.aadhaarNumber,
          passport_number: formData.passportNumber,
          twelfth_marks: parseFloat(formData.twelfthMarks) || null,
          seat_number: formData.seatNumber,
          scores: formData.scores,
          ...documentUrls,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Application Submitted Successfully",
        description: `${formData.firstName} ${formData.lastName}'s application has been submitted for review.`,
      });
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadingDocuments(false);
    }
  };

  const resetForm = () => {
    setFormData({
      university: "",
      course: "",
      academicSession: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: null,
      fatherName: "",
      motherName: "",
      city: "",
      country: "",
      address: "",
      aadhaarNumber: "",
      passportNumber: "",
      twelfthMarks: "",
      seatNumber: "",
      scores: "",
      studentImage: null,
      passportCopy: null,
      aadhaarCopy: null,
      twelfthCertificate: null,
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Student Admission"
        description="Admit new students to universities and courses"
      />
      
      <div className="space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">Select University *</Label>
                <Select value={formData.university} onValueChange={(value) => handleInputChange("university", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Select Course *</Label>
                <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicSession">Academic Session</Label>
                <Select value={formData.academicSession} onValueChange={(value) => handleInputChange("academicSession", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose session" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name}
                      </SelectItem>
                    ))}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
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
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfBirth}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentImage">Student Photo</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="studentImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("studentImage", e)}
                        className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                      />
                    </div>
                  </div>
                  {formData.studentImage && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {formData.studentImage.name}
                    </p>
                  )}
                </div>
              </div>
            </form>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter country"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name *</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name *</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange("motherName", e.target.value)}
                  placeholder="Enter mother's name"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twelfthMarks">12th Grade Marks (%)</Label>
                <Input
                  id="twelfthMarks"
                  type="number"
                  value={formData.twelfthMarks}
                  onChange={(e) => handleInputChange("twelfthMarks", e.target.value)}
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seatNumber">Seat Number</Label>
                <Input
                  id="seatNumber"
                  value={formData.seatNumber}
                  onChange={(e) => handleInputChange("seatNumber", e.target.value)}
                  placeholder="Enter seat number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="scores">Test Scores/Additional Qualifications</Label>
                <Textarea
                  id="scores"
                  value={formData.scores}
                  onChange={(e) => handleInputChange("scores", e.target.value)}
                  placeholder="Enter any test scores (NEET, SAT, etc.) or additional qualifications"
                  rows={3}
                />
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                <Input
                  id="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
                  placeholder="Enter Aadhaar number"
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                  placeholder="Enter passport number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Document Uploads
            </CardTitle>
            <CardDescription>Upload required documents (PDF, JPG, PNG accepted)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {formData.passportCopy && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.passportCopy.name}
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
                {formData.aadhaarCopy && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.aadhaarCopy.name}
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
                {formData.twelfthCertificate && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.twelfthCertificate.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={resetForm}
              >
                Reset Form
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || uploadingDocuments}
                onClick={handleSubmit}
              >
                {uploadingDocuments ? "Uploading Documents..." : isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StudentAdmission;
