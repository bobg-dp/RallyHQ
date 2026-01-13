# 🚀 Quick Start - User Profile Feature

## Prerequisites

- Supabase project set up
- Supabase CLI installed: `npm install -g supabase`
- Environment variables configured in `apps/web/.env`

## Deploy in 3 Steps

### Step 1: Apply Database Migration (Choose one)

**A) Using Supabase CLI:**

```bash
cd supabase
supabase db push
```

**B) Using Supabase Dashboard:**

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy & run: `supabase/migrations/20260113000000_create_user_profiles.sql`

### Step 2: Deploy Edge Functions (Choose one)

**A) Using our script (easiest):**

```bash
./deploy-profile.sh
```

**B) Manual CLI deployment:**

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
cd apps/functions
supabase functions deploy get-profile
supabase functions deploy update-profile
```

**C) Using Supabase Dashboard:**

1. Go to **Edge Functions** → **Create function**
2. Name: `get-profile`
3. Paste code from: `apps/functions/get-profile/index.ts`
4. Repeat for `update-profile`

### Step 3: Test

1. Start your frontend: `pnpm dev` (or `npm run dev`)
2. Login to your app
3. Navigate to the profile/dashboard page
4. Fill in the form and save
5. Refresh to verify data persists ✅

## What Was Created

### Database

- ✅ `user_profiles` table in PostgreSQL
- ✅ Row Level Security policies
- ✅ Auto-updating timestamps
- ✅ Indexes for performance

### Backend (Edge Functions)

- ✅ `get-profile` - Fetch user profile
- ✅ `update-profile` - Create/update profile
- ✅ Authentication validation
- ✅ CORS headers configured

### Frontend

- ✅ Updated `YourProfile.tsx` component
- ✅ Profile API service with `getProfile()` and `updateProfile()`
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ TypeScript type definitions

## Verify Deployment

### Check Database

```sql
-- In Supabase SQL Editor
SELECT * FROM user_profiles LIMIT 1;
```

### Check Edge Functions

Visit in browser (should require auth):

```
https://YOUR_PROJECT.supabase.co/functions/v1/get-profile
```

### Check Frontend

Look for these in browser console:

- No errors on page load
- Profile loads (or shows empty form)
- Save operation completes successfully

## Security Features

✅ **Row Level Security** - Users can only access their own data  
✅ **JWT Authentication** - All requests require valid token  
✅ **Server-side validation** - Required fields enforced  
✅ **CORS protection** - Only allowed origins can access

## Need Help?

📖 **Detailed Documentation:**

- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Full implementation details
- [PROFILE_SETUP.md](PROFILE_SETUP.md) - Complete setup guide with troubleshooting

🔍 **Debugging:**

- Check **Supabase Dashboard** → **Edge Functions** → **Logs**
- Check browser console for frontend errors
- Verify environment variables are set

## File Locations

```
rallyHQ/
├── supabase/migrations/
│   └── 20260113000000_create_user_profiles.sql  [Database schema]
├── apps/functions/
│   ├── get-profile/index.ts                     [GET endpoint]
│   └── update-profile/index.ts                  [POST endpoint]
├── apps/web/src/
│   ├── components/custom/dashboard/
│   │   └── YourProfile.tsx                      [Form component]
│   ├── lib/api/services/
│   │   └── profile.service.ts                   [API client]
│   └── lib/types/
│       └── profile.types.ts                     [Type definitions]
├── deploy-profile.sh                            [Deployment script]
├── PROFILE_SETUP.md                             [Setup guide]
└── IMPLEMENTATION_SUMMARY.md                    [Implementation details]
```

## Status Checklist

Before considering deployment complete, verify:

- [ ] Database migration applied successfully
- [ ] `user_profiles` table exists with RLS enabled
- [ ] `get-profile` edge function deployed
- [ ] `update-profile` edge function deployed
- [ ] Frontend environment variables set
- [ ] Can load profile page without errors
- [ ] Can save profile data
- [ ] Data persists after page refresh
- [ ] Other users cannot access your profile

## 🎉 You're Done!

Your user profile feature is now fully functional with:

- Secure database storage
- RESTful API endpoints
- Modern React UI
- Complete type safety

Happy coding! 🚀
