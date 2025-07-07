
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ApplyStudent = Tables<"apply_students">;

interface AgentApplicationEditFormProps {
  application: ApplyStudent;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  parents_phone_number: string;
  city: string;
  country: string;
  address: string;
  aadhaar_number: string;
  passport_number: string;
  twelfth_marks: string;
  pcb_average: string;
  neet_roll_number: string;
  neet_passing_year: string;
  tenth_marksheet_number: string;
  tenth_passing_year: string;
  twelfth_passing_year: string;
  seat_number: string;
  scores: string;
}

export default function AgentApplicationEditForm({ 
  application, 
  onSuccess, 
  onCancel 
}: AgentApplicationEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      first_name: application.first_name || "",
      last_name: application.last_name || "",
      father_name: application.father_name || "",
      mother_name: application.mother_name || "",
      date_of_birth: application.date_of_birth || "",
      email: application.email || "",
      phone_number: application.phone_number || "",
      parents_phone_number: application.parents_phone_number || "",
      city: application.city || "",
      country: application.country || "",
      address: application.address || "",
      aadhaar_number: application.aadhaar_number || "",
      passport_number: application.passport_number || "",
      twelfth_marks: application.twelfth_marks?.toString() || "",
      pcb_average: application.pcb_average?.toString() || "",
      neet_roll_number: application.neet_roll_number || "",
      neet_passing_year: application.neet_passing_year || "",
      tenth_marksheet_number: application.tenth_marksheet_number || "",
      tenth_passing_year: application.tenth_passing_year || "",
      twelfth_passing_year: application.twelfth_passing_year || "",
      seat_number: application.seat_number || "",
      scores: application.scores || "",
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        twelfth_marks: data.twelfth_marks ? parseFloat(data.twelfth_marks) : null,
        pcb_average: data.pcb_average ? parseFloat(data.pcb_average) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('apply_students')
        .update(updateData)
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application updated successfully.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              {...register("first_name", { required: "First name is required" })}
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              {...register("last_name", { required: "Last name is required" })}
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="father_name">Father's Name *</Label>
            <Input
              id="father_name"
              {...register("father_name", { required: "Father's name is required" })}
              className={errors.father_name ? "border-red-500" : ""}
            />
            {errors.father_name && (
              <p className="text-red-500 text-sm mt-1">{errors.father_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="mother_name">Mother's Name *</Label>
            <Input
              id="mother_name"
              {...register("mother_name", { required: "Mother's name is required" })}
              className={errors.mother_name ? "border-red-500" : ""}
            />
            {errors.mother_name && (
              <p className="text-red-500 text-sm mt-1">{errors.mother_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date_of_birth">Date of Birth *</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth", { required: "Date of birth is required" })}
              className={errors.date_of_birth ? "border-red-500" : ""}
            />
            {errors.date_of_birth && (
              <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
            />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              {...register("phone_number")}
            />
          </div>

          <div>
            <Label htmlFor="parents_phone_number">Parents Phone Number</Label>
            <Input
              id="parents_phone_number"
              {...register("parents_phone_number")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("city")}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register("country")}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="twelfth_marks">12th Marks (%)</Label>
            <Input
              id="twelfth_marks"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("twelfth_marks")}
            />
          </div>

          <div>
            <Label htmlFor="pcb_average">PCB Average (%)</Label>
            <Input
              id="pcb_average"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("pcb_average")}
            />
          </div>

          <div>
            <Label htmlFor="tenth_passing_year">10th Passing Year</Label>
            <Input
              id="tenth_passing_year"
              {...register("tenth_passing_year")}
            />
          </div>

          <div>
            <Label htmlFor="twelfth_passing_year">12th Passing Year</Label>
            <Input
              id="twelfth_passing_year"
              {...register("twelfth_passing_year")}
            />
          </div>

          <div>
            <Label htmlFor="neet_roll_number">NEET Roll Number</Label>
            <Input
              id="neet_roll_number"
              {...register("neet_roll_number")}
            />
          </div>

          <div>
            <Label htmlFor="neet_passing_year">NEET Passing Year</Label>
            <Input
              id="neet_passing_year"
              {...register("neet_passing_year")}
            />
          </div>

          <div>
            <Label htmlFor="seat_number">Seat Number</Label>
            <Input
              id="seat_number"
              {...register("seat_number")}
            />
          </div>

          <div>
            <Label htmlFor="tenth_marksheet_number">10th Marksheet Number</Label>
            <Input
              id="tenth_marksheet_number"
              {...register("tenth_marksheet_number")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
            <Input
              id="aadhaar_number"
              {...register("aadhaar_number")}
            />
          </div>

          <div>
            <Label htmlFor="passport_number">Passport Number</Label>
            <Input
              id="passport_number"
              {...register("passport_number")}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="scores">Additional Scores/Notes</Label>
            <Textarea
              id="scores"
              {...register("scores")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Application"}
        </Button>
      </div>
    </form>
  );
}
