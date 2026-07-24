-- ============================================================================
--  Ecommerce schema — run this in the Supabase SQL Editor (once).
--  Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";  -- for gen_random_uuid()

-- Enums ----------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum
      ('pending', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled');
  end if;
end$$;

-- ============================================================================
--  Tables
-- ============================================================================

-- Profiles (extends auth.users; holds role for admin access) ------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now()
);

-- Categories ------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Products --------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  description       text,
  price             numeric(10,2) not null check (price >= 0),
  compare_at_price  numeric(10,2) check (compare_at_price >= 0),
  images            text[] not null default '{}',
  category_id       uuid references public.categories(id) on delete set null,
  stock             int not null default 0 check (stock >= 0),
  is_active         boolean not null default true,
  is_featured       boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx   on public.products(is_active);
create index if not exists products_featured_idx on public.products(is_featured);

-- Orders ----------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique,
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  customer_phone    text not null,
  customer_email    text,
  shipping_address  text not null,
  note              text,
  status            public.order_status not null default 'pending',
  subtotal          numeric(10,2) not null default 0,
  total             numeric(10,2) not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_created_idx  on public.orders(created_at desc);
create index if not exists orders_user_idx     on public.orders(user_id);

-- Order items -----------------------------------------------------------------
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  unit_price    numeric(10,2) not null,
  quantity      int not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- ============================================================================
--  Functions & triggers
-- ============================================================================

-- Auto-update updated_at on products -----------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Human-friendly order numbers: ORD-YYYYMMDD-0001 -----------------------------
create sequence if not exists public.order_number_seq;

create or replace function public.set_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('public.order_number_seq')::text, 4, '0');
  end if;
  return new;
end$$;

drop trigger if exists orders_set_number on public.orders;
create trigger orders_set_number
  before insert on public.orders
  for each row execute function public.set_order_number();

-- Create a profile row automatically for every new auth user ------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check (SECURITY DEFINER avoids RLS recursion on profiles) -------------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
--  Row Level Security
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;

-- Profiles: read/update your own; admins can do everything -------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Categories: public read; admin write ---------------------------------------
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select using (true);

drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Products: public sees active; admin sees/writes all ------------------------
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (is_active or public.is_admin());

drop policy if exists products_write on public.products;
create policy products_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders: customers read their own; admins manage all.
-- (Order creation happens through a trusted Server Action using the service
--  role key, which bypasses RLS and validates prices server-side.) -----------
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists orders_write on public.orders;
create policy orders_write on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- Order items: visible with their parent order; admin writes ------------------
drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists order_items_write on public.order_items;
create policy order_items_write on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
--  Storage: public bucket for product images (writes via service role only)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
