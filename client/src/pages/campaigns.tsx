import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Play, Pause, Trash2, Eye, Send, Filter, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [sequenceData, setSequenceData] = useState<any>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [campaignToShare, setCampaignToShare] = useState<Campaign | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if sequence data is available and auto-open campaign form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const useSequence = urlParams.get('useSequence');
    
    if (useSequence === 'true') {
      const storedSequence = localStorage.getItem('selectedSequenceForCampaign');
      if (storedSequence) {
        try {
          const parsedSequence = JSON.parse(storedSequence);
          setSequenceData(parsedSequence);
          setIsFormOpen(true);
          
          // Clean up URL and localStorage
          window.history.replaceState({}, document.title, '/campaigns');
          localStorage.removeItem('selectedSequenceForCampaign');
          
          toast({
            title: "Sequence Loaded",
            description: `"${parsedSequence.name}" sequence has been loaded for campaign creation.`,
          });
        } catch (error) {
          console.error('Error parsing sequence data:', error);
        }
      }
    }
  }, [toast]);

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
    onError: (error: any) => {
      console.error('Campaign delete error:', error);
      toast({
        title: "Failed to delete campaign",
        description: error.message || "Please try again.",
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
        description: "The campaign status has been updated.",
      });
    },
    onError: (error: any) => {
      console.error('Campaign update error:', error);
      toast({
        title: "Failed to update campaign",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter campaigns using the API
  const filterCampaignsMutation = useMutation({
    mutationFn: (filterData: any) => api.filterCampaigns(filterData),
    onSuccess: (filteredResults) => {
      setIsFiltering(true);
      toast({
        title: "Campaigns filtered",
        description: `Found ${filteredResults.length} campaigns matching your criteria.`,
      });
    },
    onError: () => {
      toast({
        title: "Filter failed",
        description: "Could not filter campaigns. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFilterCampaigns = () => {
    if (filters.status || filters.startDate || filters.endDate) {
      filterCampaignsMutation.mutate(filters);
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', startDate: '', endDate: '' });
    setIsFiltering(false);
  };

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
    let newStatus: string;
    
    if (campaign.status === 'active') {
      newStatus = 'paused';
    } else if (campaign.status === 'paused') {
      newStatus = 'active';
    } else if (campaign.status === 'draft') {
      newStatus = 'active';
    } else {
      // For completed campaigns, don't allow status changes
      toast({
        title: "Cannot change status",
        description: "Completed campaigns cannot be modified.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Toggling campaign status:', { 
      campaignId: campaign.id, 
      currentStatus: campaign.status, 
      newStatus: newStatus 
    });
    
    updateCampaignMutation.mutate({
      id: campaign.id,
      data: { status: newStatus }
    });
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsViewDetailsOpen(true);
  };

  const handleShareCampaign = (campaign: Campaign) => {
    setCampaignToShare(campaign);
    setIsShareDialogOpen(true);
  };

  // Remove loading state - show content immediately

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
              <DialogDescription>
                Create a new email outreach campaign to send automated email sequences.
              </DialogDescription>
            </DialogHeader>
            <CampaignForm 
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
              sequenceData={sequenceData}
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

      {/* Campaign Filters */}
      <div className="metric-card mb-4">
        <h5 className="mb-3">Filter Campaigns</h5>
        <div className="row">
          <div className="col-md-3 mb-2">
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              data-testid="select-status-filter"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="date"
              className="form-control"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="Start Date"
              data-testid="input-start-date"
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="date"
              className="form-control"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="End Date"
              data-testid="input-end-date"
            />
          </div>
          <div className="col-md-3 mb-2">
            <div className="d-flex gap-2">
              <Button
                onClick={handleFilterCampaigns}
                disabled={filterCampaignsMutation.isPending}
                variant="outline"
                data-testid="button-apply-filters"
              >
                {filterCampaignsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Filtering...
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </>
                )}
              </Button>
              {isFiltering && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  data-testid="button-clear-filters"
                >
                  Clear
                </Button>
              )}
            </div>
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
                          <DropdownMenuItem 
                            data-testid={`campaign-view-${campaign.id}`}
                            onClick={() => handleViewDetails(campaign)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTogglePause(campaign)}
                            data-testid={`campaign-toggle-${campaign.id}`}
                            disabled={campaign.status === 'completed'}
                          >
                            {campaign.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Campaign
                              </>
                            ) : campaign.status === 'paused' ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume Campaign
                              </>
                            ) : campaign.status === 'draft' ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Campaign
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Campaign Completed
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleShareCampaign(campaign)}
                            data-testid={`campaign-share-${campaign.id}`}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Campaign
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
                <DialogDescription>
                  Create a new email outreach campaign to send automated email sequences.
                </DialogDescription>
              </DialogHeader>
              <CampaignForm 
                onSuccess={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
                sequenceData={sequenceData}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* View Campaign Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details: {selectedCampaign?.name}</DialogTitle>
            <DialogDescription>
              View detailed information about this campaign.
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-6">
              {/* Campaign Info */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Campaign Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedCampaign.name}</div>
                    <div><strong>Status:</strong> {selectedCampaign.status}</div>
                    <div><strong>Total Leads:</strong> {selectedCampaign.totalLeads}</div>
                    <div><strong>Sent Count:</strong> {selectedCampaign.sentCount}</div>
                    <div><strong>Created:</strong> {new Date(selectedCampaign.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Open Rate:</strong> {calculateOpenRate(selectedCampaign)}%</div>
                    <div><strong>Reply Rate:</strong> {calculateReplyRate(selectedCampaign)}%</div>
                    <div><strong>Bounce Count:</strong> {selectedCampaign.bounceCount}</div>
                    <div><strong>Progress:</strong> {calculateProgress(selectedCampaign)}%</div>
                  </div>
                </div>
              </div>

              {/* Campaign Description */}
              {selectedCampaign.description && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>
                </div>
              )}

              {/* Sequence Information */}
              {selectedCampaign.sequenceId && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Email Sequence</h4>
                  <p className="text-sm text-muted-foreground">
                    This campaign uses sequence ID: {selectedCampaign.sequenceId}
                  </p>
                </div>
              )}

              {/* Recent Activity */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div>Last email sent: {selectedCampaign.lastSentAt ? new Date(selectedCampaign.lastSentAt).toLocaleString() : 'Not started'}</div>
                  <div>Last opened: {selectedCampaign.lastOpenedAt ? new Date(selectedCampaign.lastOpenedAt).toLocaleString() : 'No opens yet'}</div>
                  <div>Last reply: {selectedCampaign.lastReplyAt ? new Date(selectedCampaign.lastReplyAt).toLocaleString() : 'No replies yet'}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Campaign Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Campaign Results</DialogTitle>
            <DialogDescription>
              Share your campaign performance with others. This creates a beautiful, shareable summary.
            </DialogDescription>
          </DialogHeader>
          {campaignToShare && (
            <div className="space-y-6">
              {/* Campaign Performance Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{campaignToShare.name}</h3>
                  <p className="text-gray-600">Campaign Performance Summary</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{campaignToShare.totalLeads}</div>
                    <div className="text-sm text-gray-600">Total Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{campaignToShare.sentCount || 0}</div>
                    <div className="text-sm text-gray-600">Emails Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{calculateOpenRate(campaignToShare)}%</div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{calculateReplyRate(campaignToShare)}%</div>
                    <div className="text-sm text-gray-600">Reply Rate</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {campaignToShare.status.charAt(0).toUpperCase() + campaignToShare.status.slice(1)} Campaign
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Share Options</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Check out my email campaign results!\n\n` +
                        `📧 Campaign: ${campaignToShare.name}\n` +
                        `📊 Performance:\n` +
                        `   • Total Leads: ${campaignToShare.totalLeads}\n` +
                        `   • Emails Sent: ${campaignToShare.sentCount || 0}\n` +
                        `   • Open Rate: ${calculateOpenRate(campaignToShare)}%\n` +
                        `   • Reply Rate: ${calculateReplyRate(campaignToShare)}%\n\n` +
                        `🚀 Powered by EmailForge - Professional email automation platform`
                      );
                      toast({
                        title: "Copied to clipboard!",
                        description: "Campaign summary has been copied to your clipboard.",
                      });
                    }}
                    variant="outline"
                    className="w-full"
                    data-testid="button-copy-summary"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const shareData = {
                        title: `${campaignToShare.name} - Campaign Results`,
                        text: `Check out my email campaign results! Total Leads: ${campaignToShare.totalLeads}, Open Rate: ${calculateOpenRate(campaignToShare)}%, Reply Rate: ${calculateReplyRate(campaignToShare)}%`,
                        url: window.location.origin + '/campaigns'
                      };
                      
                      if (navigator.share) {
                        navigator.share(shareData);
                      } else {
                        navigator.clipboard.writeText(shareData.text + '\n\n' + shareData.url);
                        toast({
                          title: "Link copied!",
                          description: "Campaign link has been copied to your clipboard.",
                        });
                      }
                    }}
                    variant="outline"
                    className="w-full"
                    data-testid="button-share-native"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                </div>

                {/* Social Media Share */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-700">Share on Social Media</h5>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const text = `🚀 Just completed my email campaign "${campaignToShare.name}" with ${calculateOpenRate(campaignToShare)}% open rate and ${calculateReplyRate(campaignToShare)}% reply rate! EmailForge makes email marketing so effective! 📧✨`;
                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                        window.open(url, '_blank');
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      data-testid="button-share-twitter"
                    >
                      Twitter
                    </Button>
                    <Button
                      onClick={() => {
                        const text = `🚀 Just completed my email campaign "${campaignToShare.name}" with ${calculateOpenRate(campaignToShare)}% open rate and ${calculateReplyRate(campaignToShare)}% reply rate! EmailForge makes email marketing so effective! 📧✨`;
                        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/campaigns')}&title=${encodeURIComponent(campaignToShare.name + ' - Campaign Results')}&summary=${encodeURIComponent(text)}`;
                        window.open(url, '_blank');
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      data-testid="button-share-linkedin"
                    >
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </div>

              {/* Campaign Insights */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Campaign Insights</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• This campaign reached {campaignToShare.totalLeads} potential customers</p>
                  <p>• {calculateOpenRate(campaignToShare)}% of recipients opened your emails</p>
                  <p>• {calculateReplyRate(campaignToShare)}% of recipients engaged with your content</p>
                  <p>• Campaign progress: {calculateProgress(campaignToShare)}% complete</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
