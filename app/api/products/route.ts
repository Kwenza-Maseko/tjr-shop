// app/api/products/route.ts
import { db } from '@/database/drizzle'
import { productTable } from '@/database/schema'
import { ilike, or, count, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const page   = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit  = Math.min(50, Number(searchParams.get('limit') ?? 20))
  const offset = (page - 1) * limit

  try {
    const where = search
      ? or(
          ilike(productTable.productName, `%${search}%`),
          ilike(productTable.sku, `%${search}%`),
          ilike(productTable.brand, `%${search}%`),
          ilike(productTable.category, `%${search}%`),
        )
      : undefined

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: productTable.id,
          productName: productTable.productName,
          imageUrl: productTable.imageUrl,
          sku: productTable.sku,
          price: productTable.price,
          stock: productTable.stock,
          isActive: productTable.isActive,
        })
        .from(productTable)
        .where(where)
        .orderBy(desc(productTable.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(productTable)
        .where(where),
    ])

    return Response.json({ success: true, data, total: totalResult[0].count })

  } catch (error) {
    console.error(error)
    return Response.json({ success: false }, { status: 500 })
  }
}