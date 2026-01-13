#!/bin/bash

# User Profile Feature Deployment Script
# This script helps deploy the edge functions to Supabase

set -e

echo "🚀 Deploying User Profile Edge Functions to Supabase"
echo "=================================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Install it with: npm install -g supabase"
    echo "   Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI is installed"
echo ""

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ You are not logged in to Supabase."
    echo "   Run: supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Get project ref
echo "📝 Please enter your Supabase project reference ID:"
echo "   (You can find this in your Supabase project settings)"
read -p "Project Ref: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference cannot be empty"
    exit 1
fi

echo ""
echo "🔗 Linking to project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "📤 Deploying get-profile function..."
cd apps/functions
supabase functions deploy get-profile --project-ref "$PROJECT_REF"

echo ""
echo "📤 Deploying update-profile function..."
supabase functions deploy update-profile --project-ref "$PROJECT_REF"

cd ../..

echo ""
echo "✅ Edge functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Apply the database migration:"
echo "      supabase db push"
echo "   2. Or manually run the SQL in Supabase Dashboard:"
echo "      supabase/migrations/20260113000000_create_user_profiles.sql"
echo "   3. Test the profile feature in your application"
echo ""
echo "🎉 Done!"
