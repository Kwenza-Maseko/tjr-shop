import { db } from "@/database/drizzle";
import { cartTable, productTable, userTable } from "@/database/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const cartItems = await db
      .select({
        id: cartTable.id,
        productId: cartTable.productId,
        userId: cartTable.userId,
        quantity: cartTable.quantity,
        priceSnapshot: cartTable.priceSnapshot,
        discountSnapshot: cartTable.discountSnapshot,
        createdAt: cartTable.createdAt,

        product: {
          id: productTable.id,
          productName: productTable.productName,
          imageUrl: productTable.imageUrl,
        },

        user: {
          id: userTable.id,
          fullName: userTable.fullName,
          email: userTable.email,
        },
      })
      .from(cartTable)
      .leftJoin(
        productTable,
        eq(cartTable.productId, productTable.id)
      )
      .leftJoin(
        userTable,
        eq(cartTable.userId, userTable.id)
      ).orderBy(desc(cartTable.createdAt));

    return Response.json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch cart items",
      },
      { status: 500 }
    );
  }
}