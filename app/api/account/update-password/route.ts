import { db } from "@/database/drizzle"
import { userTable } from "@/database/schema"
import { auth } from "@/userAuth"
import { eq } from "drizzle-orm"
import { hash, compare } from "bcryptjs"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword)
    return Response.json({ error: 'All fields are required' }, { status: 400 })

  if (newPassword.length < 8)
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const [user] = await db.select().from(userTable).where(eq(userTable.id, session.user.id)).limit(1)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  const isValid = await compare(currentPassword, user.password)
  if (!isValid) return Response.json({ error: 'Current password is incorrect' }, { status: 400 })

  const hashed = await hash(newPassword, 10)
  await db.update(userTable).set({ password: hashed }).where(eq(userTable.id, session.user.id))

  return Response.json({ success: true })
}