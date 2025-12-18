import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const NotificationRequestSchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
  type: z.string().min(1, "Type required").max(50, "Type too long"),
  title: z.string().min(1, "Title required").max(200, "Title too long"),
  message: z.string().min(1, "Message required").max(2000, "Message too long"),
  data: z.record(z.any()).optional(),
  send_email: z.boolean().optional().default(true),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check rate limit: 5 requests per minute
    const { data: rateLimitOk } = await supabase.rpc("check_rate_limit", {
      p_user_id: user.id,
      p_endpoint: "send-notification",
      p_max_requests: 5,
      p_window_seconds: 60,
    });

    if (!rateLimitOk) {
      console.log("Rate limit exceeded for user");
      return new Response(
        JSON.stringify({
          error:
            "Too many requests. Please wait before sending another notification.",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = NotificationRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: validation.error.issues
            .map(
              (i: unknown) =>
                `${(i as { path: string[]; message: string }).path.join(".")}: ${(i as { path: string[]; message: string }).message}`,
            )
            .join(", "),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { user_id, type, title, message, data, send_email } = validation.data;

    // Ensure caller can only send to themselves (unless admin)
    if (user_id !== user.id) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        return new Response(
          JSON.stringify({
            error: "Forbidden: Can only send notifications to yourself",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

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
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
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

    // Send email if enabled using Resend API directly
    if (send_email && preferences?.email_enabled) {
      try {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
          console.warn("RESEND_API_KEY not configured, skipping email");
        } else {
          const emailHtml = generateEmailHtml(title, message, data);

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Trading Platform <notifications@resend.dev>",
              to: [profile.email],
              subject: title,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            const errorData = await emailResponse.text();
            console.error("Error sending email:", errorData);
          } else {
            console.log("Email sent successfully to:", profile.email);
          }
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - notification was created, email is optional
      }
    }

    return new Response(
      JSON.stringify({ message: "Notification created successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error in send-notification function:", err);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function checkNotificationEnabled(type: string, preferences: unknown): boolean {
  if (!preferences) return true;

  const typeMap: Record<string, string> = {
    order_filled: "order_notifications",
    order_executed: "order_notifications",
    margin_warning: "margin_notifications",
    margin_call: "margin_notifications",
    stop_out: "margin_notifications",
    pnl_milestone: "pnl_notifications",
    position_update: "order_notifications",
    kyc_update: "kyc_notifications",
    price_alert: "price_alert_notifications",
    risk_event: "risk_notifications",
  };

  const prefKey = typeMap[type];
  const prefs = preferences as Record<string, unknown>;
  return !prefKey || prefs[prefKey] !== false;
}

function generateEmailHtml(
  title: string,
  message: string,
  data?: Record<string, unknown>,
): string {
  // Escape HTML to prevent XSS
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

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
            <h1 style="margin: 0;">${safeTitle}</h1>
          </div>
          <div class="content">
            <p>${safeMessage}</p>
            ${
              data
                ? `
              <div class="data">
                <h3 style="margin-top: 0;">Details:</h3>
                ${Object.entries(data)
                  .map(
                    ([key, value]) => `
                  <div class="data-item">
                    <span class="label">${escapeHtml(formatLabel(key))}:</span> ${escapeHtml(formatValue(value))}
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
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
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatValue(value: unknown): string {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
