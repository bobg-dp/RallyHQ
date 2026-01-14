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

    const { error: dbError } = await supabase
      .from("cars")
      .delete()
      .eq("id", body.id)
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to delete car" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: { success: true, id: body.id } }), {
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
