/**
 * Insights Aggregation Agent
 * 
 * Aggregates sentiment scores into quantitative adjustments for the scenario engine:
 * - Volatility adjustment factor
 * - Probability shift (bullish/bearish bias)
 * - Tail risk multiplier
 * - Expected move adjustment
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AggregateRequest {
  asset: string;
  market?: string;
  windowHours?: number;
}

interface AggregatedOutput {
  asset: string;
  sentimentScore: number;
  probabilityUp: number;
  probabilityDown: number;
  expectedMove: number;
  tailRiskAdjustment: number;
  volatilityAdjustment: number;
  sourceCount: number;
  conflictDetected: boolean;
  dataQuality: number;
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
    const { asset, market = "US", windowHours = 24 }: AggregateRequest = await req.json();

    if (!asset) {
      throw new Error("Asset symbol is required");
    }

    // Calculate time window
    const windowEnd = new Date();
    const windowStart = new Date(windowEnd.getTime() - windowHours * 60 * 60 * 1000);

    console.log(`Aggregating insights for ${asset} from ${windowStart.toISOString()} to ${windowEnd.toISOString()}`);

    // Fetch sentiment scores for the asset within window
    const { data: scores, error: fetchError } = await supabase
      .from("sentiment_scores")
      .select(`
        *,
        qualitative_signals!inner(
          source_type,
          source_name,
          published_at
        )
      `)
      .eq("asset", asset.toUpperCase())
      .gte("processed_at", windowStart.toISOString())
      .lte("processed_at", windowEnd.toISOString())
      .order("processed_at", { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch scores: ${fetchError.message}`);
    }

    // If no data, return neutral defaults
    if (!scores || scores.length === 0) {
      const neutralOutput: AggregatedOutput = {
        asset: asset.toUpperCase(),
        sentimentScore: 0,
        probabilityUp: 0.5,
        probabilityDown: 0.5,
        expectedMove: 0,
        tailRiskAdjustment: 1.0,
        volatilityAdjustment: 1.0,
        sourceCount: 0,
        conflictDetected: false,
        dataQuality: 0
      };

      return new Response(
        JSON.stringify(neutralOutput),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate aggregated metrics
    const aggregation = calculateAggregation(scores);

    // Store aggregated insight
    const { error: insertError } = await supabase
      .from("aggregated_insights")
      .upsert({
        asset: asset.toUpperCase(),
        market,
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        avg_sentiment: aggregation.avgSentiment,
        weighted_sentiment: aggregation.weightedSentiment,
        sentiment_stddev: aggregation.sentimentStdDev,
        bullish_count: aggregation.bullishCount,
        bearish_count: aggregation.bearishCount,
        neutral_count: aggregation.neutralCount,
        total_signals: scores.length,
        volatility_adjustment: aggregation.volatilityAdjustment,
        probability_shift: aggregation.probabilityShift,
        tail_risk_multiplier: aggregation.tailRiskMultiplier,
        expected_move_adjustment: aggregation.expectedMoveAdjustment,
        data_quality_score: aggregation.dataQuality,
        source_diversity_score: aggregation.sourceDiversity,
        conflict_detected: aggregation.conflictDetected,
        source_breakdown: aggregation.sourceBreakdown,
        top_signals: aggregation.topSignals,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour TTL
      }, { onConflict: "asset,market,window_start,window_end" });

    if (insertError) {
      console.warn("Failed to store aggregation:", insertError.message);
    }

    // Build output for scenario engine
    const output: AggregatedOutput = {
      asset: asset.toUpperCase(),
      sentimentScore: aggregation.weightedSentiment,
      probabilityUp: 0.5 + (aggregation.probabilityShift / 2),
      probabilityDown: 0.5 - (aggregation.probabilityShift / 2),
      expectedMove: aggregation.expectedMoveAdjustment,
      tailRiskAdjustment: aggregation.tailRiskMultiplier,
      volatilityAdjustment: aggregation.volatilityAdjustment,
      sourceCount: scores.length,
      conflictDetected: aggregation.conflictDetected,
      dataQuality: aggregation.dataQuality
    };

    console.log(`Aggregation complete for ${asset}:`, output);

    return new Response(
      JSON.stringify(output),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Aggregation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateAggregation(scores: any[]) {
  // Extract sentiment values with confidence weighting
  const sentiments = scores.map(s => ({
    value: s.sentiment_score,
    confidence: s.confidence,
    impact: s.expected_impact || 0,
    sourceType: s.qualitative_signals?.source_type || "unknown"
  }));

  // Simple average
  const avgSentiment = sentiments.reduce((sum, s) => sum + s.value, 0) / sentiments.length;

  // Confidence-weighted average
  const totalWeight = sentiments.reduce((sum, s) => sum + s.confidence, 0);
  const weightedSentiment = sentiments.reduce((sum, s) => 
    sum + (s.value * s.confidence), 0
  ) / (totalWeight || 1);

  // Standard deviation (for conflict detection)
  const variance = sentiments.reduce((sum, s) => 
    sum + Math.pow(s.value - avgSentiment, 2), 0
  ) / sentiments.length;
  const sentimentStdDev = Math.sqrt(variance);

  // Count by sentiment category
  const bullishCount = sentiments.filter(s => s.value > 0.2).length;
  const bearishCount = sentiments.filter(s => s.value < -0.2).length;
  const neutralCount = sentiments.length - bullishCount - bearishCount;

  // Conflict detection (high disagreement)
  const conflictDetected = sentimentStdDev > 0.5 && bullishCount > 0 && bearishCount > 0;

  // Source diversity (how many different source types)
  const sourceTypes = new Set(sentiments.map(s => s.sourceType));
  const sourceDiversity = sourceTypes.size / 6; // Max 6 source types

  // Source breakdown
  const sourceBreakdown: Record<string, number> = {};
  sentiments.forEach(s => {
    sourceBreakdown[s.sourceType] = (sourceBreakdown[s.sourceType] || 0) + 1;
  });

  // Top signals (highest confidence)
  const topSignals = scores
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map(s => ({
      sentiment: s.sentiment_score,
      confidence: s.confidence,
      reasoning: s.reasoning
    }));

  // Data quality score
  const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;
  const dataQuality = avgConfidence * (1 - sentimentStdDev / 2) * (0.5 + sourceDiversity / 2);

  // ===== QUANTITATIVE ADJUSTMENTS FOR SCENARIO ENGINE =====

  // Volatility adjustment: High disagreement or uncertainty = higher volatility
  // Range: 0.8 (low vol) to 1.5 (high vol)
  let volatilityAdjustment = 1.0;
  if (conflictDetected) {
    volatilityAdjustment = 1.0 + sentimentStdDev * 0.5;
  } else if (avgConfidence > 0.7) {
    volatilityAdjustment = 1.0 - (avgConfidence - 0.7) * 0.3;
  }
  volatilityAdjustment = Math.max(0.8, Math.min(1.5, volatilityAdjustment));

  // Probability shift: Strong consensus shifts base probabilities
  // Range: -0.2 (bearish) to +0.2 (bullish)
  let probabilityShift = weightedSentiment * 0.2;
  if (conflictDetected) {
    probabilityShift *= 0.5; // Reduce shift when signals conflict
  }
  probabilityShift = Math.max(-0.2, Math.min(0.2, probabilityShift));

  // Tail risk multiplier: Extreme sentiment or high disagreement increases tail risk
  // Range: 0.8 (less tail risk) to 2.0 (more tail risk)
  let tailRiskMultiplier = 1.0;
  if (Math.abs(weightedSentiment) > 0.7) {
    // Extreme consensus sometimes precedes reversals
    tailRiskMultiplier = 1.3;
  } else if (conflictDetected) {
    tailRiskMultiplier = 1.5;
  }
  tailRiskMultiplier = Math.max(0.8, Math.min(2.0, tailRiskMultiplier));

  // Expected move adjustment: Based on average expected impact
  const avgImpact = sentiments.reduce((sum, s) => sum + s.impact, 0) / sentiments.length;
  const expectedMoveAdjustment = avgImpact * (avgConfidence || 0.5);

  return {
    avgSentiment,
    weightedSentiment,
    sentimentStdDev,
    bullishCount,
    bearishCount,
    neutralCount,
    conflictDetected,
    sourceDiversity,
    sourceBreakdown,
    topSignals,
    dataQuality,
    volatilityAdjustment,
    probabilityShift,
    tailRiskMultiplier,
    expectedMoveAdjustment
  };
}