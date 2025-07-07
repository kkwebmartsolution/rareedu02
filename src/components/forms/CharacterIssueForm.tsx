import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { characterIssuesAPI, CreateCharacterIssueRequest } from "@/lib/character-issues-api";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
}

interface CharacterIssueFormProps {
  onSuccess: () => void;
}

export default function CharacterIssueForm({ onSuccess }: CharacterIssueFormProps) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [studentOpen, setStudentOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<CreateCharacterIssueRequest>({
    student_id: 0,
    complaint: "",
    fine_amount: 0,
    created_by: ""
  });
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open]);

  useEffect(() => {
    const filtered = students.filter(student =>
      `${student.first_name} ${student.last_name} ${student.admission_number}`
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchValue]);

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const data = await characterIssuesAPI.getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Failed to load students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || formData.student_id === 0 || !formData.complaint.trim() || formData.fine_amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Creating character issue with data:", formData);
      await characterIssuesAPI.create(formData);
      
      toast({
        title: "Success",
        description: "Character issue added successfully",
      });
      
      setFormData({
        student_id: 0,
        complaint: "",
        fine_amount: 0,
        created_by: ""
      });
      setSelectedStudent(null);
      setSearchValue("");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating character issue:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add character issue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Character Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Character Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student">Student *</Label>
            <Popover open={studentOpen} onOpenChange={setStudentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={studentOpen}
                  className="w-full justify-between"
                  disabled={studentsLoading}
                >
                  {selectedStudent
                    ? `${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.admission_number})`
                    : studentsLoading
                    ? "Loading students..."
                    : "Select student..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search students..." 
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup>
                      {filteredStudents.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={`${student.first_name} ${student.last_name} ${student.admission_number}`}
                          onSelect={() => {
                            setSelectedStudent(student);
                            setFormData({ ...formData, student_id: student.id });
                            setStudentOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStudent?.id === student.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {student.first_name} {student.last_name} ({student.admission_number})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="complaint">Complaint *</Label>
            <Textarea
              id="complaint"
              placeholder="Describe the issue..."
              value={formData.complaint}
              onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="fine_amount">Fine Amount *</Label>
            <Input
              id="fine_amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter fine amount"
              value={formData.fine_amount || ""}
              onChange={(e) => setFormData({ ...formData, fine_amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="created_by">Reported By</Label>
            <Input
              id="created_by"
              placeholder="Enter reporter name (optional)"
              value={formData.created_by}
              onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Issue
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}