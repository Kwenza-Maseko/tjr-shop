import { string } from "zod";

interface User {
    id: string;
    fullname: string;
    email: string;
    password: string;
    role: "USERS" | null;
    phoneNumber: string;
    createdAt: Date | null;
    passwordResetToken: string;
    passwordResetExpires: Date | null;
}

interface AdminParams {
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

interface StoreDetailsParams {
  id?: string;
  streetAddress: string;
  town: string | null;
  province: string;
  storeTelNumber: string | null;
  storeEmail: string | null;
}

interface AuthCredentails {
    fullName: string;
    email: string;
    password: string;
}

interface BannerParams {
    mediaId: string;
}

interface MediaParams {
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
}
