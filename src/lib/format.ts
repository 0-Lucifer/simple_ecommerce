import { siteConfig } from "@/lib/site"

/** Format a number as a localized currency string. */
export function formatPrice(
  amount: number,
  currency: string = siteConfig.currency,
  locale: string = siteConfig.locale
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

/** Build a WhatsApp click-to-chat URL with a prefilled message. */
export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
