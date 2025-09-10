# Quick Setup Guide

## 🚀 Your App is Already Running!
Open your browser and go to: **http://localhost:3000**

## 🔧 Complete Database Setup

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project named `local-service-mvp`

### Step 2: Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor

### Step 3: Get API Keys
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key

### Step 4: Update Environment Variables
Edit the `.env.local` file and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### Step 5: Restart the Server
After updating the environment variables:
1. Stop the current server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Refresh your browser

## ✅ Test the Application

### For Homeowners:
1. Go to http://localhost:3000
2. Enter a ZIP code like "90210"
3. See the sample companies (if database is set up)

### For Admins:
1. Go to http://localhost:3000/admin
2. Add, edit, or delete companies
3. Manage services and pricing

## 🎯 What You'll See

**Without Database Setup:**
- App loads but shows errors when searching
- Admin dashboard loads but can't save data

**With Database Setup:**
- ZIP search works with sample data
- Admin dashboard fully functional
- Can add/edit/delete companies
- Individual company pages work

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase credentials are correct
3. Make sure the database schema was run successfully
4. Restart the development server after updating environment variables
