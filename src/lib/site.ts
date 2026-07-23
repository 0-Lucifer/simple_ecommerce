/**
 * Central store/branding config. Values come from env vars so the owner can
 * rebrand without touching code. `NEXT_PUBLIC_SITE_NAME` etc. are read at build
 * time on the client.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Aurelia",
  description: "Thoughtfully curated products, delivered with care.",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "BDT",
  locale: process.env.NEXT_PUBLIC_LOCALE || "en-BD",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  nav: [
    { title: "Shop", href: "/products" },
    { title: "Categories", href: "/categories" },
    { title: "About", href: "/about" },
  ],
}

export type SiteConfig = typeof siteConfig
