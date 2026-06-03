import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TradeProvider } from "@/hooks/useTrade";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load all page components for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Results = lazy(() => import("./pages/Results"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const History = lazy(() => import("./pages/History"));
const Methodology = lazy(() => import("./pages/Methodology"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Account = lazy(() => import("./pages/Account"));
const TrackedAssets = lazy(() => import("./pages/TrackedAssets"));
const About = lazy(() => import("./pages/About"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CEODashboard = lazy(() => import("./pages/CEODashboard"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Regime = lazy(() => import("./pages/Regime"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Scenarios = lazy(() => import("./pages/Scenarios"));
const VarCalculator = lazy(() => import("./pages/VarCalculator"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <TradeProvider>
                <TrackingProvider>
                  <Toaster />
                  <Sonner />
                  <ErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/workspace" element={<Workspace />} />
                  <Route path="/analyze" element={<Navigate to="/workspace" replace />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/portfolio" element={<Navigate to="/workspace?mode=portfolio" replace />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/methodology" element={<Methodology />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/demo" element={<Navigate to="/" replace />} />
                  <Route path="/tracked-assets" element={<TrackedAssets />} />
                  <Route path="/regime" element={<Regime />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/scenarios" element={<Scenarios />} />
                  <Route path="/var" element={<VarCalculator />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/ceo-dashboard" element={<CEODashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </TrackingProvider>
              </TradeProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
