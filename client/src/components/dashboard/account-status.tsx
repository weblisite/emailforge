import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EmailAccount } from "@shared/schema";

interface AccountStatusProps {
  accounts: EmailAccount[];
}

export default function AccountStatus({ accounts }: AccountStatusProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { className: 'badge-success', text: 'Active' };
      case 'testing':
        return { className: 'badge-warning', text: 'Testing' };
      case 'error':
        return { className: 'badge-danger', text: 'Error' };
      default:
        return { className: 'badge-secondary', text: 'Pending' };
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'testing':
        return 'status-warning';
      case 'error':
        return 'status-error';
      default:
        return 'status-inactive';
    }
  };

  const activeAccounts = accounts.filter(account => account.isActive).length;

  return (
    <div className="metric-card" data-testid="account-status-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Email Accounts</h5>
        <Badge className="badge-primary" data-testid="active-accounts-count">
          {activeAccounts} Active
        </Badge>
      </div>
      
      <div className="space-y-3">
        {accounts.slice(0, 4).map((account) => {
          const statusInfo = getStatusBadge(account.status);
          return (
            <div 
              key={account.id} 
              className="d-flex justify-content-between align-items-center py-2 border-bottom border-border"
              data-testid={`account-item-${account.id}`}
            >
              <div>
                <div className="font-medium text-sm" data-testid={`account-email-${account.id}`}>
                  {account.email}
                </div>
                <div className="text-muted-foreground text-xs">
                  {account.provider} • {account.sentToday}/{account.dailyLimit} sent today
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className={`status-indicator ${getStatusIndicator(account.status)}`}></span>
                <Badge className={statusInfo.className}>
                  {statusInfo.text}
                </Badge>
              </div>
            </div>
          );
        })}
        
        {accounts.length === 0 && (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">No email accounts configured</p>
          </div>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-100 mt-3"
        data-testid="manage-accounts-button"
      >
        Manage All Accounts
      </Button>
    </div>
  );
}
