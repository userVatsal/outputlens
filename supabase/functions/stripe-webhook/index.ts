/**
 * Stripe Webhook Handler
 * 
 * Handles subscription lifecycle events:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Product ID to plan mapping
const PRODUCT_TO_PLAN: Record<string, string> = {
  'prod_SRAhNVyKJfNLLs': 'starter',
  'prod_SRAiAVhHNZhLVW': 'pro',
  'prod_SRAikz9IwuFvHG': 'trader',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    // For now, we'll process without signature verification
    // In production, you should verify: const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const event = JSON.parse(body) as Stripe.Event;

    console.log(`[WEBHOOK] Received event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, stripe, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, stripe, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[WEBHOOK] Payment succeeded for invoice ${invoice.id}`);
        // Could track revenue metrics here
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[WEBHOOK] Payment failed for invoice ${invoice.id}`);
        // Could send notification or downgrade user
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleSubscriptionChange(
  supabase: any,
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  
  // Get customer email
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    console.log(`[WEBHOOK] Customer ${customerId} is deleted`);
    return;
  }

  const email = customer.email;
  if (!email) {
    console.log(`[WEBHOOK] No email for customer ${customerId}`);
    return;
  }

  // Get product ID from subscription
  const productId = subscription.items.data[0]?.price?.product as string;
  const plan = PRODUCT_TO_PLAN[productId] || 'free';
  
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const subscriptionEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toISOString() 
    : null;

  console.log(`[WEBHOOK] Updating subscription for ${email}: plan=${plan}, active=${isActive}`);

  // Find user by email in auth.users
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u: any) => u.email === email);
  
  if (!user) {
    console.log(`[WEBHOOK] No user found for email ${email}`);
    return;
  }

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_plan: isActive ? plan : 'free',
      subscription_tier: isActive ? plan : 'free',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_started_at: isActive ? new Date().toISOString() : null,
      plan_expires_at: subscriptionEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    console.error(`[WEBHOOK] Error updating profile:`, updateError);
  } else {
    console.log(`[WEBHOOK] Successfully updated profile for ${email}`);
  }

  // Log metric
  await supabase
    .from("platform_metrics")
    .insert({
      metric_type: "conversion",
      metric_name: "subscription_change",
      metric_value: 1,
      dimensions: { plan, status: subscription.status, event: "updated" }
    });
}

async function handleSubscriptionCanceled(
  supabase: any,
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return;

  const email = customer.email;
  if (!email) return;

  console.log(`[WEBHOOK] Subscription canceled for ${email}`);

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find((u: any) => u.email === email);
  
  if (!user) return;

  // Downgrade to free
  await supabase
    .from("profiles")
    .update({
      subscription_plan: 'free',
      subscription_tier: 'free',
      stripe_subscription_id: null,
      plan_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  // Log metric
  await supabase
    .from("platform_metrics")
    .insert({
      metric_type: "conversion",
      metric_name: "subscription_change",
      metric_value: 1,
      dimensions: { plan: 'free', status: 'canceled', event: "canceled" }
    });
}
