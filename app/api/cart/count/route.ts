import { db } from "@/database/drizzle"
import { cartTable } from "@/database/schema"
import { eq, sum } from "drizzle-orm"
import { auth } from "@/userAuth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ count: 0 })

  const [result] = await db
    .select({ total: sum(cartTable.quantity) })
    .from(cartTable)
    .where(eq(cartTable.userId, session.user.id))

  return Response.json({ count: Number(result?.total ?? 0) })
}