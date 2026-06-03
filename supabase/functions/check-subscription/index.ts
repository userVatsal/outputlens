import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Map Stripe product IDs to subscription plans
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_TqfQu2gGDuzYwB": "starter",
  "prod_TqfWL1KQ91RU1B": "pro",
  "prod_TqfW4TNxviN7w5": "trader",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // No auth - return free tier (not an error)
      logStep("No auth header, returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      // Auth failed - return free tier (not an error)
      logStep("Auth failed, returning free tier", { error: userError?.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No email, returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check for database override first (for testing/demo accounts)
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("subscription_plan")
      .eq("user_id", user.id)
      .single();

    const dbPlan = profileData?.subscription_plan;
    logStep("Database plan check", { dbPlan });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Graceful fallback helper when Stripe is unreachable / key invalid.
    const fallbackToDb = (reason: string) => {
      logStep("Stripe unavailable - falling back to DB plan", { reason, dbPlan });
      const plan = dbPlan && dbPlan !== "free" ? dbPlan : "free";
      return new Response(JSON.stringify({
        subscribed: plan !== "free",
        plan,
        subscription_end: null,
        fallback: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    };

    let customers;
    try {
      customers = await stripe.customers.list({ email: user.email, limit: 1 });
    } catch (e) {
      return fallbackToDb(e instanceof Error ? e.message : String(e));
    }

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      
      // Check for database override before returning free
      if (dbPlan && dbPlan !== 'free') {
        logStep("Using database plan override (no Stripe customer)", { plan: dbPlan });
        return new Response(JSON.stringify({ 
          subscribed: true,
          plan: dbPlan,
          subscription_end: null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Update profile to free
      await supabaseClient
        .from("profiles")
        .update({ 
          subscription_plan: "free",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          plan_expires_at: null
        })
        .eq("user_id", user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    let subscriptions;
    try {
      subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
    } catch (e) {
      return fallbackToDb(e instanceof Error ? e.message : String(e));
    }

    if (subscriptions.data.length === 0) {
      logStep("No active Stripe subscription found");
      
      // Check for database override before returning free
      if (dbPlan && dbPlan !== 'free') {
        logStep("Using database plan override (no Stripe subscription)", { plan: dbPlan });
        return new Response(JSON.stringify({ 
          subscribed: true,
          plan: dbPlan,
          subscription_end: null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Update profile to free
      await supabaseClient
        .from("profiles")
        .update({ 
          subscription_plan: "free",
          stripe_customer_id: customerId,
          stripe_subscription_id: null,
          plan_expires_at: null
        })
        .eq("user_id", user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const productId = subscription.items.data[0].price.product as string;
    const plan = PRODUCT_TO_PLAN[productId] || "free";
    
    logStep("Active subscription found", { 
      subscriptionId: subscription.id, 
      productId, 
      plan,
      endDate: subscriptionEnd 
    });

    // Update profile with subscription info
    await supabaseClient
      .from("profiles")
      .update({ 
        subscription_plan: plan,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_started_at: new Date(subscription.start_date * 1000).toISOString(),
        plan_expires_at: subscriptionEnd
      })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      subscribed: true,
      plan,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    // Never return 500 — frontend treats this as a hard error and crashes.
    return new Response(JSON.stringify({
      subscribed: false,
      plan: "free",
      subscription_end: null,
      fallback: true,
      error: errorMessage,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
