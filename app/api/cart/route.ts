import { NextRequest, NextResponse } from "next/server";
import { getUserCartItems } from "@/lib/store/cart";
import { auth } from "@/userAuth";
import { db } from "@/database/drizzle";
import { cartTable } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const cart = await getUserCartItems(session.user.id);
    return NextResponse.json(cart);
}
