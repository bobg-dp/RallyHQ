import { supabase } from "@/lib/supabase/client";
import { store } from "@/lib/store";
import { clearCredentials } from "@/lib/store/slices/authSlice";

export interface UserPermission {
  permission: string;
  createdAt?: string;
}

async function getAuthToken(): Promise<string> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (session?.access_token) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      await supabase.auth.signOut();
      store.dispatch(clearCredentials());
      throw new Error("Not authenticated");
    }
    return session.access_token;
  }

  const state = store.getState();
  const token = state.auth?.token;

  if (token) {
    return token;
  }

  throw new Error("Not authenticated");
}

function getFunctionsUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL is not configured");
  }

  return `${supabaseUrl}/functions/v1`;
}

export async function getUserPermissions(): Promise<UserPermission[]> {
  try {
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    const response = await fetch(`${functionsUrl}/get-permissions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "x-access-token": `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await supabase.auth.signOut();
        store.dispatch(clearCredentials());
      }
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || "Failed to fetch permissions");
    }

    const result = await response.json();
    return result.data ?? [];
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    throw error;
  }
}

export async function hasCreateRallyPermission(): Promise<boolean> {
  try {
    const permissions = await getUserPermissions();
    return permissions.some((p) => p.permission === "create_rally");
  } catch {
    return false;
  }
}
