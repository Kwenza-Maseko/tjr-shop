'use server';

import { db } from "@/database/drizzle";
import { banners, media } from "@/database/schema";
import { eq } from "drizzle-orm";

export const createOrUpdateBanner = async (mediaId: string) => {
    try {
        // Step 1: Get existing banner 
        const existing = await db
            .select({
                bannerId: banners.id,
            })
            .from(banners)
            .leftJoin(media, eq(banners.mediaId, media.id))
            .limit(1);

        if (existing.length > 0) {
            // Step 2: Update the existing banner
            const [updated] = await db
                .update(banners)
                .set({ mediaId })
                .where(eq(banners.id, existing[0].bannerId))
                .returning();

            return {
                success: true,
                data: updated,
                action: "updated",
            };
        } else {
            // Step 3: Insert a new banner
            const [inserted] = await db
                .insert(banners)
                .values({ mediaId })
                .returning();

            return {
                success: true,
                data: inserted,
                action: "inserted",
            };
        }
    } catch (error) {
        console.error("Create/Update Banner Error:", error);
        return {
            success: false,
            message: "An error occurred while creating or updating your banner",
        };
    }
};

export const getBanners = async (): Promise<{ id: string; imageUrl: string } | null> => {
    const result = await db
        .select({
            id: banners.id,
            imageUrl: media.imageUrl,
        })
        .from(banners)
        .leftJoin(media, eq(banners.mediaId, media.id))
        .limit(1);

    if (result.length === 0 || !result[0].imageUrl) return null;

    return {
        id: result[0].id,
        imageUrl: result[0].imageUrl,
    };
};

export const deleteBannerStore = async (id: string): Promise<string | null> => {
    const res = await db
        .delete(banners)
        .where(eq(banners.id, id))
        .returning({ id: banners.id }); // return only ID

    return res[0]?.id ?? null;
};
