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
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Inicjalizacja klienta Supabase
  // Najpierw pobierz token z headera
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  const accessToken = authHeader.replace("Bearer ", "");
  const { client: supabase, error: supaError } = getSupabaseClient(accessToken);
  if (supaError) return supaError;

  // Autoryzacja - pobierz usera z tokena
  const { user, error: authError } = await getUserFromRequest(supabase, req);
  if (authError) {
    return new Response(JSON.stringify({ error: authError }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("User authenticated:", user.id);

  try {
    // Parsowanie body
    const body = await req.json();
    console.log("Received codriver data:", JSON.stringify(body, null, 2));
    console.log("User ID:", user.id);

    // Walidacja wymaganych pól
    if (!body.name || !body.email || !body.phone) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: name, email, phone",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mapowanie camelCase -> snake_case dla bazy danych
    const codriverData = {
      user_id: user.id,
      name: body.name,
      club: body.club || null,
      birth_date: body.birthDate || null,
      driving_license_number: body.drivingLicenseNumber || null,
      sports_license: body.sportsLicense || false,
      email: body.email,
      phone: body.phone,
    };

    // Dodanie nowego codrivera do bazy
    const { data: newCodriver, error: dbError } = await supabase
      .from("codrivers")
      .insert(codriverData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      console.error("Database error details:", JSON.stringify(dbError, null, 2));
      return new Response(
        JSON.stringify({ 
          error: "Failed to add codriver",
          details: dbError.message || dbError.toString()
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mapowanie snake_case -> camelCase dla odpowiedzi
    const mappedCodriver = {
      id: newCodriver.id,
      userId: newCodriver.user_id,
      name: newCodriver.name,
      club: newCodriver.club,
      birthDate: newCodriver.birth_date,
      drivingLicenseNumber: newCodriver.driving_license_number,
      sportsLicense: newCodriver.sports_license,
      email: newCodriver.email,
      phone: newCodriver.phone,
      createdAt: newCodriver.created_at,
      updatedAt: newCodriver.updated_at,
    };

    return new Response(JSON.stringify({ data: mappedCodriver }), {
      status: 201,
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
