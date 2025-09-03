'use server';

import { db } from "@/database/drizzle";
import { announcements } from "@/database/schema";
import { eq } from "drizzle-orm";
import { RotateCwSquare } from "lucide-react";


export const createOrUpdateAnnouncement = async (
  announcement: string,
  id?: string | null
) => {
  try {
    if (id) {
      // Try update
      const [updated] = await db
        .update(announcements)
        .set({ announcement })
        .where(eq(announcements.id, id))
        .returning();

      if (updated) {
        return {
          success: true,
          data: updated,
          action: "updated",
        };
      }
    }

    // If no id provided or update failed → insert
    const [inserted] = await db
      .insert(announcements)
      .values({ announcement })
      .returning();

    return {
      success: true,
      data: inserted,
      action: "inserted",
    };
  } catch (error) {
    console.error("Create/Update Announcement", error);
    return {
      success: false,
      message: "An error occurred while creating or updating announcement",
    };
  }
};



export const getAnnouncements = async (): Promise<
  { id: string; announcement: string; createdAt: Date | null }[] | null
> => {
  const result = await db
    .select()
    .from(announcements);

  if (result.length === 0) return null;

  return result.map((row) => ({
    id: row.id,
    announcement: row.announcement,
    createdAt: row.createdAt
  }));
};


export const deleteAnnouncement = async (announcementId: string | null) => {
  if (!announcementId) {
    return {
      success: false,
      message: "Invalid announcement ID",
    };
  }

  try {
    const deleted = await db
      .delete(announcements)
      .where(eq(announcements.id, announcementId))
      .returning();

    return {
      success: true,
      data: deleted[0] ?? null, // return the first deleted row
    };
  } catch (error) {
    console.error("Delete announcement Error:", error);
    return {
      success: false,
      message: "An error occurred while deleting the announcement.",
    };
  }
};

