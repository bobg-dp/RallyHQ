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
    // Parsowanie body
    const body = await req.json();

    // Walidacja wymaganych pól
    if (!body.id) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
      name: body.name,
      club: body.club || null,
      birth_date: body.birthDate || null,
      driving_license_number: body.drivingLicenseNumber || null,
      sports_license: body.sportsLicense || false,
      email: body.email,
      phone: body.phone,
    };

    // Aktualizacja codrivera w bazie
    // RLS policy automatycznie sprawdzi czy user_id się zgadza
    const { data: updatedCodriver, error: dbError } = await supabase
      .from("codrivers")
      .update(codriverData)
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);

      // Sprawdzenie czy codriver w ogóle istnieje
      if (dbError.code === "PGRST116") {
        return new Response(
          JSON.stringify({ error: "Codriver not found or access denied" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to update codriver" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mapowanie snake_case -> camelCase dla odpowiedzi
    const mappedCodriver = {
      id: updatedCodriver.id,
      userId: updatedCodriver.user_id,
      name: updatedCodriver.name,
      club: updatedCodriver.club,
      birthDate: updatedCodriver.birth_date,
      drivingLicenseNumber: updatedCodriver.driving_license_number,
      sportsLicense: updatedCodriver.sports_license,
      email: updatedCodriver.email,
      phone: updatedCodriver.phone,
      createdAt: updatedCodriver.created_at,
      updatedAt: updatedCodriver.updated_at,
    };

    return new Response(JSON.stringify({ data: mappedCodriver }), {
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
