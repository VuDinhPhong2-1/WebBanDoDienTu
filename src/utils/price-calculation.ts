// utils/price-calculation.ts

import { Products } from '../entities/Products';
import { SalePrices } from '../entities/SalePrices';
import { Discounts } from '../entities/Discounts';

interface PriceCalculationResult {
  originalPrice: number;
  currentPrice: number;
  discountedPrice: number;
}

export function calculatePrices(
  product: Products,
  salePrices: SalePrices[],
  discountMap: Map<number, Discounts>,
  now: Date,
): PriceCalculationResult {
  // Lấy giá gốc
  const originalSalePrice = salePrices.reduce(
    (prev, current) => (prev.applyDate < current.applyDate ? prev : current),
    salePrices[0] || { price: 0, applyDate: new Date(0) },
  );
  const originalPrice = originalSalePrice.price;

  // Lấy giá hiện tại
  const currentSalePrice = salePrices
    .filter((sp) => sp.startDate <= now && sp.endDate >= now)
    .sort((a, b) => b.applyDate.getTime() - a.applyDate.getTime())[0];
  const currentPrice = currentSalePrice
    ? currentSalePrice.price
    : originalPrice;

  // Áp dụng chiết khấu nếu có
  let discountedPrice = currentPrice;
  if (product.discountId) {
    const discount = discountMap.get(product.discountId);

    if (
      discount &&
      discount.isActive &&
      discount.startDate <= now &&
      discount.endDate >= now &&
      discount.discountPercent > 0
    ) {
      discountedPrice =
        currentPrice - currentPrice * (discount.discountPercent / 100);
    }
  }

  return { originalPrice, currentPrice, discountedPrice };
}
