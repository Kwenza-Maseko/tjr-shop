'use server';

import { db } from "@/database/drizzle";
import { deals, dealProducts, productTable, dealTimeSpan } from "@/database/schema";
import { DealTimeSpan, ProductParams } from "@/types";
import { and, eq, gte, ilike, lte, count } from "drizzle-orm"

export type ProductWithDeal = ProductParams & {
    dealCoupon?: string | null
    dealPercentage?: number | null
}

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

interface unLinkDealParams {
    productId: string;
}
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

export const linkDealToProduct = async ({ dealId, productIds }: LinkDealParams) => {
    try {
        if (!dealId || !Array.isArray(productIds) || productIds.length === 0) {
            throw new Error("Missing dealId or productIds");
        }

        for (const productId of productIds) {
            const existing = await db
                .select()
                .from(dealProducts)
                .where(eq(dealProducts.productId, productId));

            if (existing.length > 0) {
                await db
                    .update(dealProducts)
                    .set({ dealId })
                    .where(eq(dealProducts.productId, productId));
            } else {
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

export const unlinkDealFromProduct = async ({ productId }: unLinkDealParams) => {
    try {
        if ( productId.length === 0) {
            throw new Error("Missing dealId or productIds");
        }

            await db
                .delete(dealProducts)
                .where(eq(dealProducts.productId, productId));

        return {
            success: true,
            message: "Deal unlinked to product successfully",
            action: "unlinked",
        };
    } catch (error) {
        console.error("Deal unLinking Error:", error);
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
                timeSpanId: dealTimeSpan.id,
                productId: productTable.id,
                productName: productTable.productName,
                imageUrl: productTable.imageUrl,
                price: productTable.price,
                discountPrice: productTable.discountPrice,
                rating: productTable.rating,
                reviewCount: productTable.reviewCount,
            })
            .from(deals)
            .leftJoin(dealTimeSpan, eq(deals.id, dealTimeSpan.dealId))
            .leftJoin(dealProducts, eq(deals.id, dealProducts.dealId))
            .leftJoin(productTable, eq(dealProducts.productId, productTable.id));

        const grouped = Object.values(
            rows.reduce((acc: any, row) => {
                if (!acc[row.id]) {
                    acc[row.id] = {
                        id: row.id,
                        dealCoupon: row.dealCoupon,
                        percentage: row.percentage,
                        timeSpans: [],
                        products: [],
                    };
                }

                if (row.timeSpanId && !acc[row.id].timeSpans.find((t: any) => t.id === row.timeSpanId)) {
                    acc[row.id].timeSpans.push({
                        id: row.timeSpanId,
                        timeSpan: row.timeSpan,
                    });
                }

                if (row.productId && !acc[row.id].products.find((p: any) => p.id === row.productId)) {
                    acc[row.id].products.push({
                        id: row.productId,
                        productName: row.productName,
                        imageUrl: row.imageUrl,
                        price: row.price,
                        discountPrice: row.discountPrice,
                        rating: row.rating,
                        reviewCount: row.reviewCount,
                    });
                }

                return acc;
            }, {})
        );

        return { success: true, data: grouped };
    } catch (error) {
        console.error("Fetch Deals Error:", error);
        return { success: false, message: "An error occurred while fetching deals" };
    }
};

export const getProductsByCategory = async (
    category: string,
    productTarget: string,
    productType?: string,
    filters?: {
        brand?: string
        color?: string
        priceMin?: number
        priceMax?: number
    },
    page = 1,
    pageSize = 24
): Promise<{ products: ProductWithDeal[]; total: number } | null> => {
    const offset = (page - 1) * pageSize

    const conditions = [
        eq(productTable.isActive, true),

        ilike(productTable.productTarget, `%${productTarget}%`),

        ilike(productTable.category, `%${category}%`),

        ...(productType
            ? [ilike(productTable.productType, `%${productType}%`)]
            : []),
    ]

    if (productType) conditions.push(ilike(productTable.productType, productType))
    if (filters?.brand) conditions.push(eq(productTable.brand, filters.brand))
    if (filters?.color) conditions.push(ilike(productTable.color, filters.color))
    if (filters?.priceMin != null)
        conditions.push(gte(productTable.price, String(filters.priceMin)))
    if (filters?.priceMax != null)
        conditions.push(lte(productTable.price, String(filters.priceMax)))

    const [rows, countRows] = await Promise.all([
        db
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
                createdAt: productTable.createdAt,
                dealCoupon: deals.dealCoupon,
                dealPercentage: deals.percentage,
            })
            .from(productTable)
            .leftJoin(dealProducts, eq(dealProducts.productId, productTable.id))
            .leftJoin(deals, eq(deals.id, dealProducts.dealId))
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset),

        db
            .select({ count: count() })
            .from(productTable)
            .where(and(...conditions)),
    ])

    if (!rows.length) return null

    return {
        products: rows.map(r => ({
            ...r,
            price: Number(r.price),
            discountPrice: r.discountPrice ? Number(r.discountPrice) : null,
            weight: r.weight ? Number(r.weight) : null,
            rating: Number(r.rating ?? 0),
            reviewCount: r.reviewCount ?? 0,
            stock: r.stock ?? 0,
            isActive: r.isActive ?? true,
            relatedProducts: (r.relatedProducts as string[] | null) ?? [],
            variants: (r.variants as Record<string, any> | null) ?? {},
            dealCoupon: r.dealCoupon ?? null,
            dealPercentage: r.dealPercentage ?? null,
        })),
        total: Number(countRows[0].count),
    }
}

