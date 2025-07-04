# Separate Database Setup for bolt-version Branch

## Overview
This guide will help you create a separate Supabase database for the `bolt-version` branch while keeping your existing database for the main branch.

## Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Set project name: `heartspark-bolt-version` (or similar)
5. Set database password (save this securely)
6. Choose region (same as your main project for consistency)
7. Click "Create new project"

## Step 2: Get New Project Credentials

Once your new project is created:

1. Go to Settings → API
2. Copy the following:
   - Project URL
   - Project Reference ID
   - `anon` public key
   - `service_role` secret key (if needed)

## Step 3: Update Environment Configuration

The new credentials will be automatically updated in the next step.

## Step 4: Set Up Database Schema

You'll need to run the existing migrations on your new database. The migration files will be automatically applied.

## Step 5: Verify Separation

After setup:
- Main branch → Original Supabase project
- bolt-version branch → New Supabase project
- Each branch will have completely isolated data

## Benefits of Separate Databases

✅ **Isolated Development**: Changes in bolt-version won't affect main branch
✅ **Safe Testing**: Test new features without risk to production data
✅ **Independent Scaling**: Each database can be scaled independently
✅ **Separate Analytics**: Track metrics separately for each version
✅ **Rollback Safety**: Easy to revert without affecting other versions

## Next Steps

1. Create the new Supabase project
2. Share the new credentials
3. I'll update the configuration automatically
4. Run database migrations
5. Test the separation