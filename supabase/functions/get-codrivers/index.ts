import {
  corsHeaders,
  handleOptions,
  getSupabaseClient,
  getUserFromRequest,
} from "../util.ts";

Deno.serve(async (req: Request) => {
  // Obsługa preflight CORS
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  // Sprawdzenie metody HTTP
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Inicjalizacja klienta Supabase
  const { client: supabase, error: supaError } = getSupabaseClient();
  if (supaError) return supaError;

  // Autoryzacja - pobierz usera z tokena
  const { user, error: authError } = await getUserFromRequest(supabase, req);
  if (authError) {
    return new Response(JSON.stringify({ error: authError }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Pobieranie listy codriverów użytkownika
    const { data: codrivers, error: dbError } = await supabase
      .from("codrivers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch codrivers" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mapowanie snake_case -> camelCase
    const mappedCodrivers = (codrivers || []).map((codriver: any) => ({
      id: codriver.id,
      userId: codriver.user_id,
      name: codriver.name,
      club: codriver.club,
      birthDate: codriver.birth_date,
      drivingLicenseNumber: codriver.driving_license_number,
      sportsLicense: codriver.sports_license,
      email: codriver.email,
      phone: codriver.phone,
      createdAt: codriver.created_at,
      updatedAt: codriver.updated_at,
    }));

    return new Response(JSON.stringify({ data: mappedCodrivers }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
