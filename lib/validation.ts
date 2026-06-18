import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const storeContactDetailsValidation = z.object({
  id: z.string().optional(), // Add this line if `id` is optional (for insert)
  streetAddress: z.string().min(3),
  town: z.string().min(3),
  province: z.string().min(3),
  storeTelNumber: z.string().min(10),
  storeEmail: z.email(), // Add this line if using email
});

export const productValidation = z.object({
  id: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  imageUrl: z.string().min(1, "Image is required"),
  description: z.string().nullable().default(null),
  productTarget: z.string().min(1, "Product target is required"),
  productType: z.string().nullable().default(null),
  color: z.array(z.string()).nullable().optional(), // was z.string()
  slideImages: z.array(z.string()).nullable().optional(), // NEW
  // ✅ Use z.preprocess instead of z.coerce to avoid unknown inference
  price: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(0.01, "Price must be greater than 0")
  ),
  discountPrice: z.preprocess(
    (v) => (v === '' || v == null ? null : Number(v)),
    z.number().nullable().default(null)
  ),
  stock: z.preprocess(
    (v) => (v === '' || v == null ? 0 : Number(v)),
    z.number().int().min(0).default(0)
  ),

  sku: z.string().min(1, "SKU is required"),
  category: z.string().nullable().default(null),
  tags: z.string().nullable().default(null),

  weight: z.preprocess(
    (v) => (v === '' || v == null ? null : Number(v)),
    z.number().nullable().default(null)
  ),
  dimensions: z.string().nullable().default(null),
  rating: z.preprocess(
    (v) => (v === '' || v == null ? null : Number(v)),
    z.number().min(0).max(5).nullable().default(null)
  ),
  reviewCount: z.preprocess(
    (v) => (v === '' || v == null ? 0 : Number(v)),
    z.number().int().min(0).default(0)
  ),

  isActive: z.boolean().default(true),
  relatedProducts: z.array(z.string()).nullable().default(null),
  variants: z.record(z.string(), z.array(z.string())).nullable().default(null),
  brand: z.string().nullable().default(null),
})

export const checkoutContactDetails = z.object({
  email: z.email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short"),
  firstname: z.string().min(2, "First name must be at least 2 characters"),
  lastname: z.string().min(2, "Last name must be at least 2 characters"),
});