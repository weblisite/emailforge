import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Play, Pause, Trash2, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import CampaignForm from "@/components/forms/campaign-form";
import type { Campaign } from "@shared/schema";

export default function Campaigns() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: () => api.getCampaigns(),
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: api.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete campaign",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "Campaign updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update campaign",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="badge-success">Active</Badge>;
      case 'paused':
        return <Badge className="badge-warning">Paused</Badge>;
      case 'completed':
        return <Badge className="badge-secondary">Completed</Badge>;
      default:
        return <Badge className="badge-secondary">Draft</Badge>;
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'paused':
        return 'status-warning';
      case 'completed':
        return 'status-inactive';
      default:
        return 'status-inactive';
    }
  };

  const calculateProgress = (campaign: Campaign) => {
    if (!campaign.totalLeads || campaign.totalLeads === 0) return 0;
    const sentCount = campaign.sentCount || 0;
    return Math.round((sentCount / campaign.totalLeads) * 100);
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (!campaign.sentCount || campaign.sentCount === 0) return 0;
    const openCount = campaign.openCount || 0;
    return Math.round((openCount / campaign.sentCount) * 100 * 10) / 10;
  };

  const calculateReplyRate = (campaign: Campaign) => {
    if (!campaign.sentCount || campaign.sentCount === 0) return 0;
    const replyCount = campaign.replyCount || 0;
    return Math.round((replyCount / campaign.sentCount) * 100 * 10) / 10;
  };

  const handleDelete = (campaign: Campaign) => {
    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      deleteCampaignMutation.mutate(campaign.id);
    }
  };

  const handleTogglePause = (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateCampaignMutation.mutate({
      id: campaign.id,
      data: { status: newStatus }
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="animate-pulse text-xl font-medium text-primary mb-2">Loading Campaigns...</div>
          <div className="text-muted-foreground">Fetching your campaign data</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="campaigns-title">Campaigns</h2>
          <p className="text-muted-foreground mb-0">
            Manage and monitor your email outreach campaigns
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <CampaignForm 
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-primary">{campaigns.length}</div>
            <div className="text-muted-foreground text-sm">Total Campaigns</div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-success">{campaigns.filter(c => c.status === 'active').length}</div>
            <div className="text-muted-foreground text-sm">Active</div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-warning">{campaigns.filter(c => c.status === 'paused').length}</div>
            <div className="text-muted-foreground text-sm">Paused</div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="metric-card text-center py-3">
            <div className="h5 mb-1 text-secondary">{campaigns.filter(c => c.status === 'completed').length}</div>
            <div className="text-muted-foreground text-sm">Completed</div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      {campaigns.length > 0 ? (
        <div className="metric-card">
          <div className="table-responsive">
            <table className="table table-hover" data-testid="campaigns-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Open Rate</th>
                  <th>Reply Rate</th>
                  <th>Bounces</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} data-testid={`campaign-row-${campaign.id}`}>
                    <td>
                      <div>
                        <div className="font-medium" data-testid={`campaign-name-${campaign.id}`}>
                          {campaign.name}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {campaign.totalLeads} total leads
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className={`status-indicator ${getStatusIndicator(campaign.status)}`}></span>
                        {getStatusBadge(campaign.status)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Progress 
                          value={calculateProgress(campaign)} 
                          className="w-20 h-2 mr-2" 
                        />
                        <span className="text-sm">
                          {campaign.sentCount}/{campaign.totalLeads}
                        </span>
                      </div>
                    </td>
                    <td data-testid={`campaign-open-rate-${campaign.id}`}>
                      {calculateOpenRate(campaign)}%
                    </td>
                    <td data-testid={`campaign-reply-rate-${campaign.id}`}>
                      {calculateReplyRate(campaign)}%
                    </td>
                    <td>
                      {campaign.bounceCount}
                    </td>
                    <td className="text-sm">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`campaign-actions-${campaign.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem data-testid={`campaign-view-${campaign.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTogglePause(campaign)}
                            data-testid={`campaign-toggle-${campaign.id}`}
                          >
                            {campaign.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Campaign
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume Campaign
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(campaign)}
                            disabled={deleteCampaignMutation.isPending}
                            className="text-destructive"
                            data-testid={`campaign-delete-${campaign.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="metric-card text-center py-8">
          <div className="mb-4">
            <Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4>No Campaigns</h4>
            <p className="text-muted-foreground">
              Create your first campaign to start sending automated email sequences.
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-first-campaign">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
              </DialogHeader>
              <CampaignForm 
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
