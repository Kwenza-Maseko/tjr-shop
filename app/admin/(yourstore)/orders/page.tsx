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
import React from "react"

const { urlEndpoint, publicKey } = config.env.imagekit

interface OrderItem {
    productId: string
    productName: string
    imageUrl?: string
    quantity: number
    priceSnapshot: number
    discountSnapshot?: number | null
}

interface Order {
    id: string
    userId: string
    mPaymentId: string
    pfPaymentId?: string
    paymentStatus: string
    status: string
    shippingMethod: "PICKUP" | "DELIVERY"
    subtotal: string
    total: string
    items: OrderItem[]
    customerName?: string
    customerEmail?: string
    deliveryStreetAddress?: string
    deliverySuburb?: string
    deliveryCity?: string
    deliveryProvince?: string
    deliveryPostalCode?: string
    paidAt?: string
    createdAt: string
    updatedAt: string
}

type FilterType = 'all' | 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
type SortKey = 'total' | 'date' | 'status' | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#FAEEDA', color: '#633806' },
    { bg: '#FBEAF0', color: '#72243E' },
    { bg: '#EAF3DE', color: '#27500A' },
    { bg: '#FAECE7', color: '#712B13' },
    { bg: '#EEEDFE', color: '#3C3489' },
]

function avatarColor(id: string) {
    let hash = 0
    for (const c of id) hash += c.charCodeAt(0)
    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function CustomerAvatar({ name, id }: { name?: string; id: string }) {
    const col = avatarColor(id)
    return (
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{ background: col.bg, color: col.color }}
        >
            {name ? initials(name) : '?'}
        </div>
    )
}

function fmtPrice(n: number | string) {
    return 'R ' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })
}

function fmtDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
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

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    PENDING:    { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200', dot: 'bg-yellow-400' },
    PAID:       { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-500'   },
    PROCESSING: { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200', dot: 'bg-purple-500' },
    SHIPPED:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', dot: 'bg-indigo-500' },
    DELIVERED:  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',  dot: 'bg-green-500'  },
    CANCELLED:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-400'    },
    REFUNDED:   { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200', dot: 'bg-orange-400' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {status}
        </span>
    )
}

// ─── Expanded row ─────────────────────────────────────────────────────────────

function OrderItemsRow({ order, colSpan }: { order: Order; colSpan: number }) {
    return (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableCell colSpan={colSpan} className="py-3 px-6">
                <div className="flex flex-wrap gap-3">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-xs">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                    <IKImage
                                        path={item.imageUrl}
                                        alt={item.productName}
                                        width={32}
                                        height={32}
                                        className="object-contain w-full h-full"
                                    />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium leading-none">{item.productName}</p>
                                <p className="text-muted-foreground mt-0.5">
                                    x{item.quantity} · {fmtPrice(item.priceSnapshot)}
                                    {item.discountSnapshot ? ` (−${item.discountSnapshot}%)` : ''}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Delivery address if applicable */}
                    {order.shippingMethod === 'DELIVERY' && order.deliveryStreetAddress && (
                        <div className="ml-auto text-xs text-muted-foreground text-right">
                            <p className="font-medium text-foreground mb-0.5">Delivery address</p>
                            <p>{order.deliveryStreetAddress}</p>
                            {order.deliverySuburb && <p>{order.deliverySuburb}</p>}
                            <p>{[order.deliveryCity, order.deliveryProvince, order.deliveryPostalCode].filter(Boolean).join(', ')}</p>
                        </div>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}

// ─── Status updater ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

function StatusSelect({ order, onUpdate }: { order: Order; onUpdate: (id: string, status: string) => void }) {
    const [updating, setUpdating] = useState(false)

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value
        setUpdating(true)
        try {
            const res = await fetch(`/api/orders/${order.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (res.ok) onUpdate(order.id, newStatus)
        } catch (err) {
            console.error('Failed to update status:', err)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <select
            value={order.status}
            onChange={handleChange}
            disabled={updating}
            className="text-xs border border-border rounded-md px-2 py-1 bg-background cursor-pointer disabled:opacity-50"
        >
            {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    )
}

const PER_PAGE = 10

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrdersDashboard() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>(null)
    const [sortDir, setSortDir] = useState<1 | -1>(1)
    const [page, setPage] = useState(1)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/orders')
                const json = await res.json()
                if (json.success) setOrders(json.data)
            } catch (err) {
                console.error('Failed to fetch orders:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const stats = useMemo(() => {
        const total = orders.length
        const paid = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED').length
        const pending = orders.filter(o => o.status === 'PENDING').length
        const revenue = orders
            .filter(o => o.paymentStatus === 'COMPLETE')
            .reduce((s, o) => s + Number(o.total), 0)
        return { total, paid, pending, revenue }
    }, [orders])

    const filtered = useMemo(() => {
        let data = [...orders]

        if (filter !== 'all') data = data.filter(o => o.status === filter)

        if (search.trim()) {
            const q = search.toLowerCase()
            data = data.filter(o =>
                (o.customerName ?? '').toLowerCase().includes(q) ||
                (o.customerEmail ?? '').toLowerCase().includes(q) ||
                o.mPaymentId.toLowerCase().includes(q)
            )
        }

        if (sortKey) {
            data.sort((a, b) => {
                const av = sortKey === 'total' ? Number(a.total)
                         : sortKey === 'date'  ? new Date(a.createdAt).getTime()
                         : a.status.localeCompare(b.status)
                const bv = sortKey === 'total' ? Number(b.total)
                         : sortKey === 'date'  ? new Date(b.createdAt).getTime()
                         : b.status.localeCompare(a.status)
                return (av > bv ? 1 : -1) * sortDir
            })
        }

        return data
    }, [orders, filter, search, sortKey, sortDir])

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

    function handleStatusUpdate(id: string, newStatus: string) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    }

    const FILTERS: FilterType[] = ['all', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    const FILTER_LABELS: Record<FilterType, string> = {
        all: 'All', PENDING: 'Pending', PAID: 'Paid',
        PROCESSING: 'Processing', SHIPPED: 'Shipped',
        DELIVERED: 'Delivered', CANCELLED: 'Cancelled'
    }

    return (
        <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
            <div className="bg-background overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-border">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                            All customer orders · live view
                        </p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Live
                    </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4 border-b border-border">
                    <StatCard label="Total orders"  value={String(stats.total)}          sub="all time" />
                    <StatCard label="Revenue"        value={fmtPrice(stats.revenue)}      sub="completed payments" />
                    <StatCard label="Paid / Delivered" value={String(stats.paid)}         sub="fulfilled orders" />
                    <StatCard label="Pending"        value={String(stats.pending)}        sub="awaiting payment" />
                </div>

                {/* Filters + Search */}
                <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border">
                    {FILTERS.map(f => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => { setFilter(f); setPage(1) }}
                        >
                            {FILTER_LABELS[f]}
                        </Button>
                    ))}
                    <Input
                        className="ml-auto h-7 w-48 text-xs rounded-full"
                        placeholder="Search name, email, payment ID…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25"/>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Loading orders…
                    </div>
                ) : (
                    <div className="overflow-x-auto p-8">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="text-[10px] uppercase tracking-widest w-8" />
                                    <TableHead className="text-[10px] uppercase tracking-widest">Customer</TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Payment ID</TableHead>
                                    <TableHead
                                        className="text-[10px] uppercase tracking-widest cursor-pointer select-none"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status <SortIndicator k="status" />
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Shipping</TableHead>
                                    <TableHead
                                        className="text-[10px] uppercase tracking-widest cursor-pointer select-none"
                                        onClick={() => handleSort('total')}
                                    >
                                        Total <SortIndicator k="total" />
                                    </TableHead>
                                    <TableHead
                                        className="text-[10px] uppercase tracking-widest cursor-pointer select-none"
                                        onClick={() => handleSort('date')}
                                    >
                                        Date <SortIndicator k="date" />
                                    </TableHead>
                                    <TableHead className="text-[10px] uppercase tracking-widest">Update Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                                            No orders match your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.map(order => {
                                    const isExpanded = expandedId === order.id
                                    return (
                                        <React.Fragment key={order.id}>
                                            <TableRow
                                                className="cursor-pointer group"
                                                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                            >
                                                {/* Expand toggle */}
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {isExpanded ? '▾' : '▸'}
                                                </TableCell>

                                                {/* Customer */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CustomerAvatar name={order.customerName} id={order.userId} />
                                                        <div>
                                                            <p className="text-xs font-medium leading-none">{order.customerName ?? '—'}</p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">{order.customerEmail ?? '—'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Payment ID */}
                                                <TableCell>
                                                    <span className="text-xs font-mono text-muted-foreground">
                                                        {order.mPaymentId}
                                                    </span>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell onClick={e => e.stopPropagation()}>
                                                    <StatusBadge status={order.status} />
                                                </TableCell>

                                                {/* Shipping */}
                                                <TableCell>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                                                        ${order.shippingMethod === 'DELIVERY'
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}>
                                                        {order.shippingMethod === 'DELIVERY' ? '🚚 Delivery' : '📦 Pick Up'}
                                                    </span>
                                                </TableCell>

                                                {/* Total */}
                                                <TableCell>
                                                    <span className="text-sm font-medium tabular-nums">
                                                        {fmtPrice(order.total)}
                                                    </span>
                                                </TableCell>

                                                {/* Date */}
                                                <TableCell>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {fmtDate(order.createdAt)}
                                                    </span>
                                                </TableCell>

                                                {/* Status select */}
                                                <TableCell onClick={e => e.stopPropagation()}>
                                                    <StatusSelect order={order} onUpdate={handleStatusUpdate} />
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded items row */}
                                            {isExpanded && (
                                                <OrderItemsRow order={order} colSpan={8} />
                                            )}
                                        </React.Fragment>
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
                            {filtered.length} order{filtered.length !== 1 ? 's' : ''} · page {page} of {totalPages}
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