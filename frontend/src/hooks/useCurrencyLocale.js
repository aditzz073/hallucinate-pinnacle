import { useMemo } from "react";

// Static exchange rates (USD base)
const RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
};

const SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

// Map locale prefixes to currency
function localeToCurrency(locale) {
  if (!locale) return "USD";
  const lower = locale.toLowerCase();
  if (lower.startsWith("en-gb")) return "GBP";
  if (lower.startsWith("en-in") || lower.startsWith("hi")) return "INR";
  if (
    lower.startsWith("de") ||
    lower.startsWith("fr") ||
    lower.startsWith("es") ||
    lower.startsWith("it") ||
    lower.startsWith("nl") ||
    lower.startsWith("pt")
  )
    return "EUR";
  return "USD";
}

export function useCurrencyLocale() {
  const locale =
    typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";

  const currency = useMemo(() => localeToCurrency(locale), [locale]);
  const symbol = SYMBOLS[currency] || "$";
  const rate = RATES[currency] || 1;

  const convert = (usdAmount) => {
    return Math.round(usdAmount * rate * 100) / 100;
  };

  const formatPrice = (usdAmount, opts = {}) => {
    const converted = convert(usdAmount);
    const { decimals = currency === "INR" ? 0 : 2 } = opts;
    return `${symbol}${converted.toFixed(decimals)}`;
  };

  return { currency, symbol, rate, convert, formatPrice, locale };
}
