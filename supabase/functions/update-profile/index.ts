import { corsHeaders, handleOptions, getSupabaseClient, getUserFromRequest } from "../util.ts";

// ...existing code...

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
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Supabase client
    const { client: supabase, error: supaError } = getSupabaseClient();
    if (supaError) return supaError;

    // Pobierz usera z access_token
    const { user, error: userError } = await getUserFromRequest(supabase, req);
    if (userError) {
      return new Response(JSON.stringify({ error: userError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      id: user.id,
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
