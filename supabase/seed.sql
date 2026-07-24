-- ============================================================================
--  Optional sample data so the storefront isn't empty during development.
--  Run AFTER schema.sql. Safe to re-run (upserts by slug).
--  Delete these rows later from the dashboard once real products are added.
-- ============================================================================

insert into public.categories (name, slug, description, sort_order) values
  ('Apparel',     'apparel',     'Clothing and wearables',        1),
  ('Accessories', 'accessories', 'Bags, jewelry and extras',      2),
  ('Home',        'home',        'Home and living essentials',    3)
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, compare_at_price, stock, is_active, is_featured, category_id)
values
  ('Classic Cotton Tee', 'classic-cotton-tee',
   'A soft, breathable everyday t-shirt made from 100% combed cotton.',
   19.99, 24.99, 50, true, true,
   (select id from public.categories where slug = 'apparel')),

  ('Minimal Leather Wallet', 'minimal-leather-wallet',
   'Slim full-grain leather wallet that ages beautifully with use.',
   39.00, null, 30, true, true,
   (select id from public.categories where slug = 'accessories')),

  ('Ceramic Coffee Mug', 'ceramic-coffee-mug',
   'Hand-glazed stoneware mug, 350ml. Microwave and dishwasher safe.',
   14.50, 18.00, 80, true, true,
   (select id from public.categories where slug = 'home')),

  ('Canvas Tote Bag', 'canvas-tote-bag',
   'Heavy-duty 12oz canvas tote with reinforced handles.',
   22.00, null, 40, true, true,
   (select id from public.categories where slug = 'accessories'))
on conflict (slug) do nothing;
