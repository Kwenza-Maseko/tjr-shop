
import { db } from "@/database/drizzle"
import { ordersTable } from "@/database/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { status } = await req.json()
        await db
            .update(ordersTable)
            .set({ status, updatedAt: new Date() })
            .where(eq(ordersTable.id, id))

        return Response.json({ success: true })
    } catch (error) {
        console.error(error)
        return Response.json({ success: false }, { status: 500 })
    }
}