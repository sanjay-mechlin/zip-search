# 🚀 Supabase Deployment Guide

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install globally
   ```bash
   npm install -g supabase
   ```
3. **Git**: For version control

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose your organization and region
3. Set a strong database password
4. Wait for project creation (2-3 minutes)

## Step 2: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create tables and sample data

## Step 3: Get Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon (public) key** (starts with `eyJ...`)
   - **Service role key** (for admin operations)

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# REQUIRED: Service role key for admin operations (bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for admin operations to work properly. Without it, you'll get RLS policy errors when trying to add/edit/delete companies.

## Step 5: Deploy with Supabase CLI

### Option A: Deploy to Supabase (Recommended)

1. **Login to Supabase CLI**:
   ```bash
   supabase login
   ```

2. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Deploy your application**:
   ```bash
   supabase functions deploy
   ```

### Option B: Deploy to Vercel (Alternative)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 6: Configure Production Settings

### Update Supabase Settings

1. **Go to Authentication** → **URL Configuration**
2. **Add your production URL** to:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

### Update CORS Settings

1. **Go to Settings** → **API**
2. **Add your domain** to CORS origins

## Step 7: Test Your Deployment

1. **Visit your deployed URL**
2. **Test the search functionality**
3. **Verify admin dashboard works**
4. **Check database connections**

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client-side | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Optional |

## Troubleshooting

### Common Issues

1. **CORS Errors**: Add your domain to Supabase CORS settings
2. **Authentication Issues**: Check URL configuration in Supabase
3. **Database Connection**: Verify environment variables are correct
4. **Build Errors**: Ensure all dependencies are installed

### Debug Steps

1. **Check browser console** for errors
2. **Verify environment variables** are loaded
3. **Test API endpoints** directly
4. **Check Supabase logs** in dashboard

## Production Checklist

- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Authentication URLs configured
- [ ] SSL certificate active
- [ ] Performance monitoring enabled
- [ ] Error tracking configured

## Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
