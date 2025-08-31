import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, TestTube, Trash2, Edit, Mail } from "lucide-react";
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
import EmailAccountForm from "@/components/forms/email-account-form";
import type { EmailAccount } from "@shared/schema";

export default function EmailAccounts() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['/api/email-accounts'],
    queryFn: () => api.getEmailAccounts(),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: api.deleteEmailAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "Email account deleted",
        description: "The email account has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete account",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const testAccountMutation = useMutation({
    mutationFn: api.testEmailAccount,
    onSuccess: (result: any, accountId: string) => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-accounts'] });
      toast({
        title: result.success ? "Connection successful" : "Connection failed",
        description: result.success 
          ? "Email account is working properly." 
          : result.error || "Please check your settings.",
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Could not test the email account.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="badge-success">Active</Badge>;
      case 'testing':
        return <Badge className="badge-warning">Testing</Badge>;
      case 'error':
        return <Badge className="badge-danger">Error</Badge>;
      default:
        return <Badge className="badge-secondary">Pending</Badge>;
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

  const handleDelete = (account: EmailAccount) => {
    if (confirm(`Are you sure you want to delete ${account.email}?`)) {
      deleteAccountMutation.mutate(account.id);
    }
  };

  const handleTest = (account: EmailAccount) => {
    testAccountMutation.mutate(account.id);
  };

  const handleEdit = (account: EmailAccount) => {
    setEditingAccount(account);
    setIsEditOpen(true);
  };

  // Remove loading state - show content immediately

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1" data-testid="email-accounts-title">Email Accounts</h2>
          <p className="text-muted-foreground mb-0">
            Manage your SMTP/IMAP email account connections
          </p>
        </div>
        
        {/* Always show Add Email Account button */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-email-account">
              <Plus className="h-4 w-4 mr-2" />
              Add Email Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Email Account</DialogTitle>
              <DialogDescription>
                Add a new email account to enable sending campaigns.
              </DialogDescription>
            </DialogHeader>
            <EmailAccountForm 
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Grid */}
      {(accounts as EmailAccount[]).length > 0 ? (
        <div className="row">
          {(accounts as EmailAccount[]).map((account: EmailAccount) => (
            <div key={account.id} className="col-lg-6 col-xl-4 mb-4">
              <div className="metric-card h-100" data-testid={`account-card-${account.id}`}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <h6 className="mb-1" data-testid={`account-name-${account.id}`}>
                      {account.name}
                    </h6>
                    <p className="text-muted-foreground mb-2 text-sm" data-testid={`account-email-${account.id}`}>
                      {account.email}
                    </p>
                    <div className="d-flex align-items-center mb-2">
                      <span className={`status-indicator ${getStatusIndicator(account.status)}`}></span>
                      {getStatusBadge(account.status)}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" data-testid={`account-actions-${account.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => handleTest(account)}
                        disabled={testAccountMutation.isPending}
                        data-testid={`account-test-${account.id}`}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        data-testid={`account-edit-${account.id}`}
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(account)}
                        disabled={deleteAccountMutation.isPending}
                        className="text-destructive"
                        data-testid={`account-delete-${account.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="row text-sm">
                  <div className="col-6">
                    <div className="text-muted-foreground">Provider</div>
                    <div className="font-medium">{account.provider}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted-foreground">Daily Limit</div>
                    <div className="font-medium">{account.dailyLimit}</div>
                  </div>
                </div>

                <div className="row text-sm mt-2">
                  <div className="col-6">
                    <div className="text-muted-foreground">Sent Today</div>
                    <div className="font-medium" data-testid={`account-sent-today-${account.id}`}>
                      {account.sentToday}/{account.dailyLimit}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted-foreground">Last Tested</div>
                    <div className="font-medium">
                      {account.lastTested 
                        ? new Date(account.lastTested).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>

                {account.errorMessage && (
                  <div className="alert alert-danger mt-3 p-2">
                    <small>{account.errorMessage}</small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="metric-card text-center py-8">
          <div className="mb-4">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4>No Email Accounts</h4>
            <p className="text-muted-foreground">
              Use the "Add Email Account" button above to add your first email account and start sending campaigns.
            </p>
          </div>
        </div>
      )}

      {/* Edit Email Account Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Email Account</DialogTitle>
            <DialogDescription>
              Update your email account settings and credentials.
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <EmailAccountForm 
              onSuccess={() => {
                setIsEditOpen(false);
                setEditingAccount(null);
              }}
              onCancel={() => {
                setIsEditOpen(false);
                setEditingAccount(null);
              }}
              initialData={editingAccount}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
