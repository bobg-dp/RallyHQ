import { supabase } from "@/lib/supabase/client";
import { store } from "@/lib/store";
import { clearCredentials } from "@/lib/store/slices/authSlice";

export interface Profile {
  name: string;
  team: string;
  club: string;
  birthDate: string;
  drivingLicenseNumber: string;
  sportsLicense: boolean;
  email: string;
  phone: string;
  iceContact: {
    name: string;
    phone: string;
  };
}

/**
 * Get authentication token from Redux store or Supabase session
 */
async function getAuthToken(): Promise<string> {
  // Prefer session from Supabase to avoid stale tokens
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (session?.access_token) {
    // Validate session to avoid invalid JWT signature errors
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      await supabase.auth.signOut();
      store.dispatch(clearCredentials());
      throw new Error("Not authenticated");
    }
    return session.access_token;
  }

  // Fallback: try to get token from Redux store
  const state = store.getState();
  const token = state.auth?.token;

  if (token) {
    return token;
  }

  throw new Error("Not authenticated");
}

/**
 * Get the base URL for edge functions
 * Handles both local (http://localhost:54321) and remote URLs
 */
function getFunctionsUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL is not configured");
  }

  // For local development (e.g., http://localhost:54321)
  // For remote (e.g., https://project.supabase.co)
  // Both should get /functions/v1 appended
  return `${supabaseUrl}/functions/v1`;
}

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    console.log("Fetching profile...");
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    // Call the edge function
    const response = await fetch(`${functionsUrl}/get-profile`, {
      method: "GET",
      headers: {
        // Gateway Supabase wymaga Authorization, więc podajemy tam anon key,
        // a właściwy token użytkownika trzymamy w x-access-token do weryfikacji wewnątrz funkcji
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
      const error = await response.json();
      console.log("Error response:", JSON.stringify(error.error));
      throw new Error(error.error || "Failed to fetch profile");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfile(profile: Profile): Promise<Profile> {
  try {
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    // Call the edge function
    const response = await fetch(`${functionsUrl}/update-profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "x-access-token": `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await supabase.auth.signOut();
        store.dispatch(clearCredentials());
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
