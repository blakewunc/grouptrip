# Vercel Deployment Guide

## Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up at vercel.com)
- [x] Production Supabase project
- [x] All migrations run on production database

---

## Step 1: Prepare Repository

### Push to GitHub

```bash
cd C:\Users\Blake\OneDrive\Desktop\event-planner

# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - GroupTrip MVP"

# Create GitHub repo and push
# (Create repo at github.com/new)
git remote add origin https://github.com/YOUR_USERNAME/grouptrip.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Production Supabase

### Create Production Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. **Name**: GroupTrip Production
4. **Database Password**: Generate strong password (save it!)
5. **Region**: Choose closest to your users
6. Click "Create new project"

### Run Migrations

1. Wait for project to finish setting up (~2 minutes)
2. Go to **SQL Editor** in Supabase dashboard
3. Run migrations in order:

**Run each migration file:**
- `001_initial_schema.sql`
- `002_rls_policies.sql`
- `003_realtime_setup.sql`
- `004_functions.sql`
- `005_add_payment_profiles.sql`
- `006_add_supply_items.sql`
- `007_add_accommodation_logistics.sql`
- `008_add_availability_announcements.sql`
- `009_add_sport_modules.sql`
- `010_add_bachelorette_type.sql`

### Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider (magic links)
3. Enable **Google** OAuth:
   - Create Google OAuth credentials (console.cloud.google.com)
   - Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret
   - Paste into Supabase Google provider settings

4. Go to **Authentication** > **URL Configuration**
   - Site URL: `https://yourapp.vercel.app` (update after deployment)
   - Redirect URLs: Add `https://yourapp.vercel.app/**`

### Get Environment Variables

1. Go to **Settings** > **API**
2. Copy these values:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

---

## Step 3: Deploy to Vercel

### Connect Repository

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Configure Environment Variables

Click **Environment Variables** and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

**Important**: Use production Supabase credentials, not development!

### Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Get your deployment URL (e.g., `grouptrip.vercel.app`)

---

## Step 4: Update Supabase Settings

### Update Site URL

1. Go to Supabase **Authentication** > **URL Configuration**
2. Update Site URL to your Vercel URL: `https://yourapp.vercel.app`
3. Update Redirect URLs: `https://yourapp.vercel.app/**`

### Update OAuth Redirect URIs

If using Google OAuth:
1. Go to Google Cloud Console
2. Update authorized redirect URIs:
   - Add: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

---

## Step 5: Custom Domain (Optional)

### Add Custom Domain

1. In Vercel project, go to **Settings** > **Domains**
2. Add your custom domain (e.g., `grouptrip.com`)
3. Configure DNS:
   - Type: CNAME
   - Name: @ (or www)
   - Value: cname.vercel-dns.com
4. Wait for DNS propagation (up to 48 hours, usually ~5 minutes)

### Update Environment Variables

1. Update `NEXT_PUBLIC_APP_URL` to your custom domain
2. Redeploy (Vercel will auto-deploy on git push)

### Update Supabase

Update Site URL in Supabase to use custom domain

---

## Step 6: Post-Deployment Verification

### Smoke Test Checklist

- [ ] Site loads at production URL
- [ ] Landing page displays correctly
- [ ] Sign up with email works
- [ ] Magic link email arrives
- [ ] Google OAuth sign in works
- [ ] Create a test trip
- [ ] Invite code generates
- [ ] Join trip via invite link works
- [ ] All pages load without errors
- [ ] Real-time updates work (test comments in 2 tabs)
- [ ] Mobile responsive (test on phone)
- [ ] No console errors in browser

### Monitor Deployment

1. Check **Vercel Dashboard** > **Deployments**
   - View build logs
   - Check for errors

2. Check **Vercel Analytics** (if enabled)
   - Page load times
   - Error rates

3. Check **Supabase Dashboard** > **Database**
   - Verify tables exist
   - Check RLS policies active

---

## Troubleshooting

### Build Fails

**Error**: Type errors
- **Fix**: Run `npm run build` locally first
- Check TypeScript errors

**Error**: Missing dependencies
- **Fix**: Ensure all packages in `package.json`
- Run `npm install` locally

### Authentication Issues

**Error**: Redirect URI mismatch
- **Fix**: Double-check Supabase redirect URLs
- Ensure Google OAuth redirect matches

**Error**: Magic link doesn't arrive
- **Fix**: Check Supabase email settings
- Verify SMTP configuration

### Database Issues

**Error**: RLS prevents data access
- **Fix**: Check RLS policies in Supabase
- Test with `service_role` key temporarily

### Real-time Not Working

**Error**: Subscriptions don't update
- **Fix**: Verify real-time enabled on tables
- Check Supabase realtime logs

---

## Continuous Deployment

### Auto-Deploy on Push

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will:
1. Detect the push
2. Build the project
3. Run tests (if configured)
4. Deploy to production
5. Notify you via email

### Preview Deployments

Every branch gets a preview URL:
- Create feature branch: `git checkout -b feature/new-feature`
- Push: `git push origin feature/new-feature`
- Vercel creates preview URL
- Test before merging to main

---

## Production Best Practices

### Environment Management

- **Development**: Use local Supabase or dev project
- **Production**: Separate Supabase project with backups

### Database Backups

1. Go to Supabase **Database** > **Backups**
2. Enable automatic daily backups
3. Test restore process

### Monitoring

1. Set up **Vercel Monitoring** for errors
2. Enable **Supabase Logs** for database queries
3. Add error tracking (Sentry, LogRocket)

### Security

1. Never commit `.env.local` to Git
2. Use separate API keys for dev/prod
3. Enable rate limiting in Supabase
4. Set up CORS policies

---

## Cost Estimates

### Vercel
- **Free tier**:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Custom domains
- **Pro**: $20/month (if needed for more traffic)

### Supabase
- **Free tier**:
  - 500 MB database
  - 1 GB file storage
  - 50,000 monthly active users
- **Pro**: $25/month (for production apps)

### Total MVP Cost
- **Free tier**: $0/month (good for testing)
- **Production**: $25-45/month

---

## Next Steps After Deployment

1. Share app with beta testers
2. Monitor error logs
3. Collect user feedback
4. Iterate based on usage
5. Add analytics (PostHog, Plausible)
6. Set up monitoring alerts
7. Plan feature roadmap

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Deployment Issues**: Check Vercel build logs
