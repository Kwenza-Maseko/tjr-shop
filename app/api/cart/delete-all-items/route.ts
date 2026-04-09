// app/api/cart/delete/route.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { cartTable } from "@/database/schema";

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    await db.delete(cartTable).where(eq(cartTable.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE CART ERROR:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
