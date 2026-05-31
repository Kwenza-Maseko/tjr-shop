import { db } from "@/database/drizzle"
import { productSizes, productTable } from "@/database/schema"
import { eq, sum } from "drizzle-orm"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const sizes = await db
        .select()
        .from(productSizes)
        .where(eq(productSizes.productId, id))

    return Response.json({ sizes })
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params
    const { size, quantity } = await req.json()

    if (!size || quantity == null)
        return Response.json({ error: "Size and quantity required" }, { status: 400 })

    const [inserted] = await db
        .insert(productSizes)
        .values({
            productId: id,
            size: size.trim().toUpperCase(),
            quantity,
            isAvailable: quantity > 0,
        })
        .returning()

    await syncProductStock(id)

    return Response.json({ success: true, data: inserted })
}

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