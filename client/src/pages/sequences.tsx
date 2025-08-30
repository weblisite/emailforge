import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Trash2, Edit, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import SequenceForm from "@/components/forms/sequence-form";
import type { Sequence } from "@shared/schema";

export default function Sequences() {
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="animate-pulse text-xl font-medium text-primary mb-2">Loading Sequences...</div>
          <div className="text-muted-foreground">Fetching your email sequences</div>
        </div>
      </div>
    );
  }

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
            </DialogHeader>
            <SequenceForm 
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

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
                      <DropdownMenuItem data-testid={`sequence-use-${sequence.id}`}>
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
