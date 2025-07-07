
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Student Module
import DirectStudents from "./pages/students/DirectStudents";
import AgentStudents from "./pages/students/AgentStudents";
import StudentAdmission from "./pages/students/StudentAdmission";
import Application from "./pages/students/Application";
import Character from "./pages/students/Character";
import Visa from "./pages/students/Visa";
import AdmissionLetters from "./pages/students/AdmissionLetters";

// Agent Management
import AgentManagement from "./pages/agents/AgentManagement";

// University Section
import Universities from "./pages/universities/Universities";
import UniversityDetail from "./pages/universities/UniversityDetail";

// Hostel Expenses
import HostelExpenses from "./pages/hostels/HostelExpenses";
import HostelManagement from "./pages/hostels/HostelManagement";

// Mess Management
import MessManagement from "./pages/mess/MessManagement";

// Office Expenses
import OfficeExpenses from "./pages/office/OfficeExpenses";
import OfficeManagement from "./pages/office/OfficeManagement";

// Salary Management
import SalaryManagement from "./pages/salary/SalaryManagement";

// Personal Expenses
import PersonalExpenses from "./pages/personal/PersonalExpenses";

// Fees Collection Module
import FeesType from "./pages/fees/FeesType";
import FeesMaster from "./pages/fees/FeesMaster";
import CollectFees from "./pages/fees/CollectFees";
import FeeReports from "./pages/fees/FeeReports";
import PaymentHistory from "./pages/fees/PaymentHistory";
import OneTimeChargesCustomization from "./pages/fees/OneTimeChargesCustomization";

// Reports Section
import Reports from "./pages/reports/Reports";

// Settings
import Settings from "./pages/settings/Settings";

// Auth
import Login from "./pages/auth/Login";

// Staff Management
import StaffManagement from "./pages/staff/StaffManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            {/* Student Module */}
            <Route path="/students/direct" element={<ProtectedRoute><DirectStudents /></ProtectedRoute>} />
            <Route path="/students/agent" element={<ProtectedRoute><AgentStudents /></ProtectedRoute>} />
            <Route path="/students/admission" element={<ProtectedRoute><StudentAdmission /></ProtectedRoute>} />
            <Route path="/students/application" element={<ProtectedRoute><Application /></ProtectedRoute>} />
            <Route path="/students/admission-letters" element={<ProtectedRoute><AdmissionLetters /></ProtectedRoute>} />
            <Route path="/students/character" element={<ProtectedRoute><Character /></ProtectedRoute>} />
            <Route path="/students/visa" element={<ProtectedRoute><Visa /></ProtectedRoute>} />
            
            {/* Agent Management */}
            <Route path="/agents" element={<ProtectedRoute><AgentManagement /></ProtectedRoute>} />
            
            {/* University Section */}
            <Route path="/universities" element={<ProtectedRoute><Universities /></ProtectedRoute>} />
            <Route path="/universities/:universityId" element={<ProtectedRoute><UniversityDetail /></ProtectedRoute>} />
            
            {/* Hostel Expenses */}
            <Route path="/hostels/management" element={<ProtectedRoute allowedRoles={['admin', 'hostel_team']}><HostelManagement /></ProtectedRoute>} />
            <Route path="/hostels/expenses" element={<ProtectedRoute allowedRoles={['admin', 'hostel_team']}><HostelExpenses /></ProtectedRoute>} />
            
            {/* Mess Management */}
            <Route path="/mess/management" element={<ProtectedRoute allowedRoles={['admin', 'hostel_team']}><MessManagement /></ProtectedRoute>} />
            
            {/* Office Expenses */}
            <Route path="/office-expenses/management" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><OfficeManagement /></ProtectedRoute>} />
            <Route path="/office-expenses" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><OfficeExpenses /></ProtectedRoute>} />
            
            {/* Salary Management */}
            <Route path="/salary" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><SalaryManagement /></ProtectedRoute>} />
            
            {/* Personal Expenses */}
            <Route path="/personal-expenses" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><PersonalExpenses /></ProtectedRoute>} />
            
            {/* Fees Collection Module */}
            <Route path="/fees/types" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><FeesType /></ProtectedRoute>} />
            <Route path="/fees/master" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><FeesMaster /></ProtectedRoute>} />
            <Route path="/fees/one-time-charges" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><OneTimeChargesCustomization /></ProtectedRoute>} />
            <Route path="/fees/collect" element={<ProtectedRoute allowedRoles={['admin', 'finance', 'agent']}><CollectFees /></ProtectedRoute>} />
            <Route path="/fees/reports" element={<ProtectedRoute allowedRoles={['admin', 'finance', 'agent']}><FeeReports /></ProtectedRoute>} />
            <Route path="/fees/payment-history" element={<ProtectedRoute allowedRoles={['admin', 'finance', 'agent']}><PaymentHistory /></ProtectedRoute>} />
            
            {/* Reports Section */}
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            
            {/* Settings */}
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Staff Management - Admin only */}
            <Route path="/staff" element={<ProtectedRoute requiredRole="admin"><StaffManagement /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
