'use server';

import { db } from "@/database/drizzle";
import { media } from "@/database/schema";
import { eq } from "drizzle-orm";

export const uploadImage = async (imageUrl: string) => {
  try {
    const [newMedia] = await db
      .insert(media)
      .values({ imageUrl })
      .returning();

    return {
      success: true,
      data: newMedia,
    };
  } catch (error) {
    console.error("Create Error:", error);
    return {
      success: false,
      message: "An error occurred while creating an new midea.",
    };
  }
};

export const getImages = async () => {
  try {
    const items = await db
      .select()
      .from(media);

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Read Error:", error);
    return {
      success: false,
      message: "An error occurred while reading your Images.",
    };
  }
};



export const getImageById = async (imageUrl: string) => {
  try {
    const items = await db
      .select()
      .from(media)
      .where(eq(media.id, imageUrl));

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Read Error:", error);
    return {
      success: false,
      message: "An error occurred while reading your Images.",
    };
  }
};
