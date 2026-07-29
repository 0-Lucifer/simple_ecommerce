"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@/lib/types"
import {
  DEFAULT_DELIVERY_ZONE,
  isDeliveryZone,
  type DeliveryZone,
} from "@/lib/delivery"

/** What `addItem` is given — the line key and quantity are derived. */
export type CartItemInput = Omit<CartItem, "key" | "quantity">

type CartState = {
  items: CartItem[]
  /** Where the customer wants it delivered — drives the delivery charge. */
  deliveryZone: DeliveryZone
  addItem: (item: CartItemInput, quantity?: number) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  setDeliveryZone: (zone: DeliveryZone) => void
  clear: () => void
}

/** Product + chosen weight identify a cart line. */
export function cartLineKey(productId: string, variantId?: string | null) {
  return variantId ? `${productId}:${variantId}` : productId
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryZone: DEFAULT_DELIVERY_ZONE,
      addItem: (item, quantity = 1) => {
        const key = cartLineKey(item.productId, item.variantId)
        const items = get().items
        const existing = items.find((i) => i.key === key)
        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          })
        } else {
          set({ items: [...items, { ...item, key, quantity }] })
        }
      },
      removeItem: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),
      updateQuantity: (key, quantity) =>
        set({
          items:
            quantity <= 0
              ? get().items.filter((i) => i.key !== key)
              : get().items.map((i) =>
                  i.key === key ? { ...i, quantity } : i,
                ),
        }),
      setDeliveryZone: (zone) => set({ deliveryZone: zone }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "cart",
      version: 2,
      /**
       * v1 carts had no weight options and no line key. Carry those lines over
       * as weightless items rather than throwing away someone's cart.
       */
      migrate: (persisted, version) => {
        const state = persisted as Partial<CartState> | undefined
        if (version >= 2) return state as CartState

        type LegacyItem = Omit<CartItem, "key" | "variantId" | "variantLabel" | "weightKg">
        const legacy = (state?.items ?? []) as unknown as LegacyItem[]
        return {
          ...(state as CartState),
          deliveryZone: DEFAULT_DELIVERY_ZONE,
          items: legacy.map((i) => ({
            ...i,
            key: cartLineKey(i.productId),
            variantId: null,
            variantLabel: null,
            weightKg: 0,
          })),
        } as CartState
      },
      // A zone written by an older/newer build shouldn't break pricing.
      onRehydrateStorage: () => (state) => {
        if (state && !isDeliveryZone(state.deliveryZone)) {
          state.deliveryZone = DEFAULT_DELIVERY_ZONE
        }
      },
    },
  ),
)

/** Total number of units in the cart. */
export const selectCartCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0)

/** Sum of price * quantity across the cart. */
export const selectCartTotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

/** Total shipping weight in kg — weightless products contribute nothing. */
export const selectCartWeight = (s: CartState) =>
  s.items.reduce((kg, i) => kg + i.weightKg * i.quantity, 0)
