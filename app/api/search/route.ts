import { db } from "@/database/drizzle"
import { productTable } from "@/database/schema"
import { and, eq, ilike, or } from "drizzle-orm"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()

  if (!q || q.length < 2) return Response.json({ results: [] })

  const results = await db
    .select({
      id: productTable.id,
      productName: productTable.productName,
      imageUrl: productTable.imageUrl,
      price: productTable.price,
      discountPrice: productTable.discountPrice,
      category: productTable.category,
      productTarget: productTable.productTarget,
      productType: productTable.productType,
    })
    .from(productTable)
    .where(
      and(
        eq(productTable.isActive, true),
        or(
          ilike(productTable.productName, `%${q}%`),
          ilike(productTable.category, `%${q}%`),
          ilike(productTable.productTarget, `%${q}%`),
          ilike(productTable.productType, `%${q}%`),
          ilike(productTable.brand, `%${q}%`),
          ilike(productTable.tags, `%${q}%`),
        )
      )
    )
    .limit(8)

  return Response.json({ results })
}