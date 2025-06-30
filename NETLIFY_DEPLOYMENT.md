# Netlify Deployment Instructions

## Prerequisites
Make sure you have pushed all your changes to GitHub (which you've already done ✅).

## Deployment Steps

1. **Go to Netlify**
   - Visit https://app.netlify.com
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select your `welp` repository

3. **Configure Build Settings**
   The settings should auto-detect, but verify:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: `netlify/functions` (auto-configured)

4. **Set Environment Variables**
   In the Netlify dashboard, go to Site settings → Environment variables and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-5 minutes)

## Important Notes

- The `netlify.toml` file is already configured for Next.js
- The `@netlify/plugin-nextjs` is installed as a dev dependency
- Node version is set to 18.18.0 in `.nvmrc`
- Your app uses dynamic features (API routes, auth), so it cannot be exported as static

## Troubleshooting

If you still see 404 errors:
1. Check the build logs in Netlify dashboard
2. Ensure all environment variables are set correctly
3. Clear cache and retry deployment (Site settings → Build & deploy → Clear cache and deploy site)

## After Deployment

Your site will be available at:
- Netlify subdomain: `https://your-site-name.netlify.app`
- You can add a custom domain in Domain settings 