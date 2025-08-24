# Vercel Deployment Checklist

## Pre-Deployment ✅

- [x] **Build completed successfully** - `pnpm run build` ✅
- [x] **All TypeScript errors resolved** ✅
- [x] **Scanner page layout fixed** - No duplicate sidebars ✅
- [x] **Posts page moved to `/naujienos`** ✅
- [x] **Cache control headers added** ✅
- [x] **vercel.json configuration created** ✅

## Environment Variables Setup

### Required in Vercel Dashboard:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY` (if using payments)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using payments)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using payments)

## Database Setup

### Supabase Configuration:
- [x] **Posts table created** ✅
- [x] **RLS policies configured** ✅
- [x] **Sample data uploaded** ✅
- [ ] **Test database connection** in production

## Deployment Steps

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Import project from Git repository
   - Set build command: `pnpm run build`
   - Set install command: `pnpm install`
   - Set output directory: `.next`

3. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Set them for Production, Preview, and Development environments

4. **Deploy**
   - Trigger deployment from Vercel dashboard
   - Monitor build logs for any issues

## Post-Deployment Testing

### Core Functionality:
- [ ] **Homepage loads correctly**
- [ ] **Navigation works** (all links functional)
- [ ] **Posts page (`/naujienos`) loads posts**
- [ ] **Admin dashboard accessible**
- [ ] **Scanner page works** (full width, no duplicate sidebar)

### API Endpoints:
- [ ] `/api/posts` returns data
- [ ] `/api/events` works
- [ ] `/api/tickets` works
- [ ] All other API endpoints functional

### Authentication:
- [ ] **Login/Register works**
- [ ] **Protected routes accessible**
- [ ] **Admin features work**

### Performance:
- [ ] **Page load times acceptable**
- [ ] **Images load correctly**
- [ ] **No console errors**

## Known Issues to Monitor

1. **Posts API**: May return 0 posts initially due to RLS policies
2. **Scanner**: Full-width layout should work correctly
3. **Caching**: Cache control headers should prevent stale data

## Rollback Plan

If issues occur:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connectivity
4. Rollback to previous deployment if needed

## Support

- Check Vercel deployment logs for errors
- Verify Supabase connection in production
- Test all functionality in production environment
