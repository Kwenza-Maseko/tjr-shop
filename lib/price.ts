export function resolveEffectivePrice(
  price: number,
  discountPrice: number | null | undefined,
  dealPercentage: number | null | undefined
): { effectivePrice: number; originalPrice: number; badge: 'deal' | 'sale' | null } {
  const base = discountPrice && discountPrice < price ? discountPrice : price
  const original = price

  if (dealPercentage && dealPercentage > 0) {
    const dealPrice = Math.round(base * (1 - dealPercentage / 100) * 100) / 100
    return { effectivePrice: dealPrice, originalPrice: original, badge: 'deal' }
  }

  if (discountPrice && discountPrice < price) {
    return { effectivePrice: discountPrice, originalPrice: original, badge: 'sale' }
  }

  return { effectivePrice: price, originalPrice: price, badge: null }
}