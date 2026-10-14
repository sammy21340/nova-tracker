// The currencies the app can display. CoinGecko prices every coin in each of
// these, so switching between them needs no extra request.
export const CURRENCIES = ["usd", "ngn"];

const LOCALES = { usd: "en-US", ngn: "en-NG" };

// formatMoney(1234.5, "usd")                   -> "$1,234.50"
// formatMoney(1234.5, "ngn")                   -> "₦1,234.50"
// formatMoney(-50, "usd", { signed: true })    -> "-$50.00"  (and "+$50.00" for gains)
export function formatMoney(amount, currency = "usd", { signed = false } = {}) {
  return new Intl.NumberFormat(LOCALES[currency] ?? "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(amount);
}