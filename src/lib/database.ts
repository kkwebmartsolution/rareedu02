
// Database configuration
const DB_CONFIG = {
  host: 'srv1554.hstgr.io',
  database: 'u350554738_rareeducation',
  username: 'u350554738_rareeducation',
  password: 'HSZDS68m:',
};

// Since we're in a frontend environment, we'll create API endpoints
// This file contains the database queries that would be used in a backend

export interface Student {
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
  status: 'active' | 'inactive' | 'completed';
  university_name?: string;
  course_name?: string;
  session_name?: string;
  created_at: string;
}

export interface University {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  name: string;
}

export interface AcademicSession {
  id: number;
  session_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// API endpoints for database operations
export const studentAPI = {
  getAll: async (): Promise<Student[]> => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  create: async (studentData: Omit<Student, 'id' | 'created_at' | 'university_name' | 'course_name' | 'session_name'>): Promise<Student> => {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error('Failed to create student');
    return response.json();
  },

  update: async (id: number, studentData: Partial<Student>): Promise<Student> => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete student');
  },
};

export const universityAPI = {
  getAll: async (): Promise<University[]> => {
    try {
      const response = await fetch('/api/universities');
      if (!response.ok) throw new Error('Failed to fetch universities');
      return response.json();
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
  },
};

export const courseAPI = {
  getAll: async (): Promise<Course[]> => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },
};

export const academicSessionAPI = {
  getAll: async (): Promise<AcademicSession[]> => {
    try {
      const response = await fetch('/api/academic-sessions');
      if (!response.ok) throw new Error('Failed to fetch academic sessions');
      return response.json();
    } catch (error) {
      console.error('Error fetching academic sessions:', error);
      return [];
    }
  },
};
