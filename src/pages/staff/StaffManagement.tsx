import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Plus, Users, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '' as UserRole,
    agentName: '',
    agentPhone: '',
    agentLocation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, newPassword: '', staffName: '' });
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    }
  }, [isAdmin]);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStaff(data.map(user => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role as UserRole,
        isActive: user.is_active,
        createdAt: user.created_at,
      })));
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staff members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('create_staff_member', {
        email_param: formData.email,
        password_param: formData.password,
        first_name_param: formData.firstName,
        last_name_param: formData.lastName,
        role_param: formData.role,
        agent_name_param: formData.role === 'agent' ? formData.agentName : null,
        agent_phone_param: formData.role === 'agent' ? formData.agentPhone : null,
        agent_location_param: formData.role === 'agent' ? formData.agentLocation : null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Staff member created successfully. ${formData.role === 'agent' ? 'Also added to agents table.' : ''}`,
      });

      setIsDialogOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: '' as UserRole,
        agentName: '',
        agentPhone: '',
        agentLocation: '',
      });
      fetchStaff();
    } catch (error) {
      console.error('Error creating staff:', error);
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (staffMember: Staff) => {
    try {
      const { data: newPassword, error } = await supabase.rpc('reset_staff_password', {
        staff_id_param: parseInt(staffMember.id)
      });

      if (error) throw error;

      setResetPasswordDialog({
        open: true,
        newPassword: newPassword,
        staffName: `${staffMember.firstName} ${staffMember.lastName}`
      });

      toast({
        title: "Password Reset",
        description: `Password has been reset for ${staffMember.firstName} ${staffMember.lastName}`,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'default';
      case 'agent': return 'secondary';
      case 'hostel_team': return 'outline';
      case 'finance': return 'destructive';
      case 'staff': return 'secondary';
      default: return 'outline';
    }
  };

  const columns = [
    {
      accessorKey: 'firstName' as keyof Staff,
      header: 'Name',
      cell: (row: Staff) => (
        <div>
          <div className="font-medium">{row.firstName} {row.lastName}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role' as keyof Staff,
      header: 'Role',
      cell: (row: Staff) => (
        <Badge variant={getRoleBadgeVariant(row.role)}>
          {row.role.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive' as keyof Staff,
      header: 'Status',
      cell: (row: Staff) => (
        <Badge variant={row.isActive ? 'default' : 'secondary'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt' as keyof Staff,
      header: 'Created',
      cell: (row: Staff) => (
        <span className="text-sm">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'actions' as 'actions',
      header: 'Actions',
      cell: (row: Staff) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleResetPassword(row)}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Password
        </Button>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">Only administrators can access staff management.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Staff Management"
        description="Manage staff members and their roles"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-sm text-muted-foreground">
              {staff.length} staff members
            </span>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Create a new staff member account. If you select "Agent" role, the person will also be added to the agents table.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="outline" onClick={generatePassword}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="hostel_team">Hostel Team</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'agent' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name (Optional)</Label>
                      <Input
                        id="agentName"
                        value={formData.agentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
                        placeholder="Leave empty to use full name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="agentPhone">Phone</Label>
                        <Input
                          id="agentPhone"
                          value={formData.agentPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, agentPhone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agentLocation">Location</Label>
                        <Input
                          id="agentLocation"
                          value={formData.agentLocation}
                          onChange={(e) => setFormData(prev => ({ ...prev, agentLocation: e.target.value }))}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Staff Member
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              Manage all staff members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <DataTable
                columns={columns}
                data={staff}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Reset Dialog */}
      <AlertDialog 
        open={resetPasswordDialog.open} 
        onOpenChange={(open) => setResetPasswordDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset Successful</AlertDialogTitle>
            <AlertDialogDescription>
              A new password has been generated for {resetPasswordDialog.staffName}. 
              Please share this password securely with the staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">New Password:</p>
            <code className="text-lg font-mono bg-background px-3 py-2 rounded border">
              {resetPasswordDialog.newPassword}
            </code>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setResetPasswordDialog({ open: false, newPassword: '', staffName: '' })}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default StaffManagement;