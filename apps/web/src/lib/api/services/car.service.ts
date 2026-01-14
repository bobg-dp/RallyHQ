import { supabase } from "@/lib/supabase/client";
import { store } from "@/lib/store";

export interface Car {
  id?: string;
  userId?: string;
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  vin: string;
  engine: {
    capacity: string;
    type: string;
    capacityMultiplier: number;
    capacityWithMultiplier: string;
    fuel: string;
  };
  drive: string;
  nextInspection: string;
  insurance: {
    policyNumber: string;
    expiryDate: string;
  };
  sportCarType: string;
  createdAt?: string;
  updatedAt?: string;
}

async function getAuthToken(): Promise<string> {
  const state = store.getState();
  const token = state.auth?.token;

  if (token) {
    return token;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
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

export async function getCars(): Promise<Car[]> {
  try {
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    const response = await fetch(`${functionsUrl}/get-cars`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch cars");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
}

export async function addCar(
  car: Omit<Car, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Car> {
  try {
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    const response = await fetch(`${functionsUrl}/add-car`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(car),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add car");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error adding car:", error);
    throw error;
  }
}

export async function updateCar(car: Car): Promise<Car> {
  try {
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    if (!car.id) {
      throw new Error("Car ID is required for update");
    }

    const response = await fetch(`${functionsUrl}/update-car`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(car),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update car");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating car:", error);
    throw error;
  }
}

export async function deleteCar(id: string): Promise<void> {
  try {
    const token = await getAuthToken();
    const functionsUrl = getFunctionsUrl();

    const response = await fetch(`${functionsUrl}/delete-car`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete car");
    }
  } catch (error) {
    console.error("Error deleting car:", error);
    throw error;
  }
}
