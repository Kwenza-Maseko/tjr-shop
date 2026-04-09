import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const storeContactDetailsValidation = z.object({
  id: z.string().optional(), // Add this line if `id` is optional (for insert)
  streetAddress: z.string().min(3),
  town: z.string().min(3),
  province: z.string().min(3),
  storeTelNumber: z.string().min(10),
  storeEmail: z.string().email(), // Add this line if using email
});

export const productValidation = z.object({
  id: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  imageUrl: z.string().min(1, "Invalid image URL"),
  description: z.string().nullable(),
  productTarget: z.string().min(1, "Product target is required"),
  productType: z.string().nullable(),
  color: z.string().nullable(),
  // Accept string, then convert to number
  price: z.coerce.number().min(1, "Price is required"),
  discountPrice: z.coerce.number().nullable(),

  stock: z.coerce.number().nullable(),

  sku: z.string().min(1, "SKU is required"),
  category: z.string().nullable(),
  tags: z.string().nullable(),

  weight: z.coerce.number().nullable(),
  dimensions: z.string().nullable(),
  rating: z.coerce.number().nullable(),
  reviewCount: z.coerce.number().nullable(),

  isActive: z.boolean().nullable(),
  relatedProducts: z.array(z.string()).nullable(),
  variants: z.union([
    z.array(z.string().nullable()),
    z.record(z.any())
  ]).optional().nullable(),

  brand: z.string().nullable(),
});

export const checkoutContactDetails = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short"),
  firstname: z.string().min(2, "First name must be at least 2 characters"),
  lastname: z.string().min(2, "Last name must be at least 2 characters"),
});