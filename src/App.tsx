import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TradeProvider } from "@/hooks/useTrade";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";

// Core pages (4 only)
import Decision from "./pages/Decision";
import Decisions from "./pages/Decisions";
import Account from "./pages/Account";
import Legal from "./pages/Legal";
import Auth from "./pages/Auth";
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
                {/* Core 4 pages */}
                <Route path="/" element={<Decision />} />
                <Route path="/decisions" element={<Decisions />} />
                <Route path="/account" element={<Account />} />
                <Route path="/legal" element={<Legal />} />
                
                {/* Auth flow */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Redirects for deprecated routes */}
                <Route path="/landing" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/workspace" element={<Navigate to="/" replace />} />
                <Route path="/analyze" element={<Navigate to="/" replace />} />
                <Route path="/results" element={<Navigate to="/" replace />} />
                <Route path="/onboarding" element={<Navigate to="/" replace />} />
                <Route path="/pricing" element={<Navigate to="/account" replace />} />
                <Route path="/methodology" element={<Navigate to="/legal" replace />} />
                <Route path="/about" element={<Navigate to="/" replace />} />
                <Route path="/portfolio" element={<Navigate to="/" replace />} />
                <Route path="/tracked-assets" element={<Navigate to="/" replace />} />
                <Route path="/demo" element={<Navigate to="/" replace />} />
                <Route path="/history" element={<Navigate to="/decisions" replace />} />
                <Route path="/privacy" element={<Navigate to="/legal" replace />} />
                <Route path="/terms" element={<Navigate to="/legal" replace />} />
                
                {/* 404 */}
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
