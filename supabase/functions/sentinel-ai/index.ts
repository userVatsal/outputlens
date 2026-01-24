/**
 * SentinelAI - Real-time Security Agent
 * 
 * Provides:
 * - Request threat analysis
 * - IP reputation management
 * - Rate limiting
 * - Captcha verification
 * - Security event logging
 * 
 * Endpoints:
 * POST /analyze - Analyze request for threats
 * POST /verify-captcha - Verify captcha response
 * POST /log-event - Log a security event
 * GET /ip-status - Check IP reputation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip",
};

interface AnalyzeRequest {
  action: "analyze" | "verify-captcha" | "log-event" | "ip-status";
  ip?: string;
  endpoint?: string;
  userId?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  captchaToken?: string;
  eventType?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

interface ThreatAnalysis {
  threatScore: number;
  action: "allow" | "challenge" | "block";
  captchaRequired: boolean;
  captchaType?: "invisible" | "checkbox" | "puzzle";
  blocked: boolean;
  blockReason?: string;
  ipReputation: number;
  rateLimit: { allowed: boolean; remaining: number; resetIn: number };
}

interface SecurityThresholds {
  failed_login_captcha_trigger: number;
  failed_login_block_trigger: number;
  block_duration_minutes: number;
  rate_limit_free_per_minute: number;
  rate_limit_paid_per_minute: number;
  threat_score_captcha_threshold: number;
  threat_score_block_threshold: number;
  captcha_failure_block_count: number;
  ip_reputation_decay_hours: number;
}

interface IpReputationRow {
  id: string;
  ip_address: string;
  reputation_score: number;
  total_requests: number;
  failed_attempts: number;
  successful_attempts: number;
  captcha_challenges: number;
  captcha_failures: number;
  last_seen_at: string;
  first_seen_at: string;
  blocked_until: string | null;
  permanent_block: boolean;
  block_reason: string | null;
  metadata: Record<string, unknown>;
}

interface ThresholdRow {
  threshold_name: string;
  threshold_value: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body: AnalyzeRequest = await req.json();
    const clientIp = body.ip || 
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
      req.headers.get("x-real-ip") || 
      "unknown";

    console.log(`[SENTINEL] Action: ${body.action}, IP: ${clientIp}`);

    // Load thresholds from database
    const thresholds = await loadThresholds(supabase);

    switch (body.action) {
      case "analyze":
        return await handleAnalyze(supabase, clientIp, body, thresholds);
      
      case "verify-captcha":
        return await handleVerifyCaptcha(supabase, clientIp, body);
      
      case "log-event":
        return await handleLogEvent(supabase, clientIp, body);
      
      case "ip-status":
        return await handleIpStatus(supabase, clientIp);
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("[SENTINEL] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function loadThresholds(supabase: SupabaseClient): Promise<SecurityThresholds> {
  const { data } = await supabase
    .from("security_thresholds")
    .select("threshold_name, threshold_value");

  const defaults: SecurityThresholds = {
    failed_login_captcha_trigger: 3,
    failed_login_block_trigger: 10,
    block_duration_minutes: 15,
    rate_limit_free_per_minute: 30,
    rate_limit_paid_per_minute: 100,
    threat_score_captcha_threshold: 40,
    threat_score_block_threshold: 85,
    captcha_failure_block_count: 3,
    ip_reputation_decay_hours: 24,
  };

  if (data) {
    (data as ThresholdRow[]).forEach((row) => {
      const key = row.threshold_name as keyof SecurityThresholds;
      if (key in defaults) {
        defaults[key] = row.threshold_value;
      }
    });
  }

  return defaults;
}

async function handleAnalyze(
  supabase: SupabaseClient,
  ip: string,
  body: AnalyzeRequest,
  thresholds: SecurityThresholds
): Promise<Response> {
  // Get or create IP reputation
  const { data: ipRepData } = await supabase
    .from("ip_reputation")
    .select("*")
    .eq("ip_address", ip)
    .single();

  const ipRep = ipRepData as IpReputationRow | null;
  const reputation = ipRep?.reputation_score ?? 50;
  const failedAttempts = ipRep?.failed_attempts ?? 0;
  const captchaFailures = ipRep?.captcha_failures ?? 0;

  // Check if IP is blocked
  if (ipRep?.permanent_block || (ipRep?.blocked_until && new Date(ipRep.blocked_until) > new Date())) {
    return new Response(
      JSON.stringify({
        threatScore: 100,
        action: "block",
        captchaRequired: false,
        blocked: true,
        blockReason: ipRep.block_reason || "IP temporarily blocked",
        ipReputation: reputation,
        rateLimit: { allowed: false, remaining: 0, resetIn: 0 },
      } as ThreatAnalysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Calculate threat score
  let threatScore = 0;

  // IP reputation weight (30%)
  threatScore += (100 - reputation) * 0.3;

  // Failed attempts weight (25%)
  const failedWeight = Math.min(failedAttempts / thresholds.failed_login_block_trigger, 1) * 25;
  threatScore += failedWeight;

  // Captcha failures weight (20%)
  const captchaWeight = Math.min(captchaFailures / thresholds.captcha_failure_block_count, 1) * 20;
  threatScore += captchaWeight;

  // Recent activity velocity (25%)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const { count: recentRequests } = await supabase
    .from("security_events")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", oneMinuteAgo);

  const rateLimit = body.userId ? thresholds.rate_limit_paid_per_minute : thresholds.rate_limit_free_per_minute;
  const velocityWeight = Math.min((recentRequests || 0) / rateLimit, 1) * 25;
  threatScore += velocityWeight;

  threatScore = Math.min(Math.round(threatScore), 100);

  // Determine action
  let action: "allow" | "challenge" | "block" = "allow";
  let captchaRequired = false;
  let captchaType: "invisible" | "checkbox" | "puzzle" | undefined;
  let blocked = false;
  let blockReason: string | undefined;

  if (threatScore >= thresholds.threat_score_block_threshold) {
    action = "block";
    blocked = true;
    blockReason = "Threat score exceeded threshold";
    
    // Block the IP
    const blockUntil = new Date(Date.now() + thresholds.block_duration_minutes * 60 * 1000);
    await supabase.from("ip_reputation").upsert({
      ip_address: ip,
      reputation_score: Math.max(0, reputation - 20),
      blocked_until: blockUntil.toISOString(),
      block_reason: blockReason,
      updated_at: new Date().toISOString(),
    }, { onConflict: "ip_address" });

    // Log the event
    await supabase.from("security_events").insert({
      event_type: "blocked",
      severity: "high",
      ip_address: ip,
      user_id: body.userId,
      endpoint: body.endpoint,
      threat_score: threatScore,
      action_taken: "blocked",
      request_metadata: body.metadata || {},
    });
  } else if (threatScore >= thresholds.threat_score_captcha_threshold) {
    action = "challenge";
    captchaRequired = true;
    
    // Determine captcha type based on threat level
    if (threatScore >= 70) {
      captchaType = "puzzle";
    } else if (threatScore >= 50) {
      captchaType = "checkbox";
    } else {
      captchaType = "invisible";
    }

    await supabase.from("security_events").insert({
      event_type: "suspicious_pattern",
      severity: "medium",
      ip_address: ip,
      user_id: body.userId,
      endpoint: body.endpoint,
      threat_score: threatScore,
      action_taken: "challenged",
      request_metadata: body.metadata || {},
    });
  }

  // Update IP stats
  const currentTotalRequests = ipRep?.total_requests ?? 0;
  await supabase.from("ip_reputation").upsert({
    ip_address: ip,
    total_requests: currentTotalRequests + 1,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "ip_address" });

  const remaining = Math.max(0, rateLimit - (recentRequests || 0));

  return new Response(
    JSON.stringify({
      threatScore,
      action,
      captchaRequired,
      captchaType,
      blocked,
      blockReason,
      ipReputation: reputation,
      rateLimit: { 
        allowed: remaining > 0, 
        remaining, 
        resetIn: 60 
      },
    } as ThreatAnalysis),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleVerifyCaptcha(
  supabase: SupabaseClient,
  ip: string,
  body: AnalyzeRequest
): Promise<Response> {
  if (!body.captchaToken) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing captcha token" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verify with hCaptcha
  const HCAPTCHA_SECRET = Deno.env.get("HCAPTCHA_SECRET_KEY");
  
  if (!HCAPTCHA_SECRET) {
    // If no hCaptcha configured, log and allow (development mode)
    console.log("[SENTINEL] hCaptcha not configured, allowing request");
    return new Response(
      JSON.stringify({ success: true, score: 1.0, development: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const verifyResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${body.captchaToken}&secret=${HCAPTCHA_SECRET}`,
    });

    const result = await verifyResponse.json();

    if (result.success) {
      // Update IP reputation positively
      await supabase.rpc("update_ip_reputation", {
        p_ip_address: ip,
        p_delta: 5,
        p_event_type: "success",
      });

      // Log successful captcha
      await supabase.from("captcha_challenges").insert({
        challenge_token: body.captchaToken.substring(0, 50),
        ip_address: ip,
        user_id: body.userId,
        action: body.endpoint || "unknown",
        verified_at: new Date().toISOString(),
        success: true,
        score: result.score || 1.0,
      });

      return new Response(
        JSON.stringify({ success: true, score: result.score }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Update IP reputation negatively
      await supabase.rpc("update_ip_reputation", {
        p_ip_address: ip,
        p_delta: -10,
        p_event_type: "failed",
      });

      // Increment captcha failures manually
      const { data: currentIp } = await supabase
        .from("ip_reputation")
        .select("captcha_failures")
        .eq("ip_address", ip)
        .single();

      const currentFailures = (currentIp as { captcha_failures: number } | null)?.captcha_failures ?? 0;
      
      await supabase
        .from("ip_reputation")
        .update({ 
          captcha_failures: currentFailures + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("ip_address", ip);

      // Log failed captcha
      await supabase.from("captcha_challenges").insert({
        challenge_token: body.captchaToken.substring(0, 50),
        ip_address: ip,
        user_id: body.userId,
        action: body.endpoint || "unknown",
        verified_at: new Date().toISOString(),
        success: false,
        failure_reason: result["error-codes"]?.join(", ") || "Verification failed",
      });

      await supabase.from("security_events").insert({
        event_type: "captcha_failed",
        severity: "medium",
        ip_address: ip,
        user_id: body.userId,
        action_taken: "logged",
      });

      return new Response(
        JSON.stringify({ success: false, error: "Captcha verification failed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[SENTINEL] Captcha verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Verification service unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handleLogEvent(
  supabase: SupabaseClient,
  ip: string,
  body: AnalyzeRequest
): Promise<Response> {
  const { error } = await supabase.from("security_events").insert({
    event_type: body.eventType || "unknown",
    severity: body.severity || "low",
    ip_address: ip,
    user_id: body.userId,
    user_agent: body.userAgent,
    endpoint: body.endpoint,
    request_metadata: body.metadata || {},
    action_taken: "logged",
  });

  if (error) {
    console.error("[SENTINEL] Log event error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update IP reputation based on event type
  if (body.eventType === "failed_login") {
    await supabase.rpc("update_ip_reputation", {
      p_ip_address: ip,
      p_delta: -5,
      p_event_type: "failed",
    });
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleIpStatus(
  supabase: SupabaseClient,
  ip: string
): Promise<Response> {
  const { data: ipRepData } = await supabase
    .from("ip_reputation")
    .select("*")
    .eq("ip_address", ip)
    .single();

  const ipRep = ipRepData as IpReputationRow | null;
  const blocked = ipRep?.permanent_block || 
    (ipRep?.blocked_until && new Date(ipRep.blocked_until) > new Date());

  return new Response(
    JSON.stringify({
      ip,
      reputation: ipRep?.reputation_score ?? 50,
      blocked: blocked ?? false,
      blockedUntil: ipRep?.blocked_until,
      totalRequests: ipRep?.total_requests ?? 0,
      failedAttempts: ipRep?.failed_attempts ?? 0,
      captchaFailures: ipRep?.captcha_failures ?? 0,
      lastSeen: ipRep?.last_seen_at,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
