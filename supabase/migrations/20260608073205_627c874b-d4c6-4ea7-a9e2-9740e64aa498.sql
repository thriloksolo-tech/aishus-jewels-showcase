
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly viewable" ON public.categories FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  instagram_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tag TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are publicly viewable" ON public.products FOR SELECT
  TO anon USING (active = true);
CREATE POLICY "Authenticated can view all products" ON public.products FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(active);

-- Seed categories + sample products
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Necklaces', 'necklaces', 1),
  ('Earrings', 'earrings', 2),
  ('Bangles', 'bangles', 3),
  ('Rings', 'rings', 4),
  ('Mangalsutra', 'mangalsutra', 5);

INSERT INTO public.products (name, description, price_inr, stock, tag, featured, sort_order, category_id)
SELECT 'Stardust Pendant', 'Delicate gold pendant with a single ruby.', 2499, 8, 'New', true, 1, id FROM public.categories WHERE slug='necklaces';
INSERT INTO public.products (name, description, price_inr, stock, tag, featured, sort_order, category_id)
SELECT 'Heritage Jhumkas', 'Traditional gold jhumkas with intricate detailing.', 3899, 5, 'Bestseller', true, 2, id FROM public.categories WHERE slug='earrings';
INSERT INTO public.products (name, description, price_inr, stock, featured, sort_order, category_id)
SELECT 'Whisper Bangles (Set of 4)', 'Delicate stack of engraved gold bangles.', 4299, 6, true, 3, id FROM public.categories WHERE slug='bangles';
INSERT INTO public.products (name, description, price_inr, stock, tag, featured, sort_order, category_id)
SELECT 'Solitaire Promise Ring', 'Dainty gold band with single sparkling stone.', 1899, 10, 'Dainty', true, 4, id FROM public.categories WHERE slug='rings';
INSERT INTO public.products (name, description, price_inr, stock, tag, featured, sort_order, category_id)
SELECT 'Classic Mangalsutra', 'Traditional design with black beads and gold pendant.', 5499, 4, 'Traditional', true, 5, id FROM public.categories WHERE slug='mangalsutra';
