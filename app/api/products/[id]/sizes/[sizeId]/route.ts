import { db } from "@/database/drizzle"
import { productSizes, productTable } from "@/database/schema"
import { eq, sum } from "drizzle-orm"

async function syncProductStock(productId: string) {
    const [result] = await db
        .select({ total: sum(productSizes.quantity) })
        .from(productSizes)
        .where(eq(productSizes.productId, productId))

    await db
        .update(productTable)
        .set({ stock: Number(result?.total ?? 0) })
        .where(eq(productTable.id, productId))
}

// PATCH — update quantity or availability
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; sizeId: string }> }
) {

    const { id, sizeId } = await params
    const { quantity, isAvailable } = await req.json()

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (quantity != null) {
        updateData.quantity = quantity
        updateData.isAvailable = quantity > 0
    }
    if (isAvailable != null) updateData.isAvailable = isAvailable

    const [updated] = await db
        .update(productSizes)
        .set(updateData)
        .where(eq(productSizes.id, sizeId))
        .returning()

    await syncProductStock(id)

    return Response.json({ success: true, data: updated })
}

// DELETE — remove a size
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; sizeId: string }> }
) {

    const { id, sizeId } = await params

    await db.delete(productSizes).where(eq(productSizes.id, sizeId))
    await syncProductStock(id)

    return Response.json({ success: true })
}