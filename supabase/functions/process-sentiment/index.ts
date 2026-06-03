/**
 * Optimized Sentiment Processing Agent
 * 
 * Features:
 * - Batched AI calls (up to 5 signals per request)
 * - Tier-based model selection
 * - Performance metrics logging
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
  tier?: 'free' | 'starter' | 'pro' | 'trader';
}

interface SentimentOutput {
  signal_id: string;
  sentiment_score: number;
  confidence: number;
  expected_impact: number;
  impact_timeframe: string;
  entities: { name: string; type: string }[];
  keywords: string[];
  reasoning: string;
}

// Tier-based AI model selection for cost optimization
const MODEL_BY_TIER: Record<string, string> = {
  free: 'google/gemini-2.5-flash-lite',      // Fastest, cheapest
  starter: 'google/gemini-3-flash-preview',   // Balanced
  pro: 'google/gemini-3-flash-preview',       // Balanced
  trader: 'google/gemini-2.5-pro',            // Highest quality
};

const BATCH_SIZE = 5; // Process 5 signals per AI call

// ─── Lightweight VADER sentiment scorer ───────────────────────────────────────
const VADER_LEXICON: Record<string, number> = {
  'beat': 2.1, 'beats': 2.1, 'exceeded': 2.3, 'surpassed': 2.2, 'outperformed': 2.4,
  'record': 1.8, 'growth': 1.6, 'profit': 1.7, 'revenue': 0.8, 'upgrade': 2.0,
  'buy': 1.5, 'bullish': 2.2, 'rally': 2.0, 'soar': 2.4, 'surge': 2.2, 'jump': 1.8,
  'gain': 1.6, 'gains': 1.6, 'rose': 1.4, 'rises': 1.4, 'up': 0.8, 'higher': 1.2,
  'strong': 1.5, 'strength': 1.5, 'positive': 1.3, 'good': 1.2, 'great': 2.0,
  'excellent': 2.4, 'outstanding': 2.4, 'impressive': 2.0, 'solid': 1.4,
  'momentum': 1.3, 'breakout': 1.9, 'expansion': 1.4, 'accelerating': 1.6,
  'innovation': 1.2, 'partnership': 1.1, 'deal': 1.0, 'acquisition': 0.8,
  'stable': 0.6, 'steady': 0.6, 'resilient': 1.0, 'recovery': 1.2, 'rebound': 1.4,
  'optimistic': 1.6, 'confident': 1.4, 'expect': 0.3, 'forecast': 0.2, 'guidance': 0.2,
  'miss': -2.0, 'missed': -2.0, 'below': -1.2, 'fell': -1.5, 'fall': -1.5,
  'drop': -1.6, 'drops': -1.6, 'decline': -1.5, 'declining': -1.5, 'decrease': -1.3,
  'loss': -1.8, 'losses': -1.8, 'down': -0.8, 'lower': -1.2, 'weak': -1.5,
  'weakness': -1.5, 'concern': -1.2, 'concerns': -1.2, 'risk': -0.8, 'risks': -0.8,
  'warning': -1.8, 'warn': -1.8, 'cut': -1.6, 'downgrade': -2.2, 'sell': -1.5,
  'bearish': -2.2, 'crash': -2.8, 'collapse': -2.6, 'plunge': -2.4, 'tank': -2.2,
  'tumble': -2.0, 'slump': -1.8, 'struggle': -1.4, 'disappointing': -2.0,
  'disappoints': -2.0, 'shortfall': -1.8, 'lawsuit': -1.6,
  'investigation': -1.4, 'fraud': -2.8, 'scandal': -2.4, 'recall': -1.6,
  'bankruptcy': -3.0, 'default': -2.6, 'layoffs': -1.4, 'restructuring': -1.0,
};
const NEGATORS = new Set(['not', 'no', 'never', 'neither', 'without', "n't", 'cannot', 'cant']);
const INTENSIFIERS: Record<string, number> = {
  'very': 1.3, 'extremely': 1.6, 'significantly': 1.4, 'substantially': 1.3,
  'massive': 1.5, 'major': 1.2, 'hugely': 1.4, 'barely': 0.6, 'slightly': 0.7,
};

function vaderScore(text: string): { compound: number; pos: number; neg: number; neu: number } {
  const words = (text || '').toLowerCase().replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(Boolean);
  const scores: number[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let score = VADER_LEXICON[word] ?? 0;
    if (score !== 0) {
      const prevWords = words.slice(Math.max(0, i - 3), i);
      if (prevWords.some(w => NEGATORS.has(w))) score *= -0.74;
      if (i > 0) {
        const intensifier = INTENSIFIERS[words[i - 1]];
        if (intensifier) score *= intensifier;
      }
      scores.push(score);
    }
  }
  if (scores.length === 0) return { compound: 0, pos: 0, neg: 0, neu: 1 };
  const sum = scores.reduce((a, b) => a + b, 0);
  const alpha = 15;
  const compound = sum / Math.sqrt(sum * sum + alpha);
  const totalMagnitude = scores.reduce((a, b) => a + Math.abs(b), 0) || 1;
  const posSum = scores.filter(s => s > 0).reduce((a, b) => a + b, 0);
  const negSum = Math.abs(scores.filter(s => s < 0).reduce((a, b) => a + b, 0));
  const pos = posSum / totalMagnitude;
  const neg = negSum / totalMagnitude;
  const neu = Math.max(0, 1 - pos - neg);
  return {
    compound: Math.max(-1, Math.min(1, compound)),
    pos: Math.max(0, pos),
    neg: Math.max(0, neg),
    neu,
  };
}

function vaderToFinancialSignal(compound: number) {
  if (compound >= 0.5)   return { label: 'very_bullish',  probabilityAdjustment: +0.08, volatilityAdjustment: -0.05 };
  if (compound >= 0.15)  return { label: 'bullish',        probabilityAdjustment: +0.04, volatilityAdjustment: -0.02 };
  if (compound <= -0.5)  return { label: 'very_bearish',   probabilityAdjustment: -0.08, volatilityAdjustment: +0.08 };
  if (compound <= -0.15) return { label: 'bearish',        probabilityAdjustment: -0.04, volatilityAdjustment: +0.04 };
  return { label: 'neutral', probabilityAdjustment: 0, volatilityAdjustment: 0 };
}
// ─── End VADER ────────────────────────────────────────────────────────────────

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
    const { limit = 20, asset, tier = 'pro' }: ProcessRequest = await req.json().catch(() => ({}));
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const model = MODEL_BY_TIER[tier] || MODEL_BY_TIER.pro;
    console.log(`[SENTIMENT] Starting processing with model: ${model} (tier: ${tier})`);

    // Log agent run
    const { data: runData } = await supabase
      .from("agent_runs")
      .insert({
        agent_name: "sentiment-processor",
        agent_type: "nlp",
        status: "running",
        metadata: { limit, asset, tier, model }
      })
      .select()
      .single();

    const runId = runData?.id;
    let itemsProcessed = 0;
    let itemsFailed = 0;
    let aiCallsCount = 0;

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

    console.log(`[SENTIMENT] Processing ${signals.length} signals in batches of ${BATCH_SIZE}`);

    // Process signals in batches for efficiency
    for (let i = 0; i < signals.length; i += BATCH_SIZE) {
      const batch = signals.slice(i, i + BATCH_SIZE);
      
      try {
        // Batch analyze all signals in one AI call
        const batchResults = await analyzeSentimentBatch(batch, LOVABLE_API_KEY, model);
        aiCallsCount++;
        
        // Insert all sentiment scores
        for (const result of batchResults) {
          try {
            const { error: insertError } = await supabase
              .from("sentiment_scores")
              .insert({
                signal_id: result.signal_id,
                asset: signals.find(s => s.id === result.signal_id)?.asset || "UNKNOWN",
                sentiment_score: result.sentiment_score,
                confidence: result.confidence,
                expected_impact: result.expected_impact,
                impact_timeframe: result.impact_timeframe,
                entities: result.entities,
                keywords: result.keywords,
                reasoning: result.reasoning,
                model_used: model
              });

            if (insertError) {
              throw insertError;
            }

            // Mark signal as processed
            await supabase
              .from("qualitative_signals")
              .update({ processed: true })
              .eq("id", result.signal_id);

            itemsProcessed++;
            console.log(`[SENTIMENT] Processed signal ${result.signal_id}: score=${result.sentiment_score}`);

          } catch (signalError) {
            console.error(`[SENTIMENT] Failed to save signal ${result.signal_id}:`, signalError);
            
            await supabase
              .from("qualitative_signals")
              .update({
                processed: true,
                processing_error: signalError instanceof Error ? signalError.message : "Save error"
              })
              .eq("id", result.signal_id);

            itemsFailed++;
          }
        }

      } catch (batchError) {
        console.error(`[SENTIMENT] Batch processing failed:`, batchError);
        
        // Fallback: process signals individually if batch fails
        for (const signal of batch) {
          try {
            const results = await analyzeSentimentBatch([signal], LOVABLE_API_KEY, model);
            aiCallsCount++;
            
            if (results.length > 0) {
              const result = results[0];
              
              await supabase
                .from("sentiment_scores")
                .insert({
                  signal_id: result.signal_id,
                  asset: signal.asset || "UNKNOWN",
                  sentiment_score: result.sentiment_score,
                  confidence: result.confidence,
                  expected_impact: result.expected_impact,
                  impact_timeframe: result.impact_timeframe,
                  entities: result.entities,
                  keywords: result.keywords,
                  reasoning: result.reasoning,
                  model_used: model
                });

              await supabase
                .from("qualitative_signals")
                .update({ processed: true })
                .eq("id", signal.id);

              itemsProcessed++;
            }
          } catch (individualError) {
            console.error(`[SENTIMENT] Individual processing failed for ${signal.id}:`, individualError);
            
            await supabase
              .from("qualitative_signals")
              .update({
                processed: true,
                processing_error: individualError instanceof Error ? individualError.message : "Unknown error"
              })
              .eq("id", signal.id);

            itemsFailed++;
          }
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < signals.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    const processingTime = Date.now() - startTime;
    
    // Update agent run
    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          items_processed: itemsProcessed,
          items_failed: itemsFailed,
          metadata: { limit, asset, tier, model, aiCallsCount, processingTimeMs: processingTime }
        })
        .eq("id", runId);
    }

    // Log metrics
    await supabase
      .from("platform_metrics")
      .insert([
        {
          metric_type: 'ai_cost',
          metric_name: 'sentiment_ai_calls',
          metric_value: aiCallsCount,
          dimensions: { tier, model, signals_count: signals.length }
        },
        {
          metric_type: 'edge_function',
          metric_name: 'process_sentiment_latency',
          metric_value: processingTime,
          dimensions: { items_processed: itemsProcessed, items_failed: itemsFailed }
        }
      ]);

    console.log(`[SENTIMENT] Complete: ${itemsProcessed} processed, ${itemsFailed} failed, ${aiCallsCount} AI calls in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        itemsProcessed,
        itemsFailed,
        aiCallsCount,
        processingTimeMs: processingTime,
        message: `Processed ${itemsProcessed} signals with ${aiCallsCount} AI calls`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[SENTIMENT] Processing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Analyze multiple signals in a single AI call (batching)
 */
