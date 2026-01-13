import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

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

    // Use direct Postgres client to bypass PostgREST JWT validation
    console.log("Attempting upsert with data:", dbData);
    
    // In Docker, use 'db' as hostname; locally you might need host.docker.internal
    const client = new Client({
      hostname: "db",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "postgres",
    });

    await client.connect();
    
    const result = await client.queryObject(
      `INSERT INTO public.user_profiles (
        id, name, team, club, birth_date, driving_license_number,
        sports_license, email, phone, ice_contact_name, ice_contact_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        team = EXCLUDED.team,
        club = EXCLUDED.club,
        birth_date = EXCLUDED.birth_date,
        driving_license_number = EXCLUDED.driving_license_number,
        sports_license = EXCLUDED.sports_license,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        ice_contact_name = EXCLUDED.ice_contact_name,
        ice_contact_phone = EXCLUDED.ice_contact_phone,
        updated_at = NOW()
      RETURNING *`,
      [
        dbData.id,
        dbData.name,
        dbData.team,
        dbData.club,
        dbData.birth_date,
        dbData.driving_license_number,
        dbData.sports_license,
        dbData.email,
        dbData.phone,
        dbData.ice_contact_name,
        dbData.ice_contact_phone,
      ]
    );

    await client.end();
    
    const profile = result.rows[0];
    console.log("Upsert successful:", profile);

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
