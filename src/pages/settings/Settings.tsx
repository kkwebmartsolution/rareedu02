
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  User,
  Users,
  FileText,
  Database,
  MessageSquare,
  Mail,
  Shield,
} from "lucide-react";

const Settings = () => {
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Settings"
        description="Configure system settings and preferences"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="backup">Data Backup</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general system preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" defaultValue="Rare Education" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" defaultValue="USD ($)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscal">Fiscal Year Start</Label>
                <Input id="fiscal" type="date" defaultValue="2025-01-01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">System Language</Label>
                <Input id="language" defaultValue="English" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-6">
                <Input placeholder="Search users..." className="max-w-sm" />
                <Button>
                  <User className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 items-center gap-4 p-4 font-medium">
                  <div>User</div>
                  <div>Email</div>
                  <div>Role</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 border-t p-4">
                  <div>Admin User</div>
                  <div>admin@rareeducation.com</div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Admin</span>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 border-t p-4">
                  <div>Finance Manager</div>
                  <div>finance@rareeducation.com</div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Finance</span>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 border-t p-4">
                  <div>Counselor</div>
                  <div>counselor@rareeducation.com</div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">Staff</span>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Placeholder content for other tabs */}
        {["categories", "backup", "whatsapp", "email", "security"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{tab.charAt(0).toUpperCase() + tab.slice(1)} Settings</CardTitle>
                <CardDescription>
                  Configure {tab} settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This section is under development. Coming soon!</p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </MainLayout>
  );
};

export default Settings;
