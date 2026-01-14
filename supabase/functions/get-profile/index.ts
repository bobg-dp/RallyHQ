import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface Profile {
  id?: string;
  name: string;
  team: string;
  club: string;
  birth_date: string;
  driving_license_number: string;
  sports_license: boolean;
  email: string;
  phone: string;
  ice_contact_name: string;
  ice_contact_phone: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");

    console.log("Auth header:", authHeader ? "Present" : "Missing");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract and decode JWT token
    const token = authHeader.replace("Bearer ", "");
    let userId: string;

    try {
      // Decode JWT payload (base64)
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token format");
      }
      const payload = JSON.parse(atob(parts[1]));
      console.log("payload", payload);
      console.log("Token payload keys:", Object.keys(payload));

      userId = payload.sub || payload.user_id || payload.id;

      if (!userId) {
        console.error("No user ID found in token. Payload:", payload);
        throw new Error("No user ID in token");
      }

      console.log("User ID:", userId);
    } catch (e) {
      console.error("Token decode error:", e);
      return new Response(
        JSON.stringify({ error: "Invalid token: " + String(e) }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use supabase-js client with service role key for secure profile fetch
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase env vars" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116: No rows found
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      return new Response(JSON.stringify({ data: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map database fields to camelCase for frontend
    const responseData = {
      name: profile.name,
      team: profile.team,
      club: profile.club,
      birthDate: profile.birth_date,
      drivingLicenseNumber: profile.driving_license_number,
      sportsLicense: profile.sports_license,
      email: profile.email,
      phone: profile.phone,
      iceContact: {
        name: profile.ice_contact_name,
        phone: profile.ice_contact_phone,
      },
    };

    return new Response(JSON.stringify({ data: responseData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
