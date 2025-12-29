/**
 * Format a number to a compact string (e.g., 10000 -> "10k", 1500000 -> "1.5M")
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}

/**
 * Format a currency value to a compact string (e.g., 500000 -> "S$500k", 1500000 -> "S$1.5M")
 */
export function formatCurrency(num: number): string {
  if (num >= 1000000) {
    return 'S$' + (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return 'S$' + (num / 1000).toFixed(0) + 'k'
  }
  return 'S$' + num.toLocaleString()
}

/**
 * Format a currency value with full precision for tooltips
 */
export function formatCurrencyFull(num: number): string {
  return 'S$' + num.toLocaleString()
}

