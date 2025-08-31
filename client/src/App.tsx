import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@clerk/clerk-react";

// Pages
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import EmailAccounts from "@/pages/email-accounts";
import Leads from "@/pages/leads";
import Sequences from "@/pages/sequences";
import Campaigns from "@/pages/campaigns";
import Inbox from "@/pages/inbox";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import EmailSchedule from "@/pages/email-schedule";
import ToastTest from "@/pages/toast-test";
import NotFound from "@/pages/not-found";

// Components
import Sidebar from "@/components/layout/sidebar";
import { ClerkProviderWrapper, SignIn, SignUp } from "@/providers/clerk-provider";

// Beautiful, centered authentication page wrapper
function AuthPageWrapper({ children, title, subtitle }: { 
  children: React.ReactNode; 
  title: string; 
  subtitle: string; 
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-300 text-lg">{subtitle}</p>
        </div>
        
        {/* Clerk Component Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8">
          {children}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Secure authentication powered by{" "}
            <a 
              href="https://clerk.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clerk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Styled wrapper components for Clerk components
function SignInPage() {
  return (
    <AuthPageWrapper 
      title="Welcome Back" 
      subtitle="Sign in to your EmailForge account to continue"
    >
      <SignIn />
    </AuthPageWrapper>
  );
}

function SignUpPage() {
  return (
    <AuthPageWrapper 
      title="Create Account" 
      subtitle="Join EmailForge and start building your email campaigns"
    >
      <SignUp />
    </AuthPageWrapper>
  );
}

function AuthenticatedApp() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">EmailForge</div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to sign-in if not authenticated
    window.location.href = '/sign-in';
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="main-content">
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/dashboard/email-accounts" component={EmailAccounts} />
          <Route path="/dashboard/leads" component={Leads} />
          <Route path="/dashboard/sequences" component={Sequences} />
          <Route path="/dashboard/campaigns" component={Campaigns} />
          <Route path="/dashboard/inbox" component={Inbox} />
          <Route path="/dashboard/analytics" component={Analytics} />
          <Route path="/dashboard/settings" component={Settings} />
          <Route path="/dashboard/email-schedule" component={EmailSchedule} />
          <Route path="/dashboard/toast-test" component={ToastTest} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">EmailForge</div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          {/* Landing page for unauthenticated users */}
          {!user && <Route path="/" component={Landing} />}
          
          {/* Authentication routes */}
          <Route path="/sign-in" component={SignInPage} />
          <Route path="/create-account" component={SignUpPage} />
          
          {/* Dashboard routes for authenticated users */}
          {user && <Route path="/dashboard" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/email-accounts" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/leads" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/sequences" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/campaigns" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/inbox" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/analytics" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/settings" component={AuthenticatedApp} />}
          {user && <Route path="/dashboard/email-schedule" component={AuthenticatedApp} />}
          
          {/* Redirect old routes to new dashboard routes for backward compatibility */}
          {user && <Route path="/leads" component={() => { window.location.href = '/dashboard/leads'; return null; }} />}
          {user && <Route path="/sequences" component={() => { window.location.href = '/dashboard/sequences'; return null; }} />}
          {user && <Route path="/campaigns" component={() => { window.location.href = '/dashboard/campaigns'; return null; }} />}
          {user && <Route path="/inbox" component={() => { window.location.href = '/dashboard/inbox'; return null; }} />}
          {user && <Route path="/analytics" component={() => { window.location.href = '/dashboard/analytics'; return null; }} />}
          {user && <Route path="/settings" component={() => { window.location.href = '/dashboard/settings'; return null; }} />}
          {user && <Route path="/email-accounts" component={() => { window.location.href = '/dashboard/email-accounts'; return null; }} />}
          
          {/* Redirect authenticated users from root to dashboard */}
          {user && <Route path="/" component={() => { window.location.href = '/dashboard'; return null; }} />}
          
          {/* Fallback for unauthenticated users */}
          {!user && <Route component={Landing} />}
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ClerkProviderWrapper>
      <AppContent />
    </ClerkProviderWrapper>
  );
}

export default App;

