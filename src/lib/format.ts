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

/**
 * wa.me needs an international number: country code, no "+", no leading zero.
 * Accepts "+880 1948-851986", "8801948851986" or local "01948851986".
 */
export function normalizeWhatsAppNumber(
  input: string,
  countryCode: string = siteConfig.whatsappCountryCode
) {
  let digits = input.replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  if (digits.startsWith("0")) digits = countryCode + digits.slice(1)
  return digits
}

/** Build a WhatsApp click-to-chat URL with a prefilled message. */
export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`
}
