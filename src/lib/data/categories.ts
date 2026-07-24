import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories:", error.message);
    return [];
  }
  return (data ?? []) as Category[];
}

export type CategoryWithCover = Category & { cover: string | null };

/**
 * Categories plus a cover image: the category's own image_url if set, else the
 * first photo of a product in that category, else null (UI shows a gradient).
 */
export async function getCategoriesWithCovers(): Promise<CategoryWithCover[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createPublicClient();
  const [cats, prods] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("products")
      .select("category_id, images")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
  ]);

  const coverByCategory = new Map<string, string>();
  for (const p of (prods.data ?? []) as {
    category_id: string | null;
    images: string[] | null;
  }[]) {
    const img = p.images?.[0];
    if (p.category_id && img && !coverByCategory.has(p.category_id)) {
      coverByCategory.set(p.category_id, img);
    }
  }

  return ((cats.data ?? []) as Category[]).map((c) => ({
    ...c,
    cover: c.image_url ?? coverByCategory.get(c.id) ?? null,
  }));
}
