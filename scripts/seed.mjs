// One-off seed: uploads product images to Supabase Storage and inserts
// candle-making categories + products.
//
// Run:  node --env-file=.env.local scripts/seed.mjs
//
// Safe to re-run — upserts by slug and overwrites images at the same path.

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "product-images";
const SRC_DIR = "product_sample";

const categories = [
  { name: "Waxes", slug: "waxes", description: "Paraffin, beeswax and additives", sort_order: 1 },
  { name: "Wicks", slug: "wicks", description: "Pre-waxed and natural cotton wicks", sort_order: 2 },
  { name: "Fragrance Oils", slug: "fragrance-oils", description: "Scents for candles and soaps", sort_order: 3 },
  { name: "Containers & Jars", slug: "containers", description: "Jars, tins and vessels", sort_order: 4 },
];

const products = [
  {
    slug: "paraffin-wax",
    name: "Fully Refined Paraffin Wax",
    category: "waxes",
    price: 380,
    compare_at_price: 450,
    stock: 120,
    is_featured: true,
    file: "WhatsApp Image 2026-07-23 at 14.44.02.jpeg",
    description:
      "Premium fully-refined paraffin wax with excellent scent throw and a smooth, glossy finish. Ideal for container and pillar candles. Sold per kg.",
  },
  {
    slug: "beeswax-blocks",
    name: "Natural Beeswax Blocks",
    category: "waxes",
    price: 1250,
    stock: 60,
    is_featured: true,
    file: "WhatsApp Image 2026-07-23 at 14.44.02 (1).jpeg",
    description:
      "100% pure natural beeswax with a subtle honey aroma. Perfect for beeswax candles, balms and cosmetics. Sold per kg.",
  },
  {
    slug: "beeswax-bars",
    name: "Golden Beeswax Bars",
    category: "waxes",
    price: 950,
    compare_at_price: 1100,
    stock: 45,
    file: "WhatsApp Image 2026-07-23 at 14.44.03 (3).jpeg",
    description:
      "Filtered golden beeswax pressed into easy-to-melt bars. Clean, natural burn with a warm glow. Sold per kg.",
  },
  {
    slug: "stearic-acid",
    name: "Stearic Acid — Candle Hardener",
    category: "waxes",
    price: 420,
    stock: 80,
    file: "WhatsApp Image 2026-07-23 at 14.44.03 (4).jpeg",
    description:
      "Vegetable stearic acid to harden candles, raise the melt point and improve opacity. Add 1–3 tbsp per pound of wax.",
  },
  {
    slug: "prewaxed-wicks",
    name: "Pre-Waxed Candle Wicks — Pack of 100",
    category: "wicks",
    price: 260,
    compare_at_price: 320,
    stock: 200,
    is_featured: true,
    file: "WhatsApp Image 2026-07-23 at 14.44.03.jpeg",
    description:
      "Pre-waxed cotton wicks with metal sustainer tabs, ready to use. Low smoke and a steady flame. Approx. 15 cm, pack of 100.",
  },
  {
    slug: "cotton-wicks",
    name: "Natural Cotton Wicks with Tabs — Pack of 100",
    category: "wicks",
    price: 300,
    stock: 150,
    file: "WhatsApp Image 2026-07-23 at 14.44.03 (2).jpeg",
    description:
      "Eco-friendly braided cotton wicks with pre-tabbed bases for a clean, consistent burn in container candles. Pack of 100.",
  },
  {
    slug: "glass-jar-bamboo-lid",
    name: "Glass Candle Jar with Bamboo Lid",
    category: "containers",
    price: 180,
    compare_at_price: 220,
    stock: 90,
    is_featured: true,
    file: "WhatsApp Image 2026-07-23 at 14.44.03 (1).jpeg",
    description:
      "Heat-resistant clear glass jar with an airtight bamboo lid — perfect for soy and container candles. Approx. 180 ml.",
  },
  {
    slug: "fragrance-oils",
    name: "Premium Fragrance Oils — 30ml",
    category: "fragrance-oils",
    price: 280,
    stock: 300,
    is_featured: true,
    file: "WhatsApp Image 2026-07-23 at 14.44.03 (5).jpeg",
    description:
      "Highly-concentrated fragrance oils formulated for candles and soaps. Dozens of scents — lavender, vanilla, rose, sandalwood and more. Sold per 30 ml.",
  },
];

async function uploadImage(file, slug) {
  const buffer = await readFile(path.join(SRC_DIR, file));
  const objectPath = `seed/${slug}.jpeg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`upload ${slug}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

async function main() {
  console.log("Seeding categories…");
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select("id, slug");
  if (catErr) throw catErr;
  const categoryId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  console.log("Uploading images + seeding products…");
  for (const p of products) {
    const imageUrl = await uploadImage(p.file, p.slug);
    const { error } = await supabase.from("products").upsert(
      {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compare_at_price: p.compare_at_price ?? null,
        images: [imageUrl],
        category_id: categoryId[p.category] ?? null,
        stock: p.stock,
        is_active: true,
        is_featured: !!p.is_featured,
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(`product ${p.slug}: ${error.message}`);
    console.log(`  ✓ ${p.name}`);
  }

  console.log("\nDone. Seeded", categories.length, "categories and", products.length, "products.");
}

main().catch((e) => {
  console.error("\nSeed failed:", e.message ?? e);
  process.exit(1);
});
