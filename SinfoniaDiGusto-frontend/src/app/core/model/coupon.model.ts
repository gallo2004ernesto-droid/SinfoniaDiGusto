export type DiscountType = 'PERCENT' | 'FIXED';

export type CouponStatus =
  | 'ACTIVE'
  | 'DISABLED'
  | 'EXPIRED'
  | 'SCHEDULED'
  | 'EXHAUSTED';

export interface Coupon {
  id?: number;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  validFrom?: string | null;   // formato yyyy-MM-dd
  validUntil?: string | null;  // formato yyyy-MM-dd
  usageLimit?: number | null;
  usedCount?: number;
  active: boolean;
  status?: CouponStatus;
}

export interface CouponValidation {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  subtotal: number;
  discountAmount: number;
  totalAfterDiscount: number;
}