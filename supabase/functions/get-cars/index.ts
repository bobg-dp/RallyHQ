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
    // Pobieranie listy samochodów użytkownika
    const { data: cars, error: dbError } = await supabase
      .from("cars")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to fetch cars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mapowanie snake_case -> camelCase
    const mappedCars = (cars || []).map((car: any) => ({
      id: car.id,
      userId: car.user_id,
      make: car.make,
      model: car.model,
      year: car.year,
      registrationNumber: car.registration_number,
      vin: car.vin,
      engine: {
        capacity: car.engine_capacity,
        type: car.engine_type,
        capacityMultiplier: car.engine_capacity_multiplier,
        capacityWithMultiplier: car.engine_capacity_with_multiplier,
        fuel: car.engine_fuel,
      },
      drive: car.drive,
      nextInspection: car.next_inspection,
      insurance: {
        policyNumber: car.insurance_policy_number,
        expiryDate: car.insurance_expiry_date,
      },
      sportCarType: car.sport_car_type,
      createdAt: car.created_at,
      updatedAt: car.updated_at,
    }));

    return new Response(JSON.stringify({ data: mappedCars }), {
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
