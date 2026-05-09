// app/api/orders/route.ts — fetch all orders

import { db } from "@/database/drizzle"
import { ordersTable } from "@/database/schema"
import { desc } from "drizzle-orm"

export async function GET() {
    try {
        const data = await db
            .select()
            .from(ordersTable)
            .orderBy(desc(ordersTable.createdAt))

        return Response.json({ success: true, data })
    } catch (error) {
        console.error(error)
        return Response.json({ success: false }, { status: 500 })
    }
}