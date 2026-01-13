/**
 * Shared type definitions for User Profile feature
 *
 * This file defines the Profile structure used across:
 * - Frontend (React components)
 * - Backend (Edge functions)
 * - Database (PostgreSQL schema)
 */

/**
 * User Profile data structure
 *
 * All fields except name and email are optional
 */
export interface Profile {
  /** Full name of the user */
  name: string;

  /** Team name (optional) */
  team: string;

  /** Club affiliation (optional) */
  club: string;

  /** Birth date in DD.MM.YYYY format (optional) */
  birthDate: string;

  /** Driving license number (optional) */
  drivingLicenseNumber: string;

  /** Whether user has sports license */
  sportsLicense: boolean;

  /** Email address */
  email: string;

  /** Phone number (optional) */
  phone: string;

  /** ICE (In Case of Emergency) contact information */
  iceContact: {
    /** Name of emergency contact */
    name: string;

    /** Phone number of emergency contact */
    phone: string;
  };
}

/**
 * Database row structure (snake_case)
 * Used internally by Supabase
 */
export interface ProfileDbRow {
  id: string;
  name: string;
  team: string | null;
  club: string | null;
  birth_date: string | null;
  driving_license_number: string | null;
  sports_license: boolean;
  email: string;
  phone: string | null;
  ice_contact_name: string | null;
  ice_contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * API response wrapper
 */
export interface ProfileApiResponse {
  data: Profile | null;
  error?: string;
}

/**
 * Validation errors
 */
export interface ProfileValidationError {
  field: keyof Profile | `iceContact.${keyof Profile["iceContact"]}`;
  message: string;
}
