
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface HostelFormData {
  id?: number;
  name: string;
  location: string;
  capacity: string;
  monthly_rent: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  facilities: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  university_id: string;
}

interface University {
  id: number;
  name: string;
}

interface HostelFormProps {
  defaultValues?: HostelFormData;
  onSubmit: (data: HostelFormData) => void;
  isSubmitting?: boolean;
}

const HostelForm: React.FC<HostelFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  const [formData, setFormData] = useState<HostelFormData>({
    name: defaultValues?.name || "",
    location: defaultValues?.location || "",
    capacity: defaultValues?.capacity || "",
    monthly_rent: defaultValues?.monthly_rent || "",
    contact_person: defaultValues?.contact_person || "",
    phone: defaultValues?.phone || "",
    email: defaultValues?.email || "",
    address: defaultValues?.address || "",
    facilities: defaultValues?.facilities || "",
    status: defaultValues?.status || "Active",
    university_id: defaultValues?.university_id || "",
    ...defaultValues,
  });

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setUniversities(data || []);
    } catch (error) {
      console.error('Error loading universities:', error);
      toast({
        title: "Error",
        description: "Failed to load universities.",
        variant: "destructive",
      });
    } finally {
      setLoadingUniversities(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof HostelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="university">University *</Label>
          <Select value={formData.university_id} onValueChange={(value) => handleChange("university_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder={loadingUniversities ? "Loading universities..." : "Select a university"} />
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
          <Label htmlFor="name">Hostel Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly_rent">Monthly Rent *</Label>
          <Input
            id="monthly_rent"
            type="number"
            step="0.01"
            value={formData.monthly_rent}
            onChange={(e) => handleChange("monthly_rent", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleChange("contact_person", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="facilities">Facilities</Label>
        <Textarea
          id="facilities"
          value={formData.facilities}
          onChange={(e) => handleChange("facilities", e.target.value)}
          rows={3}
          placeholder="List available facilities..."
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : defaultValues?.id ? "Update Hostel" : "Add Hostel"}
        </Button>
      </div>
    </form>
  );
};

export default HostelForm;
