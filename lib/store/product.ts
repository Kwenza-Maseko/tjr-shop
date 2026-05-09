'use server'

import { db } from "@/database/drizzle";
import { productTable } from "@/database/schema";
import { ProductParams } from "@/types";
import { eq, or, and, isNotNull } from "drizzle-orm";

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
          (
            eq(productTable.productType, productType)
          ),
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

  return result.map((item) => ({
    id: item.id,
    productName: item.productName,
    imageUrl: item.imageUrl,
    description: item.description ?? null,
    productTarget: item.productTarget,
    productType: item.productType ?? null,
    color: item.color ?? null,
    price: Number(item.price),
    discountPrice:
      item.discountPrice !== null ? Number(item.discountPrice) : null,
    stock: item.stock ?? 0,
    sku: item.sku,
    category: item.category ?? null,
    tags: item.tags ?? null,
    weight: item.weight !== null ? Number(item.weight) : null,
    dimensions: item.dimensions ?? null,
    rating: item.rating !== null ? Number(item.rating) : 0,
    reviewCount: item.reviewCount ?? 0,
    isActive: item.isActive ?? true,
    relatedProducts: (item.relatedProducts as string[] | null) ?? [],
    variants: (item.variants as Record<string, any> | null) ?? {},
    brand: item.brand ?? null,
  }));
};


export const getLatestProducts = async (): Promise<ProductParams[] | null> => {
  const result = await db.select().from(productTable).limit(2);

  if (result.length === 0) return null;

  const mapped = result.map((item) => ({
    id: item.id,
    productName: item.productName,
    imageUrl: item.imageUrl,
    description: item.description ?? null,
    productTarget: item.productTarget,
    productType: item.productType ?? null,
    color: item.color ?? null,

    price: Number(item.price), // convert string -> number
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
    relatedProducts: (item.relatedProducts as string[] | null) ?? [],
    variants: (item.variants as Record<string, any> | null) ?? {},
    brand: item.brand ?? null
  }));

  return mapped;
};



export async function createOrUpdateProduct(payload: ProductParams) {
  try {
    const isUpdate = !!payload.id

    const values = {
      productName: payload.productName,
      imageUrl: payload.imageUrl,
      description: payload.description ?? null,
      productTarget: payload.productTarget,
      productType: payload.productType ?? null,
      color: payload.color ?? null,
      price: String(payload.price),              
      discountPrice: payload.discountPrice != null
        ? String(payload.discountPrice)
        : null,
      stock: payload.stock ?? 0,                  
      sku: payload.sku,
      category: payload.category ?? null,
      tags: payload.tags ?? null,
      weight: payload.weight != null
        ? String(payload.weight)
        : null,
      dimensions: payload.dimensions ?? null,
      rating: payload.rating != null
        ? String(payload.rating)
        : '0',
      reviewCount: payload.reviewCount ?? 0,
      isActive: payload.isActive ?? true,
      relatedProducts: payload.relatedProducts ?? null,    
      variants: payload.variants ?? null,           
      brand: payload.brand ?? null,
    }

    if (isUpdate) {
      const [updated] = await db
        .update(productTable)
        .set(values)
        .where(eq(productTable.id, payload.id!))
        .returning()

      return { success: true, data: updated, action: 'updated' }
    }

    const [created] = await db
      .insert(productTable)
      .values(values)
      .returning()

    return { success: true, data: created, action: 'created' }

  } catch (error: any) {
    console.error('createOrUpdateProduct error:', error)

    if (error?.message?.includes('unique') || error?.code === '23505') {
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

import { unstable_cache } from 'next/cache'


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

  console.log("📦 Raw rows:", rows)

  return rows.reduce<Record<string, string[]>>((acc, row) => {
    const target = row.productTarget!.toLowerCase().trim()  // "men"
    const category = row.category!.trim()                   // "Clothing"
    const type = row.productType!.trim()                    // "Hoodies and Sweatshirts"

    const key = `${target}__${category}`                    // "men__Clothing"
    if (!acc[key]) acc[key] = []
    if (!acc[key].includes(type)) acc[key].push(type)
    return acc
  }, {})
}
