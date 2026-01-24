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

// Source reliability weights for weighted aggregation
const SOURCE_WEIGHTS: Record<string, number> = {
  news: 1.0,        // Professional journalism - highest weight
  research: 0.9,    // Analyst reports, Seeking Alpha
  analyst: 0.9,     // Professional analysts
  video: 0.7,       // YouTube financial content (CNBC, Bloomberg)
  forum: 0.5,       // Reddit, stock forums
  social: 0.4,      // General social media
  unknown: 0.3      // Unclassified sources
};

function calculateAggregation(scores: any[]) {
  // Extract sentiment values with confidence AND source weighting
  const sentiments = scores.map(s => {
    const sourceType = s.qualitative_signals?.source_type || "unknown";
    const sourceWeight = SOURCE_WEIGHTS[sourceType] || SOURCE_WEIGHTS.unknown;
    
    return {
      value: s.sentiment_score,
      confidence: s.confidence,
      impact: s.expected_impact || 0,
      sourceType,
      sourceWeight,
      // Combined weight = confidence * source reliability
      combinedWeight: s.confidence * sourceWeight
    };
  });

  // Simple average (unweighted)
  const avgSentiment = sentiments.reduce((sum, s) => sum + s.value, 0) / sentiments.length;

  // Source-weighted average (accounts for source reliability)
  const totalCombinedWeight = sentiments.reduce((sum, s) => sum + s.combinedWeight, 0);
  const weightedSentiment = sentiments.reduce((sum, s) => 
    sum + (s.value * s.combinedWeight), 0
  ) / (totalCombinedWeight || 1);

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

  // Source breakdown with weights
  const sourceBreakdown: Record<string, number> = {};
  sentiments.forEach(s => {
    sourceBreakdown[s.sourceType] = (sourceBreakdown[s.sourceType] || 0) + 1;
  });

  // Top signals (highest combined weight, not just confidence)
  const topSignals = scores
    .map(s => {
      const sourceType = s.qualitative_signals?.source_type || "unknown";
      const sourceWeight = SOURCE_WEIGHTS[sourceType] || SOURCE_WEIGHTS.unknown;
      return {
        ...s,
        combinedWeight: s.confidence * sourceWeight
      };
    })
    .sort((a, b) => b.combinedWeight - a.combinedWeight)
    .slice(0, 5)
    .map(s => ({
      sentiment: s.sentiment_score,
      confidence: s.confidence,
      reasoning: s.reasoning,
      source: s.qualitative_signals?.source_type
    }));

  // Data quality score (incorporates source diversity)
  const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;
  const avgSourceWeight = sentiments.reduce((sum, s) => sum + s.sourceWeight, 0) / sentiments.length;
  const dataQuality = avgConfidence * avgSourceWeight * (1 - sentimentStdDev / 2) * (0.5 + sourceDiversity / 2);

  // ===== QUANTITATIVE ADJUSTMENTS FOR SCENARIO ENGINE =====

  // Volatility adjustment: High disagreement or uncertainty = higher volatility
  // Also factor in source quality - low-quality sources = more uncertainty
  let volatilityAdjustment = 1.0;
  if (conflictDetected) {
    volatilityAdjustment = 1.0 + sentimentStdDev * 0.5;
  } else if (avgConfidence > 0.7 && avgSourceWeight > 0.7) {
    // High-confidence from reliable sources = lower vol adjustment
    volatilityAdjustment = 1.0 - (avgConfidence - 0.7) * 0.3;
  } else if (avgSourceWeight < 0.5) {
    // Low-quality sources = slight vol increase
    volatilityAdjustment = 1.1;
  }
  volatilityAdjustment = Math.max(0.8, Math.min(1.5, volatilityAdjustment));

  // Probability shift: Strong consensus from reliable sources shifts probabilities
  // Weight shift by average source quality
  let probabilityShift = weightedSentiment * 0.2 * avgSourceWeight;
  if (conflictDetected) {
    probabilityShift *= 0.5; // Reduce shift when signals conflict
  }
  probabilityShift = Math.max(-0.2, Math.min(0.2, probabilityShift));

  // Tail risk multiplier: Extreme sentiment or high disagreement increases tail risk
  // Low-quality consensus can also be a contrarian signal
  let tailRiskMultiplier = 1.0;
  if (Math.abs(weightedSentiment) > 0.7) {
    // Extreme consensus sometimes precedes reversals
    tailRiskMultiplier = 1.3;
  } else if (conflictDetected) {
    tailRiskMultiplier = 1.5;
  } else if (avgSourceWeight < 0.5 && Math.abs(weightedSentiment) > 0.5) {
    // Strong sentiment from unreliable sources = higher tail risk
    tailRiskMultiplier = 1.4;
  }
  tailRiskMultiplier = Math.max(0.8, Math.min(2.0, tailRiskMultiplier));

  // Expected move adjustment: Based on average expected impact weighted by source quality
  const avgImpact = sentiments.reduce((sum, s) => sum + s.impact * s.sourceWeight, 0) / 
                    sentiments.reduce((sum, s) => sum + s.sourceWeight, 0);
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
    expectedMoveAdjustment,
    // New metrics for transparency
    avgSourceWeight,
    sourceWeightsUsed: SOURCE_WEIGHTS
  };
}