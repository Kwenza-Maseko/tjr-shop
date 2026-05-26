import { db } from "@/database/drizzle"
import { userTable } from "@/database/schema"
import { auth } from "@/userAuth"
import { eq } from "drizzle-orm"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone?.trim()) return Response.json({ error: 'Phone number is required' }, { status: 400 })

  await db.update(userTable).set({ phoneNumber: phone.trim() }).where(eq(userTable.id, session.user.id))

  return Response.json({ success: true })
}