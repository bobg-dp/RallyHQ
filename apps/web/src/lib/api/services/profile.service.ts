import { supabase } from "@/lib/supabase/client";
import { store } from "@/lib/store";

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
  // Try to get token from Redux store first
  const state = store.getState();
  const token = state.auth?.token;

  if (token) {
    return token;
  }

  // Fallback: try to get session directly from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
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
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
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
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
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
