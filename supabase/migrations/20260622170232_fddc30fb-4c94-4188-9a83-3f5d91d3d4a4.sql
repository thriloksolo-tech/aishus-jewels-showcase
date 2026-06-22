
-- 1. Create private schema for security-sensitive functions (not exposed via Data API)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

-- 2. Recreate has_role in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- 3. Update policies that reference public.has_role to use private.has_role
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Storage policies
DROP POLICY IF EXISTS "Admins upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;

CREATE POLICY "Admins upload product-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update product-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete product-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins read product-images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Drop the original public.has_role now that nothing references it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 5. Restrict product viewing: only admins can see inactive products
DROP POLICY IF EXISTS "Authenticated can view all products" ON public.products;

CREATE POLICY "Admins view all products" ON public.products
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
