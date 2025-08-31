import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  RefreshCw, 
  Plus, 
  NotebookPen, 
  Eye, 
  MessageSquare, 
  Mail,
  Upload,
  FileText,
  Shield,
  TrendingUp,
  BookmarkCheck,
  Calendar,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import MetricsCard from "@/components/dashboard/metrics-card";
import CampaignTable from "@/components/dashboard/campaign-table";
import AccountStatus from "@/components/dashboard/account-status";
import InboxActivity from "@/components/dashboard/inbox-activity";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: () => api.getDashboardMetrics(),
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: () => api.getCampaigns(),
  });

  // Fetch campaign analytics for active campaigns
  const { data: campaignAnalytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/campaigns/analytics'],
    queryFn: async () => {
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      const analyticsPromises = activeCampaigns.map(campaign => 
        api.getCampaignAnalytics(campaign.id)
      );
      return Promise.all(analyticsPromises);
    },
    enabled: campaigns.length > 0 && !campaignsLoading,
  });

  const { data: emailAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/email-accounts'],
    queryFn: () => api.getEmailAccounts(),
  });

  // Fetch email account analytics
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

  const { data: inboxMessages = [], isLoading: inboxLoading } = useQuery({
    queryKey: ['/api/inbox'],
    queryFn: () => api.getInboxMessages(),
  });

  // Mark all messages as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadMessages = inboxMessages.filter(m => !m.isRead);
      const promises = unreadMessages.map(message => api.markMessageRead(message.id));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "All messages marked as read",
        description: "Your inbox has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark messages as read",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = async () => {
    try {
      await refetchMetrics();
      toast({
        title: "Dashboard refreshed",
        description: "All metrics have been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh dashboard data.",
        variant: "destructive",
      });
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  // Remove loading state - show content immediately

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="dashboard-title">Dashboard</h2>
          <p className="text-muted-foreground mb-0">
            Monitor your email campaigns and account performance
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            data-testid="button-refresh-dashboard"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            data-testid="button-create-campaign"
            onClick={() => window.location.href = '/dashboard/campaigns'}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <MetricsCard
            title="Total Sent"
            value={metrics?.totalSent?.toLocaleString() || '0'}
            icon={<NotebookPen className="h-5 w-5 text-primary" />}
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
            title="Active Accounts"
            value={metrics?.activeAccounts || 0}
            icon={<Mail className="h-5 w-5 text-chart-1" />}
            description={`${metrics?.pendingEmails || 0} pending`}
          />
        </div>
      </div>

      {/* Main Content Row */}
      <div className="row mb-4">
        {/* Active Campaigns */}
        <div className="col-lg-8 mb-4">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Active Campaigns</h5>
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-view-all-campaigns"
                onClick={() => window.location.href = '/dashboard/campaigns'}
              >
                View All
              </Button>
            </div>
            
            <CampaignTable campaigns={activeCampaigns} />
          </div>
        </div>

        {/* Quick Actions & Account Status */}
        <div className="col-lg-4 mb-4">
          <div className="metric-card mb-4">
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-grid gap-2">
              <Button 
                data-testid="button-upload-leads"
                onClick={() => window.location.href = '/dashboard/leads'}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Leads
              </Button>
              <Button 
                variant="outline" 
                data-testid="button-add-email-account"
                onClick={() => window.location.href = '/dashboard/email-accounts'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Email Account
              </Button>
              <Button 
                variant="outline" 
                data-testid="button-create-sequence"
                onClick={() => window.location.href = '/dashboard/sequences'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Sequence
              </Button>
              <Button 
                variant="outline" 
                data-testid="button-test-deliverability"
                onClick={() => window.location.href = '/dashboard/settings'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Test Deliverability
              </Button>
              <Button 
                variant="outline" 
                data-testid="button-schedule-email"
                onClick={() => window.location.href = '/dashboard/email-schedule'}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Email
              </Button>
              <Button 
                variant="outline" 
                data-testid="button-bulk-email"
                onClick={() => window.location.href = '/dashboard/bulk-email'}
              >
                <Send className="h-4 w-4 mr-2" />
                Bulk Email
              </Button>
            </div>
          </div>

          <AccountStatus accounts={emailAccounts} />
        </div>
      </div>

      {/* Recent Inbox Activity */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="metric-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Recent Inbox Activity</h5>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  data-testid="button-mark-all-read"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  {markAllReadMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Mark All Read
                    </>
                  )}
                </Button>
                <Button size="sm" data-testid="button-open-inbox">
                  View Inbox
                </Button>
              </div>
            </div>
            
            <InboxActivity messages={inboxMessages} />
          </div>
        </div>
      </div>

      {/* System Status Row */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="metric-card">
            <h5 className="mb-4">Deliverability Health</h5>
            
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-sm font-medium">Overall Spam Score</span>
                <Badge className="badge-success">2.3/10</Badge>
              </div>
              <Progress value={77} className="h-2" />
            </div>
            
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-sm font-medium">Blacklist Status</span>
                <Badge className="badge-success">Clean</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Last checked: 1 hour ago</div>
            </div>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-sm font-medium">Domain Reputation</span>
                <Badge className="badge-warning">Moderate</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Recommendation: Warm up new domains
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-100" data-testid="button-run-deliverability-test">
              <Shield className="h-4 w-4 mr-2" />
              Run Full Deliverability Test
            </Button>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4">
          <div className="metric-card">
            <h5 className="mb-4">System Status</h5>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <span className="status-indicator status-active"></span>
                <span className="font-medium">Email Queue</span>
              </div>
              <Badge className="badge-success">Running</Badge>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <span className="status-indicator status-active"></span>
                <span className="font-medium">IMAP Polling</span>
              </div>
              <Badge className="badge-success">Active</Badge>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <span className="status-indicator status-warning"></span>
                <span className="font-medium">Database</span>
              </div>
              <Badge className="badge-warning">High Load</Badge>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <span className="status-indicator status-active"></span>
                <span className="font-medium">API Services</span>
              </div>
              <Badge className="badge-success">Operational</Badge>
            </div>
            
            <div className="alert alert-info">
              <div className="d-flex align-items-start">
                <TrendingUp className="h-4 w-4 mr-2 mt-1" />
                <div>
                  <strong>Scheduled Maintenance:</strong> System backup scheduled for tonight at 2:00 AM UTC.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
