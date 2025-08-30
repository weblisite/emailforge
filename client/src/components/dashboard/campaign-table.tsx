import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Play, Pause, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Campaign } from "@shared/schema";

interface CampaignTableProps {
  campaigns: Campaign[];
}

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleTogglePause = (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateCampaignMutation.mutate({
      id: campaign.id,
      data: { status: newStatus }
    });
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

  return (
    <div className="table-responsive">
      <table className="table table-hover" data-testid="campaign-table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Open Rate</th>
            <th>Reply Rate</th>
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
                    Created {new Date(campaign.createdAt).toLocaleDateString()}
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
                    <DropdownMenuItem 
                      onClick={() => handleTogglePause(campaign)}
                      data-testid={`campaign-toggle-${campaign.id}`}
                    >
                      {campaign.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid={`campaign-view-${campaign.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {campaigns.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No campaigns found.</p>
          <Button className="mt-2" data-testid="create-first-campaign">
            Create Your First Campaign
          </Button>
        </div>
      )}
    </div>
  );
}
