import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
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

    const resend = new Resend(resendApiKey);
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error('All fields are required');
    }

    // Basic validation
    if (name.length < 2 || name.length > 100) {
      throw new Error('Name must be between 2 and 100 characters');
    }
    if (message.length < 10 || message.length > 1000) {
      throw new Error('Message must be between 10 and 1000 characters');
    }

    const validSubjects = ['Support', 'Bug Report', 'Feature Request', 'General Inquiry'];
    if (!validSubjects.includes(subject)) {
      throw new Error('Invalid subject type');
    }

    const { data, error } = await resend.emails.send({
      from: 'OutputLens Contact <contact@outputlens.com>',
      to: ['outputlens@gmail.com'],
      reply_to: email,
      subject: `[OutputLens Contact] ${subject} from ${name}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 25px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase; }
    .value { margin-top: 4px; }
    .message-box { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin-top: 20px; }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">New Contact Form Submission</h2>
  </div>
  <div class="content">
    <div class="field">
      <div class="label">From</div>
      <div class="value">${name} (${email})</div>
    </div>
    <div class="field">
      <div class="label">Subject Type</div>
      <div class="value">${subject}</div>
    </div>
    <div class="message-box">
      <div class="label">Message</div>
      <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${message}</div>
    </div>
  </div>
  <div class="footer">
    Sent via OutputLens Contact Form
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Contact email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send contact email error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
