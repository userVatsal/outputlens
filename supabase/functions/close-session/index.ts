/**
 * close-session - Secure session closing endpoint
 * Replaces sendBeacon direct database writes to prevent RLS bypass
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloseSessionRequest {
  sessionId: string;
  visitorId: string;
  exitPage: string;
  totalTimeSeconds: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: CloseSessionRequest = await req.json();
    const { sessionId, visitorId, exitPage, totalTimeSeconds } = body;

    // Validate required fields
    if (!sessionId || !visitorId) {
      return new Response(
        JSON.stringify({ error: 'Missing sessionId or visitorId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate sessionId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId) || !uuidRegex.test(visitorId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid sessionId or visitorId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Verify that this session belongs to this visitor
    // This prevents attackers from closing other users' sessions
    const { data: session, error: fetchError } = await supabase
      .from('behavior_sessions')
      .select('id, visitor_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      console.log(`[CLOSE-SESSION] Session not found: ${sessionId}`);
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify visitor ownership
    if (session.visitor_id !== visitorId) {
      console.warn(`[CLOSE-SESSION] Visitor mismatch: session=${sessionId}, claimed=${visitorId}, actual=${session.visitor_id}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the session with end data
    const { error: updateError } = await supabase
      .from('behavior_sessions')
      .update({
        ended_at: new Date().toISOString(),
        exit_page: exitPage?.substring(0, 500) || null,
        total_time_seconds: Math.min(Math.max(0, totalTimeSeconds || 0), 86400), // Cap at 24 hours
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('[CLOSE-SESSION] Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to close session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CLOSE-SESSION] Session closed: ${sessionId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CLOSE-SESSION] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
