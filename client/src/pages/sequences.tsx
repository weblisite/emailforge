import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Trash2, Edit, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import SequenceForm from "@/components/forms/sequence-form";
import type { Sequence, SequenceWithSteps } from "@shared/schema";

export default function Sequences() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<SequenceWithSteps | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ['/api/sequences'],
    queryFn: () => api.getSequences(),
  });

  const deleteSequenceMutation = useMutation({
    mutationFn: api.deleteSequence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sequences'] });
      toast({
        title: "Sequence deleted",
        description: "The email sequence has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete sequence",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (sequence: Sequence) => {
    if (confirm(`Are you sure you want to delete "${sequence.name}"?`)) {
      deleteSequenceMutation.mutate(sequence.id);
    }
  };

  const handleUseInCampaign = (sequence: Sequence) => {
    // Store sequence data in localStorage for campaign creation
    localStorage.setItem('selectedSequenceForCampaign', JSON.stringify({
      id: sequence.id,
      name: sequence.name,
      description: sequence.description,
      steps: sequence.steps,
      isActive: sequence.isActive
    }));
    
    // Navigate to campaigns page
            window.location.href = '/dashboard/campaigns?useSequence=true';
  };

  const handleViewDetails = async (sequence: Sequence) => {
    try {
      // Fetch the complete sequence with steps
      const response = await fetch(`/api/sequences/${sequence.id}`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`,
        },
      });
      
      if (response.ok) {
        const sequenceWithSteps = await response.json();
        setSelectedSequence(sequenceWithSteps);
        setIsViewDetailsOpen(true);
      } else {
        toast({
          title: "Failed to load sequence details",
          description: "Could not retrieve sequence information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading sequence details",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Remove loading state - show content immediately

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="sequences-title">Email Sequences</h2>
          <p className="text-muted-foreground mb-0">
            Create and manage your automated email sequences
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-sequence">
              <Plus className="h-4 w-4 mr-2" />
              Create Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Sequence</DialogTitle>
              <DialogDescription>
                Create a new email sequence to automate your outreach campaigns.
              </DialogDescription>
            </DialogHeader>
            <SequenceForm 
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sequence Details: {selectedSequence?.name}</DialogTitle>
            <DialogDescription>
              View the details and email steps for this sequence.
            </DialogDescription>
          </DialogHeader>
          {selectedSequence && (
            <div className="space-y-6">
              {/* Sequence Info */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Sequence Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedSequence.name}</span>
                    </div>
                    {selectedSequence.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="font-medium">{selectedSequence.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={selectedSequence.isActive ? "badge-success" : "badge-secondary"}>
                        {selectedSequence.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(selectedSequence.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(selectedSequence.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Steps */}
              <div className="space-y-4">
                <h4 className="font-medium">Email Steps</h4>
                {selectedSequence.steps && selectedSequence.steps.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSequence.steps.map((step, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">Step {step.stepNumber}</h5>
                          <Badge variant="outline">{step.delayDays} day{step.delayDays !== 1 ? 's' : ''} delay</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Subject:</span>
                            <p className="text-sm">{step.subject}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Body:</span>
                            <p className="text-sm whitespace-pre-wrap">{step.body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No email steps found for this sequence.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sequences Grid */}
      {sequences.length > 0 ? (
        <div className="row">
          {sequences.map((sequence) => (
            <div key={sequence.id} className="col-lg-6 col-xl-4 mb-4">
              <div className="metric-card h-100" data-testid={`sequence-card-${sequence.id}`}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <h6 className="mb-1" data-testid={`sequence-name-${sequence.id}`}>
                      {sequence.name}
                    </h6>
                    {sequence.description && (
                      <p className="text-muted-foreground mb-2 text-sm">
                        {sequence.description}
                      </p>
                    )}
                    <div className="d-flex align-items-center mb-2">
                      <Badge className={sequence.isActive ? "badge-success" : "badge-secondary"}>
                        {sequence.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" data-testid={`sequence-actions-${sequence.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem data-testid={`sequence-edit-${sequence.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUseInCampaign(sequence)}
                        data-testid={`sequence-use-${sequence.id}`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Use in Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(sequence)}
                        disabled={deleteSequenceMutation.isPending}
                        className="text-destructive"
                        data-testid={`sequence-delete-${sequence.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(sequence.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date(sequence.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-top border-border">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-sm text-muted-foreground">Email Steps</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(sequence)}
                      data-testid={`sequence-view-${sequence.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="metric-card text-center py-8">
          <div className="mb-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4>No Email Sequences</h4>
            <p className="text-muted-foreground">
              Create your first email sequence to automate your outreach campaigns.
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-first-sequence">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Sequence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Email Sequence</DialogTitle>
                <DialogDescription>
                  Create a new email sequence to automate your outreach campaigns.
                </DialogDescription>
              </DialogHeader>
              <SequenceForm 
                onSuccess={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
