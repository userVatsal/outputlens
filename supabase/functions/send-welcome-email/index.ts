import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    const { email, name }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    const displayName = name || 'there';
    const appUrl = 'https://outputlens.lovable.app';

    const { data, error } = await resend.emails.send({
      from: 'Vatsal <vatsal@outputlens.com>',
      to: [email],
      reply_to: 'vatsal@outputlens.com',
      subject: 'Welcome to OutputLens - Let\'s make smarter trades together',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .content { background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
    .cta-list { margin: 25px 0; }
    .cta-item { margin: 12px 0; padding-left: 20px; position: relative; }
    .cta-item::before { content: '→'; position: absolute; left: 0; color: #10b981; }
    .button { display: inline-block; background: #10b981; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .ps { margin-top: 20px; padding: 15px; background: #ecfdf5; border-radius: 8px; font-size: 14px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    a { color: #10b981; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">OutputLens</div>
  </div>

  <div class="content">
    <p>Hey ${displayName},</p>

    <p>I'm Vatsal, the founder of OutputLens.</p>

    <p>I built this because I was tired of entering trades blind — not knowing if my gut feel aligned with real market conditions. Now you have a tool that shows you probabilities <em>before</em> you commit capital.</p>

    <p><strong>Here's what you can do right now:</strong></p>

    <div class="cta-list">
      <div class="cta-item"><strong>Run your first analysis:</strong> Head to the Workspace and enter any trade idea</div>
      <div class="cta-item"><strong>Track an asset:</strong> Save it to your dashboard and get alerts when risk changes</div>
      <div class="cta-item"><strong>Build a portfolio:</strong> Add multiple positions and see aggregate risk</div>
    </div>

    <a href="${appUrl}/workspace" class="button">Start Your First Analysis</a>

    <p style="margin-top: 25px;">If you ever have questions or feedback, just reply to this email. I read every one.</p>

    <p>Let's make better trades together.</p>

    <div class="signature">
      <p style="margin: 0;">— <strong>Vatsal</strong></p>
      <p style="margin: 5px 0 0 0; color: #6b7280;">Founder, OutputLens</p>
    </div>

    <div class="ps">
      <strong>P.S.</strong> Your first 3 analyses are on me. No credit card needed.
    </div>
  </div>

  <div class="footer">
    <p>You're receiving this because you signed up for OutputLens.</p>
    <p><a href="${appUrl}/account">Manage email preferences</a></p>
    <p>OutputLens — Know your risk before you trade</p>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Welcome email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send welcome email error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
