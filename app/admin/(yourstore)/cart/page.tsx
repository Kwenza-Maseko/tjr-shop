'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IKImage, ImageKitProvider } from "imagekitio-next"
import { useEffect, useState, useMemo } from "react"
import config from "@/lib/config"

const { urlEndpoint, publicKey } = config.env.imagekit

interface User {
    id: string
    fullName: string
    email: string
    image?: string
}

interface Product {
    id: string
    productName: string
    imageUrl?: string
}

interface CartItem {
    id: string
    productId: string
    userId: string
    quantity: number
    priceSnapshot: number
    discountSnapshot: number
    createdAt: string
    imageUrl?: string
    product?: Product
    user?: User
}

type FilterType = 'all' | 'discounted' | 'high-qty'
type SortKey = 'quantity' | 'price' | 'date' | null


const AVATAR_COLORS = [
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#FBEAF0', color: '#72243E' },
    { bg: '#EAF3DE', color: '#27500A' },
    { bg: '#FAECE7', color: '#712B13' },
    { bg: '#EEEDFE', color: '#3C3489' },
]

function avatarColor(userId: string) {
    let hash = 0
    for (const c of userId) hash += c.charCodeAt(0)
    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function Avatar({ user }: { user: User }) {
    const col = avatarColor(user.id)
    if (user.image) {
        return (
            <img
                src={user.image}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
        )
    }
    return (
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{ background: col.bg, color: col.color }}
        >
            {initials(user.fullName)}
        </div>
    )
}


function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-medium leading-none">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
        </div>
    )
}


function fmtPrice(n: number) {
    return 'R ' + n.toLocaleString('en-ZA')
}

function discountedPrice(discountPrice: number, qty: number) {
    const totalDiscount = discountPrice * qty;
    return 'R ' + totalDiscount.toLocaleString('en-ZA')
}

function finalCartPrice(price: number, qty: number) {
    const totalPrice = price * qty;
    return 'R ' + totalPrice.toLocaleString('en-ZA')
}


function fmtDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const PER_PAGE = 10


