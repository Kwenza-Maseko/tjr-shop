'use server';

import { db } from "@/database/drizzle";
import { deals, dealProducts, productTable, dealTimeSpan } from "@/database/schema";
import { DealTimeSpan, ProductParams } from "@/types";
import { eq } from "drizzle-orm";

interface CreateDealParams {
    dealCoupon: string;
    percentage: number;
}

interface TimeSpan {
    dealId: string;
    timeSpan: Date;
}

interface LinkDealParams {
    dealId: string;
    productIds: string[];
}

/**
 * Create a new deal
 */
export const createDeal = async ({ dealCoupon, percentage }: CreateDealParams) => {
    try {
        const inserted = await db
            .insert(deals)
            .values({
                dealCoupon,
                percentage,
            })
            .returning();

        return {
            success: true,
            message: "Deal created successfully",
            data: inserted[0],
            action: "inserted",
        };
    } catch (error) {
        console.error("Deal Create Error:", error);
        return {
            success: false,
            message: "An error occurred while creating the deal",
        };
    }
};


export const getDeals = async () => {
    try {
        const result = await db.select().from(deals);

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Get Deals Error:", error);
        return {
            success: false,
            message: "An error occurred while fetching deals",
        };
    }
};

/**
 * Link deal to one or more products
 */
export const linkDealToProduct = async ({ dealId, productIds }: LinkDealParams) => {
  try {
    if (!dealId || !Array.isArray(productIds) || productIds.length === 0) {
      throw new Error("Missing dealId or productIds");
    }

    for (const productId of productIds) {
      // Check if a dealProduct already exists for this product
      const existing = await db
        .select()
        .from(dealProducts)
        .where(eq(dealProducts.productId, productId));

      if (existing.length > 0) {
        // Update existing row with new dealId
        await db
          .update(dealProducts)
          .set({ dealId })
          .where(eq(dealProducts.productId, productId));
      } else {
        // Insert new row
        await db.insert(dealProducts).values({ dealId, productId });
      }
    }

    return {
      success: true,
      message: "Deal linked to product(s) successfully",
      action: "linked",
    };
  } catch (error) {
    console.error("Deal Linking Error:", error);
    return {
      success: false,
      message: "An error occurred while linking deal to product(s)",
    };
  }
};

export const getProductsWithDeals = async (): Promise<(ProductParams & { dealCoupon?: string | null })[] | null> => {
    const result = await db
        .select({
            id: productTable.id,
            productName: productTable.productName,
            imageUrl: productTable.imageUrl,
            description: productTable.description,
            productTarget: productTable.productTarget,
            productType: productTable.productType,
            color: productTable.color,
            price: productTable.price,
            discountPrice: productTable.discountPrice,
            stock: productTable.stock,
            sku: productTable.sku,
            category: productTable.category,
            tags: productTable.tags,
            weight: productTable.weight,
            dimensions: productTable.dimensions,
            rating: productTable.rating,
            reviewCount: productTable.reviewCount,
            isActive: productTable.isActive,
            relatedProducts: productTable.relatedProducts,
            variants: productTable.variants,
            brand: productTable.brand,
            dealCoupon: deals.dealCoupon,
        })
        .from(productTable)
        .leftJoin(dealProducts, eq(dealProducts.productId, productTable.id))
        .leftJoin(deals, eq(deals.id, dealProducts.dealId));

    if (result.length === 0) return null;

    // map to correct types
    return result.map((item) => ({
        ...item,
        price: Number(item.price),
        discountPrice: item.discountPrice !== null ? Number(item.discountPrice) : null,
        stock: item.stock ?? 0,
        weight: item.weight !== null ? Number(item.weight) : null,
        rating: item.rating !== null ? Number(item.rating) : 0,
        reviewCount: item.reviewCount ?? 0,
        isActive: item.isActive ?? true,
        relatedProducts: (item.relatedProducts as string[] | null) ?? [],
        variants: (item.variants as Record<string, any> | null) ?? {},
        dealCoupon: item.dealCoupon ?? null,
    }));
};


export const addTimeSpan = async ({ dealId, timeSpan }: TimeSpan) => {
    try {
        const inserted = await db
            .insert(dealTimeSpan)
            .values({
                dealId,
                timeSpan,
            })
            .returning();

        return {
            success: true,
            message: "Time Span Create successfully",
            data: inserted[0],
            action: "inserted",
        };
    } catch (error) {
        console.error("Time Span Create Error:", error);
        return {
            success: false,
            message: "An error occurred while creating the deal time span",
        };
    }
};


export const getTimeSpan = async (): Promise<DealTimeSpan[] | null> => {
  const result = await db.select().from(dealTimeSpan);

  if (result.length === 0) return null;

  return result.map((item) => ({
    id: item.id,
    dealId: item.dealId,
    timeSpan: item.timeSpan ? new Date(item.timeSpan) : null,
  }));
};


export const getDealsWithTimeSpan = async () => {
    try {
        const rows = await db
            .select({
                id: deals.id,
                dealCoupon: deals.dealCoupon,
                percentage: deals.percentage,
                timeSpan: dealTimeSpan.timeSpan,
                timeSpanId: dealTimeSpan.id
            })
            .from(deals)
            .leftJoin(dealTimeSpan, eq(deals.id, dealTimeSpan.dealId));

        const grouped = Object.values(
            rows.reduce((acc: any, row) => {
                if (!acc[row.id]) {
                    acc[row.id] = {
                        id: row.id,
                        dealCoupon: row.dealCoupon,
                        percentage: row.percentage,
                        timeSpans: []
                    };
                }

                if (row.timeSpanId) {
                    acc[row.id].timeSpans.push({
                        id: row.timeSpanId,
                        timeSpan: row.timeSpan
                    });
                }

                return acc;
            }, {})
        );

        return {
            success: true,
            data: grouped,
        };
    } catch (error) {
        console.error("Fetch Deals With TimeSpan Error:", error);
        return {
            success: false,
            message: "An error occurred while fetching deals with timespan",
        };
    }
};