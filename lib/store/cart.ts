'use server';

import { db } from "@/database/drizzle";
import { cartTable, productTable } from "@/database/schema";
import { CartItem } from "@/types";
import { and, eq } from "drizzle-orm";

export const createOrUpdateCart = async (params: CartItem) => {
    try {
        const {
            userId,
            productId,
            imageUrl,
            quantity,
            priceSnapshot,
            discountSnapshot,
            selectedOptions,
        } = params;

        // 1. Check if item already exists in cart
        const [existing] = await db
            .select()
            .from(cartTable)
            .where(
                and(
                    eq(cartTable.userId, userId),
                    eq(cartTable.productId, productId),
                    eq(cartTable.isActive, true)
                )
            );

        // 2. Update existing cart item
        if (existing) {
            const [updated] = await db
                .update(cartTable)
                .set({
                    imageUrl,
                    quantity: existing.quantity + quantity,
                    priceSnapshot,
                    discountSnapshot,
                    selectedOptions,
                    updatedAt: new Date(),
                })
                .where(eq(cartTable.id, existing.id))
                .returning();

            return {
                success: true,
                data: updated,
                action: "updated",
            };
        }

        // 3. Create new cart item
        const [inserted] = await db
            .insert(cartTable)
            .values({
                userId,
                productId,
                imageUrl,
                quantity,
                priceSnapshot,
                discountSnapshot,
                selectedOptions,
                isActive: true,
            })
            .returning();

        return {
            success: true,
            data: inserted,
            action: "created",
        };

    } catch (error) {
        console.error("Cart Error:", error);
        return {
            success: false,
            message: "Failed to create or update cart",
        };
    }
};


export const getUserCartItems = async (userId: string) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    // Join cartTable with productTable
    const items = await db
      .select({
        id: cartTable.id,
        userId: cartTable.id,
        productId: cartTable.productId,
        quantity: cartTable.quantity,
        priceSnapshot: cartTable.priceSnapshot,
        discountSnapshot: cartTable.discountSnapshot,
        selectedOptions: cartTable.selectedOptions,
        imageUrl: cartTable.imageUrl,
        createdAt: cartTable.createdAt,
        productName: productTable.productName, // <- joined product name
      })
      .from(cartTable)
      .leftJoin(productTable, eq(cartTable.productId, productTable.id))
      .where(
        and(
          eq(cartTable.userId, userId),
          eq(cartTable.isActive, true)
        )
      )
      .orderBy(cartTable.createdAt);

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Get Cart Items Error:", error);
    return {
      success: false,
      message: "Failed to fetch cart items",
    };
  }
};
