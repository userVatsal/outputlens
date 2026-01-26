import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackedAsset {
  id: string;
  user_id: string;
  symbol: string;
  market: string;
  direction: string;
  entry_price: number;
  track_frequency: string;
  risk_threshold_delta: number;
  alert_on_risk_change: boolean;
  risk_score_at_track: number | null;
  current_risk_score: number | null;
  tail_risk_at_track: number | null;
  last_analysis_at: string | null;
}

// Check if asset is due for re-analysis based on frequency
function isDueForAnalysis(lastAnalysis: string | null, frequency: string): boolean {
  if (!lastAnalysis) return true;
  
  const lastDate = new Date(lastAnalysis);
  const now = new Date();
  const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  
  switch (frequency) {
    case 'daily':
      return diffHours >= 24;
    case 'weekly':
      return diffHours >= 168; // 7 days
    case 'monthly':
      return diffHours >= 720; // 30 days
    default:
      return diffHours >= 168;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active tracked assets
    const { data: trackedAssets, error: fetchError } = await supabase
      .from('tracked_assets')
      .select('*')
      .eq('status', 'active');

    if (fetchError) {
      throw new Error(`Failed to fetch tracked assets: ${fetchError.message}`);
    }

    if (!trackedAssets || trackedAssets.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: 'No active tracked assets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      processed: 0,
      analyzed: 0,
      alerts_created: 0,
      errors: [] as string[],
    };

    // Process each asset that's due for analysis
    for (const asset of trackedAssets as TrackedAsset[]) {
      results.processed++;

      if (!isDueForAnalysis(asset.last_analysis_at, asset.track_frequency)) {
        continue;
      }

      try {
        // Call analyze-trade function to get fresh analysis
        const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-trade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            asset: asset.symbol,
            market: asset.market,
            direction: asset.direction,
            entryPrice: asset.entry_price,
            timeHorizon: '1w',
          }),
        });

        if (!analyzeResponse.ok) {
          const errorText = await analyzeResponse.text();
          results.errors.push(`Analysis failed for ${asset.symbol}: ${errorText}`);
          continue;
        }

        const analysisResult = await analyzeResponse.json();
        const newRiskScore = analysisResult.riskMetrics?.riskScore ?? null;
        const newWinProb = analysisResult.riskMetrics?.probabilityOfProfit ?? null;
        const newVaR95 = analysisResult.riskMetrics?.valueAtRisk95 ?? null;
        const newTailRisk = analysisResult.riskMetrics?.expectedShortfall ?? null;

        // Calculate risk delta
        const riskDelta = asset.risk_score_at_track !== null && newRiskScore !== null
          ? newRiskScore - asset.risk_score_at_track
          : null;

        // Update tracked asset with new values
        const { error: updateError } = await supabase
          .from('tracked_assets')
          .update({
            current_risk_score: newRiskScore,
            current_win_prob: newWinProb,
            current_var95: newVaR95,
            current_tail_risk: newTailRisk,
            risk_delta: riskDelta,
            last_analysis_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', asset.id);

        if (updateError) {
          results.errors.push(`Update failed for ${asset.symbol}: ${updateError.message}`);
          continue;
        }

        results.analyzed++;

        // Check if alert should be created
        if (asset.alert_on_risk_change && riskDelta !== null) {
          const absDelta = Math.abs(riskDelta);
          
          if (absDelta >= asset.risk_threshold_delta) {
            const alertType = riskDelta > 0 ? 'risk_increase' : 'risk_decrease';
            const severity = absDelta >= 4 ? 'critical' : absDelta >= 2 ? 'warning' : 'info';
            
            const message = riskDelta > 0
              ? `Risk score increased by ${riskDelta.toFixed(1)} points for ${asset.symbol}`
              : `Risk score decreased by ${Math.abs(riskDelta).toFixed(1)} points for ${asset.symbol}`;

            const { error: alertError } = await supabase
              .from('risk_alerts')
              .insert({
                user_id: asset.user_id,
                tracked_asset_id: asset.id,
                alert_type: alertType,
                severity: severity,
                previous_value: asset.risk_score_at_track,
                current_value: newRiskScore,
                delta: riskDelta,
                message: message,
              });

            if (!alertError) {
              results.alerts_created++;
            } else {
              results.errors.push(`Alert creation failed for ${asset.symbol}: ${alertError.message}`);
            }
          }
        }

        // Check for tail risk spike
        if (asset.alert_on_risk_change && newTailRisk !== null && asset.tail_risk_at_track !== null) {
          const tailDelta = newTailRisk - asset.tail_risk_at_track;
          if (tailDelta > 5) { // Tail risk increased by more than 5%
            const { error: alertError } = await supabase
              .from('risk_alerts')
              .insert({
                user_id: asset.user_id,
                tracked_asset_id: asset.id,
                alert_type: 'tail_spike',
                severity: 'warning',
                previous_value: asset.tail_risk_at_track,
                current_value: newTailRisk,
                delta: tailDelta,
                message: `Tail risk (CVaR) spiked by ${tailDelta.toFixed(1)}% for ${asset.symbol}`,
              });

            if (!alertError) {
              results.alerts_created++;
            }
          }
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(`Processing failed for ${asset.symbol}: ${errorMessage}`);
      }
    }

    console.log('Monitor assets completed:', results);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Monitor assets error:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
