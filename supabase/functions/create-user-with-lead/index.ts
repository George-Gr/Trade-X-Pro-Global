import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  tradingExperience: string;
  occupation: string;
  financialCapability: string;
  reasonForJoining: string;
  tradingGoals: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body: CreateUserRequest = await req.json();

    // Validate required fields
    const requiredFields = [
      "email",
      "password",
      "firstName",
      "lastName",
      "phone",
      "address",
      "tradingExperience",
      "occupation",
      "financialCapability",
      "reasonForJoining",
      "tradingGoals",
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CreateUserRequest]) {
        return new Response(JSON.stringify({ error: `${field} is required` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate password
    if (body.password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Creating user:", body.email);

    // Create user with Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: false,
        user_metadata: {
          full_name: `${body.firstName} ${body.lastName}`,
          first_name: body.firstName,
          last_name: body.lastName,
          phone: body.phone,
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!authData.user) {
      return new Response(JSON.stringify({ error: "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User created:", authData.user.id);

    // Generate lead number
    const { data: leadNumberData, error: leadNumberError } =
      await supabaseAdmin.rpc("generate_lead_number");

    if (leadNumberError) {
      console.error("Lead number error:", leadNumberError);
      // Continue without lead number generation error
    }

    const leadNumber = leadNumberData || `TXP-${Date.now()}`;

    console.log("Generated lead number:", leadNumber);

    // Create lead record
    const { data: leadData, error: leadError } = await supabaseAdmin
      .from("leads")
      .insert({
        user_id: authData.user.id,
        lead_number: leadNumber,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        trading_experience: body.tradingExperience,
        occupation: body.occupation,
        financial_capability: body.financialCapability,
        reason_for_joining: body.reasonForJoining,
        trading_goals: body.tradingGoals,
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      console.error("Lead creation error:", leadError);
      // Don't fail the whole registration if lead creation fails
    }

    console.log("Lead created:", leadData?.id);

    // Update profile with phone and full name
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: `${body.firstName} ${body.lastName}`,
        phone: body.phone,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authData.user.id,
        lead_number: leadNumber,
        message:
          "Account created successfully. Please check your email to verify your account.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
