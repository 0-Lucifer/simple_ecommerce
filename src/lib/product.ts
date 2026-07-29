import type { Product, ProductVariant } from "@/lib/types"

/** A product-ish shape — anything carrying price + weight options. */
type WithVariants = Pick<Product, "price" | "variants">

/**
 * Coerces the `variants` jsonb column into clean `ProductVariant[]`. Postgres
 * `numeric` values can arrive as strings, and older rows have no column at all,
 * so everything is validated and bad entries are dropped.
 */
export function parseVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return []
  const out: ProductVariant[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue
    const v = entry as Record<string, unknown>
    const weight = Number(v.weight_kg)
    const price = Number(v.price)
    const id = typeof v.id === "string" ? v.id : ""
    if (!id || !Number.isFinite(weight) || weight < 0) continue
    if (!Number.isFinite(price) || price < 0) continue
    out.push({
      id,
      label:
        typeof v.label === "string" && v.label.trim()
          ? v.label.trim()
          : formatWeight(weight),
      weight_kg: weight,
      price,
    })
  }
  return out
}

/** "500 g", "1 kg", "1.5 kg" — the label shown next to each price. */
export function formatWeight(kg: number): string {
  if (!Number.isFinite(kg) || kg <= 0) return ""
  if (kg < 1) return `${Math.round(kg * 1000)} g`
  return `${Number(kg.toFixed(3))} kg`
}

export function hasWeightOptions(product: WithVariants): boolean {
  return product.variants.length > 0
}

export function findVariant(
  product: WithVariants,
  variantId: string | null | undefined,
): ProductVariant | null {
  if (!variantId) return null
  return product.variants.find((v) => v.id === variantId) ?? null
}

/**
 * Price span across the weight options — used to show "From ৳450" on cards.
 * Falls back to the product's own price when there are no options.
 */
export function priceRange(product: WithVariants): { min: number; max: number } {
  if (product.variants.length === 0) {
    return { min: product.price, max: product.price }
  }
  const prices = product.variants.map((v) => v.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/** The price to headline: lowest weight option, or the plain product price. */
export function displayPrice(product: WithVariants): number {
  return priceRange(product).min
}
