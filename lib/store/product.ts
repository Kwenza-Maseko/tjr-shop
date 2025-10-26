'use server'

import { db } from "@/database/drizzle";
import { productTable } from "@/database/schema";
import { ProductParams } from "@/types";
import { eq, or, and } from "drizzle-orm";

export const createOrUpdateProduct = async (params: ProductParams) => {
  try {
    const existingProduct = params.id
      ? await db
        .select()
        .from(productTable)
        .where(eq(productTable.id, params.id))
        .limit(1)
      : [];

    let product;

    // Normalize numeric fields to strings for Drizzle
    const normalizedPayload = {
      productName: params.productName,
      imageUrl: params.imageUrl,
      description: params.description,
      productTarget: params.productTarget,
      productType: params.productType ?? null,
      color: params.color ?? null,
      price: params.price.toString(),
      discountPrice: params.discountPrice?.toString() ?? null,
      stock: params.stock ?? 0,
      sku: params.sku,
      category: params.category,
      tags: params.tags,
      weight: params.weight?.toString() ?? null,
      dimensions: params.dimensions,
      rating: params.rating.toString(),
      reviewCount: params.reviewCount ?? 0,
      isActive: params.isActive ?? true,
      relatedProducts: params.relatedProducts ?? [],
      variants: params.variants ?? {},
      brand: params.brand ?? null
    };

    if (existingProduct.length > 0) {
      // Update
      [product] = await db
        .update(productTable)
        .set(normalizedPayload)
        .where(eq(productTable.id, existingProduct[0].id))
        .returning();
    } else {
      // Insert
      [product] = await db
        .insert(productTable)
        .values(normalizedPayload)
        .returning();
    }

    return {
      success: true,
      data: product,
      action: existingProduct.length > 0 ? "updated" : "inserted",
    };
  } catch (error) {
    console.error("Create/Update Product Error:", error);
    return {
      success: false,
      message: "An error occurred while creating or updating product",
    };
  }
};


export const getProducts = async (): Promise<ProductParams[] | null> => {
  const result = await db.select().from(productTable);

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

export const deleteProduct = async (id: string) => {
  try {
    const deleted = await db
      .delete(productTable)
      .where(eq(productTable.id, id))
      .returning();

    if (!deleted || deleted.length === 0) {
      return {
        success: false,
        message: "Product not found or already deleted",
      };
    }

    return {
      success: true,
      data: deleted[0], // return the deleted product for confirmation
    };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return {
      success: false,
      message: "An error occurred while deleting product",
    };
  }
};

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