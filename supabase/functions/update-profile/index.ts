import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ProfileInput {
  name: string;
  team: string;
  club: string;
  birthDate: string;
  drivingLicenseNumber: string;
  sportsLicense: boolean;
  email: string;
  phone: string;
  iceContact: {
    name: string;
    phone: string;
  };
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
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Parse request body
    const profileData: ProfileInput = await req.json();

    // Validate required fields
    if (!profileData.name || !profileData.email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Map camelCase to snake_case for database
    const dbData = {
      id: userId,
      name: profileData.name,
      team: profileData.team || null,
      club: profileData.club || null,
      birth_date: profileData.birthDate || null,
      driving_license_number: profileData.drivingLicenseNumber || null,
      sports_license: profileData.sportsLicense || false,
      email: profileData.email,
      phone: profileData.phone || null,
      ice_contact_name: profileData.iceContact?.name || null,
      ice_contact_phone: profileData.iceContact?.phone || null,
    };

    // Use supabase-js client with service role key for secure upsert
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

    // Upsert profile, but only for the user matching JWT
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .upsert([dbData], { onConflict: "id" })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map database fields back to camelCase for response
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
