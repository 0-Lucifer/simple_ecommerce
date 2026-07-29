/**
 * Delivery charges.
 *
 * The customer picks a zone; the charge is driven by the total weight of the
 * cart. Prices are billed per started kilogram (2.1 kg is charged as 3 kg).
 *
 *   Inside Dhaka   1 kg ৳70   ·  2 kg ৳90   ·  +৳20 per extra kg
 *   Outside Dhaka  1 kg ৳130  ·  2 kg ৳150  ·  +৳20 per extra kg
 *
 * Products with no weight options carry no weight, so a cart made up only of
 * those falls back to the flat minimum (৳70 inside / ৳110 outside).
 *
 * This module is shared by the storefront (to show the charge) and the order
 * Server Action (which recomputes it — client numbers are never trusted).
 */

export const DELIVERY_ZONES = ["inside_dhaka", "outside_dhaka"] as const

export type DeliveryZone = (typeof DELIVERY_ZONES)[number]

export const DEFAULT_DELIVERY_ZONE: DeliveryZone = "inside_dhaka"

export const DELIVERY_ZONE_LABELS: Record<DeliveryZone, string> = {
  inside_dhaka: "Inside Dhaka",
  outside_dhaka: "Outside Dhaka",
}

type Rate = {
  /** Charge for the first kilogram. */
  firstKg: number
  /** Charge at exactly two kilograms. */
  secondKg: number
  /** Added for every kilogram beyond the second. */
  extraPerKg: number
  /** Flat charge when nothing in the cart has a weight. */
  noWeight: number
}

export const DELIVERY_RATES: Record<DeliveryZone, Rate> = {
  inside_dhaka: { firstKg: 70, secondKg: 90, extraPerKg: 20, noWeight: 70 },
  outside_dhaka: { firstKg: 130, secondKg: 150, extraPerKg: 20, noWeight: 110 },
}

export function isDeliveryZone(value: unknown): value is DeliveryZone {
  return DELIVERY_ZONES.includes(value as DeliveryZone)
}

/** Kilograms actually billed: rounded up, minimum 1 kg. */
export function billableKg(totalWeightKg: number) {
  // Nudge by an epsilon so float sums like 0.5 + 0.5 = 1.0000000000000002
  // aren't billed as 2 kg.
  return Math.max(1, Math.ceil(totalWeightKg - 1e-6))
}

/** Delivery charge in BDT for a cart weight (kg) and a zone. */
export function calculateDeliveryCharge(
  totalWeightKg: number,
  zone: DeliveryZone,
): number {
  const rate = DELIVERY_RATES[zone] ?? DELIVERY_RATES[DEFAULT_DELIVERY_ZONE]
  if (!Number.isFinite(totalWeightKg) || totalWeightKg <= 0) {
    return rate.noWeight
  }
  const kg = billableKg(totalWeightKg)
  return kg <= 1 ? rate.firstKg : rate.secondKg + (kg - 2) * rate.extraPerKg
}

/** One-line explanation of how the shown charge was reached. */
export function describeDeliveryCharge(
  totalWeightKg: number,
  zone: DeliveryZone,
) {
  const label = DELIVERY_ZONE_LABELS[zone]
  if (!Number.isFinite(totalWeightKg) || totalWeightKg <= 0) {
    return `${label} · flat rate (no weight listed)`
  }
  return `${label} · ${billableKg(totalWeightKg)} kg`
}
