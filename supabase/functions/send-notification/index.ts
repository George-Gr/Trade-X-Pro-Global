import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  send_email?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, type, title, message, data, send_email = true }: NotificationRequest = await req.json();

    console.log("Creating notification:", { user_id, type, title });

    // Get user email and notification preferences
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user_id)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    const { data: preferences, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
    }

    // Check if this type of notification is enabled
    const notificationTypeEnabled = checkNotificationEnabled(type, preferences);

    if (!notificationTypeEnabled) {
      console.log("Notification type disabled for user:", type);
      return new Response(
        JSON.stringify({ message: "Notification type disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create notification record
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        sent_email: send_email && preferences?.email_enabled,
      });

    if (notificationError) {
      throw notificationError;
    }

    // Send email if enabled
    if (send_email && preferences?.email_enabled) {
      try {
        const emailHtml = generateEmailHtml(title, message, data);
        
        await resend.emails.send({
          from: "Trading Platform <notifications@resend.dev>",
          to: [profile.email],
          subject: title,
          html: emailHtml,
        });

        console.log("Email sent successfully to:", profile.email);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - notification was created, email is optional
      }
    }

    return new Response(
      JSON.stringify({ message: "Notification created successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function checkNotificationEnabled(type: string, preferences: any): boolean {
  if (!preferences) return true;

  const typeMap: Record<string, string> = {
    'order_filled': 'order_notifications',
    'order_executed': 'order_notifications',
    'margin_warning': 'margin_notifications',
    'margin_call': 'margin_notifications',
    'stop_out': 'margin_notifications',
    'pnl_milestone': 'pnl_notifications',
    'position_update': 'order_notifications',
    'kyc_update': 'kyc_notifications',
    'price_alert': 'price_alert_notifications',
    'risk_event': 'risk_notifications',
  };

  const prefKey = typeMap[type];
  return !prefKey || preferences[prefKey] !== false;
}

function generateEmailHtml(title: string, message: string, data?: Record<string, any>): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .data { background: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 20px; }
          .data-item { margin: 8px 0; }
          .label { font-weight: 600; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${title}</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            ${data ? `
              <div class="data">
                <h3 style="margin-top: 0;">Details:</h3>
                ${Object.entries(data).map(([key, value]) => `
                  <div class="data-item">
                    <span class="label">${formatLabel(key)}:</span> ${formatValue(value)}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>This is an automated notification from your trading platform.</p>
            <p>To manage your notification preferences, log in to your account.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function formatLabel(key: string): string {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}