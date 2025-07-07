
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

export interface DirectStudentFormData {
  id?: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  universityId: string;
  courseId: string;
  academicSessionId: string;
  status: "active" | "inactive" | "completed";
}

interface DirectStudentFormProps {
  initialData?: DirectStudentFormData;
  onSubmit: (data: DirectStudentFormData) => void;
  isSubmitting?: boolean;
}

const DirectStudentForm: React.FC<DirectStudentFormProps> = ({
  initialData = {
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    universityId: "",
    courseId: "",
    academicSessionId: "",
    status: "active",
  },
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<DirectStudentFormData>(initialData);
  const [universities, setUniversities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [academicSessions, setAcademicSessions] = useState<any[]>([]);

  useEffect(() => {
    // Load dropdown data
    loadUniversities();
    loadCourses();
    loadAcademicSessions();
  }, []);

  const loadUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      console.error('Error loading universities:', error);
      // Fallback data
      setUniversities([
        { id: 1, name: "Tashkent State Medical University" },
        { id: 2, name: "Samarkand State Medical University" },
        { id: 3, name: "Bukhara State Medical Institute" },
        { id: 4, name: "Qarshi State University" },
      ]);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback data
      setCourses([
        { id: 1, name: "MBBS" },
        { id: 2, name: "BDS" },
        { id: 3, name: "Pharmacy" },
        { id: 4, name: "Nursing" },
        { id: 5, name: "Pediatrics" },
      ]);
    }
  };

  const loadAcademicSessions = async () => {
    try {
      const response = await fetch('/api/academic-sessions');
      const data = await response.json();
      setAcademicSessions(data);
    } catch (error) {
      console.error('Error loading academic sessions:', error);
      // Fallback data
      setAcademicSessions([
        { id: 1, session_name: "2025-26", is_active: true },
      ]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatherName">Father's Name *</Label>
          <Input
            id="fatherName"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Enter father's name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motherName">Mother's Name *</Label>
          <Input
            id="motherName"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            placeholder="Enter mother's name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="universityId">University *</Label>
          <Select
            value={formData.universityId}
            onValueChange={(value) => handleSelectChange("universityId", value)}
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
          <Label htmlFor="courseId">Course *</Label>
          <Select
            value={formData.courseId}
            onValueChange={(value) => handleSelectChange("courseId", value)}
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
          <Label htmlFor="academicSessionId">Academic Session *</Label>
          <Select
            value={formData.academicSessionId}
            onValueChange={(value) => handleSelectChange("academicSessionId", value)}
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Student"}
      </Button>
    </form>
  );
};

export default DirectStudentForm;
