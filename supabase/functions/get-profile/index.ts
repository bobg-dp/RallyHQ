import {
  corsHeaders,
  handleOptions,
  getSupabaseClient,
  getUserFromRequest,
} from "../util.ts";

// ...existing code...

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
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  try {
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

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
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
