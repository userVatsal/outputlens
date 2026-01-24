import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MARKET_CONTEXT: Record<string, { name: string; centralBank: string; currency: string }> = {
  US: { name: 'United States', centralBank: 'Federal Reserve (Fed)', currency: 'USD' },
  UK: { name: 'United Kingdom', centralBank: 'Bank of England (BOE)', currency: 'GBP' },
  EU: { name: 'Europe', centralBank: 'European Central Bank (ECB)', currency: 'EUR' },
};

// Tier-based AI model selection
const MODEL_BY_TIER: Record<string, string> = {
  free: 'google/gemini-2.5-flash-lite',
  starter: 'google/gemini-3-flash-preview',
  pro: 'google/gemini-3-flash-preview',
  trader: 'google/gemini-2.5-pro',
};

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 30,
  pro: 100,
  trader: 500,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { analysis, tier = 'free' } = await req.json();
    
    if (!analysis) {
      throw new Error("Analysis data is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Server-side usage verification (optional - user auth check)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      
      if (userData?.user) {
        const userId = userData.user.id;
        const monthYear = new Date().toISOString().slice(0, 7);
        
        // Check usage limit
        const { data: usageData } = await supabase
          .from("usage_tracking")
          .select("analysis_count")
          .eq("user_id", userId)
          .eq("month_year", monthYear)
          .maybeSingle();
        
        // Get user's plan
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("user_id", userId)
          .maybeSingle();
        
        const userPlan = profile?.subscription_plan || 'free';
        const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
        const currentCount = usageData?.analysis_count || 0;
        
        if (currentCount >= limit) {
          console.log(`[ANALYZE] User ${userId} exceeded limit: ${currentCount}/${limit}`);
          return new Response(
            JSON.stringify({ 
              error: "Monthly analysis limit reached",
              code: "LIMIT_EXCEEDED",
              plan: userPlan,
              limit: limit,
              current: currentCount,
              upgrade_url: "/pricing"
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const { input, marketData, riskMetrics, scenarios, simulation, bestCase, worstCase, overallRisk } = analysis;
    const marketContext = MARKET_CONTEXT[input.market] || MARKET_CONTEXT.US;
    
    // Select model based on tier
    const model = MODEL_BY_TIER[tier] || MODEL_BY_TIER.free;
    console.log(`[ANALYZE] Using model: ${model} for tier: ${tier}`);

    // Build structured scenario summary
    const formatScenarios = (categoryScenarios: any[], categoryName: string) => {
      if (!categoryScenarios || categoryScenarios.length === 0) return '';
      return `${categoryName}:\n${categoryScenarios.map((s: any) => 
        `  - ${s.name} (${(s.probability * 100).toFixed(0)}% probability): ${s.returnRangeMin.toFixed(1)}% to ${s.returnRangeMax.toFixed(1)}% return`
      ).join('\n')}`;
    };

    const scenarioSummary = [
      formatScenarios(scenarios.base, 'BASE CASE'),
      formatScenarios(scenarios.upside, 'UPSIDE SCENARIOS'),
      formatScenarios(scenarios.downside, 'DOWNSIDE SCENARIOS'),
      formatScenarios(scenarios.tail, 'TAIL RISK EVENTS'),
    ].filter(Boolean).join('\n\n');

    const dataQualityNote = marketData?.dataQuality === 'live' 
      ? `Live data from ${marketData.source}` 
      : 'Using market default estimates';

    const systemPrompt = `You are a professional trading analyst providing educational scenario analysis for the ${marketContext.name} market. Your role is to help traders understand potential outcomes and think critically about their trade.

MARKET CONTEXT:
- Market: ${marketContext.name}
- Currency: ${marketContext.currency}
- Central Bank: ${marketContext.centralBank}

DATA FLOW CONTEXT:
You are the qualitative reasoning layer of a structured analysis system. Before you:
1. User manually entered trade details (asset, direction, entry price, time horizon, confidence level)
2. System fetched live market data and computed volatility
3. System ran Monte Carlo simulation with ${simulation?.paths?.toLocaleString() || '10,000'} paths
4. System generated dynamic scenarios with calculated probabilities
5. System computed advanced risk metrics (VaR, Expected Shortfall, win/loss probability)

Your job is to synthesize this data into educational insights, NOT to predict outcomes.

CRITICAL RULES:
- NEVER use words like "guarantee", "will", "definitely", "certainly", or make price predictions
- Always use probabilistic language: "may", "could", "might", "tends to", "historically"
- State clearly this is educational analysis, not financial advice
- Reference the specific probabilities from the Monte Carlo simulation
- Explain what the VaR and Expected Shortfall mean in practical terms
- Focus on explaining WHY scenarios exist and what drives them
- Reference market-specific factors (${marketContext.centralBank} policy, regional risks)
- Be concise but insightful (3-4 paragraphs max)
- Prioritize clarity and explainability over technical jargon`;

    const userPrompt = `Analyze this ${input.direction.toUpperCase()} trade on ${input.asset} in the ${marketContext.name} market.

TRADE PARAMETERS (user input):
- Asset: ${input.asset}
- Direction: ${input.direction.toUpperCase()}
- Entry Price: ${marketContext.currency} ${input.entryPrice}
- Time Horizon: ${input.timeHorizon}
- User Confidence: ${input.confidence || 5}/10
${input.assumptions ? `- User Thesis: "${input.assumptions}"` : ''}

LIVE MARKET DATA (${dataQualityNote}):
- Current Price: ${marketContext.currency} ${marketData?.price || input.entryPrice}
- Annualized Volatility: ${marketData?.volatility?.toFixed(1) || 'N/A'}%
${marketData?.changePercent ? `- Today's Change: ${marketData.changePercent > 0 ? '+' : ''}${marketData.changePercent.toFixed(2)}%` : ''}

MONTE CARLO SIMULATION (${simulation?.paths?.toLocaleString() || '10,000'} paths):
- Mean Expected Return: ${simulation?.meanReturn?.toFixed(2) || 'N/A'}%
- Median Return: ${simulation?.medianReturn?.toFixed(2) || 'N/A'}%
- Standard Deviation: ${simulation?.stdDev?.toFixed(2) || 'N/A'}%
- Distribution Skew: ${simulation?.skewness?.toFixed(2) || 'N/A'} (${simulation?.skewness < 0 ? 'left-skewed, more downside risk' : simulation?.skewness > 0 ? 'right-skewed, more upside potential' : 'symmetric'})
- Tail Thickness (Kurtosis): ${simulation?.kurtosis?.toFixed(2) || 'N/A'} (${simulation?.kurtosis > 1 ? 'fat tails - extreme moves more likely than normal' : 'normal tails'})

RISK METRICS:
- Probability of Profit: ${riskMetrics?.probabilityOfProfit ? (riskMetrics.probabilityOfProfit * 100).toFixed(0) : 'N/A'}%
- Probability of Loss: ${riskMetrics?.probabilityOfLoss ? (riskMetrics.probabilityOfLoss * 100).toFixed(0) : 'N/A'}%
- 95% Value at Risk (VaR): ${riskMetrics?.valueAtRisk95?.toFixed(1) || 'N/A'}% (95% of outcomes better than this)
- Expected Shortfall (CVaR): ${riskMetrics?.expectedShortfall?.toFixed(1) || 'N/A'}% (average loss in worst 5% of cases)
- Risk Score: ${riskMetrics?.riskScore || 'N/A'}/10 (${riskMetrics?.riskLabel || 'N/A'})

PROBABILITY-WEIGHTED SCENARIOS:
${scenarioSummary}

SUMMARY:
- Best case: ${bestCase?.scenario?.name || 'N/A'} (up to ${bestCase?.returnMax?.toFixed(1) || 'N/A'}%)
- Worst case: ${worstCase?.scenario?.name || 'N/A'} (down to ${worstCase?.returnMin?.toFixed(1) || 'N/A'}%)
- Overall risk rating: ${overallRisk}

Provide an educational explanation that:
1. Interprets the Monte Carlo simulation results - what does the ${(riskMetrics?.probabilityOfProfit * 100)?.toFixed(0) || 'N/A'}% win probability mean practically?
2. Explains the VaR and Expected Shortfall in plain English - what should the trader expect in worst cases?
3. Identifies which scenario categories matter most based on the probabilities
4. ${simulation?.kurtosis > 1 ? 'Warns about the fat tails detected - extreme moves are more likely than a normal distribution would suggest' : 'Notes that the distribution shows typical market behavior'}
5. ${input.assumptions ? `Considers the user's thesis: "${input.assumptions}" - does it align with the probabilistic outcomes?` : 'Highlights key risk factors specific to ' + input.asset}

Focus on helping the trader understand the RANGE of possibilities and the FACTORS that could influence outcomes.`;

    console.log(`[ANALYZE] Analyzing ${input.direction} trade for ${input.asset} in ${input.market} market`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content;

    if (!explanation) {
      throw new Error("No explanation generated");
    }

    const latency = Date.now() - startTime;
    console.log(`[ANALYZE] Generated explanation in ${latency}ms for ${input.asset} (${input.market})`);

    // Log metrics
    await supabase
      .from("platform_metrics")
      .insert({
        metric_type: 'ai_cost',
        metric_name: 'analyze_trade_call',
        metric_value: 1,
        dimensions: { tier, model, asset: input.asset, latency_ms: latency }
      });

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-trade:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
