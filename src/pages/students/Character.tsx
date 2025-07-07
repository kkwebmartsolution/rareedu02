import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, Trash2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { characterIssuesAPI, CharacterIssue } from "@/lib/character-issues-api";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import CharacterIssueForm from "@/components/forms/CharacterIssueForm";
import DataTable, { Column } from "@/components/ui/DataTable";

export default function Character() {
  const [characterIssues, setCharacterIssues] = useState<CharacterIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCharacterIssues();
  }, []);

  const loadCharacterIssues = async () => {
    try {
      setLoading(true);
      const data = await characterIssuesAPI.getAll();
      setCharacterIssues(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load character issues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectFine = async (issueId: number) => {
    try {
      await characterIssuesAPI.resolveFine(issueId);
      toast({
        title: "Success",
        description: "Fine collected successfully. Student removed from character issues.",
      });
      loadCharacterIssues(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to collect fine",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    try {
      await characterIssuesAPI.delete(issueId);
      toast({
        title: "Success",
        description: "Character issue deleted successfully",
      });
      loadCharacterIssues(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete issue",
        variant: "destructive",
      });
    }
  };

  const columns: Column<CharacterIssue>[] = [
    {
      header: "Student Name",
      accessorKey: "students",
      cell: (row) => (
        <div>
          <div className="font-medium">
            {row.students?.first_name} {row.students?.last_name}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.students?.admission_number}
          </div>
        </div>
      ),
    },
    {
      header: "Complaint",
      accessorKey: "complaint",
      cell: (row) => (
        <div className="max-w-md">
          <p className="text-sm">{row.complaint}</p>
        </div>
      ),
    },
    {
      header: "Fine Amount",
      accessorKey: "fine_amount",
      cell: (row) => (
        <div className="font-medium">
          ₹{row.fine_amount.toLocaleString()}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "fine_collected",
      cell: (row) => (
        <Badge variant={row.fine_collected ? "default" : "destructive"}>
          {row.fine_collected ? "Resolved" : "Pending"}
        </Badge>
      ),
    },
    {
      header: "Date",
      accessorKey: "created_at",
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          {!row.fine_collected && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="default">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Collect Fine
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Collect Fine</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mark the fine of ₹{row.fine_amount.toLocaleString()} as collected? 
                    This will resolve the issue and remove the student from this list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCollectFine(row.id)}>
                    Collect Fine
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Character Issue</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this character issue? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteIssue(row.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Character Issues"
          description="Manage student disciplinary issues and fines"
        />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total Pending Fines: ₹
                {characterIssues
                  .filter(issue => !issue.fine_collected)
                  .reduce((sum, issue) => sum + issue.fine_amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
          <CharacterIssueForm onSuccess={loadCharacterIssues} />
        </div>

        <div className="bg-card rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground">Loading character issues...</div>
            </div>
          ) : characterIssues.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground">No character issues found</div>
            </div>
          ) : (
            <DataTable columns={columns} data={characterIssues} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}