'use server';

import { db } from "@/database/drizzle";
import { adminTable } from "@/database/schema";
import { eq } from "drizzle-orm";
import { AdminParams } from "@/types";

export const ungrantedAccessAdmins = async () => {
  try {
    const ungrantedAdmins: AdminParams[] = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.accessGranted, "NOT GRANTED"));

    return {
      success: true,
      data: ungrantedAdmins, // always an array
    };
  } catch (error) {
    console.error("Read Error:", error);
    return {
      success: false,
      data: [], // always return an array here too
      message: "An error occurred while fetching ungranted admins.",
    };
  }
};


export const UpdateAdmin = async (id: string) => {
  try {
    const existing = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.id, id))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(adminTable)
        .set({ accessGranted: "GRANTED" }) // ✅ correct
        .where(eq(adminTable.id, existing[0].id))
        .returning();

      return {
        success: true,
        data: updated,
        action: "updated",
      };
    }

    return {
      success: false,
      message: "Admin not found",
    };
  } catch (error) {
    console.error("Update Admin Error:", error);
    return {
      success: false,
      message: "An error occurred while updating admin",
    };
  }
};
