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

    const { input, results, bestCase, worstCase, overallRisk } = analysis;
    const marketContext = MARKET_CONTEXT[input.market] || MARKET_CONTEXT.US;

    // Build context for the AI with market-specific info
    const scenarioSummary = results.map((r: any) => 
      `- ${r.scenario.name}: ${r.returnMin.toFixed(1)}% to ${r.returnMax.toFixed(1)}% return, ${r.scenario.riskLevel} risk`
    ).join('\n');

    const systemPrompt = `You are a professional trading analyst providing educational scenario analysis for the ${marketContext.name} market. Your role is to help traders understand potential outcomes across different market conditions.

MARKET CONTEXT:
- Market: ${marketContext.name}
- Currency: ${marketContext.currency}
- Central Bank: ${marketContext.centralBank}

CRITICAL RULES:
- NEVER use words like "guarantee", "will", "definitely", "certainly", or make price predictions
- Always use probabilistic language: "may", "could", "might", "tends to", "historically"
- State clearly this is educational analysis, not financial advice
- Focus on risk awareness and scenario-based thinking
- Reference market-specific factors (e.g., Fed for US, BOE for UK, ECB for Europe)
- Be concise but insightful (3-4 paragraphs max)`;

    const userPrompt = `Analyze this ${input.direction.toUpperCase()} trade on ${input.asset} in the ${marketContext.name} market at entry price ${marketContext.currency} ${input.entryPrice} with a ${input.timeHorizon} time horizon.

SCENARIO ANALYSIS:
${scenarioSummary}

Best case: ${bestCase.scenario.name} (up to ${bestCase.returnMax.toFixed(1)}%)
Worst case: ${worstCase.scenario.name} (down to ${worstCase.returnMin.toFixed(1)}%)
Overall risk rating: ${overallRisk}

Provide a plain-English explanation that:
1. Highlights which scenarios matter most for this ${marketContext.name} market trade
2. Identifies where the biggest risk comes from (consider ${marketContext.centralBank} policy, regional factors)
3. Explains why this trade could fail
4. Uses probabilistic language throughout
5. References market-specific factors relevant to ${input.asset}`;

    console.log(`Analyzing ${input.direction} trade for ${input.asset} in ${input.market} market at ${input.entryPrice}`);

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
