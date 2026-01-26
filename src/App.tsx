import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TradeProvider } from "@/hooks/useTrade";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Workspace from "./pages/Workspace";
import Results from "./pages/Results";
import Portfolio from "./pages/Portfolio";
import History from "./pages/History";
import Methodology from "./pages/Methodology";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Account from "./pages/Account";
import Demo from "./pages/Demo";
import TrackedAssets from "./pages/TrackedAssets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <TradeProvider>
          <BrowserRouter>
            <TrackingProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
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
                <Route path="/demo" element={<Demo />} />
                <Route path="/tracked-assets" element={<TrackedAssets />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TrackingProvider>
          </BrowserRouter>
        </TradeProvider>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
