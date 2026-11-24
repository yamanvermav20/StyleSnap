import { strings } from '#/generated/strings'

/** Whole dollars have no decimals ("189"); anything else has two ("42.50"). */
export function formatPriceAmount(amount: number) {
  const cents = Math.round(amount * 100)
  if (cents % 100 === 0) return String(cents / 100)
  return (cents / 100).toFixed(2)
}

export function formatPrice(amount: number) {
  return strings.commonPrice({ price: formatPriceAmount(amount) })
}
