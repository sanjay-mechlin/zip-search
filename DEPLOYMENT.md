# Deployment Guide

## Quick Start with Vercel

### 1. Set up Supabase Database
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Go to Settings > API to get your project URL and anon key

### 2. Deploy to Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
5. Click "Deploy"

### 3. Test Your Deployment
1. Visit your Vercel URL
2. Test the ZIP code search functionality
3. Navigate to `/admin` to test the admin dashboard
4. Add a test company to verify everything works

## Alternative Deployment Options

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

### Railway
1. Connect your GitHub repository to Railway
2. Add a PostgreSQL database service
3. Run the SQL schema in your database
4. Set environment variables
5. Deploy

## Environment Variables Reference

```env
# Required for frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Post-Deployment Checklist

- [ ] Database schema is properly set up
- [ ] Environment variables are configured
- [ ] ZIP code search works
- [ ] Company pages load correctly
- [ ] Admin dashboard is accessible
- [ ] Can add/edit/delete companies
- [ ] Mobile responsiveness works
- [ ] All links and navigation work

## Troubleshooting

### Common Issues

1. **"Failed to fetch companies" error**
   - Check Supabase URL and anon key
   - Verify database schema is set up correctly
   - Check Supabase RLS policies

2. **Admin operations not working**
   - Verify service role key is set
   - Check RLS policies allow service role access

3. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check if all dependencies are installed

4. **Build errors**
   - Run `npm run build` locally to test
   - Check for TypeScript errors
   - Verify all imports are correct

### Getting Help

- Check the Supabase documentation for database issues
- Review Next.js documentation for deployment issues
- Check the project README for setup instructions
