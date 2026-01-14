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
    const body = await req.json();

    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    const { data: updatedCar, error: dbError } = await supabase
      .from("cars")
      .update(carData)
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);

      if (dbError.code === "PGRST116") {
        return new Response(
          JSON.stringify({ error: "Car not found or access denied" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify({ error: "Failed to update car" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mappedCar = {
      id: updatedCar.id,
      userId: updatedCar.user_id,
      make: updatedCar.make,
      model: updatedCar.model,
      year: updatedCar.year,
      registrationNumber: updatedCar.registration_number,
      vin: updatedCar.vin,
      engine: {
        capacity: updatedCar.engine_capacity,
        type: updatedCar.engine_type,
        capacityMultiplier: updatedCar.engine_capacity_multiplier,
        capacityWithMultiplier: updatedCar.engine_capacity_with_multiplier,
        fuel: updatedCar.engine_fuel,
      },
      drive: updatedCar.drive,
      nextInspection: updatedCar.next_inspection,
      insurance: {
        policyNumber: updatedCar.insurance_policy_number,
        expiryDate: updatedCar.insurance_expiry_date,
      },
      sportCarType: updatedCar.sport_car_type,
      createdAt: updatedCar.created_at,
      updatedAt: updatedCar.updated_at,
    };

    return new Response(JSON.stringify({ data: mappedCar }), {
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
