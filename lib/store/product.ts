'use server'

import { db } from "@/database/drizzle";
import { productTable } from "@/database/schema";
import { ProductParams } from "@/types";
import { eq, or, and, isNotNull } from "drizzle-orm";

// ─── Shared normalizer ────────────────────────────────────────────────────────

function normalizeProduct(item: typeof productTable.$inferSelect): ProductParams {
  return {
    id: item.id,
    productName: item.productName,
    imageUrl: item.imageUrl,
    slideImages: Array.isArray(item.slideImages)
      ? (item.slideImages as string[])
      : null,
    description: item.description ?? null,
    productTarget: item.productTarget,
    productType: item.productType ?? null,
    color: Array.isArray(item.color)
      ? (item.color as string[])
      : null,
    price: Number(item.price),
    discountPrice: item.discountPrice !== null ? Number(item.discountPrice) : null,
    stock: item.stock ?? 0,
    sku: item.sku,
    category: item.category ?? null,
    tags: item.tags ?? null,
    weight: item.weight !== null ? Number(item.weight) : null,
    dimensions: item.dimensions ?? null,
    rating: item.rating !== null ? Number(item.rating) : 0,
    reviewCount: item.reviewCount ?? 0,
    isActive: item.isActive ?? true,
    relatedProducts: Array.isArray(item.relatedProducts)
      ? (item.relatedProducts as string[])
      : null,
    variants: (item.variants as Record<string, string[]> | null) ?? null,
    brand: item.brand ?? null,
  }
}

// ─── Shared values builder ────────────────────────────────────────────────────

function buildValues(payload: ProductParams) {
  return {
    productName: payload.productName,
    imageUrl: payload.imageUrl,
    slideImages: Array.isArray(payload.slideImages) && payload.slideImages.length > 0
      ? payload.slideImages
      : null,
    description: payload.description ?? null,
    productTarget: payload.productTarget,
    productType: payload.productType ?? null,
    // color is now string[] stored as jsonb
    color: Array.isArray(payload.color) && payload.color.length > 0
      ? payload.color
      : null,
    price: String(payload.price),
    discountPrice: payload.discountPrice != null ? String(payload.discountPrice) : null,
    stock: payload.stock ?? 0,
    sku: payload.sku,
    category: payload.category ?? null,
    tags: payload.tags ?? null,
    weight: payload.weight != null ? String(payload.weight) : null,
    dimensions: payload.dimensions ?? null,
    rating: payload.rating != null ? String(payload.rating) : '0',
    reviewCount: payload.reviewCount ?? 0,
    isActive: payload.isActive ?? true,
    relatedProducts: payload.relatedProducts ?? null,
    variants: payload.variants ?? null,
    brand: payload.brand ?? null,
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getStoreProducts = async (
  productType?: string,
  productTarget?: string
): Promise<ProductParams[] | null> => {
  let result;

  if (productType && productTarget) {
    result = await db
      .select()
      .from(productTable)
      .where(
        and(
          eq(productTable.productType, productType),
          or(
            eq(productTable.productTarget, productTarget),
            eq(productTable.productType, "unisex")
          )
        )
      );
  } else {
    result = await db.select().from(productTable);
  }

  if (!result || result.length === 0) return null;

  return result.map(normalizeProduct);
};

export const getLatestProducts = async (): Promise<ProductParams[] | null> => {
  const result = await db.select().from(productTable).limit(2);

  if (result.length === 0) return null;

  return result.map(normalizeProduct);
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createOrUpdateProduct(payload: ProductParams) {
  try {
    const isUpdate = !!payload.id
    const values = buildValues(payload)

    if (isUpdate) {
      const [updated] = await db
        .update(productTable)
        .set(values)
        .where(eq(productTable.id, payload.id!))
        .returning()

      return { success: true, data: normalizeProduct(updated), action: 'updated' }
    }

    const [created] = await db
      .insert(productTable)
      .values(values)
      .returning()

    return { success: true, data: normalizeProduct(created), action: 'created' }

  } catch (error: unknown) {
    console.error('createOrUpdateProduct error:', error)

    const dbError = error as { message?: string; code?: string }

    if (dbError?.message?.includes('unique') || dbError?.code === '23505') {
      return { success: false, message: 'A product with this SKU already exists' }
    }

    return { success: false, message: 'Failed to save product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.delete(productTable).where(eq(productTable.id, id))
    return { success: true }
  } catch (error) {
    console.error('deleteProduct error:', error)
    return { success: false, message: 'Failed to delete product' }
  }
}

export async function getProducts() {
  try {
    const data = await db
      .select()
      .from(productTable)
      .orderBy(productTable.createdAt)
    return data
  } catch (error) {
    console.error('getProducts error:', error)
    return []
  }
}

// ─── Nav helper ───────────────────────────────────────────────────────────────

export const getNavProductTypes = async (): Promise<Record<string, string[]>> => {
  const rows = await db
    .select({
      productTarget: productTable.productTarget,
      category: productTable.category,
      productType: productTable.productType,
    })
    .from(productTable)
    .where(
      and(
        eq(productTable.isActive, true),
        isNotNull(productTable.productTarget),
        isNotNull(productTable.category),
        isNotNull(productTable.productType),
      )
    )
    .groupBy(
      productTable.productTarget,
      productTable.category,
      productTable.productType
    )

  return rows.reduce<Record<string, string[]>>((acc, row) => {
    const target = row.productTarget!.toLowerCase().trim()
    const category = row.category!.trim()
    const type = row.productType!.trim()

    const key = `${target}__${category}`
    if (!acc[key]) acc[key] = []
    if (!acc[key].includes(type)) acc[key].push(type)
    return acc
  }, {})
}