
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable, { Column } from "@/components/ui/DataTable";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash } from "lucide-react";
import { feeTypesAPI, FeeType } from "@/lib/supabase-database";

const FeesType = () => {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Academic",
    frequency: "One Time",
    status: "Active",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    try {
      setLoading(true);
      const data = await feeTypesAPI.getAll();
      setFeeTypes(data);
    } catch (error) {
      console.error('Error loading fee types:', error);
      toast({
        title: "Error",
        description: "Failed to load fee types.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Fee type name is required.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        const updatedFeeType = await feeTypesAPI.update(editingId, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          frequency: formData.frequency,
          status: formData.status,
          is_active: true,
        });
        setFeeTypes(prev => prev.map(fee => 
          fee.id === editingId ? updatedFeeType : fee
        ));
        toast({
          title: "Fee Type Updated",
          description: `${formData.name} has been updated successfully.`,
        });
        setEditingId(null);
      } else {
        const newFeeType = await feeTypesAPI.create({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          frequency: formData.frequency,
          status: formData.status,
          amount: 0, // Default amount since it's set at structure level
          is_active: true,
        });
        setFeeTypes(prev => [...prev, newFeeType]);
        toast({
          title: "Fee Type Added",
          description: `${formData.name} has been added successfully.`,
        });
      }

      setFormData({ 
        name: "", 
        description: "", 
        category: "Academic",
        frequency: "One Time",
        status: "Active"
      });
    } catch (error) {
      console.error('Error saving fee type:', error);
      toast({
        title: "Error",
        description: "Failed to save fee type.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (feeType: FeeType) => {
    setFormData({
      name: feeType.name,
      description: feeType.description || "",
      category: feeType.category,
      frequency: feeType.frequency,
      status: feeType.status,
    });
    setEditingId(feeType.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await feeTypesAPI.delete(id);
      setFeeTypes(prev => prev.filter(fee => fee.id !== id));
      toast({
        title: "Fee Type Deleted",
        description: "Fee type has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting fee type:', error);
      toast({
        title: "Error",
        description: "Failed to delete fee type.",
        variant: "destructive",
      });
    }
  };

  const columns: Column<FeeType>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Category", accessorKey: "category" },
    { header: "Frequency", accessorKey: "frequency" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (feeType: FeeType) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          feeType.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {feeType.status}
        </span>
      )
    },
    { 
      header: "Created Date", 
      accessorKey: "created_at",
      cell: (feeType: FeeType) => new Date(feeType.created_at).toLocaleDateString()
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (feeType: FeeType) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(feeType)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(feeType.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <PageHeader
          title="Fees Type Management"
          description="Manage different types of fees"
        />
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Fees Type Management"
        description="Manage different types of fees"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Fee Type" : "Add New Fee Type"}</CardTitle>
            <CardDescription>
              {editingId ? "Update the fee type details" : "Create a new fee type category"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fee Type Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Tuition Fee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Accommodation">Accommodation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One Time">One Time</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Per Semester">Per Semester</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the fee type"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Add Fee Type"}
                </Button>
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ 
                        name: "", 
                        description: "", 
                        category: "Academic",
                        frequency: "One Time",
                        status: "Active"
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Existing Fee Types</CardTitle>
            <CardDescription>List of all fee types in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={feeTypes} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FeesType;
