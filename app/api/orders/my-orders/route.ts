// app/api/orders/my-orders/route.ts

import { db } from "@/database/drizzle"
import { ordersTable } from "@/database/schema"
import { auth } from "@/userAuth"
import { eq, desc } from "drizzle-orm"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ success: false }, { status: 401 })
    }

    const data = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, session.user.id))
      .orderBy(desc(ordersTable.createdAt))

    return Response.json({ success: true, data })
  } catch (error) {
    console.error(error)
    return Response.json({ success: false }, { status: 500 })
  }
}