export const getAllProducts = async (
    filters?: {
        brand?: string
        color?: string
        priceMin?: number
        priceMax?: number
    },
    page = 1,
    pageSize = 24
): Promise<{ products: ProductWithDeal[]; total: number } | null> => {
    const offset = (page - 1) * pageSize

    const conditions = [
        eq(productTable.isActive, true),
    ]

    if (filters?.brand) conditions.push(eq(productTable.brand, filters.brand))
    if (filters?.color) conditions.push(ilike(productTable.color, filters.color))
    if (filters?.priceMin != null)
        conditions.push(gte(productTable.price, String(filters.priceMin)))
    if (filters?.priceMax != null)
        conditions.push(lte(productTable.price, String(filters.priceMax)))

    const [rows, countRows] = await Promise.all([
        db
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
                createdAt: productTable.createdAt,
                dealCoupon: deals.dealCoupon,
                dealPercentage: deals.percentage,
            })
            .from(productTable)
            .leftJoin(dealProducts, eq(dealProducts.productId, productTable.id))
            .leftJoin(deals, eq(deals.id, dealProducts.dealId))
            .where(and(...conditions))
            .orderBy(productTable.createdAt)
            .limit(pageSize)
            .offset(offset),

        db
            .select({ count: count() })
            .from(productTable)
            .where(and(...conditions)),
    ])

    if (!rows.length) return null

    return {
        products: rows.map(r => ({
            ...r,
            price: Number(r.price),
            discountPrice: r.discountPrice ? Number(r.discountPrice) : null,
            weight: r.weight ? Number(r.weight) : null,
            rating: Number(r.rating ?? 0),
            reviewCount: r.reviewCount ?? 0,
            stock: r.stock ?? 0,
            isActive: r.isActive ?? true,
            relatedProducts: (r.relatedProducts as string[] | null) ?? [],
            variants: (r.variants as Record<string, any> | null) ?? {},
            dealCoupon: r.dealCoupon ?? null,
            dealPercentage: r.dealPercentage ?? null,
        })),
        total: Number(countRows[0].count),
    }
}

export const getAllTargetedProducts = async (
    productTarget: string,
    filters?: {
        brand?: string
        color?: string
        priceMin?: number
        priceMax?: number
    },
    page = 1,
    pageSize = 24
): Promise<{ products: ProductWithDeal[]; total: number } | null> => {
    const offset = (page - 1) * pageSize

    const conditions = [
        eq(productTable.isActive, true),

        ilike(productTable.productTarget, `%${productTarget}%`),
    ]

    if (filters?.brand) conditions.push(eq(productTable.brand, filters.brand))
    if (filters?.color) conditions.push(ilike(productTable.color, filters.color))
    if (filters?.priceMin != null)
        conditions.push(gte(productTable.price, String(filters.priceMin)))
    if (filters?.priceMax != null)
        conditions.push(lte(productTable.price, String(filters.priceMax)))

    const [rows, countRows] = await Promise.all([
        db
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
                createdAt: productTable.createdAt,
                dealCoupon: deals.dealCoupon,
                dealPercentage: deals.percentage,
            })
            .from(productTable)
            .leftJoin(dealProducts, eq(dealProducts.productId, productTable.id))
            .leftJoin(deals, eq(deals.id, dealProducts.dealId))
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset),

        db
            .select({ count: count() })
            .from(productTable)
            .where(and(...conditions)),
    ])

    if (!rows.length) return null

    return {
        products: rows.map(r => ({
            ...r,
            price: Number(r.price),
            discountPrice: r.discountPrice ? Number(r.discountPrice) : null,
            weight: r.weight ? Number(r.weight) : null,
            rating: Number(r.rating ?? 0),
            reviewCount: r.reviewCount ?? 0,
            stock: r.stock ?? 0,
            isActive: r.isActive ?? true,
            relatedProducts: (r.relatedProducts as string[] | null) ?? [],
            variants: (r.variants as Record<string, any> | null) ?? {},
            dealCoupon: r.dealCoupon ?? null,
            dealPercentage: r.dealPercentage ?? null,
        })),
        total: Number(countRows[0].count),
    }
}

