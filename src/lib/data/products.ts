import "server-only";
import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseVariants } from "@/lib/product";
import type { ProductWithCategory } from "@/lib/types";

const CATEGORY_JOIN = "category:categories(id, name, slug)";
const CATEGORY_JOIN_INNER = "category:categories!inner(id, name, slug)";

/** Postgres `numeric` can arrive as a string; coerce money fields to numbers. */
function normalizeProduct(row: ProductWithCategory): ProductWithCategory {
  return {
    ...row,
    price: Number(row.price),
    compare_at_price:
      row.compare_at_price == null ? null : Number(row.compare_at_price),
    variants: parseVariants(row.variants),
  };
}

export type GetProductsOptions = {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
};

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<ProductWithCategory[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  const join = options.categorySlug ? CATEGORY_JOIN_INNER : CATEGORY_JOIN;

  let query = supabase
    .from("products")
    .select(`*, ${join}`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (options.categorySlug) query = query.eq("categories.slug", options.categorySlug);
  if (options.featured) query = query.eq("is_featured", true);
  if (options.search) query = query.ilike("name", `%${options.search}%`);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("getProducts:", error.message);
    return [];
  }
  return ((data ?? []) as unknown as ProductWithCategory[]).map(normalizeProduct);
}

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductWithCategory | null> => {
    if (!isSupabaseConfigured()) return null;

    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(`*, ${CATEGORY_JOIN}`)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("getProductBySlug:", error.message);
      return null;
    }
    return data ? normalizeProduct(data as unknown as ProductWithCategory) : null;
  },
);

export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit });
}