async function analyzeSentimentBatch(signals: any[], apiKey: string, model: string): Promise<SentimentOutput[]> {
  if (signals.length === 0) return [];
  
  const systemPrompt = `You are a financial sentiment analyzer for OutputLens. Analyze the following news/content items and extract structured sentiment data for EACH item.

CRITICAL RULES:
- sentiment_score: -1 (extremely bearish) to +1 (extremely bullish), 0 = neutral
- confidence: 0-1 scale for how confident you are in the analysis
- expected_impact: Expected price impact in percentage (-10 to +10 typical)
- impact_timeframe: "immediate", "1-3 days", "1 week", "1 month"
- entities: Extract mentioned companies, people, sectors, events
- keywords: Extract 3-5 key terms
- reasoning: One sentence explaining why

Return an array with one result per input signal. Be precise and quantitative.`;

  const signalDescriptions = signals.map((signal, idx) => 
    `[SIGNAL ${idx + 1}] ID: ${signal.id}
SOURCE: ${signal.source_name}
ASSET: ${signal.asset || "Unknown"}
TITLE: ${signal.title || ""}
CONTENT: ${signal.content?.substring(0, 500) || "No content"}
PUBLISHED: ${signal.published_at || "Unknown"}`
  ).join('\n\n---\n\n');

  const userPrompt = `Analyze these ${signals.length} signal(s) for market sentiment:

${signalDescriptions}

Return structured JSON array with one result per signal.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "extract_batch_sentiment",
          description: "Extract structured sentiment data from multiple financial content items",
          parameters: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    signal_index: {
                      type: "number",
                      description: "Index of the signal (1-based)"
                    },
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
                  required: ["signal_index", "sentiment_score", "confidence", "expected_impact", "impact_timeframe", "keywords", "reasoning"]
                }
              }
            },
            required: ["results"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "extract_batch_sentiment" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[SENTIMENT] AI gateway error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded");
    }
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new Error("No structured output received");
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  const results = parsed.results || [];
  
  // Map results back to signal IDs
  return results.map((result: any) => {
    const signalIndex = (result.signal_index || 1) - 1;
    const signal = signals[signalIndex] || signals[0];
    
    return {
      signal_id: signal.id,
      sentiment_score: Math.max(-1, Math.min(1, result.sentiment_score || 0)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      expected_impact: result.expected_impact || 0,
      impact_timeframe: result.impact_timeframe || "1 week",
      entities: result.entities || [],
      keywords: result.keywords || [],
      reasoning: result.reasoning || ""
    };
  });
}
