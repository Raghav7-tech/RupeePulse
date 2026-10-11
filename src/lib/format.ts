export const inr = (value: number, sign = false) => {
  const prefix = sign && value > 0 ? '+' : value < 0 ? '−' : ''
  return `${prefix}₹${Math.abs(Math.round(value)).toLocaleString('en-IN')}`
}

export const pct = (value: number) => `${Math.round(value)}%`
