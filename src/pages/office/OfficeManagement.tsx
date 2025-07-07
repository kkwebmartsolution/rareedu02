import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DetailViewModal from "@/components/shared/DetailViewModal";
import EditModal from "@/components/shared/EditModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { officesAPI, type Office } from "@/lib/supabase-database";
import OfficeForm from "@/components/forms/OfficeForm";

const OfficeManagement = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [editedOffice, setEditedOffice] = useState<Office | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOffices();
  }, []);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const data = await officesAPI.getAll();
      setOffices(data);
    } catch (error) {
      console.error('Error loading offices:', error);
      toast({
        title: "Error",
        description: "Failed to load offices.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData =
    selectedStatus === "all"
      ? offices
      : offices.filter((office) => office.status === selectedStatus);

  const handleViewOffice = (office: Office) => {
    setSelectedOffice(office);
    setViewModalOpen(true);
  };

  const handleEditOffice = (office: Office) => {
    setSelectedOffice(office);
    setEditedOffice({...office});
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedOffice) return;

    try {
      setSaving(true);
      await officesAPI.update(editedOffice.id, {
        name: editedOffice.name,
        address: editedOffice.address,
        contact_person: editedOffice.contact_person,
        phone: editedOffice.phone,
        email: editedOffice.email,
        status: editedOffice.status,
      });
      
      toast({
        title: "Success",
        description: `Office ${editedOffice.name} has been updated.`,
      });
      
      setEditModalOpen(false);
      loadOffices(); // Reload data
    } catch (error) {
      console.error('Error updating office:', error);
      toast({
        title: "Error",
        description: "Failed to update office.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOffice = () => {
    setAddModalOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Address", "Contact Person", "Phone", "Email", "Status"],
      ...filteredData.map(office => [
        office.name,
        office.address || '',
        office.contact_person || '',
        office.phone || '',
        office.email || '',
        office.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "offices.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusOptions = [...new Set(offices.map((item) => item.status))];

  // Correctly typed columns with the actions column
  const columns = [
    { header: "Office Name", accessorKey: "name" as const },
    { header: "Address", accessorKey: "address" as const },
    { header: "Contact Person", accessorKey: "contact_person" as const },
    { header: "Phone", accessorKey: "phone" as const },
    { header: "Email", accessorKey: "email" as const },
    { 
      header: "Status", 
      accessorKey: "status" as const,
      cell: (row: Office) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: "Actions",
      accessorKey: "actions" as const,
      cell: (row: Office) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewOffice(row)}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditOffice(row)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Office Management"
        description="Manage all office locations and their details"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="default" size="sm" onClick={handleAddOffice}>
              <Plus className="mr-2 h-4 w-4" />
              Add Office
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <div className="flex gap-4">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading offices...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>

      {/* View Modal */}
      {selectedOffice && (
        <DetailViewModal
          title={`Office Details - ${selectedOffice.name}`}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Office Name</p>
              <p className="text-lg">{selectedOffice.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                selectedOffice.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {selectedOffice.status}
              </span>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-lg">{selectedOffice.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
              <p className="text-lg">{selectedOffice.contact_person || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg">{selectedOffice.phone || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{selectedOffice.email || 'N/A'}</p>
            </div>
          </div>
        </DetailViewModal>
      )}

      {/* Add Office Form */}
      <OfficeForm
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={loadOffices}
      />

      {/* Edit Modal */}
      {editedOffice && (
        <EditModal
          title={`Edit Office - ${editedOffice.name}`}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Office Name</Label>
              <Input 
                id="name" 
                value={editedOffice.name} 
                onChange={(e) => setEditedOffice({...editedOffice, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editedOffice.status}
                onValueChange={(value) => setEditedOffice({...editedOffice, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={editedOffice.address || ''} 
                onChange={(e) => setEditedOffice({...editedOffice, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input 
                id="contact_person" 
                value={editedOffice.contact_person || ''} 
                onChange={(e) => setEditedOffice({...editedOffice, contact_person: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={editedOffice.phone || ''} 
                onChange={(e) => setEditedOffice({...editedOffice, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={editedOffice.email || ''} 
                onChange={(e) => setEditedOffice({...editedOffice, email: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </EditModal>
      )}
    </MainLayout>
  );
};

export default OfficeManagement;