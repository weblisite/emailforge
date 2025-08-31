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
import { useUser, useClerk } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Email Accounts', href: '/dashboard/email-accounts', icon: Mail },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Sequences', href: '/dashboard/sequences', icon: FileText },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Send },
  { name: 'Unified Inbox', href: '/dashboard/inbox', icon: Inbox },
  { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Toast Test', href: '/dashboard/toast-test', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    if (user.username) return user.username;
    return 'User';
  };

  // Get email
  const getEmail = () => {
    if (!user) return 'user@example.com';
    return user.primaryEmailAddress?.emailAddress || 'user@example.com';
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
            <span className="text-sm font-medium">{getUserInitials()}</span>
          </div>
          <div className="ms-3">
            <p className="mb-0 text-sm font-medium" data-testid="user-name">{getDisplayName()}</p>
            <p className="mb-0 text-xs text-muted-foreground" data-testid="user-email">{getEmail()}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}
