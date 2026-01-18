import { string } from "zod";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: "USERS" | "ADMIN" | null; // ✅ matches DB enum
  phoneNumber: string | null;
  createdAt: Date | null;         // ✅ timestamp with timezone
  lastLogin: Date | null;         // ✅ stores date only (still valid as Date in TS)
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
}

export interface AdminParams {
  id: string;
  fullName: string;
  email: string;
  password: string;
  adminRole: "SUPER ADMIN" | "ADMIN" | null;
  accessGranted: "GRANTED" | "NOT GRANTED" | null;
  createdAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
}

export interface StoreDetailsParams {
  id?: string;
  streetAddress: string;
  town: string | null;
  province: string;
  storeTelNumber: string | null;
  storeEmail: string | null;
}

export interface AuthCredentails {
  fullName: string;
  email: string;
  password: string;
}

export interface BannerParams {
  mediaId: string;
}

export interface MediaParams {
  id: string;
  imageUrl: string;
  createdAt: Date | null;
}
export interface ProductParams {
  id?: string;
  productName: string;
  imageUrl: string;
  description: string | null;
  productTarget: string;
  productType: string | null;
  color: string | null;
  price: number;
  discountPrice: number | null;
  stock: number; // default 0 at runtime
  sku: string;

  category: string | null;
  tags: string | null;

  weight: number | null;
  dimensions: string | null;

  rating: number; // default 0 at runtime
  reviewCount: number; // default 0 at runtime

  isActive: boolean; // default true at runtime
  relatedProducts: (string | undefined)[] | null; // JSONB array
  variants: Record<string, any> | null; // JSONB object

  brand: string | null;
}

export interface Deals {
  id: string;
  dealCoupon: string;
  percentage: number;
  createdAt: Date | null;
}

export interface DealTimeSpan {
  id: string;
  dealId: string;
  timeSpan: Date | null;
}

export interface DealProducts {
  id: string;
  dealId: string;
  productId: string;
  createdAt: Date | null;
}

export interface CartItem {
  id?: string;
  userId: string;
  productId: string;
  imageUrl: string;
  quantity: number;

  priceSnapshot: string;              // ✅ STRING
  discountSnapshot?: string | null;   // ✅ STRING

  selectedOptions?: any | null;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

