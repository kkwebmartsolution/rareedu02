
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface StudentSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const StudentSearch: React.FC<StudentSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="mb-6">
      <Label htmlFor="student-search" className="text-base font-medium">
        Search Students
      </Label>
      <div className="relative mt-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="student-search"
          type="text"
          placeholder="Search by name, phone number, or university..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default StudentSearch;
