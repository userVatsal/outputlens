import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Types for behavior tracking
interface CursorPosition {
  x: number;
  y: number;
  t: number; // timestamp offset from page load
}

interface TrackingSession {
  id: string;
  visitorId: string;
  startedAt: Date;
  pageStartTime: number;
}

interface EventData {
  element?: string;
  elementType?: string;
  elementText?: string;
  x?: number;
  y?: number;
  scrollDepth?: number;
  timeOnPage?: number;
  formId?: string;
  fieldName?: string;
  [key: string]: unknown;
}

// Generate anonymous visitor ID (hashed, no PII)
function generateVisitorId(): string {
  const stored = localStorage.getItem('_ol_vid');
  if (stored) return stored;
  
  const id = crypto.randomUUID();
  localStorage.setItem('_ol_vid', id);
  return id;
}

// Get page type from pathname
function getPageType(pathname: string): string {
  const pageMap: Record<string, string> = {
    '/': 'landing',
    '/methodology': 'methodology',
    '/pricing': 'pricing',
    '/demo': 'demo',
    '/analyze': 'analyze',
    '/results': 'results',
    '/portfolio': 'portfolio',
    '/history': 'history',
    '/auth': 'auth',
    '/account': 'account',
    '/privacy': 'privacy',
    '/terms': 'terms',
  };
  return pageMap[pathname] || 'other';
}

// Parse UTM parameters
function getUtmParams(): Record<string, string | null> {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  };
}

