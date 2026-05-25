import { db } from "@/database/drizzle"
import { deals } from "@/database/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(deals).where(eq(deals.id, params.id));
    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ success: false }, { status: 500 })
  }
}