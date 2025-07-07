
import React from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { hostelsAPI } from "@/lib/hostels-api";
import MessBudgetCard from "@/components/hostels/MessBudgetCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const MessBudgetManagement = () => {
  const { data: hostels = [], isLoading, refetch } = useQuery({
    queryKey: ['hostels'],
    queryFn: hostelsAPI.getAll,
  });

  const handleUpdate = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading hostels...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Mess Budget Management"
        description="Set and manage annual mess budgets for each hostel. Expenses will be automatically deducted from the allocated budget."
      />

      <div className="space-y-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Set an annual mess budget for each hostel. When mess expenses are recorded, 
            the amounts will be automatically deducted from the remaining budget. 
            Budget allocations are valid for one calendar year.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => (
            <MessBudgetCard
              key={hostel.id}
              hostel={hostel}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        {hostels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hostels found. Please add hostels first to manage their mess budgets.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MessBudgetManagement;