// Main tracking hook
export function useBehaviorTracking() {
  const location = useLocation();
  const sessionRef = useRef<TrackingSession | null>(null);
  const cursorPositions = useRef<CursorPosition[]>([]);
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const cursorFlushInterval = useRef<NodeJS.Timeout | null>(null);
  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const exitIntentTriggered = useRef(false);
  
  // Check if exit survey was already shown (persisted across sessions)
  const exitSurveyShown = useRef(localStorage.getItem('_ol_exit_survey_shown') === 'true');

  // Initialize session
  const initSession = useCallback(async () => {
    if (sessionRef.current) return;

    const visitorId = generateVisitorId();
    const utmParams = getUtmParams();
    const sessionId = crypto.randomUUID();

    try {
      // Using type assertion as types will be regenerated after migration sync
      await (supabase.from('behavior_sessions' as never) as ReturnType<typeof supabase.from>).insert({
        id: sessionId,
        visitor_id: visitorId,
        entry_url: window.location.href,
        entry_referrer: document.referrer || null,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term,
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
      } as never);

      sessionRef.current = {
        id: sessionId,
        visitorId,
        startedAt: new Date(),
        pageStartTime: Date.now(),
      };

      console.log('[Tracking] Session initialized:', sessionId);
    } catch (error) {
      console.error('[Tracking] Failed to init session:', error);
    }
  }, []);

  // Track event
  const trackEvent = useCallback(async (
    eventType: string,
    eventData: EventData = {}
  ) => {
    if (!sessionRef.current) return;

    try {
      // Using type assertion as types will be regenerated after migration sync
      await (supabase.from('behavior_events' as never) as ReturnType<typeof supabase.from>).insert({
        session_id: sessionRef.current.id,
        event_type: eventType,
        page_url: window.location.pathname,
        page_type: getPageType(window.location.pathname),
        event_data: eventData,
      } as never);
    } catch (error) {
      console.error('[Tracking] Failed to track event:', error);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback(() => {
    if (!sessionRef.current) return;

    const timeOnPreviousPage = Date.now() - pageStartTime.current;
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;

    trackEvent('page_view', {
      referrer: document.referrer,
      timeOnPreviousPage: Math.round(timeOnPreviousPage / 1000),
    });

    // Update session page count
    (supabase.from('behavior_sessions' as never) as ReturnType<typeof supabase.from>)
      .update({ 
        total_pages: sessionRef.current ? 1 : 1,
      } as never)
      .eq('id', sessionRef.current?.id || '')
      .then(() => {});
  }, [trackEvent]);

  // Track click
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const elementData = {
      element: target.tagName.toLowerCase(),
      elementType: target.getAttribute('type') || undefined,
      elementText: target.textContent?.slice(0, 50) || undefined,
      x: e.clientX,
      y: e.clientY,
      className: target.className?.toString().slice(0, 100) || undefined,
      id: target.id || undefined,
    };

    trackEvent('click', elementData);
  }, [trackEvent]);

  // Track scroll depth - batched with requestAnimationFrame to avoid forced reflow
  const handleScroll = useCallback(() => {
    // Use RAF to batch layout reads and avoid forced reflow
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;

        // Track at 25%, 50%, 75%, 100% milestones
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          trackEvent('scroll', { scrollDepth: scrollPercent });
        }
      }
    });
  }, [trackEvent]);

  // Track cursor movement (throttled, batched)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now() - pageStartTime.current;
    
    // Only record every 100ms to reduce data
    const lastPos = cursorPositions.current[cursorPositions.current.length - 1];
    if (lastPos && now - lastPos.t < 100) return;

    cursorPositions.current.push({
      x: Math.round((e.clientX / window.innerWidth) * 100), // Normalize to percentage
      y: Math.round((e.clientY / window.innerHeight) * 100),
      t: now,
    });

    // Cap at 500 positions per page
    if (cursorPositions.current.length > 500) {
      cursorPositions.current.shift();
    }
  }, []);

  // Flush cursor data to database
  const flushCursorData = useCallback(async () => {
    if (!sessionRef.current || cursorPositions.current.length === 0) return;

    const positions = [...cursorPositions.current];
    cursorPositions.current = [];

    try {
      // Using type assertion as types will be regenerated after migration sync
      await (supabase.from('cursor_heatmap' as never) as ReturnType<typeof supabase.from>).insert({
        session_id: sessionRef.current.id,
        page_url: window.location.pathname,
        positions: positions,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      } as never);
    } catch (error) {
      console.error('[Tracking] Failed to flush cursor data:', error);
    }
  }, []);

  // Track exit intent
  const handleExitIntent = useCallback((e: MouseEvent) => {
    // Detect mouse leaving viewport toward top (browser bar)
    // Only show if never shown before (persisted in localStorage)
    if (e.clientY <= 0 && !exitIntentTriggered.current && !exitSurveyShown.current) {
      exitIntentTriggered.current = true;
      exitSurveyShown.current = true;
      localStorage.setItem('_ol_exit_survey_shown', 'true');

      trackEvent('exit_intent', {
        timeOnPage: Math.round((Date.now() - pageStartTime.current) / 1000),
        scrollDepth: maxScrollDepth.current,
      });

      setShowExitSurvey(true);
    }
  }, [trackEvent]);

  // Track form abandonment
  const trackFormAbandon = useCallback((formId: string, lastField: string) => {
    trackEvent('form_abandon', {
      formId,
      lastField,
      timeOnPage: Math.round((Date.now() - pageStartTime.current) / 1000),
    });
  }, [trackEvent]);

  // Close session on page unload
  const handleUnload = useCallback(() => {
    if (!sessionRef.current) return;

    const totalTime = Math.round((Date.now() - sessionRef.current.startedAt.getTime()) / 1000);

    // Use sendBeacon for reliable delivery on unload
    const payload = JSON.stringify({
      ended_at: new Date().toISOString(),
      exit_page: window.location.pathname,
      total_time_seconds: totalTime,
    });

    navigator.sendBeacon(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/behavior_sessions?id=eq.${sessionRef.current.id}`,
      new Blob([payload], { type: 'application/json' })
    );
  }, []);

  // Submit exit survey
  const submitExitSurvey = useCallback(async (data: {
    reason?: string;
    lookingFor?: string;
    additionalFeedback?: string;
  }) => {
    if (!sessionRef.current) return;

    try {
      // Using type assertion as types will be regenerated after migration sync
      await (supabase.from('exit_survey_responses' as never) as ReturnType<typeof supabase.from>).insert({
        session_id: sessionRef.current.id,
        exit_page: window.location.pathname,
        reason: data.reason,
        looking_for: data.lookingFor,
        additional_feedback: data.additionalFeedback,
      } as never);

      // Update session with exit reason
      await (supabase.from('behavior_sessions' as never) as ReturnType<typeof supabase.from>)
        .update({ exit_reason: data.reason } as never)
        .eq('id', sessionRef.current.id);

      setShowExitSurvey(false);
    } catch (error) {
      console.error('[Tracking] Failed to submit exit survey:', error);
    }
  }, []);

  const dismissExitSurvey = useCallback(() => {
    setShowExitSurvey(false);
  }, []);

  // Initialize on mount - deferred to avoid blocking initial render
  useEffect(() => {
    // Use requestIdleCallback for non-critical initialization
    const scheduleInit = () => {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
          () => initSession(),
          { timeout: 3000 }
        );
      } else {
        // Fallback: defer by 2 seconds
        setTimeout(initSession, 2000);
      }
    };
    
    scheduleInit();
  }, [initSession]);

  // Track page views on route change
  useEffect(() => {
    if (sessionRef.current) {
      trackPageView();
      exitIntentTriggered.current = false; // Reset exit intent for new page
    }
  }, [location.pathname, trackPageView]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleExitIntent);
    window.addEventListener('beforeunload', handleUnload);

    // Flush cursor data every 10 seconds
    cursorFlushInterval.current = setInterval(flushCursorData, 10000);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleExitIntent);
      window.removeEventListener('beforeunload', handleUnload);

      if (cursorFlushInterval.current) {
        clearInterval(cursorFlushInterval.current);
      }

      // Flush remaining cursor data
      flushCursorData();
    };
  }, [handleClick, handleScroll, handleMouseMove, handleExitIntent, handleUnload, flushCursorData]);

  return {
    trackEvent,
    trackFormAbandon,
    showExitSurvey,
    submitExitSurvey,
    dismissExitSurvey,
    sessionId: sessionRef.current?.id,
  };
}

// Context for global tracking
import { createContext, useContext, ReactNode } from 'react';

interface BehaviorTrackingContextType {
  trackEvent: (eventType: string, eventData?: EventData) => void;
  trackFormAbandon: (formId: string, lastField: string) => void;
  showExitSurvey: boolean;
  submitExitSurvey: (data: { reason?: string; lookingFor?: string; additionalFeedback?: string }) => void;
  dismissExitSurvey: () => void;
}

const BehaviorTrackingContext = createContext<BehaviorTrackingContextType | null>(null);

export function BehaviorTrackingProvider({ children }: { children: ReactNode }) {
  const tracking = useBehaviorTracking();

  return (
    <BehaviorTrackingContext.Provider value={tracking}>
      {children}
    </BehaviorTrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(BehaviorTrackingContext);
  if (!context) {
    // Return no-op functions if not in provider
    return {
      trackEvent: () => {},
      trackFormAbandon: () => {},
      showExitSurvey: false,
      submitExitSurvey: () => {},
      dismissExitSurvey: () => {},
    };
  }
  return context;
}
