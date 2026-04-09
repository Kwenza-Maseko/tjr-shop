import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/userAuth";
import { getUsers } from "@/lib/store/users";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const cart = await getUsers();
    return NextResponse.json(cart);
}
