import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MARKET_CONTEXT: Record<string, { name: string; centralBank: string; currency: string }> = {
  US: { name: 'United States', centralBank: 'Federal Reserve (Fed)', currency: 'USD' },
  UK: { name: 'United Kingdom', centralBank: 'Bank of England (BOE)', currency: 'GBP' },
  EU: { name: 'Europe', centralBank: 'European Central Bank (ECB)', currency: 'EUR' },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis } = await req.json();
    
    if (!analysis) {
      throw new Error("Analysis data is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { input, quantMetrics, scenarios, bestCase, worstCase, overallRisk } = analysis;
    const marketContext = MARKET_CONTEXT[input.market] || MARKET_CONTEXT.US;

    // Build structured scenario summary by category
    const formatScenarios = (categoryScenarios: any[], categoryName: string) => {
      if (!categoryScenarios || categoryScenarios.length === 0) return '';
      return `${categoryName}:\n${categoryScenarios.map((r: any) => 
        `  - ${r.scenario.name} (${r.scenario.probability}): ${r.returnMin.toFixed(1)}% to ${r.returnMax.toFixed(1)}% return`
      ).join('\n')}`;
    };

    const scenarioSummary = [
      formatScenarios(scenarios.base, 'BASE CASE'),
      formatScenarios(scenarios.upside, 'UPSIDE SCENARIOS'),
      formatScenarios(scenarios.downside, 'DOWNSIDE SCENARIOS'),
      formatScenarios(scenarios.tail, 'TAIL RISK EVENTS'),
    ].filter(Boolean).join('\n\n');

    const systemPrompt = `You are a professional trading analyst providing educational scenario analysis for the ${marketContext.name} market. Your role is to help traders understand potential outcomes and think critically about their trade.

MARKET CONTEXT:
- Market: ${marketContext.name}
- Currency: ${marketContext.currency}
- Central Bank: ${marketContext.centralBank}

DATA FLOW CONTEXT:
You are the qualitative reasoning layer of a structured analysis system. Before you:
1. User manually entered trade details (asset, direction, entry price, time horizon)
2. System validated user access and usage limits
3. System computed quantitative metrics (volatility, risk score)
4. System generated structured scenarios (base, upside, downside, tail)

Your job is to synthesize this data into educational insights, NOT to predict outcomes.

CRITICAL RULES:
- NEVER use words like "guarantee", "will", "definitely", "certainly", or make price predictions
- Always use probabilistic language: "may", "could", "might", "tends to", "historically"
- State clearly this is educational analysis, not financial advice
- Focus on explaining WHY scenarios exist and what drives them
- Reference market-specific factors (${marketContext.centralBank} policy, regional risks)
- Explain the quantitative metrics in plain English
- Be concise but insightful (3-4 paragraphs max)
- Prioritize clarity and explainability over technical jargon`;

    const userPrompt = `Analyze this ${input.direction.toUpperCase()} trade on ${input.asset} in the ${marketContext.name} market.

TRADE PARAMETERS (user input):
- Asset: ${input.asset}
- Direction: ${input.direction.toUpperCase()}
- Entry Price: ${marketContext.currency} ${input.entryPrice}
- Time Horizon: ${input.timeHorizon}

QUANTITATIVE METRICS (system computed):
- Volatility Estimate: ±${quantMetrics.volatilityProxy}% over ${quantMetrics.holdingPeriodDays} days
- Max Expected Move: ±${quantMetrics.maxExpectedMove}% (2σ range)
- Risk Score: ${quantMetrics.riskScore}/10 (${quantMetrics.riskLabel})

STRUCTURED SCENARIOS:
${scenarioSummary}

SUMMARY:
- Best case: ${bestCase.scenario.name} (up to ${bestCase.returnMax.toFixed(1)}%)
- Worst case: ${worstCase.scenario.name} (down to ${worstCase.returnMin.toFixed(1)}%)
- Overall risk rating: ${overallRisk}

Provide an educational explanation that:
1. Explains what the quantitative metrics mean for this specific trade
2. Identifies which scenario categories matter most and why
3. Highlights the key risk factors specific to the ${marketContext.name} market and ${input.asset}
4. Explains conditions under which this trade could fail
5. Uses clear, probabilistic language throughout

Focus on helping the trader understand the RANGE of possibilities and the FACTORS that could influence outcomes.`;

    console.log(`Analyzing ${input.direction} trade for ${input.asset} in ${input.market} market at ${input.entryPrice}`);
    console.log(`Quant metrics: volatility=${quantMetrics.volatilityProxy}%, risk=${quantMetrics.riskScore}/10`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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

    console.log(`Successfully generated explanation for ${input.asset} (${input.market})`);

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
