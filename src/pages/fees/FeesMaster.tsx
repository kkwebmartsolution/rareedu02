import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable, { Column } from "@/components/ui/DataTable";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Save, X, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  universitiesAPI,
  coursesAPI,
  feeTypesAPI,
  feeStructuresAPI,
  feeStructureComponentsAPI,
  type University,
  type Course,
  type FeeType,
  type FeeStructure,
  type FeeStructureComponent
} from "@/lib/supabase-database";

interface FeeComponent {
  feeTypeId: number;
  amount: string;
  frequency: 'one-time' | 'yearly' | 'semester-wise';
}

const FeesMaster = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [structureName, setStructureName] = useState("");
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([]);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [editingComponents, setEditingComponents] = useState<FeeStructureComponent[]>([]);

  // Fetch data
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: universitiesAPI.getAll,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesAPI.getAll,
  });

  const { data: feeTypes = [] } = useQuery({
    queryKey: ['feeTypes'],
    queryFn: feeTypesAPI.getAll,
  });

  const { data: feeStructures = [], refetch: refetchStructures } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: feeStructuresAPI.getAll,
  });

  // Mutations
  const createStructureMutation = useMutation({
    mutationFn: async (structureData: Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>) => {
      const structure = await feeStructuresAPI.create(structureData);
      
      // Create components
      for (const component of feeComponents) {
        await feeStructureComponentsAPI.create({
          fee_structure_id: structure.id,
          fee_type_id: component.feeTypeId,
          amount: parseFloat(component.amount),
          frequency: component.frequency,
        });
      }
      
      // Assign to students
      const assignedCount = await feeStructuresAPI.assignToStudents(structure.id);
      
      return { structure, assignedCount };
    },
    onSuccess: ({ assignedCount }) => {
      toast({
        title: "Fee Structure Created",
        description: `Fee structure created and assigned to ${assignedCount} students.`,
      });
      resetForm();
      refetchStructures();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create fee structure.",
        variant: "destructive",
      });
      console.error('Create structure error:', error);
    },
  });

  const updateComponentMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      feeStructureComponentsAPI.update(id, { amount }),
    onSuccess: () => {
      toast({
        title: "Component Updated",
        description: "Fee component amount updated successfully.",
      });
      refetchStructures();
    },
  });

  const deleteStructureMutation = useMutation({
    mutationFn: feeStructuresAPI.delete,
    onSuccess: () => {
      toast({
        title: "Fee Structure Deleted",
        description: "Fee structure deleted successfully.",
      });
      refetchStructures();
    },
  });

  const addFeeComponent = () => {
    setFeeComponents([...feeComponents, { feeTypeId: 0, amount: "", frequency: "one-time" }]);
  };

  const updateFeeComponent = (index: number, field: keyof FeeComponent, value: string | number) => {
    const updated = [...feeComponents];
    updated[index] = { ...updated[index], [field]: value };
    setFeeComponents(updated);
  };

  const removeFeeComponent = (index: number) => {
    setFeeComponents(feeComponents.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedUniversity("");
    setSelectedCourse("");
    setStructureName("");
    setFeeComponents([]);
    setEditingStructure(null);
    setEditingComponents([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUniversity || !selectedCourse || !structureName || feeComponents.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and add at least one fee component.",
        variant: "destructive",
      });
      return;
    }

    if (feeComponents.some(comp => !comp.feeTypeId || !comp.amount)) {
      toast({
        title: "Error",
        description: "Please complete all fee component details.",
        variant: "destructive",
      });
      return;
    }

    createStructureMutation.mutate({
      university_id: parseInt(selectedUniversity),
      course_id: parseInt(selectedCourse),
      name: structureName,
      is_active: true,
    });
  };

  const handleEditComponent = async (componentId: number, newAmount: number) => {
    updateComponentMutation.mutate({ id: componentId, amount: newAmount });
  };

  const feeStructureColumns: Column<FeeStructure>[] = [
    { header: "Structure Name", accessorKey: "name" },
    {
      header: "University",
      accessorKey: "university_id",
      cell: (structure: FeeStructure) => {
        const university = universities.find(u => u.id === structure.university_id);
        return university?.name || "Unknown";
      }
    },
    {
      header: "Course",
      accessorKey: "course_id",
      cell: (structure: FeeStructure) => {
        const course = courses.find(c => c.id === structure.course_id);
        return course?.name || "Unknown";
      }
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: (structure: FeeStructure) => (
        <span className={`px-2 py-1 rounded text-xs ${structure.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {structure.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (structure: FeeStructure) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingStructure(structure)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteStructureMutation.mutate(structure.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Fees Master"
        description="View fee structures for universities and courses"
        actions={
          (user?.role === 'admin' || user?.role === 'finance') && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/fees/one-time-charges')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Customize One-Time Charges
            </Button>
          )
        }
      />
      
      <div className="space-y-6">
        {/* Fee Structure Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Fee Structure</CardTitle>
            <CardDescription>
              Set up fee components for a specific university and course combination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University *</Label>
                  <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
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
                  <Label htmlFor="course">Course *</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
                  <Label htmlFor="structureName">Structure Name *</Label>
                  <Input
                    id="structureName"
                    value={structureName}
                    onChange={(e) => setStructureName(e.target.value)}
                    placeholder="Enter structure name"
                  />
                </div>
              </div>

              {/* Fee Components */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Fee Components</Label>
                  <Button type="button" onClick={addFeeComponent} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Component
                  </Button>
                </div>

                {feeComponents.map((component, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Fee Type *</Label>
                      <Select
                        value={component.feeTypeId.toString()}
                        onValueChange={(value) => updateFeeComponent(index, "feeTypeId", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeTypes.map((feeType) => (
                            <SelectItem key={feeType.id} value={feeType.id.toString()}>
                              {feeType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount ($) *</Label>
                      <Input
                        type="number"
                        value={component.amount}
                        onChange={(e) => updateFeeComponent(index, "amount", e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Frequency *</Label>
                      <Select
                        value={component.frequency}
                        onValueChange={(value) => updateFeeComponent(index, "frequency", value as 'one-time' | 'yearly' | 'semester-wise')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One-time</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="semester-wise">Semester-wise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFeeComponent(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={createStructureMutation.isPending} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {createStructureMutation.isPending ? "Creating..." : "Create Fee Structure"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Fee Structures */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Fee Structures</CardTitle>
            <CardDescription>
              Manage existing fee structures and their components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={feeStructureColumns} data={feeStructures} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FeesMaster;
