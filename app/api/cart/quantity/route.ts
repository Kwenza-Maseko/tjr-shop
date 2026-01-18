// app/api/cart/quantity/route.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { cartTable } from "@/database/schema";

export async function PATCH(req: Request) {
  try {
    const { cartItemId, quantity } = await req.json();

    if (!cartItemId || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    await db
      .update(cartTable)
      .set({ quantity })
      .where(eq(cartTable.id, cartItemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update quantity" },
      { status: 500 }
    );
  }
}
