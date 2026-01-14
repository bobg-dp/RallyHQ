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
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const accessToken = authHeader.replace("Bearer ", "");
  const { client: supabase, error: supaError } =
    getSupabaseClient(accessToken);
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
    const body = await req.json();

    if (!body.make || !body.model || !body.registrationNumber) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: make, model, registrationNumber",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const engine = body.engine || {};
    const insurance = body.insurance || {};

    const carData = {
      user_id: user.id,
      make: body.make,
      model: body.model,
      year: body.year || null,
      registration_number: body.registrationNumber,
      vin: body.vin || null,
      engine_capacity: engine.capacity || null,
      engine_type: engine.type || null,
      engine_capacity_multiplier:
        engine.capacityMultiplier !== undefined
          ? Number(engine.capacityMultiplier)
          : null,
      engine_capacity_with_multiplier: engine.capacityWithMultiplier || null,
      engine_fuel: engine.fuel || null,
      drive: body.drive || null,
      next_inspection: body.nextInspection || null,
      insurance_policy_number: insurance.policyNumber || null,
      insurance_expiry_date: insurance.expiryDate || null,
      sport_car_type: body.sportCarType || null,
    };

    const { data: newCar, error: dbError } = await supabase
      .from("cars")
      .insert(carData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to add car", details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const mappedCar = {
      id: newCar.id,
      userId: newCar.user_id,
      make: newCar.make,
      model: newCar.model,
      year: newCar.year,
      registrationNumber: newCar.registration_number,
      vin: newCar.vin,
      engine: {
        capacity: newCar.engine_capacity,
        type: newCar.engine_type,
        capacityMultiplier: newCar.engine_capacity_multiplier,
        capacityWithMultiplier: newCar.engine_capacity_with_multiplier,
        fuel: newCar.engine_fuel,
      },
      drive: newCar.drive,
      nextInspection: newCar.next_inspection,
      insurance: {
        policyNumber: newCar.insurance_policy_number,
        expiryDate: newCar.insurance_expiry_date,
      },
      sportCarType: newCar.sport_car_type,
      createdAt: newCar.created_at,
      updatedAt: newCar.updated_at,
    };

    return new Response(JSON.stringify({ data: mappedCar }), {
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
