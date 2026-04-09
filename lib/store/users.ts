'use server';

import { db } from "@/database/drizzle";
import { userTable } from "@/database/schema";
import { User } from "@/types";
import { and, eq } from "drizzle-orm";

export const getUsers = async () => {
  try {
    
    const items = await db
      .select({
        id: userTable.id,
        fullName: userTable.fullName,
        email: userTable.email,
        role: userTable.role,
        phoneNumber: userTable.phoneNumber,
        createdAt: userTable.createdAt,
        lastLogin: userTable.lastLogin,
      })
      .from(userTable);

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Get Users Error:", error);
    return {
      success: false,
      message: "Failed to fetch users",
    };
  }
};