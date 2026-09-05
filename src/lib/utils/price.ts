/**
 * Format paise (integer) to Indian Rupee string
 * e.g., 100000 → "₹1,000"
 */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Convert rupees to paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculate discount percentage
 */
export function discountPercent(regularPrice: number, salePrice: number): number {
  if (regularPrice <= 0 || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

/**
 * Calculate shipping fee
 */
export function calculateShipping(
  subtotal: number,
  threshold: number,
  fee: number,
  enabled: boolean
): number {
  if (!enabled) return fee;
  return subtotal >= threshold ? 0 : fee;
}
