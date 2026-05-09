import { db } from "@/database/drizzle";
import { cartTable } from "@/database/schema";

export async function GET() {
  try {
    const cartItems = await db.select().from(cartTable);

    return Response.json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch cart items",
      },
      { status: 500 }
    );
  }
}