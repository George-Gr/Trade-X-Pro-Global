import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

/**
 * Edge Function: send-critical-email
 * 
 * Purpose: Send critical email notifications for margin calls and liquidations
 * Trigger: Invoked by margin monitoring system when critical events occur
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'margin_warning' | 'margin_critical' | 'liquidation' | 'margin_call';
  data: {
    user_name?: string;
    margin_level: number;
    equity: number;
    margin_used: number;
    actions?: string[];
    time_to_liquidation?: number;
  };
}

// Resend API key from environment
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

function getEmailTemplate(type: string, data: unknown): { subject: string; html: string } {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      .critical { background: #f8d7da; border-left: 4px solid #dc3545; }
      .metric { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
      .metric-value { font-size: 24px; font-weight: bold; margin: 5px 0; }
      .actions { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
      .action-item { padding: 10px; margin: 5px 0; background: #e3f2fd; border-left: 3px solid #2196f3; }
      .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
  `;

  // Type guard to ensure data has required properties
  const hasRequiredData = (d: unknown): d is {
    margin_level: number;
    equity: number;
    margin_used: number;
    actions?: string[];
    time_to_liquidation?: number;
  } => {
    return typeof d === 'object' && d !== null &&
           typeof (d as Record<string, unknown>).margin_level === 'number' &&
           typeof (d as Record<string, unknown>).equity === 'number' &&
           typeof (d as Record<string, unknown>).margin_used === 'number';
  };

  if (!hasRequiredData(data)) {
    return {
      subject: 'Notification from TradeX Pro',
      html: '<p>You have a new notification</p>',
    };
  }

  if (type === 'margin_warning') {
    return {
      subject: `⚠️ Margin Level Warning - ${data.margin_level.toFixed(2)}%`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>⚠️ Margin Level Warning</h1>
          </div>
          <div class="content">
            <div class="alert">
              <p><strong>Your margin level has dropped to ${data.margin_level.toFixed(2)}%</strong></p>
              <p>This is below the warning threshold of 200%. Please take action to avoid a margin call.</p>
            </div>
            
            <div class="metric">
              <div class="metric-label">Current Margin Level</div>
              <div class="metric-value" style="color: #ffc107;">${data.margin_level.toFixed(2)}%</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Account Equity</div>
              <div class="metric-value">$${data.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Margin Used</div>
              <div class="metric-value">$${data.margin_used.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            ${data.actions && data.actions.length > 0 ? `
              <div class="actions">
                <h3>Recommended Actions:</h3>
                ${(data.actions as string[]).map((action: string) => `<div class="action-item">${action}</div>`).join('')}
              </div>
            ` : ''}
            
            <a href="${Deno.env.get('APP_URL')}/risk-management" class="button">View Risk Management</a>
            
            <div class="footer">
              <p>This is an automated notification from TradeX Pro</p>
              <p>If you have questions, please contact support</p>
            </div>
          </div>
        </div>
      `,
    };
  }

  if (type === 'margin_critical' || type === 'margin_call') {
    return {
      subject: `🚨 URGENT: Margin Call - ${data.margin_level.toFixed(2)}%`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
            <h1>🚨 URGENT: Margin Call</h1>
          </div>
          <div class="content">
            <div class="alert critical">
              <p><strong>IMMEDIATE ACTION REQUIRED</strong></p>
              <p>Your margin level is at ${data.margin_level.toFixed(2)}%, which is below the margin call threshold of 150%.</p>
              <p>Your account is now in <strong>close-only mode</strong>. You cannot open new positions.</p>
              ${data.time_to_liquidation ? `<p><strong>Estimated time to liquidation: ${data.time_to_liquidation} minutes</strong></p>` : ''}
            </div>
            
            <div class="metric">
              <div class="metric-label">Current Margin Level</div>
              <div class="metric-value" style="color: #dc3545;">${data.margin_level.toFixed(2)}%</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Account Equity</div>
              <div class="metric-value">$${data.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Margin Used</div>
              <div class="metric-value">$${data.margin_used.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            ${data.actions && data.actions.length > 0 ? `
              <div class="actions">
                <h3>REQUIRED ACTIONS:</h3>
                ${(data.actions as string[]).map((action: string) => `<div class="action-item" style="background: #f8d7da; border-color: #dc3545;">${action}</div>`).join('')}
              </div>
            ` : ''}
            
            <a href="${Deno.env.get('APP_URL')}/wallet" class="button" style="background: #dc3545;">Deposit Funds Now</a>
            <a href="${Deno.env.get('APP_URL')}/portfolio" class="button" style="background: #6c757d;">Close Positions</a>
            
            <div class="footer">
              <p><strong>This is a critical automated notification from TradeX Pro</strong></p>
              <p>Failure to act may result in automatic liquidation of your positions</p>
            </div>
          </div>
        </div>
      `,
    };
  }

  if (type === 'liquidation') {
    return {
      subject: `🔴 LIQUIDATION ALERT - Positions Being Closed`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #8b0000 0%, #660000 100%);">
            <h1>🔴 LIQUIDATION IN PROGRESS</h1>
          </div>
          <div class="content">
            <div class="alert critical">
              <p><strong>LIQUIDATION TRIGGERED</strong></p>
              <p>Your margin level dropped below 50%, triggering automatic liquidation of your positions.</p>
              <p>This action is being taken to protect your account from further losses.</p>
            </div>
            
            <div class="metric">
              <div class="metric-label">Margin Level at Liquidation</div>
              <div class="metric-value" style="color: #8b0000;">${data.margin_level.toFixed(2)}%</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Account Equity</div>
              <div class="metric-value">$${data.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            <p style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
              Your positions are being systematically closed to bring your account back to a safe margin level.
              You will be notified once the liquidation process is complete.
            </p>
            
            <a href="${Deno.env.get('APP_URL')}/history" class="button" style="background: #8b0000;">View Liquidation History</a>
            
            <div class="footer">
              <p><strong>This is an automated liquidation notification from TradeX Pro</strong></p>
              <p>For questions about the liquidation process, please contact support immediately</p>
            </div>
          </div>
        </div>
      `,
    };
  }

  return {
    subject: 'Notification from TradeX Pro',
    html: '<p>You have a new notification</p>',
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate CRON_SECRET for security
    const CRON_SECRET = Deno.env.get('CRON_SECRET');
    const providedSecret = req.headers.get('X-Cron-Secret');
    
    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      console.error('Unauthorized access attempt to send-critical-email');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRequest: EmailRequest = await req.json();
    
    if (!emailRequest.to || !emailRequest.type || !emailRequest.data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const template = getEmailTemplate(emailRequest.type, emailRequest.data);
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TradeX Pro Alerts <alerts@tradexpro.com>',
        to: emailRequest.to,
        subject: template.subject,
        html: template.html,
      }),
    });

    const data = await result.json();
    console.log('Email sent:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
