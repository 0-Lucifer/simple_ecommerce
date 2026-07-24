/**
 * Central store/branding config. Values come from env vars so the owner can
 * rebrand without touching code. `NEXT_PUBLIC_SITE_NAME` etc. are read at build
 * time on the client.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Candle Co.",
  description: "Premium raw materials for candle makers.",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "BDT",
  locale: process.env.NEXT_PUBLIC_LOCALE || "en-BD",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  /** Country dialling code, used to expand local numbers like 01948851986. */
  whatsappCountryCode: process.env.NEXT_PUBLIC_WHATSAPP_COUNTRY_CODE || "880",
  nav: [
    { title: "Shop", href: "/products" },
    { title: "Categories", href: "/categories" },
    { title: "About", href: "/about" },
  ],
}

export type SiteConfig = typeof siteConfig
