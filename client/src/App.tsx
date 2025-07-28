import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

// Import pages
import Landing from "@/pages/Landing";
import JobHackrDashboard from "@/pages/JobHackrDashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Onboarding from "@/pages/onboarding";
import AccessPending from "@/pages/AccessPending";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
    },
  },
});

function Router() {
  const { isAuthenticated, isApproved, hasCompletedOnboarding, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      
      {/* Authenticated routes */}
      {!isAuthenticated ? (
        <Route path="*" component={Landing} />
      ) : !hasCompletedOnboarding ? (
        <Route path="*" component={Onboarding} />
      ) : !isApproved ? (
        <Route path="*" component={AccessPending} />
      ) : (
        <>
          <Route path="/" component={JobHackrDashboard} />
          <Route path="/dashboard" component={JobHackrDashboard} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;