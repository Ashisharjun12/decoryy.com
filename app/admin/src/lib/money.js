export function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100)
}

export function paiseToRupees(paise) {
  return Number(paise) / 100
}

export function formatPaise(paise) {
  return paiseToRupees(paise).toFixed(2)
}
