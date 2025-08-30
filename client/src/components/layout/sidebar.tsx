import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Mail, 
  Users, 
  FileText, 
  Send, 
  Inbox, 
  PieChart, 
  Settings,
  LogOut
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Email Accounts', href: '/email-accounts', icon: Mail },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Sequences', href: '/sequences', icon: FileText },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Unified Inbox', href: '/inbox', icon: Inbox },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="sidebar" data-testid="sidebar">
      <div className="p-4">
        <h1 className="text-xl font-bold text-primary mb-6" data-testid="logo">
          EmailForge
        </h1>
        
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-border">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-primary text-primary-foreground rounded-full d-flex align-items-center justify-content-center" 
               style={{ width: '32px', height: '32px' }}>
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="ms-3">
            <p className="mb-0 text-sm font-medium" data-testid="user-name">User</p>
            <p className="mb-0 text-xs text-muted-foreground" data-testid="user-email">user@example.com</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
