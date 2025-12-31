-- Seed Test User for Supabase
-- Creates demo user and profile for development/testing

-- Insert test user
INSERT INTO public.users (id, email, name, password, created_at, updated_at)
VALUES (
  'demo-user-id',
  'demo@refleqt.ai',
  'Demo User',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert user profile
INSERT INTO public.user_profiles (id, user_id, company_name, industry, business_challenge, obsession_score, created_at, updated_at)
VALUES (
  'demo-profile-id',
  'demo-user-id',
  'Demo Company',
  'Technology',
  'Understanding competitive landscape and market trends',
  7.5,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the data
SELECT 'User created:' AS status, email, name FROM public.users WHERE id = 'demo-user-id';
SELECT 'Profile created:' AS status, company_name, industry, obsession_score FROM public.user_profiles WHERE user_id = 'demo-user-id';
