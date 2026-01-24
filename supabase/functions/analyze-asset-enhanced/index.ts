/**
 * Enhanced Asset Analysis Function
 * 
 * Integrates qualitative sentiment insights with quantitative scenario engine:
 * 1. Fetches live market data
 * 2. Retrieves aggregated sentiment insights
 * 3. Adjusts Monte Carlo parameters based on sentiment
 * 4. Generates probability-weighted scenarios
 * 5. Provides AI explanation with sentiment context
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  asset: string;
  market?: string;
  direction?: "long" | "short";
  entryPrice?: number;
  timeHorizon?: string;
  confidence?: number;
  assumptions?: string;
  includeSentiment?: boolean;
}

interface SentimentInsights {
  sentimentScore: number;
  probabilityUp: number;
  probabilityDown: number;
  expectedMove: number;
  tailRiskAdjustment: number;
  volatilityAdjustment: number;
  sourceCount: number;
  conflictDetected: boolean;
  dataQuality: number;
  topSignals?: any[];
}

interface MarketData {
  price: number;
  volatility: number;
  change?: number;
  changePercent?: number;
  source: string;
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
    const {
      asset,
      market = "US",
      direction = "long",
      entryPrice,
      timeHorizon = "3-7 days",
      confidence = 5,
      assumptions,
      includeSentiment = true
    }: AnalysisRequest = await req.json();

    if (!asset) {
      throw new Error("Asset symbol is required");
    }

    console.log(`Enhanced analysis for ${asset} (${market}), direction: ${direction}`);

    // 1. Fetch live market data
    let marketData: MarketData | null = null;
    try {
      const { data: mdResponse, error: mdError } = await supabase.functions.invoke("fetch-market-data", {
        body: { symbol: asset, provider: "finnhub", type: "quote", market }
      });
      
      if (!mdError && mdResponse?.price) {
        marketData = {
          price: mdResponse.price,
          volatility: mdResponse.volatility || 20,
          change: mdResponse.change,
          changePercent: mdResponse.changePercent,
          source: mdResponse.source || "finnhub"
        };
      }
    } catch (mdErr) {
      console.warn("Failed to fetch market data:", mdErr);
    }

    // Use entry price or market price
    const analysisPrice = entryPrice || marketData?.price || 100;
    const baseVolatility = marketData?.volatility || 20;

    // 2. Fetch aggregated sentiment insights
    let sentimentInsights: SentimentInsights | null = null;
    if (includeSentiment) {
      try {
        const { data: insightData } = await supabase
          .from("aggregated_insights")
          .select("*")
          .eq("asset", asset.toUpperCase())
          .eq("market", market)
          .gte("expires_at", new Date().toISOString())
          .order("computed_at", { ascending: false })
          .limit(1)
          .single();

        if (insightData) {
          sentimentInsights = {
            sentimentScore: insightData.weighted_sentiment || 0,
            probabilityUp: 0.5 + (insightData.probability_shift || 0) / 2,
            probabilityDown: 0.5 - (insightData.probability_shift || 0) / 2,
            expectedMove: insightData.expected_move_adjustment || 0,
            tailRiskAdjustment: insightData.tail_risk_multiplier || 1,
            volatilityAdjustment: insightData.volatility_adjustment || 1,
            sourceCount: insightData.total_signals || 0,
            conflictDetected: insightData.conflict_detected || false,
            dataQuality: insightData.data_quality_score || 0,
            topSignals: insightData.top_signals || []
          };
          console.log(`Loaded sentiment insights: score=${sentimentInsights.sentimentScore}, sources=${sentimentInsights.sourceCount}`);
        }
      } catch (insightErr) {
        console.warn("No sentiment insights available:", insightErr);
      }
    }

    // 3. Adjust Monte Carlo parameters based on sentiment
    const holdingDays = parseHorizonToDays(timeHorizon);
    
    // Base volatility adjusted by sentiment
    let adjustedVolatility = baseVolatility;
    if (sentimentInsights) {
      adjustedVolatility *= sentimentInsights.volatilityAdjustment;
    }

    // Calculate drift adjustment from sentiment
    let driftAdjustment = 0;
    if (sentimentInsights && sentimentInsights.dataQuality > 0.3) {
      driftAdjustment = sentimentInsights.sentimentScore * 0.05; // Max ±5% annual drift
    }

    // 4. Run Monte Carlo simulation
    const simulation = runMonteCarloSimulation({
      currentPrice: analysisPrice,
      volatility: adjustedVolatility,
      holdingPeriodDays: holdingDays,
      drift: driftAdjustment,
      simulations: 10000
    });

    // 5. Generate dynamic scenarios with sentiment adjustments
    const scenarios = generateScenarios(
      simulation,
      analysisPrice,
      direction,
      sentimentInsights
    );

    // 6. Calculate risk metrics
    const riskMetrics = calculateRiskMetrics(
      simulation,
      adjustedVolatility,
      holdingDays,
      direction,
      sentimentInsights
    );

    // 7. Build comprehensive output
    const output = {
      asset: asset.toUpperCase(),
      market,
      direction,
      entryPrice: analysisPrice,
      timeHorizon,
      userConfidence: confidence,
      
      // Market data
      marketData: marketData ? {
        price: marketData.price,
        volatility: baseVolatility,
        adjustedVolatility,
        change: marketData.change,
        changePercent: marketData.changePercent,
        source: marketData.source
      } : null,

      // Sentiment insights
      sentimentInsights: sentimentInsights ? {
        score: sentimentInsights.sentimentScore,
        direction: sentimentInsights.sentimentScore > 0.1 ? "bullish" : 
                   sentimentInsights.sentimentScore < -0.1 ? "bearish" : "neutral",
        sourceCount: sentimentInsights.sourceCount,
        dataQuality: sentimentInsights.dataQuality,
        conflictDetected: sentimentInsights.conflictDetected,
        adjustments: {
          volatility: sentimentInsights.volatilityAdjustment,
          tailRisk: sentimentInsights.tailRiskAdjustment,
          expectedMove: sentimentInsights.expectedMove
        }
      } : null,

      // Simulation results
      simulation: {
        paths: simulation.paths,
        meanReturn: simulation.meanReturn,
        medianReturn: simulation.medianReturn,
        stdDev: simulation.stdDev,
        skewness: simulation.skewness,
        kurtosis: simulation.kurtosis
      },

      // Risk metrics
      riskMetrics,

      // Probability-weighted scenarios
      scenarios,

      // Best/worst case
      bestCase: scenarios.upside[scenarios.upside.length - 1] || scenarios.base[0],
      worstCase: scenarios.downside[scenarios.downside.length - 1] || scenarios.tail[0],

      // Metadata
      analyzedAt: new Date().toISOString(),
      dataSourcesUsed: [
        marketData?.source || "default",
        sentimentInsights ? "sentiment_pipeline" : null
      ].filter(Boolean)
    };

    console.log(`Analysis complete for ${asset}: ${simulation.paths} paths, sentiment=${sentimentInsights?.sentimentScore || 'N/A'}`);

    return new Response(
      JSON.stringify(output),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Enhanced analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ===== Helper Functions =====

function parseHorizonToDays(horizon: string): number {
  switch (horizon) {
    case "1-3 days": return 2;
    case "3-7 days": return 5;
    case "7-30 days": return 15;
    default: return 7;
  }
}

function randomNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function percentile(sortedArray: number[], p: number): number {
  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (lower === upper) return sortedArray[lower];
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

interface SimulationResult {
  paths: number;
  finalPrices: number[];
  returns: number[];
  meanReturn: number;
  medianReturn: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
  percentiles: Record<string, number>;
}

function runMonteCarloSimulation(params: {
  currentPrice: number;
  volatility: number;
  holdingPeriodDays: number;
  drift?: number;
  simulations?: number;
}): SimulationResult {
  const {
    currentPrice,
    volatility,
    holdingPeriodDays,
    drift = 0,
    simulations = 10000
  } = params;

  const dailyDrift = drift / 252;
  const dailyVol = volatility / 100 / Math.sqrt(252);
  
  const finalPrices: number[] = [];
  const returns: number[] = [];

  for (let i = 0; i < simulations; i++) {
    let price = currentPrice;
    
    for (let day = 0; day < holdingPeriodDays; day++) {
      const shock = randomNormal();
      price = price * Math.exp(
        (dailyDrift - 0.5 * dailyVol * dailyVol) + 
        dailyVol * shock
      );
    }
    
    finalPrices.push(price);
    returns.push(((price - currentPrice) / currentPrice) * 100);
  }

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const medianReturn = percentile(sortedReturns, 50);
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Skewness and kurtosis
  const m3 = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 3), 0) / returns.length;
  const m4 = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 4), 0) / returns.length;
  const skewness = stdDev > 0 ? m3 / Math.pow(stdDev, 3) : 0;
  const kurtosis = stdDev > 0 ? (m4 / Math.pow(stdDev, 4)) - 3 : 0;

  return {
    paths: simulations,
    finalPrices,
    returns,
    meanReturn,
    medianReturn,
    stdDev,
    skewness,
    kurtosis,
    percentiles: {
      p1: percentile(sortedReturns, 1),
      p5: percentile(sortedReturns, 5),
      p10: percentile(sortedReturns, 10),
      p25: percentile(sortedReturns, 25),
      p50: medianReturn,
      p75: percentile(sortedReturns, 75),
      p90: percentile(sortedReturns, 90),
      p95: percentile(sortedReturns, 95),
      p99: percentile(sortedReturns, 99),
    }
  };
}

function generateScenarios(
  simulation: SimulationResult,
  entryPrice: number,
  direction: "long" | "short",
  sentimentInsights: SentimentInsights | null
) {
  const { percentiles } = simulation;
  const isLong = direction === "long";
  
  const adjustReturn = (r: number) => isLong ? r : -r;
  const adjustPrice = (r: number) => entryPrice * (1 + r / 100);

  // Adjust probabilities based on sentiment
  let baseProbAdjust = 0;
  let tailRiskMultiplier = 1;
  if (sentimentInsights && sentimentInsights.dataQuality > 0.3) {
    baseProbAdjust = sentimentInsights.sentimentScore * 0.05;
    tailRiskMultiplier = sentimentInsights.tailRiskAdjustment;
  }

  const scenarios = {
    base: [{
      id: "base-range",
      name: "Range-Bound Trading",
      category: "base",
      priceRangeMin: adjustPrice(percentiles.p25),
      priceRangeMax: adjustPrice(percentiles.p75),
      returnRangeMin: adjustReturn(percentiles.p25),
      returnRangeMax: adjustReturn(percentiles.p75),
      probability: 0.50 + baseProbAdjust,
      probabilityLabel: "Most Likely",
      riskLevel: "Low"
    }],
    upside: [
      {
        id: "upside-moderate",
        name: isLong ? "Bullish Breakout" : "Short Squeeze Risk",
        category: "upside",
        priceRangeMin: adjustPrice(percentiles.p75),
        priceRangeMax: adjustPrice(percentiles.p90),
        returnRangeMin: adjustReturn(percentiles.p75),
        returnRangeMax: adjustReturn(percentiles.p90),
        probability: Math.max(0.05, 0.15 + (isLong ? baseProbAdjust : -baseProbAdjust)),
        probabilityLabel: "Possible",
        riskLevel: isLong ? "Low" : "Medium"
      },
      {
        id: "upside-strong",
        name: isLong ? "Strong Rally" : "Major Squeeze",
        category: "upside",
        priceRangeMin: adjustPrice(percentiles.p90),
        priceRangeMax: adjustPrice(percentiles.p99),
        returnRangeMin: adjustReturn(percentiles.p90),
        returnRangeMax: adjustReturn(percentiles.p99),
        probability: Math.max(0.02, 0.09 + (isLong ? baseProbAdjust / 2 : -baseProbAdjust / 2)),
        probabilityLabel: "Unlikely",
        riskLevel: isLong ? "Low" : "High"
      }
    ],
    downside: [
      {
        id: "downside-moderate",
        name: isLong ? "Pullback" : "Profitable Decline",
        category: "downside",
        priceRangeMin: adjustPrice(percentiles.p10),
        priceRangeMax: adjustPrice(percentiles.p25),
        returnRangeMin: adjustReturn(percentiles.p10),
        returnRangeMax: adjustReturn(percentiles.p25),
        probability: Math.max(0.05, 0.15 + (isLong ? -baseProbAdjust : baseProbAdjust)),
        probabilityLabel: "Possible",
        riskLevel: isLong ? "Medium" : "Low"
      },
      {
        id: "downside-significant",
        name: isLong ? "Correction" : "Strong Move",
        category: "downside",
        priceRangeMin: adjustPrice(percentiles.p1),
        priceRangeMax: adjustPrice(percentiles.p10),
        returnRangeMin: adjustReturn(percentiles.p1),
        returnRangeMax: adjustReturn(percentiles.p10),
        probability: Math.max(0.02, 0.09 + (isLong ? -baseProbAdjust / 2 : baseProbAdjust / 2)),
        probabilityLabel: "Unlikely",
        riskLevel: isLong ? "High" : "Low"
      }
    ],
    tail: [
      {
        id: "tail-extreme",
        name: isLong ? "Black Swan Event" : "Tail Risk",
        category: "tail",
        priceRangeMin: adjustPrice(percentiles.p1 * 0.5),
        priceRangeMax: adjustPrice(percentiles.p1),
        returnRangeMin: adjustReturn(percentiles.p1 * 0.5),
        returnRangeMax: adjustReturn(percentiles.p1),
        probability: 0.02 * tailRiskMultiplier,
        probabilityLabel: "Rare",
        riskLevel: "High"
      }
    ]
  };

  return scenarios;
}

function calculateRiskMetrics(
  simulation: SimulationResult,
  volatility: number,
  holdingDays: number,
  direction: "long" | "short",
  sentimentInsights: SentimentInsights | null
) {
  const sortedReturns = [...simulation.returns].sort((a, b) => a - b);
  const adjustedReturns = direction === "long" ? sortedReturns : sortedReturns.map(r => -r);
  
  // VaR calculations
  const var95Index = Math.floor(0.05 * adjustedReturns.length);
  const var99Index = Math.floor(0.01 * adjustedReturns.length);
  const valueAtRisk95 = -adjustedReturns[var95Index];
  const valueAtRisk99 = -adjustedReturns[var99Index];
  
  // Expected Shortfall
  const tailReturns = adjustedReturns.slice(0, var95Index);
  const expectedShortfall = tailReturns.length > 0 
    ? -tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length 
    : valueAtRisk95;

  // Probabilities
  const lossPaths = adjustedReturns.filter(r => r < 0).length;
  const probabilityOfLoss = lossPaths / simulation.returns.length;
  const probabilityOfProfit = 1 - probabilityOfLoss;

  // Risk score
  let riskScore = Math.min(10, volatility / 5);
  riskScore *= Math.sqrt(holdingDays / 7);
  if (direction === "short") riskScore *= 1.2;
  if (simulation.kurtosis > 1) riskScore *= 1 + (simulation.kurtosis * 0.1);
  if (sentimentInsights?.conflictDetected) riskScore *= 1.15;
  riskScore = Math.max(1, Math.min(10, Math.round(riskScore)));

  const riskLabel = riskScore <= 3 ? "Low" : riskScore <= 6 ? "Medium" : "High";

  return {
    volatilityProxy: simulation.stdDev,
    maxExpectedMove: 2 * simulation.stdDev,
    riskScore,
    riskLabel,
    valueAtRisk95,
    valueAtRisk99,
    expectedShortfall,
    expectedReturn: simulation.meanReturn,
    medianReturn: simulation.medianReturn,
    probabilityOfLoss,
    probabilityOfProfit,
    sharpeProxy: simulation.stdDev > 0 ? simulation.meanReturn / simulation.stdDev : 0,
    skewness: simulation.skewness,
    kurtosis: simulation.kurtosis,
    usedLiveData: true,
    simulationPaths: simulation.paths,
    sentimentAdjusted: !!sentimentInsights
  };
}