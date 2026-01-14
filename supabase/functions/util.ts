// supabase/functions/util.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function handleOptions(req: Request) {
  console.log("[CORS] Preflight OPTIONS request received", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
}

export function getSupabaseClient(accessToken?: string) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!SUPABASE_URL) {
    return {
      error: new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL env var" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
      client: null,
    };
  }

  // If accessToken is provided, use anon key + set auth header
  // Otherwise use service role key
  const key = accessToken ? SUPABASE_ANON_KEY : SUPABASE_SERVICE_ROLE_KEY;
  
  if (!key) {
    return {
      error: new Response(
        JSON.stringify({ error: "Missing Supabase API key" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
      client: null,
    };
  }

  const client = createClient(SUPABASE_URL, key, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });

  return {
    client,
    error: null,
  };
}

export function getUserIdFromAuthHeader(authHeader: string | null) {
  if (!authHeader)
    return { error: "Unauthorized - No Authorization header", userId: null };
  try {
    const token = authHeader.replace("Bearer ", "");
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token format");
    const payload = JSON.parse(atob(parts[1]));
    const userId = payload.sub || payload.user_id || payload.id;
    if (!userId) throw new Error("No user ID in token");
    return { userId, error: null };
  } catch (e) {
    return { error: `Invalid token: ${String(e)}`, userId: null };
  }
}

// Nowa funkcja: pobierz usera z access_token przez supabase.auth.getUser()
export async function getUserFromRequest(supabase: any, req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { user: null, error: "Unauthorized - No Authorization header" };
  }
  const token = authHeader.replace("Bearer ", "");

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      const errorMessage = error?.message || "Invalid or expired token";
      const decoded = getUserIdFromAuthHeader(authHeader);
      console.error("[Auth] getUser failed", {
        error: errorMessage,
        hasAuthHeader: Boolean(authHeader),
        tokenPrefix: token.slice(0, 8),
        userIdFromJwt: decoded.userId,
        jwtError: decoded.error,
      });
      return {
        user: null,
        error: errorMessage,
      };
    }
    return { user: data.user, error: null };
  } catch (err) {
    const errorMessage = String(err) || "Invalid or expired token";
    const decoded = getUserIdFromAuthHeader(authHeader);
    console.error("[Auth] getUser threw", {
      error: errorMessage,
      hasAuthHeader: Boolean(authHeader),
      tokenPrefix: token.slice(0, 8),
      userIdFromJwt: decoded.userId,
      jwtError: decoded.error,
    });
    return {
      user: null,
      error: errorMessage,
    };
  }
}
