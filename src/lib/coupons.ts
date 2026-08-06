import { dbCoupon } from "../services/dbService";

export interface Coupon {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  description: string;
  minSpend?: number;
  assignedUserId?: string;
}

// Dynamic coupons retrieved from database only (no hardcoded coupons)
export const AVAILABLE_COUPONS: Coupon[] = [];

export function validateCoupon(
  code: string,
  rawPrice: number,
  availableCouponsList: Coupon[] = []
): {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  error?: string;
} {
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0, error: "Please enter a coupon code" };
  }

  const normalized = code.trim().toUpperCase();
  const found = availableCouponsList.find(c => c.code.toUpperCase() === normalized);

  if (!found) {
    return { valid: false, discountAmount: 0, error: `Invalid or expired coupon code "${code}"` };
  }

  if (found.minSpend && rawPrice < found.minSpend) {
    return {
      valid: false,
      coupon: found,
      discountAmount: 0,
      error: `Minimum service amount of ₹${found.minSpend} required for ${found.code}`
    };
  }

  let discount = 0;
  if (found.discountType === "percentage") {
    discount = Math.round((rawPrice * found.discountValue) / 100);
  } else {
    discount = found.discountValue;
  }

  // Cap discount to rawPrice so price doesn't go below 0
  const finalDiscount = Math.min(rawPrice, Math.max(0, discount));

  return {
    valid: true,
    coupon: found,
    discountAmount: finalDiscount
  };
}
