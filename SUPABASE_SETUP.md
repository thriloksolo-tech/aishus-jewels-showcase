# Supabase Admin Setup Guide

Follow these steps to set up admin authentication in Supabase:

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project name**: aishus-jewels-admin
   - **Database password**: Create a strong password (save it!)
   - **Region**: Select closest to you
5. Click "Create new project" and wait for setup (~2 minutes)

## Step 2: Get Your API Keys

1. Once project is created, go to **Settings → API**
2. Copy these values:
   - **Project URL** (use as `VITE_SUPABASE_URL`)
   - **Anon public key** (use as `VITE_SUPABASE_ANON_KEY`)
3. Save them in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Enable Email/Password Authentication

1. Go to **Authentication → Providers** in Supabase Dashboard
2. Click on **Email**
3. Enable:
   - ✅ **Enable Email Signup**
   - ✅ **Enable Email Confirmations** (optional for development)
4. Click **Save**

## Step 4: Create Admin User

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication → Users**
2. Click **Add user**
3. Fill in:
   - **Email**: `admin@aishus.com` (or your preferred email)
   - **Password**: Create a strong password (min 6 characters)
4. Toggle **Email confirmed** (to skip verification)
5. Click **Create user**

### Option B: Using SQL (Advanced)

1. Go to **SQL Editor → New Query**
2. Paste this script:

```sql
-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@aishus.com',
  crypt('YourSecurePassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  false
);

-- Create corresponding user profile
INSERT INTO public.user_profiles (
  id,
  email,
  name,
  role,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@aishus.com'),
  'admin@aishus.com',
  'Admin User',
  'admin',
  now()
);
```

3. Replace `YourSecurePassword123` with your desired password
4. Click **Run**

## Step 5: Create Profiles Table (Optional but Recommended)

This table stores additional admin information:

1. Go to **SQL Editor → New Query**
2. Paste:

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

3. Click **Run**

## Step 6: Test Admin Login

1. Start your development server: `npm run dev` or `bun dev`
2. Navigate to `http://localhost:5173/admin/login`
3. Enter credentials:
   - **Email**: admin@aishus.com
   - **Password**: (the password you set)
4. Click **Login**
5. You should be redirected to `/admin/dashboard`

## Step 7: Verify Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

If you added these after starting the dev server, restart it!

## Troubleshooting

### "Failed to login" Error
- ✅ Check email is correct (case-sensitive in Supabase)
- ✅ Verify password is correct
- ✅ Ensure Email Provider is enabled
- ✅ Check `.env` variables are set correctly

### Environment Variables Not Loading
- ✅ Restart dev server after adding `.env`
- ✅ Check `.env` is in root directory
- ✅ Ensure no spaces around `=` in `.env`

### "Invalid API Key"
- ✅ Go to Settings → API in Supabase
- ✅ Copy the correct Anon Key (not service role key!)
- ✅ Paste into `.env` as `VITE_SUPABASE_ANON_KEY`

### Session Persists Across Tabs
This is expected! Supabase stores auth in localStorage by default.

## Security Notes

- ⚠️ **Never commit `.env`** to git (it's in `.gitignore`)
- ⚠️ Never share your database password
- ⚠️ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ⚠️ Anon key can be public (it's in frontend code anyway)
- 🔐 Service Role key must be kept secret (never in frontend)

## Next Steps

Once admin login works:
1. Create product management pages
2. Add database tables for products, orders, etc.
3. Implement role-based access control (RBAC)
4. Add audit logging for admin actions
5. Set up email notifications

---

**Need help?** Check [Supabase Docs](https://supabase.com/docs)
