import { useQuery, useMutation } from "@tanstack/react-query";
import { TrendingUp, Eye, MessageSquare, Mail, Users, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import MetricsCard from "@/components/dashboard/metrics-card";

export default function Analytics() {
  const { toast } = useToast();
  
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: () => api.getDashboardMetrics(),
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: () => api.getCampaigns(),
  });

  const { data: emailAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/email-accounts'],
    queryFn: () => api.getEmailAccounts(),
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/leads'],
    queryFn: () => api.getLeads(),
  });

  // Fetch detailed analytics for campaigns, leads, and email accounts
  const { data: campaignAnalytics = [], isLoading: campaignAnalyticsLoading } = useQuery({
    queryKey: ['/api/campaigns/analytics'],
    queryFn: async () => {
      const analyticsPromises = campaigns.map(campaign => 
        api.getCampaignAnalytics(campaign.id)
      );
      return Promise.all(analyticsPromises);
    },
    enabled: campaigns.length > 0 && !campaignsLoading,
  });

  const { data: leadAnalytics = [], isLoading: leadAnalyticsLoading } = useQuery({
    queryKey: ['/api/leads/analytics'],
    queryFn: async () => {
      const analyticsPromises = leads.map(lead => 
        api.getLeadAnalytics(lead.id)
      );
      return Promise.all(analyticsPromises);
    },
    enabled: leads.length > 0 && !leadsLoading,
  });

  const { data: accountAnalytics = [], isLoading: accountAnalyticsLoading } = useQuery({
    queryKey: ['/api/email-accounts/analytics'],
    queryFn: async () => {
      const analyticsPromises = emailAccounts.map(account => 
        api.getEmailAccountAnalytics(account.id)
      );
      return Promise.all(analyticsPromises);
    },
    enabled: emailAccounts.length > 0 && !accountsLoading,
  });

  // Export functionality
  const exportMutation = useMutation({
    mutationFn: ({ type, filters }: { type: string; filters?: any }) => 
      api.exportData(type, filters),
    onSuccess: (data, variables) => {
      toast({
        title: "Export successful",
        description: `${variables.type} data has been prepared for download.`,
      });
      // In a real app, this would trigger a file download
      console.log(`Export data for ${variables.type}:`, data);
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Could not export data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = (type: string) => {
    exportMutation.mutate({ type });
  };

  // Remove loading state - show content immediately

  // Calculate additional metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => l.status === 'active').length;
  const unsubscribedLeads = leads.filter(l => l.status === 'unsubscribed').length;
  const totalSentEmails = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + c.openCount, 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + c.replyCount, 0);
  const totalBounces = campaigns.reduce((sum, c) => sum + c.bounceCount, 0);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="analytics-title">Analytics</h2>
          <p className="text-muted-foreground mb-0">
            Detailed performance insights and campaign analytics
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport('leads')}
            disabled={exportMutation.isPending}
            data-testid="button-export-leads"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Leads
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('campaigns')}
            disabled={exportMutation.isPending}
            data-testid="button-export-campaigns"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Campaigns
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('email-accounts')}
            disabled={exportMutation.isPending}
            data-testid="button-export-accounts"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Accounts
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <MetricsCard
            title="Total Sent"
            value={totalSentEmails.toLocaleString()}
            icon={<Mail className="h-5 w-5 text-primary" />}
            change={{
              value: "+12.5%",
              type: "positive"
            }}
            description="vs last month"
          />
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <MetricsCard
            title="Open Rate"
            value={`${metrics?.openRate || 0}%`}
            icon={<Eye className="h-5 w-5 text-chart-2" />}
            change={{
              value: "+3.2%",
              type: "positive"
            }}
            description="vs last month"
          />
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <MetricsCard
            title="Reply Rate"
            value={`${metrics?.replyRate || 0}%`}
            icon={<MessageSquare className="h-5 w-5 text-chart-4" />}
            change={{
              value: "-1.8%",
              type: "negative"
            }}
            description="vs last month"
          />
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <MetricsCard
            title="Bounce Rate"
            value={totalSentEmails > 0 ? `${Math.round((totalBounces / totalSentEmails) * 100 * 10) / 10}%` : '0%'}
            icon={<TrendingUp className="h-5 w-5 text-chart-1" />}
            description="Total bounces"
          />
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="row mb-4">
        {/* Campaign Performance */}
        <div className="col-lg-8 mb-4">
          <div className="metric-card">
            <h5 className="mb-4">Campaign Performance</h5>
            
            <div className="table-responsive">
              <table className="table" data-testid="campaign-performance-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Sent</th>
                    <th>Opens</th>
                    <th>Replies</th>
                    <th>Bounces</th>
                    <th>Open Rate</th>
                    <th>Reply Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const openRate = campaign.sentCount > 0 
                      ? Math.round((campaign.openCount / campaign.sentCount) * 100 * 10) / 10 
                      : 0;
                    const replyRate = campaign.sentCount > 0 
                      ? Math.round((campaign.replyCount / campaign.sentCount) * 100 * 10) / 10 
                      : 0;
                    
                    return (
                      <tr key={campaign.id} data-testid={`analytics-campaign-${campaign.id}`}>
                        <td className="font-medium">{campaign.name}</td>
                        <td>{campaign.sentCount}</td>
                        <td>{campaign.openCount}</td>
                        <td>{campaign.replyCount}</td>
                        <td>{campaign.bounceCount}</td>
                        <td>{openRate}%</td>
                        <td>{replyRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {campaigns.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No campaigns to analyze yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="col-lg-4 mb-4">
          <div className="metric-card mb-4">
            <h5 className="mb-3">Campaign Summary</h5>
            
            <div className="row text-center">
              <div className="col-6 mb-3">
                <div className="h4 mb-1 text-primary" data-testid="total-campaigns">{totalCampaigns}</div>
                <div className="text-muted-foreground text-sm">Total Campaigns</div>
              </div>
              <div className="col-6 mb-3">
                <div className="h4 mb-1 text-success" data-testid="active-campaigns">{activeCampaigns}</div>
                <div className="text-muted-foreground text-sm">Active</div>
              </div>
            </div>
          </div>

          <div className="metric-card mb-4">
            <h5 className="mb-3">Lead Statistics</h5>
            
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-sm">Total Leads</span>
              <span className="font-medium" data-testid="total-leads">{totalLeads}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-sm">Active Leads</span>
              <span className="font-medium text-success" data-testid="active-leads">{activeLeads}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-sm">Unsubscribed</span>
              <span className="font-medium text-danger" data-testid="unsubscribed-leads">{unsubscribedLeads}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-sm">Email Accounts</span>
              <span className="font-medium" data-testid="total-accounts">{emailAccounts.length}</span>
            </div>
          </div>

          <div className="metric-card">
            <h5 className="mb-3">Engagement Overview</h5>
            
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-sm">Total Emails Sent</span>
              <span className="font-medium">{totalSentEmails.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-sm">Total Opens</span>
              <span className="font-medium text-chart-2">{totalOpens.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-sm">Total Replies</span>
              <span className="font-medium text-chart-4">{totalReplies.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-sm">Total Bounces</span>
              <span className="font-medium text-warning">{totalBounces.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Performance */}
      <div className="row">
        <div className="col-12">
          <div className="metric-card">
            <h5 className="mb-4">Email Account Performance</h5>
            
            <div className="table-responsive">
              <table className="table" data-testid="account-performance-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Daily Limit</th>
                    <th>Sent Today</th>
                    <th>Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {emailAccounts.map((account) => {
                    const usagePercent = Math.round((account.sentToday / account.dailyLimit) * 100);
                    
                    return (
                      <tr key={account.id} data-testid={`analytics-account-${account.id}`}>
                        <td className="font-medium">{account.email}</td>
                        <td className="text-capitalize">{account.provider}</td>
                        <td>
                          <span className={`badge ${
                            account.status === 'active' ? 'badge-success' : 
                            account.status === 'error' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {account.status}
                          </span>
                        </td>
                        <td>{account.dailyLimit}</td>
                        <td>{account.sentToday}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{usagePercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {emailAccounts.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No email accounts configured yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
