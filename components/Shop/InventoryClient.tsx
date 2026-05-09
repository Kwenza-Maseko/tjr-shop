// app/admin/inventory/InventoryClient.tsx  (Client Component)
'use client'

import { useMemo, useState } from 'react'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { IKImage, ImageKitProvider } from 'imagekitio-next'
import config from '@/lib/config'
import { AlertTriangle, Box, PackageX, TrendingDown } from 'lucide-react'

const { urlEndpoint, publicKey } = config.env.imagekit

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  productName: string
  imageUrl: string
  sku: string
  category: string | null
  brand: string | null
  price: string
  discountPrice: string | null
  stock: number | null
  isActive: boolean | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number | string) {
  return 'R ' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })
}

function getStockStatus(stock: number) {
  if (stock === 0)  return { label: 'Out of stock', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200'    }
  if (stock <= 5)   return { label: 'Very low',     color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
  if (stock <= 20)  return { label: 'Low',          color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
  return              { label: 'In stock',          color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200'  }
}

type FilterType = 'all' | 'out' | 'low' | 'ok'
type SortKey = 'name' | 'stock' | 'price' | 'value' | null

const PER_PAGE = 15

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InventoryClient({ products }: { products: Product[] }) {
  const [filter, setFilter]   = useState<FilterType>('all')
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [page, setPage]       = useState(1)

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalStockValue = products.reduce((s, p) =>
      s + Number(p.price) * (p.stock ?? 0), 0)
    const outOfStock  = products.filter(p => (p.stock ?? 0) === 0).length
    const lowStock    = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 20).length
    const totalUnits  = products.reduce((s, p) => s + (p.stock ?? 0), 0)
    return { totalStockValue, outOfStock, lowStock, totalUnits }
  }, [products])

  // ── Filter + search + sort ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...products]

    if (filter === 'out') data = data.filter(p => (p.stock ?? 0) === 0)
    if (filter === 'low') data = data.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 20)
    if (filter === 'ok')  data = data.filter(p => (p.stock ?? 0) > 20)

    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q) ||
        (p.brand ?? '').toLowerCase().includes(q)
      )
    }

    if (sortKey) {
      data.sort((a, b) => {
        const av = sortKey === 'name'  ? a.productName
                 : sortKey === 'stock' ? (a.stock ?? 0)
                 : sortKey === 'price' ? Number(a.price)
                 : Number(a.price) * (a.stock ?? 0)  // value
        const bv = sortKey === 'name'  ? b.productName
                 : sortKey === 'stock' ? (b.stock ?? 0)
                 : sortKey === 'price' ? Number(b.price)
                 : Number(b.price) * (b.stock ?? 0)
        if (typeof av === 'string') return av.localeCompare(bv as string) * sortDir
        return ((av as number) - (bv as number)) * sortDir
      })
    }

    return data
  }, [products, filter, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 1 ? -1 : 1)
    else { setSortKey(key); setSortDir(1) }
  }

  function SortIndicator({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-muted-foreground/40 ml-1">↕</span>
    return <span className="ml-1">{sortDir === 1 ? '↑' : '↓'}</span>
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'out', label: 'Out of stock' },
    { key: 'low', label: 'Low stock' },
    { key: 'ok',  label: 'Healthy' },
  ]

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
      <div className="m-4 space-y-4">

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">

          <div className="flex-1 min-w-[180px] rounded-xl bg-white border border-black/5 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Stock Value</p>
            <p className="text-2xl font-medium leading-none">{fmtPrice(stats.totalStockValue)}</p>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              <Box className="w-3 h-3" /> Warehouse
            </span>
          </div>

          <div className="flex-1 min-w-[180px] rounded-xl bg-white border border-black/5 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Units</p>
            <p className="text-2xl font-medium leading-none">{stats.totalUnits.toLocaleString('en-ZA')}</p>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              <Box className="w-3 h-3" /> In warehouse
            </span>
          </div>

          <div className="flex-1 min-w-[180px] rounded-xl bg-white border border-black/5 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Low Stock</p>
            <p className="text-2xl font-medium leading-none">{stats.lowStock}</p>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
              <TrendingDown className="w-3 h-3" /> Need restock
            </span>
          </div>

          <div className="flex-1 min-w-[180px] rounded-xl bg-white border border-black/5 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Out of Stock</p>
            <p className="text-2xl font-medium leading-none">{stats.outOfStock}</p>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
              <PackageX className="w-3 h-3" /> Urgent
            </span>
          </div>

        </div>

        {/* ── Table card ──────────────────────────────────────────────────── */}
        <div className="rounded-xl bg-white border border-black/5 overflow-hidden">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Inventory · {filtered.length} products
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFilter(f.key); setPage(1) }}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors
                    ${filter === f.key
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  {f.label}
                </button>
              ))}
              <Input
                className="h-7 w-44 text-xs rounded-full"
                placeholder="Search name, SKU, brand…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] uppercase tracking-widest w-64">
                    <span className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                      Product <SortIndicator k="name" />
                    </span>
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">SKU</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest cursor-pointer select-none" onClick={() => handleSort('stock')}>
                    Stock <SortIndicator k="stock" />
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest cursor-pointer select-none" onClick={() => handleSort('price')}>
                    Unit Price <SortIndicator k="price" />
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-right cursor-pointer select-none" onClick={() => handleSort('value')}>
                    Stock Value <SortIndicator k="value" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                      No products match your filters.
                    </TableCell>
                  </TableRow>
                ) : paginated.map(product => {
                  const stock  = product.stock ?? 0
                  const status = getStockStatus(stock)
                  const stockValue = Number(product.price) * stock

                  return (
                    <TableRow key={product.id} className="group">

                      {/* Product */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <IKImage
                                path={product.imageUrl}
                                alt={product.productName}
                                width={36}
                                height={36}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <span className="text-lg">📦</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none">{product.productName}</p>
                            {product.brand && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* SKU */}
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        {product.category ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground capitalize">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Stock qty */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {stock <= 5 && stock > 0 && (
                            <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium tabular-nums ${stock === 0 ? 'text-red-500' : ''}`}>
                            {stock}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border
                          ${status.bg} ${status.color} ${status.border}`}>
                          {status.label}
                        </span>
                      </TableCell>

                      {/* Unit price */}
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium tabular-nums">{fmtPrice(product.price)}</p>
                          {product.discountPrice && (
                            <p className="text-[11px] text-green-600 tabular-nums">
                              Sale: {fmtPrice(product.discountPrice)}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Stock value */}
                      <TableCell className="text-right">
                        <span className={`text-sm font-medium tabular-nums ${stockValue === 0 ? 'text-muted-foreground' : 'text-green-600'}`}>
                          {fmtPrice(stockValue)}
                        </span>
                      </TableCell>

                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filtered.length > PER_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {filtered.length} products · page {page} of {totalPages}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-7 w-7 text-xs rounded-md border transition-colors
                      ${n === page ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </ImageKitProvider>
  )
}