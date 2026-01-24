/**
 * Sentiment Processing Agent
 * 
 * Uses Lovable AI Gateway to analyze qualitative signals and extract:
 * - Sentiment score (-1 to +1)
 * - Expected price impact
 * - Confidence level
 * - Key entities and keywords
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessRequest {
  limit?: number;
  asset?: string;
}

interface SentimentOutput {
  sentiment_score: number;
  confidence: number;
  expected_impact: number;
  impact_timeframe: string;
  entities: { name: string; type: string }[];
  keywords: string[];
  reasoning: string;
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
    const { limit = 20, asset }: ProcessRequest = await req.json().catch(() => ({}));
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Log agent run
    const { data: runData } = await supabase
      .from("agent_runs")
      .insert({
        agent_name: "sentiment-processor",
        agent_type: "nlp",
        status: "running",
        metadata: { limit, asset }
      })
      .select()
      .single();

    const runId = runData?.id;
    let itemsProcessed = 0;
    let itemsFailed = 0;

    // Fetch unprocessed signals
    let query = supabase
      .from("qualitative_signals")
      .select("*")
      .eq("processed", false)
      .order("fetched_at", { ascending: false })
      .limit(limit);

    if (asset) {
      query = query.eq("asset", asset);
    }

    const { data: signals, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch signals: ${fetchError.message}`);
    }

    if (!signals || signals.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No signals to process", itemsProcessed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${signals.length} signals`);

    // Process signals in batches of 5 to avoid rate limits
    for (let i = 0; i < signals.length; i += 5) {
      const batch = signals.slice(i, i + 5);
      
      await Promise.all(batch.map(async (signal) => {
        try {
          const sentimentResult = await analyzeSentiment(signal, LOVABLE_API_KEY);
          
          // Insert sentiment score
          const { error: insertError } = await supabase
            .from("sentiment_scores")
            .insert({
              signal_id: signal.id,
              asset: signal.asset || "UNKNOWN",
              sentiment_score: sentimentResult.sentiment_score,
              confidence: sentimentResult.confidence,
              expected_impact: sentimentResult.expected_impact,
              impact_timeframe: sentimentResult.impact_timeframe,
              entities: sentimentResult.entities,
              keywords: sentimentResult.keywords,
              reasoning: sentimentResult.reasoning,
              model_used: "google/gemini-3-flash-preview"
            });

          if (insertError) {
            throw insertError;
          }

          // Mark signal as processed
          await supabase
            .from("qualitative_signals")
            .update({ processed: true })
            .eq("id", signal.id);

          itemsProcessed++;
          console.log(`Processed signal ${signal.id}: sentiment=${sentimentResult.sentiment_score}`);

        } catch (signalError) {
          console.error(`Failed to process signal ${signal.id}:`, signalError);
          
          // Mark as processed with error
          await supabase
            .from("qualitative_signals")
            .update({
              processed: true,
              processing_error: signalError instanceof Error ? signalError.message : "Unknown error"
            })
            .eq("id", signal.id);

          itemsFailed++;
        }
      }));

      // Small delay between batches
      if (i + 5 < signals.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Update agent run
    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          items_processed: itemsProcessed,
          items_failed: itemsFailed
        })
        .eq("id", runId);
    }

    console.log(`Sentiment processing complete: ${itemsProcessed} processed, ${itemsFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        itemsProcessed,
        itemsFailed,
        message: `Processed ${itemsProcessed} signals`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Sentiment processing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeSentiment(signal: any, apiKey: string): Promise<SentimentOutput> {
  const systemPrompt = `You are a financial sentiment analyzer for OutputLens, a quantitative trading analysis platform. Analyze the following news/content and extract structured sentiment data.

CRITICAL RULES:
- sentiment_score: -1 (extremely bearish) to +1 (extremely bullish), 0 = neutral
- confidence: 0-1 scale for how confident you are in the analysis
- expected_impact: Expected price impact in percentage (-10 to +10 typical)
- impact_timeframe: "immediate", "1-3 days", "1 week", "1 month"
- entities: Extract mentioned companies, people, sectors, events
- keywords: Extract 3-5 key terms
- reasoning: One sentence explaining why

Be precise and quantitative. Focus on market-moving implications.`;

  const userPrompt = `Analyze this content for market sentiment:

SOURCE: ${signal.source_name}
ASSET: ${signal.asset || "Unknown"}
TITLE: ${signal.title || ""}
CONTENT: ${signal.content}
PUBLISHED: ${signal.published_at || "Unknown"}

Return structured JSON output.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "extract_sentiment",
          description: "Extract structured sentiment data from financial content",
          parameters: {
            type: "object",
            properties: {
              sentiment_score: {
                type: "number",
                description: "Sentiment from -1 (bearish) to +1 (bullish)"
              },
              confidence: {
                type: "number",
                description: "Confidence in analysis from 0 to 1"
              },
              expected_impact: {
                type: "number",
                description: "Expected price impact in percentage"
              },
              impact_timeframe: {
                type: "string",
                enum: ["immediate", "1-3 days", "1 week", "1 month"]
              },
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string", enum: ["company", "person", "sector", "event", "macro"] }
                  }
                }
              },
              keywords: {
                type: "array",
                items: { type: "string" }
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of sentiment"
              }
            },
            required: ["sentiment_score", "confidence", "expected_impact", "impact_timeframe", "keywords", "reasoning"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "extract_sentiment" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded");
    }
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  
  // Extract tool call result
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new Error("No structured output received");
  }

  const result = JSON.parse(toolCall.function.arguments);
  
  return {
    sentiment_score: Math.max(-1, Math.min(1, result.sentiment_score || 0)),
    confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    expected_impact: result.expected_impact || 0,
    impact_timeframe: result.impact_timeframe || "1 week",
    entities: result.entities || [],
    keywords: result.keywords || [],
    reasoning: result.reasoning || ""
  };
}