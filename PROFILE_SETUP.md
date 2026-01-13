# User Profile Feature - Setup Guide

This guide explains how to set up and deploy the user profile feature with Supabase.

## Overview

The user profile feature allows logged-in users to:

- View their profile data
- Update their profile information
- Store data securely in Supabase PostgreSQL
- Access only their own data (enforced by Row Level Security)

## Architecture

- **Database**: Supabase PostgreSQL with RLS policies
- **Backend**: Supabase Edge Functions (Deno)
- **Frontend**: React component with API service layer

## Setup Steps

### 1. Database Migration

Run the database migration to create the `user_profiles` table:

```bash
# Navigate to the supabase directory
cd supabase

# Run the migration (if using Supabase CLI locally)
supabase db push

# Or apply manually in Supabase Dashboard > SQL Editor
# Copy contents of: supabase/migrations/20260113000000_create_user_profiles.sql
```

The migration creates:

- `user_profiles` table with all necessary fields
- Row Level Security (RLS) policies for data protection
- Automatic `updated_at` timestamp trigger
- Database indexes for performance

### 2. Deploy Edge Functions

Deploy the two edge functions to Supabase:

```bash
# Install Supabase CLI if not already installed
# npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the get-profile function
supabase functions deploy get-profile --project-ref your-project-ref

# Deploy the update-profile function
supabase functions deploy update-profile --project-ref your-project-ref
```

Or deploy via the Supabase Dashboard:

1. Go to **Edge Functions** in your Supabase project
2. Create new functions named `get-profile` and `update-profile`
3. Copy the code from:
   - `apps/functions/get-profile/index.ts`
   - `apps/functions/update-profile/index.ts`

### 3. Environment Variables

Make sure your frontend has the required environment variables:

```env
# .env or .env.local in apps/web/
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test the Feature

1. **Login** to the application as a user
2. **Navigate** to the dashboard/profile page
3. **View** your profile (will load empty initially)
4. **Fill in** the form fields
5. **Save** the profile
6. **Refresh** the page to verify data persistence

## Security Features

### Row Level Security (RLS)

All data access is protected by RLS policies:

- ✅ Users can only view their own profile
- ✅ Users can only insert their own profile
- ✅ Users can only update their own profile
- ✅ Users can only delete their own profile

### Authentication

- All API calls require a valid JWT token
- Edge functions verify the token before processing requests
- User ID is extracted from the JWT and used for data filtering

## API Documentation

### Get Profile

**Endpoint**: `/functions/v1/get-profile`  
**Method**: GET  
**Auth**: Required (Bearer token)

**Response**:

```json
{
  "data": {
    "name": "John Doe",
    "team": "Team A",
    "club": "Racing Club",
    "birthDate": "01.01.1990",
    "drivingLicenseNumber": "ABC123",
    "sportsLicense": true,
    "email": "john@example.com",
    "phone": "123456789",
    "iceContact": {
      "name": "Jane Doe",
      "phone": "987654321"
    }
  }
}
```

### Update Profile

**Endpoint**: `/functions/v1/update-profile`  
**Method**: POST  
**Auth**: Required (Bearer token)

**Request Body**:

```json
{
  "name": "John Doe",
  "team": "Team A",
  "club": "Racing Club",
  "birthDate": "01.01.1990",
  "drivingLicenseNumber": "ABC123",
  "sportsLicense": true,
  "email": "john@example.com",
  "phone": "123456789",
  "iceContact": {
    "name": "Jane Doe",
    "phone": "987654321"
  }
}
```

**Response**: Same as Get Profile

## Database Schema

```sql
Table: user_profiles
├── id (UUID, PRIMARY KEY, references auth.users)
├── name (TEXT, NOT NULL)
├── team (TEXT)
├── club (TEXT)
├── birth_date (TEXT)
├── driving_license_number (TEXT)
├── sports_license (BOOLEAN, default: false)
├── email (TEXT, NOT NULL)
├── phone (TEXT)
├── ice_contact_name (TEXT)
├── ice_contact_phone (TEXT)
├── created_at (TIMESTAMP WITH TIME ZONE)
└── updated_at (TIMESTAMP WITH TIME ZONE)
```

## Frontend Components

### YourProfile Component

Location: `apps/web/src/components/custom/dashboard/YourProfile.tsx`

Features:

- Automatic profile loading on mount
- Form validation
- Loading and saving states
- Toast notifications for success/error
- Optimistic UI updates

### Profile Service

Location: `apps/web/src/lib/api/services/profile.service.ts`

Functions:

- `getProfile()`: Fetch current user's profile
- `updateProfile(profile)`: Update current user's profile

## Troubleshooting

### Profile not loading

1. Check that the user is authenticated
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Verify edge functions are deployed

### Cannot save profile

1. Check that RLS policies are enabled
2. Verify the user token is valid
3. Check edge function logs in Supabase Dashboard
4. Ensure all required fields (name, email) are filled

### CORS errors

1. Edge functions include CORS headers by default
2. Verify the `corsHeaders` configuration in edge functions
3. Check that OPTIONS requests are handled

## Future Enhancements

Potential improvements:

- [ ] Add profile picture upload
- [ ] Add email verification
- [ ] Add phone number validation
- [ ] Add audit logging
- [ ] Add profile completion percentage
- [ ] Add profile export feature

## Support

For issues or questions:

1. Check the Supabase Dashboard logs
2. Review browser console errors
3. Verify database RLS policies
4. Check edge function deployment status