export const getAllProductsType = async (
    category: string,
    productTarget: string,
    filters?: {
        brand?: string
        color?: string
        priceMin?: number
        priceMax?: number
    },
    page = 1,
    pageSize = 24
): Promise<{ products: ProductWithDeal[]; total: number } | null> => {
    const offset = (page - 1) * pageSize

    const conditions = [
        eq(productTable.isActive, true),

        ilike(productTable.productTarget, `%${productTarget}%`),

        ilike(productTable.category, `%${category}%`),
    ]

    if (filters?.brand) conditions.push(eq(productTable.brand, filters.brand))
    if (filters?.color) conditions.push(ilike(productTable.color, filters.color))
    if (filters?.priceMin != null)
        conditions.push(gte(productTable.price, String(filters.priceMin)))
    if (filters?.priceMax != null)
        conditions.push(lte(productTable.price, String(filters.priceMax)))

    const [rows, countRows] = await Promise.all([
        db
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
                createdAt: productTable.createdAt,
                dealCoupon: deals.dealCoupon,
                dealPercentage: deals.percentage,
            })
            .from(productTable)
            .leftJoin(dealProducts, eq(dealProducts.productId, productTable.id))
            .leftJoin(deals, eq(deals.id, dealProducts.dealId))
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset),

        db
            .select({ count: count() })
            .from(productTable)
            .where(and(...conditions)),
    ])

    if (!rows.length) return null

    return {
        products: rows.map(r => ({
            ...r,
            price: Number(r.price),
            discountPrice: r.discountPrice ? Number(r.discountPrice) : null,
            weight: r.weight ? Number(r.weight) : null,
            rating: Number(r.rating ?? 0),
            reviewCount: r.reviewCount ?? 0,
            stock: r.stock ?? 0,
            isActive: r.isActive ?? true,
            relatedProducts: (r.relatedProducts as string[] | null) ?? [],
            variants: (r.variants as Record<string, any> | null) ?? {},
            dealCoupon: r.dealCoupon ?? null,
            dealPercentage: r.dealPercentage ?? null,
        })),
        total: Number(countRows[0].count),
    }
}

export const getProductById = async (id: string): Promise<ProductWithDeal | null> => {
    const rows = await db
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
            createdAt: productTable.createdAt,
            // Deal columns
            dealCoupon: deals.dealCoupon,
            dealPercentage: deals.percentage,
        })
        .from(productTable)
        .leftJoin(dealProducts, eq(dealProducts.productId, productTable.id))
        .leftJoin(deals, eq(deals.id, dealProducts.dealId))
        .where(eq(productTable.id, id))
        .limit(1)

    if (!rows.length) return null

    const r = rows[0]
    return {
        ...r,
        price: Number(r.price),
        discountPrice: r.discountPrice ? Number(r.discountPrice) : null,
        weight: r.weight ? Number(r.weight) : null,
        rating: Number(r.rating ?? 0),
        reviewCount: r.reviewCount ?? 0,
        stock: r.stock ?? 0,
        isActive: r.isActive ?? true,
        relatedProducts: (r.relatedProducts as string[] | null) ?? [],
        variants: (r.variants as Record<string, any> | null) ?? {},
        brand: r.brand ?? null,
        dealCoupon: r.dealCoupon ?? null,
        dealPercentage: r.dealPercentage ?? null,
    }
}