
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Eye, Edit, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import DetailViewModal from "@/components/shared/DetailViewModal";
import EditModal from "@/components/shared/EditModal";
import AgentForm, { AgentFormData } from "@/components/forms/AgentForm";

import { agentsAPI, Agent } from "@/lib/agents-api";
import { useAuth } from "@/contexts/AuthContext";

const AgentManagement = () => {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load agents data
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await agentsAPI.getAll();
      
      // Filter agents based on user role
      if (user?.role === 'agent' && user?.email) {
        // If user is an agent, only show their own record
        const filteredData = data.filter(agent => agent.email === user.email);
        setAgents(filteredData);
      } else {
        // If user is admin or other roles, show all agents
        setAgents(data);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: "Error",
        description: "Failed to load agents data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.location && agent.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setIsViewModalOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleAddAgent = () => {
    setIsAddModalOpen(true);
  };

  const handleUpdatePaymentStatus = async (agent: Agent) => {
    const newStatus = agent.payment_status === 'Paid' ? 'Unpaid' : 'Paid';
    
    try {
      await agentsAPI.updatePaymentStatus(agent.id, newStatus);
      
      toast({
        title: "Payment Status Updated",
        description: `${agent.name}'s payment status changed to ${newStatus}.`,
      });
      
      // Reload agents data
      await loadAgents();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAgent = async (formData: AgentFormData) => {
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        // Update existing agent
        await agentsAPI.update(formData.id, {
          name: formData.name,
          email: formData.email,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          location: formData.location,
          status: formData.status,
        });
        
        toast({
          title: "Agent Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Add new agent
        await agentsAPI.create({
          name: formData.name,
          email: formData.email,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          location: formData.location,
          status: formData.status,
        });
        
        toast({
          title: "Agent Added",
          description: `${formData.name} has been added successfully.`,
        });
      }
      
      // Reload agents data
      await loadAgents();
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Error",
        description: "Failed to save agent data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Import functionality will be available shortly.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Export functionality will be available shortly.",
    });
  };

  const columns = [
    { header: "Agent Name", accessorKey: "name" as keyof Agent },
    { header: "Contact Person", accessorKey: "contact_person" as keyof Agent },
    { header: "Email", accessorKey: "email" as keyof Agent },
    { header: "Location", accessorKey: "location" as keyof Agent },
    { header: "Students Count", accessorKey: "students_count" as keyof Agent },
    { 
      header: "Total Receivable", 
      accessorKey: "total_received" as keyof Agent,
      cell: (row: Agent) => (
        <span className={`font-medium ${
          row.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-600'
        }`}>
          ${(row.total_received || 0).toFixed(2)}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Agent,
      cell: (row: Agent) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as "actions",
      cell: (row: Agent) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleViewAgent(row)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          {(isAdmin || user?.email === row.email) && (
            <Button variant="outline" size="sm" onClick={() => handleEditAgent(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading agents...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title={user?.role === 'agent' ? "My Agent Profile" : "Agent Management"}
        description={
          user?.role === 'agent' 
            ? "View and manage your agent profile and students" 
            : "Manage all education agents, their students, and commission structures"
        }
        actions={
          isAdmin ? (
            <>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="default" size="sm" onClick={handleAddAgent}>
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Search by name, contact person, email or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <DataTable columns={columns} data={filteredData} />
      </div>
      
      {/* Add Agent Modal */}
      <EditModal
        title="Add New Agent"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <AgentForm 
          onSubmit={handleSaveAgent}
          isSubmitting={isSubmitting}
        />
      </EditModal>
      
      {/* View Agent Modal */}
      {currentAgent && (
        <DetailViewModal
          title={`Agent: ${currentAgent.name}`}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Agent Name</h3>
              <p>{currentAgent.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Contact Person</h3>
              <p>{currentAgent.contact_person}</p>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>{currentAgent.email}</p>
            </div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p>{currentAgent.phone || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p>{currentAgent.location || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Students Count</h3>
              <p>{currentAgent.students_count}</p>
            </div>
            <div>
              <h3 className="font-semibold">Total Receivable</h3>
              <p className={`font-medium ${
                currentAgent.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-600'
              }`}>
                ${(currentAgent.total_received || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{currentAgent.status}</p>
            </div>
            {isAdmin && (
              <div>
                <h3 className="font-semibold">Payment Status</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      currentAgent.payment_status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {currentAgent.payment_status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUpdatePaymentStatus(currentAgent)}
                    className="flex items-center"
                  >
                    <DollarSign className="mr-1 h-3 w-3" />
                    Mark as {currentAgent.payment_status === 'Paid' ? 'Unpaid' : 'Paid'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DetailViewModal>
      )}
      
      {/* Edit Agent Modal */}
      {currentAgent && (
        <EditModal
          title={`Edit Agent: ${currentAgent.name}`}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <AgentForm 
            defaultValues={{
              id: currentAgent.id,
              name: currentAgent.name,
              contactPerson: currentAgent.contact_person,
              email: currentAgent.email,
              phone: currentAgent.phone || '',
              location: currentAgent.location || '',
              status: currentAgent.status || 'Active',
            }}
            onSubmit={handleSaveAgent}
            isSubmitting={isSubmitting}
          />
        </EditModal>
      )}

    </MainLayout>
  );
};

export default AgentManagement;
