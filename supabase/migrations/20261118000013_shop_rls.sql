-- Enable RLS on shop tables (the original shop migrations never did).
-- Storefront catalog is public-read (active rows only); everything else is admin-only.
-- Checkout and order writes use the service role, which bypasses RLS.

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.product_categories
  FOR SELECT USING (is_active);
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active);
CREATE POLICY "Anyone can view active variants" ON public.product_variants
  FOR SELECT USING (is_active);
CREATE POLICY "Anyone can view product attributes" ON public.product_attributes
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view product attribute values" ON public.product_attribute_values
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.product_categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage variants" ON public.product_variants
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage product attributes" ON public.product_attributes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage product attribute values" ON public.product_attribute_values
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage inventory transactions" ON public.inventory_transactions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage shop orders" ON public.shop_orders
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage shop order items" ON public.shop_order_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
