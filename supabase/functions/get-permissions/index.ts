import {
  corsHeaders,
  handleOptions,
  getSupabaseClient,
  getUserFromRequest,
} from "../util.ts";

interface UserPermissionRow {
  user_id: string;
  permission: string;
  created_at: string | null;
}

Deno.serve(async (req: Request) => {
  const optionsRes = handleOptions(req);
  if (optionsRes) return optionsRes;

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { client: supabase, error: supaError } = getSupabaseClient();
  if (supaError) return supaError;

  const { user, error: userError } = await getUserFromRequest(supabase, req);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: userError ?? "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { data, error } = await supabase
      .from("user_permissions")
      .select("user_id, permission, created_at")
      .eq("user_id", user.id)
      .order("permission", { ascending: true });

    if (error) {
      console.error("[get-permissions] Database error", error);
      return new Response(JSON.stringify({ error: "Failed to fetch permissions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = (data ?? []) as UserPermissionRow[];

    const mapped = rows.map((row) => ({
      permission: row.permission,
      createdAt: row.created_at,
    }));

    return new Response(JSON.stringify({ data: mapped }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[get-permissions] Unexpected error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