export default function CartDashboard() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>(null)
    const [sortDir, setSortDir] = useState<1 | -1>(1)
    const [page, setPage] = useState(1)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/cart/cart-items')
                const json = await res.json()
                if (json.success) setItems(json.data)
            } catch (err) {
                console.error('Failed to fetch cart items:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const stats = useMemo(() => {
        const total = items.length
        const discounted = items.filter(i => i.discountSnapshot > 0).length
        const uniqueUsers = new Set(items.map(i => i.userId)).size
        const totalValue = items.reduce((s, i) => s + i.priceSnapshot * i.quantity, 0)
        return { total, discounted, uniqueUsers, totalValue }
    }, [items])

    const filtered = useMemo(() => {
        let data = [...items]

        if (filter === 'discounted') data = data.filter(i => i.discountSnapshot > 0)
        if (filter === 'high-qty') data = data.filter(i => i.quantity >= 2)

        if (search.trim()) {
            const q = search.toLowerCase()
            data = data.filter(i =>
                (i.product?.productName ?? i.productId).toLowerCase().includes(q) ||
                (i.user?.fullName ?? i.userId).toLowerCase().includes(q) ||
                (i.user?.email ?? '').toLowerCase().includes(q)
            )
        }

        if (sortKey) {
            data.sort((a, b) => {
                const av = sortKey === 'quantity' ? a.quantity
                    : sortKey === 'price' ? a.priceSnapshot
                        : new Date(a.createdAt).getTime()
                const bv = sortKey === 'quantity' ? b.quantity
                    : sortKey === 'price' ? b.priceSnapshot
                        : new Date(b.createdAt).getTime()
                return (av > bv ? 1 : -1) * sortDir
            })
        }

        return data
    }, [items, filter, search, sortKey, sortDir])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    function handleSort(key: SortKey) {
        if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1))
        else { setSortKey(key); setSortDir(1) }
    }

    function SortIndicator({ k }: { k: SortKey }) {
        if (sortKey !== k) return <span className="text-muted-foreground/40 ml-1">↕</span>
        return <span className="ml-1">{sortDir === 1 ? '↑' : '↓'}</span>
    }

    return (
        <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
            <div className="bg-background overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-border">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                            Items added to cart · all users
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4 border-b border-border">
                    <StatCard
                        label="Total items"
                        value={String(stats.total)}
                        sub="across all users"
                    />
                    <StatCard
                        label="Cart value"
                        value={fmtPrice(stats.totalValue)}
                        sub="before discount"
                    />
                    <StatCard
                        label="Discounted"
                        value={String(stats.discounted)}
                        sub={`${stats.total ? Math.round(stats.discounted / stats.total * 100) : 0}% of items`}
                    />
                    <StatCard
                        label="Unique users"
                        value={String(stats.uniqueUsers)}
                        sub="active shoppers"
                    />
                </div>

                {/* Filters + Search */}
                <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border">
                    {(['all', 'discounted', 'high-qty'] as FilterType[]).map(f => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => { setFilter(f); setPage(1) }}
                        >
                            {f === 'all' ? 'All' : f === 'discounted' ? 'Discounted' : 'High qty'}
                        </Button>
                    ))}
                    <Input
                        className="ml-auto h-7 w-48 text-xs rounded-full"
                        placeholder="Search products or users…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Loading cart items…
                    </div>
                ) : (
                    <div className="overflow-x-auto p-8">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="text-[10px] uppercase tracking-widest w-64">Product</TableHead>
                                    <TableHead
                                        className="text-[10px] uppercase tracking-widest cursor-pointer select-none"
                                        onClick={() => handleSort('quantity')}
                                    >
                                        Qty <SortIndicator k="quantity" />
                                    </TableHead>
                                    <TableHead
                                        className="text-[10px] uppercase tracking-widest cursor-pointer select-none"
                                        onClick={() => handleSort('price')}
                                    >
                                        Unit Price <SortIndicator k="price" />
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Discount</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Total</TableHead>
                                    <TableHead
                                        className="text-[10px] uppercase tracking-widest cursor-pointer select-none"
                                        onClick={() => handleSort('date')}
                                    >
                                        Added <SortIndicator k="date" />
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Added by</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                                            No items match your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.map(item => {
                                    const productName = item.product?.productName ?? item.productId
                                    const user = item.user
                                    const discounted = item.discountSnapshot > 0
                                    const finalPrice = discounted
                                        ? Math.round(item.priceSnapshot - (item.discountSnapshot))
                                        : null

                                    return (
                                        <TableRow key={item.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                                                        {item.product?.imageUrl ? (
                                                            <IKImage
                                                                path={item.imageUrl}
                                                                alt={productName}
                                                                width={40}
                                                                height={40}
                                                                className="object-contain w-full h-full"
                                                            />
                                                        ) : (
                                                            <span className="text-lg">🛍️</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none">{productName}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Quantity */}
                                            <TableCell>
                                                <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-muted border border-border text-xs font-medium">
                                                    {item.quantity}
                                                </span>
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell>
                                                <p className="text-sm font-medium tabular-nums">{fmtPrice(item.priceSnapshot)}</p>
                                                {finalPrice && (
                                                    <p className="text-[11px] text-muted-foreground tabular-nums line-through">
                                                        {fmtPrice(finalPrice)}
                                                    </p>
                                                )}
                                            </TableCell>

                                            {/* Discount */}
                                            <TableCell>
                                                {discounted ? (
                                                    <span className="text-sm">
                                                        -{item.discountSnapshot}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">—</span>
                                                )}
                                            </TableCell>

                                             {/* Total Price */}
                                            <TableCell>
                                                {discounted ? (
                                                    <span className="text-sm">
                                                        {discountedPrice(item.discountSnapshot, item.quantity)}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm">
                                                        {finalCartPrice(item.priceSnapshot, item.quantity)}
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {fmtDate(item.createdAt)}
                                                </span>
                                            </TableCell>

                                            {/* User */}
                                            <TableCell>
                                                {user ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar user={user} />
                                                        <div>
                                                            <p className="text-xs font-medium leading-none">{user.fullName}</p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-mono text-muted-foreground">{item.userId}</span>
                                                )}
                                            </TableCell>

                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && filtered.length > PER_PAGE && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                            {filtered.length} item{filtered.length !== 1 ? 's' : ''} · page {page} of {totalPages}
                        </p>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <Button
                                    key={n}
                                    variant={n === page ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-7 w-7 p-0 text-xs"
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </ImageKitProvider>
    )
}