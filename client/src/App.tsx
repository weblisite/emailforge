import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";

// Pages
import Dashboard from "@/pages/dashboard";
import EmailAccounts from "@/pages/email-accounts";
import Leads from "@/pages/leads";
import Sequences from "@/pages/sequences";
import Campaigns from "@/pages/campaigns";
import Inbox from "@/pages/inbox";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Components
import Sidebar from "@/components/layout/sidebar";
import AuthForm from "@/components/forms/auth-form";

function AuthenticatedApp() {
  const [location] = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => api.me(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold text-primary mb-2">EmailForge</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="main-content">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/email-accounts" component={EmailAccounts} />
          <Route path="/leads" component={Leads} />
          <Route path="/sequences" component={Sequences} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
