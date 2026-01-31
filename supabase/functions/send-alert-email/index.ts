import { Resend } from 'https://esm.sh/resend@2.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertEmailRequest {
  userId: string;
  email: string;
  name?: string;
  symbol: string;
  alertType: 'risk_increase' | 'risk_decrease' | 'tail_spike';
  severity: 'info' | 'warning' | 'critical';
  previousValue: number;
  currentValue: number;
  delta: number;
  message: string;
}

function getAlertInterpretation(alertType: string, delta: number, severity: string): string {
  switch (alertType) {
    case 'risk_increase':
      if (severity === 'critical') {
        return 'This is a significant risk increase. You may want to review your position size or consider adjusting your stop-loss levels.';
      } else if (severity === 'warning') {
        return 'Your position risk has increased moderately. Keep an eye on this and consider your exit strategy.';
      }
      return 'A minor risk increase has been detected. This is within normal market fluctuation.';
    
    case 'risk_decrease':
      return 'Good news — your position risk has decreased. The market conditions have become more favorable for your trade.';
    
    case 'tail_spike':
      return 'Tail risk (CVaR) has spiked, meaning the potential for extreme losses has increased. This often happens during market stress or before major events.';
    
    default:
      return 'Risk conditions for this position have changed. Review your analysis for updated metrics.';
  }
}

function getAlertEmoji(alertType: string, severity: string): string {
  if (alertType === 'risk_decrease') return '📉';
  if (alertType === 'tail_spike') return '⚠️';
  if (severity === 'critical') return '🚨';
  if (severity === 'warning') return '⚠️';
  return '📊';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const request: AlertEmailRequest = await req.json();

    const {
      userId,
      email,
      name,
      symbol,
      alertType,
      severity,
      previousValue,
      currentValue,
      delta,
      message,
    } = request;

    if (!email || !symbol || !userId) {
      throw new Error('Email, symbol, and userId are required');
    }

    // SECURITY: Verify the user exists and has email alerts enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, contact_preferences')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.warn(`[ALERT-EMAIL] User not found: ${userId}`);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has email alerts enabled
    const contactPrefs = profile.contact_preferences as { email?: boolean } | null;
    if (contactPrefs && contactPrefs.email === false) {
      console.log(`[ALERT-EMAIL] User ${userId} has disabled email alerts`);
      return new Response(
        JSON.stringify({ success: false, reason: 'Email alerts disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user has a tracked asset for this symbol
    const { data: trackedAsset, error: assetError } = await supabase
      .from('tracked_assets')
      .select('id, alert_on_risk_change')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();

    if (assetError || !trackedAsset) {
      console.warn(`[ALERT-EMAIL] No tracked asset found for user ${userId}, symbol ${symbol}`);
      return new Response(
        JSON.stringify({ error: 'No tracked asset found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if alerts are enabled for this tracked asset
    if (trackedAsset.alert_on_risk_change === false) {
      console.log(`[ALERT-EMAIL] Alerts disabled for asset ${symbol} for user ${userId}`);
      return new Response(
        JSON.stringify({ success: false, reason: 'Asset alerts disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);
    const displayName = name || 'there';
    const appUrl = 'https://outputlens.lovable.app';
    const emoji = getAlertEmoji(alertType, severity);
    const interpretation = getAlertInterpretation(alertType, delta, severity);
    const deltaSign = delta > 0 ? '+' : '';
    const severityColor = severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#10b981';

    const { data, error } = await resend.emails.send({
      from: 'Vatsal Pareshkumar <contact@outputlens.com>',
      to: [email],
      reply_to: 'contact@outputlens.com',
      subject: `${emoji} Risk Alert: ${symbol} - Your position risk has changed`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: ${severityColor}20; color: ${severityColor}; }
    .alert-card { background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid ${severityColor}; }
    .symbol { font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 15px; }
    .metrics { margin: 20px 0; }
    .metric-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .metric-row:last-child { border-bottom: none; }
    .metric-label { color: #6b7280; }
    .metric-value { font-weight: 600; }
    .delta { color: ${delta > 0 ? '#ef4444' : '#10b981'}; }
    .interpretation { background: white; border-radius: 8px; padding: 15px; margin-top: 20px; }
    .interpretation-title { font-weight: 600; margin-bottom: 8px; color: #374151; }
    .button { display: inline-block; background: #10b981; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
    .signature { margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    a { color: #10b981; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">OutputLens</div>
    <span class="severity-badge">${severity}</span>
  </div>

  <p>Hey ${displayName},</p>

  <p>I wanted to give you a heads up — the risk profile for your <strong>${symbol}</strong> position just changed significantly.</p>

  <div class="alert-card">
    <div class="symbol">${emoji} ${symbol}</div>
    
    <div class="metrics">
      <div class="metric-row">
        <span class="metric-label">Previous Risk Score</span>
        <span class="metric-value">${previousValue.toFixed(1)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Current Risk Score</span>
        <span class="metric-value">${currentValue.toFixed(1)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Change</span>
        <span class="metric-value delta">${deltaSign}${delta.toFixed(1)} points</span>
      </div>
    </div>

    <div class="interpretation">
      <div class="interpretation-title">🎯 What this means</div>
      <p style="margin: 0; font-size: 14px; color: #4b5563;">${interpretation}</p>
    </div>

    <a href="${appUrl}/tracked-assets" class="button">View Full Analysis</a>
  </div>

  <p style="font-size: 14px; color: #6b7280;">
    You're getting this because you enabled email alerts for tracked assets.
    <a href="${appUrl}/account">Manage your preferences</a>
  </p>

  <div class="signature">
    <p style="margin: 0;">Stay sharp,</p>
    <p style="margin: 5px 0 0 0;"><strong>Vatsal</strong></p>
  </div>

  <div class="footer">
    <p>OutputLens — Know your risk before you trade</p>
    <p><a href="${appUrl}/account">Unsubscribe from risk alerts</a></p>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Alert email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send alert email error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
