'use server'

import { db } from "@/database/drizzle";
import { storeContactDetails } from "@/database/schema";
import { StoreDetailsParams } from "@/types";
import { eq } from "drizzle-orm";

export const createStoreContactDetails = async (params: StoreDetailsParams) => {
    try {
        if (params.id) {
            const existing = await db
                .select()
                .from(storeContactDetails)
                .where(eq(storeContactDetails.id, params.id))
                .limit(1);

            if (existing.length > 0) {
                const [updated] = await db
                    .update(storeContactDetails)
                    .set(params)
                    .where(eq(storeContactDetails.id, existing[0].id))
                    .returning();

                return { success: true, data: updated, action: "updated" };
            }
        }

        // If no id or no existing record, insert new
        const insertData = { ...params };
        delete insertData.id;

        const [inserted] = await db
            .insert(storeContactDetails)
            .values(insertData)
            .returning();

        return { success: true, data: inserted, action: "inserted" };

    } catch (error) {
        console.error("Create/Update Store Details Error:", error);
        return {
            success: false,
            message: "An error occurred while creating or updating your store details",
        };
    }
};

export const getContactDetailsByStoreId = async (): Promise<StoreDetailsParams[]> => {
    const res = await db
        .select()
        .from(storeContactDetails);

    return res;
};

export const deleteStoreDetail = async (id: string): Promise<StoreDetailsParams[]> => {
    const res = await db
        .delete(storeContactDetails)
        .where(eq(storeContactDetails.id, id))
        .returning();

    return res;
};

