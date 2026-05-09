// app/admin/inventory/page.tsx  (Server Component)
import InventoryClient from '@/components/Shop/InventoryClient'
import { db } from '@/database/drizzle'
import { productTable } from '@/database/schema'
import { desc } from 'drizzle-orm'

export default async function InventoryPage() {
  const products = await db
    .select()
    .from(productTable)
    .orderBy(desc(productTable.createdAt))

  return <InventoryClient products={products} />
}