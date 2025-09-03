'use server';

import { db } from "@/database/drizzle";
import { storeHeadline } from "@/database/schema";
import { eq } from "drizzle-orm";


export const createOrUpdateHeadline = async (
    headline: string,
    textBold: "YES" | "NO",
    textItalic: "YES" | "NO",
    colorHex: string
) => {
    try {
        const existing = await db
            .select()
            .from(storeHeadline)
            .limit(1);

        if (existing.length > 0) {
            const [updated] = await db
                .update(storeHeadline)
                .set({
                    headline,
                    textBold,       // ✅ already "YES" or "NO"
                    textItalic,
                    colorHex
                })
                .where(eq(storeHeadline.id, existing[0].id))
                .returning();

            return {
                success: true,
                data: updated,
                action: "updated",
            };
        } else {
            const [inserted] = await db
                .insert(storeHeadline)
                .values({
                    headline,
                    textBold,
                    textItalic,
                    colorHex
                })
                .returning();

            return {
                success: true,
                data: inserted,
                action: "inserted",
            };
        }
    } catch (error) {
        console.error("Create/Update Store Headline Error:", error);
        return {
            success: false,
            message: "An error occurred while creating or updating your store headline",
        };
    }
};


export const getStoreHeadLine = async (
): Promise<{
    id: string;
    headline: string;
    textBold: "YES" | "NO" | null;
    textItalic: "YES" | "NO" | null;
    colorHex: string;
} | null> => {
    const result = await db
        .select()
        .from(storeHeadline)
        .limit(1);

    if (result.length === 0) return null;

    return {
        id: result[0].id,
        headline: result[0].headline,
        textBold: result[0].textBold,
        textItalic: result[0].textItalic,
        colorHex: result[0].colorHex,
    };
};

export const deleteStoreId = async (storeheadlineId: string) => {
  try {
    const deleted = await db
      .delete(storeHeadline)
      .where(eq(storeHeadline.id, storeheadlineId))
      .returning();

    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    console.error("Delete Store Headline Error:", error);
    return {
      success: false,
      message: "An error occurred while deleting the store headline.",
    };
  }
};
