-- ============================================================================
--  Weight options (per-weight pricing) + delivery charges
--  Run this once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================================

-- Products: optional weight/price options ------------------------------------
--  Shape: [{ "id": "uuid", "label": "500 g", "weight_kg": 0.5, "price": 450 }]
--  Empty array = product has no weight variations (single price, no weight).
alter table public.products
  add column if not exists variants jsonb not null default '[]'::jsonb;

-- Orders: delivery zone + charge ---------------------------------------------
alter table public.orders
  add column if not exists delivery_zone    text,
  add column if not exists delivery_charge  numeric(10,2) not null default 0,
  add column if not exists total_weight_kg  numeric(10,3) not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_delivery_zone_check'
  ) then
    alter table public.orders
      add constraint orders_delivery_zone_check check (
        delivery_zone is null
        or delivery_zone in ('inside_dhaka', 'outside_dhaka')
      );
  end if;
end$$;

-- Order items: which weight was bought ---------------------------------------
alter table public.order_items
  add column if not exists variant_label text,
  add column if not exists weight_kg     numeric(10,3) not null default 0;
