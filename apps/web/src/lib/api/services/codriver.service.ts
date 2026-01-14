import { supabase } from "@/lib/supabase/client";
import { store } from "@/lib/store";

export interface Codriver {
  id?: string;
  userId?: string;
  name: string;
  club: string;
  birthDate: string;
  drivingLicenseNumber: string;
  sportsLicense: boolean;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
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
 * Get all codrivers for the current user
 */
export async function getCodrivers(): Promise<Codriver[]> {
  try {
    console.log("Fetching codrivers...");
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    const response = await fetch(`${functionsUrl}/get-codrivers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error response:", error);
      throw new Error(error.error || "Failed to fetch codrivers");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching codrivers:", error);
    throw error;
  }
}

/**
 * Add a new codriver
 */
export async function addCodriver(
  codriver: Omit<Codriver, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Codriver> {
  try {
    console.log("Adding codriver...");
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    const response = await fetch(`${functionsUrl}/add-codriver`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(codriver),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error response:", error);
      throw new Error(error.error || "Failed to add codriver");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error adding codriver:", error);
    throw error;
  }
}

/**
 * Update an existing codriver
 */
export async function updateCodriver(codriver: Codriver): Promise<Codriver> {
  try {
    console.log("Updating codriver...");
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    if (!codriver.id) {
      throw new Error("Codriver ID is required for update");
    }

    const response = await fetch(`${functionsUrl}/update-codriver`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(codriver),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error response:", error);
      throw new Error(error.error || "Failed to update codriver");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating codriver:", error);
    throw error;
  }
}

/**
 * Delete a codriver
 */
export async function deleteCodriver(id: string): Promise<void> {
  try {
    console.log("Deleting codriver...");
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    const response = await fetch(`${functionsUrl}/delete-codriver`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error response:", error);
      throw new Error(error.error || "Failed to delete codriver");
    }
  } catch (error) {
    console.error("Error deleting codriver:", error);
    throw error;
  }
}
