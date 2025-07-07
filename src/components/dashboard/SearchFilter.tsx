
import React, { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filterType: string, value: string) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export default function SearchFilter({
  onSearch,
  onFilterChange,
  onDateRangeChange,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value);
    if (onFilterChange) onFilterChange("type", value);
  };

  const handleFilterValueChange = (value: string) => {
    setFilterValue(value);
    if (onFilterChange) onFilterChange("value", value);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (onDateRangeChange) onDateRangeChange(range);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Date Range</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  Select Range
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  // Set date range for this week
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  const endOfWeek = new Date(today);
                  endOfWeek.setDate(startOfWeek.getDate() + 6);
                  
                  const range = { from: startOfWeek, to: endOfWeek };
                  handleDateRangeChange(range);
                }}>
                  This Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Set date range for this month
                  const today = new Date();
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  
                  const range = { from: startOfMonth, to: endOfMonth };
                  handleDateRangeChange(range);
                }}>
                  This Month
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Custom Range</DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
            <DatePickerWithRange 
              date={dateRange} 
              onDateChange={handleDateRangeChange}
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center gap-2">
          <Select onValueChange={handleFilterTypeChange}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="university">University</SelectItem>
              <SelectItem value="agents">Agents</SelectItem>
              <SelectItem value="country">Country/State</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
