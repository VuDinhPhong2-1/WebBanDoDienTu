import { Products } from '../entities/Products';
import { SalePrices } from '../entities/SalePrices';
import { Discounts } from '../entities/Discounts';

interface PriceCalculationResult {
  originalPrice: number;
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

  // Áp dụng chiết khấu nếu có
  let discountedPrice = originalPrice;
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
        originalPrice - originalPrice * (discount.discountPercent / 100);
    }
  }

  return { originalPrice, discountedPrice };
}
