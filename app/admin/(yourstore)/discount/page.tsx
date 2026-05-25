'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductParams } from "@/types"
import { useEffect, useState, useMemo } from "react"
import { IKImage, ImageKitProvider } from "imagekitio-next"
import { Calendar, Loader2, Tag, Percent, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import config from "@/lib/config"
import { createDeal, getDeals, getProductsWithDeals, linkDealToProduct, unlinkDealFromProduct } from "@/lib/store/deals"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DatePicker } from "@/components/Shop/DatePicker"

const { urlEndpoint, publicKey } = config.env.imagekit

interface Deal {
    id: string
    dealCoupon: string
    percentage: number
}

interface ProductWithDeal extends ProductParams {
    dealCoupon?: string | null
    dealId?: string | null
}

const PAGE_SIZE = 8

type FilterDeal = 'all' | 'with' | 'without'

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
            <span className="text-2xl font-medium leading-none">{value}</span>
        </div>
    )
}

function DealChip({
    deal,
    selected,
    onClick,
    onDelete,
    showDelete,
}: {
    deal: Deal
    selected?: boolean
    onClick?: () => void
    onDelete?: () => void
    showDelete?: boolean
}) {
    return (
        <div
            onClick={onClick}
            className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium
                transition-all cursor-pointer select-none
                ${selected
                    ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }
                ${!onClick ? 'cursor-default' : ''}
            `}
        >
            <Tag className="w-3 h-3" />
            <span>{deal.dealCoupon}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${selected ? 'bg-teal-500 text-white' : 'bg-purple-100 text-purple-700'}`}>
                {deal.percentage}%
            </span>
            {showDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                    className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    )
}

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize,
}: {
    currentPage: number
    totalPages: number
    onPageChange: (p: number) => void
    totalItems: number
    pageSize: number
}) {
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalItems)

    const pages: (number | '…')[] = []
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
            pages.push(i)
        } else if (pages[pages.length - 1] !== '…') {
            pages.push('…')
        }
    }

    return (
        <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-xs text-gray-500">
                {totalItems === 0 ? 'No results' : `Showing ${start}–${end} of ${totalItems}`}
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {pages.map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className="w-7 text-center text-xs text-gray-400">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs border transition
                                ${p === currentPage
                                    ? 'bg-gray-800 text-white border-gray-800'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

const Discount = () => {
    const [products, setProducts] = useState<ProductWithDeal[]>([])
    const [deals, setDeals] = useState<Deal[]>([])

    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [linking, setLinking] = useState(false)
    const [dealCoupon, setDealCoupon] = useState("")
    const [percentage, setPercentage] = useState("")
    const [activeDealId, setActiveDealId] = useState<string | null>(null)
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState("")
    const [filterDeal, setFilterDeal] = useState<FilterDeal>('all')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [productData, dealRes] = await Promise.all([
                    getProductsWithDeals(),
                    getDeals(),
                ])
                if (productData) setProducts(productData)
                if (dealRes.success) setDeals(dealRes.data || [])
            } catch (err) {
                console.error("Error fetching data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase())
            const matchesDeal =
                filterDeal === 'all' ||
                (filterDeal === 'with' && p.dealCoupon) ||
                (filterDeal === 'without' && !p.dealCoupon)
            return matchesSearch && matchesDeal
        })
    }, [products, search, filterDeal])

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE
        return filteredProducts.slice(start, start + PAGE_SIZE)
    }, [filteredProducts, currentPage])

    const activeDeal = deals.find(d => d.id === activeDealId) ?? null

    const stats = useMemo(() => ({
        total: deals.length,
        withDeal: products.filter(p => p.dealCoupon).length,
        withoutDeal: products.filter(p => !p.dealCoupon).length,
        highest: deals.length ? Math.max(...deals.map(d => d.percentage)) : 0,
    }), [deals, products])

    const handleCreateDeal = async () => {
        if (!dealCoupon.trim() || !percentage) return toast.error("Please fill in both fields")
        const pct = Number(percentage)
        if (pct < 1 || pct > 100) return toast.error("Percentage must be between 1 and 100")
        setCreating(true)
        const res = await createDeal({ dealCoupon: dealCoupon.toUpperCase().trim(), percentage: pct })
        setCreating(false)
        if (res.success && res.data) {
            setDeals(prev => [...prev, res.data as Deal])
            setDealCoupon("")
            setPercentage("")
            toast.success("Deal created")
        } else {
            toast.error("Error creating deal")
        }
    }

    const handleLinkDeal = async () => {
        if (!activeDealId) return toast.error("Select a deal first")
        if (selectedProducts.size === 0) return toast.error("Select at least one product")
        setLinking(true)
        const res = await linkDealToProduct({ dealId: activeDealId, productIds: Array.from(selectedProducts) })
        setLinking(false)
        if (res.success) {
            toast.success("Deal applied successfully")
            setSelectedProducts(new Set())
            const refreshed = await getProductsWithDeals()
            if (refreshed) setProducts(refreshed)
        } else {
            toast.error("Error applying deal")
        }
    }

    const handleRemoveDealFromProduct = async (productId: string) => {
        const res = await unlinkDealFromProduct({ productId })

        if (res.success) {
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, dealCoupon: null } : p))
            toast.success("Deal removed")

        } else {

            toast.success("Failed to untlink deal")
        }
    }

    const handleRemoveDealFromSelected = async () => {
        const ids = Array.from(selectedProducts)
        // TODO: batch call your server action for each or a batch endpoint
        setProducts(prev => prev.map(p => ids.includes(p.id!) ? { ...p, dealCoupon: null } : p))
        setSelectedProducts(new Set())
        toast.success(`Deal removed from ${ids.length} product${ids.length > 1 ? 's' : ''}`)
    }

    const toggleProduct = (id: string) => {
        setSelectedProducts(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleAllOnPage = () => {
        const pageIds = paginatedProducts.map(p => p.id!)
        const allSelected = pageIds.every(id => selectedProducts.has(id))
        setSelectedProducts(prev => {
            const next = new Set(prev)
            allSelected ? pageIds.forEach(id => next.delete(id)) : pageIds.forEach(id => next.add(id))
            return next
        })
    }

    const handleFilterChange = (f: FilterDeal) => {
        setFilterDeal(f)
        setCurrentPage(1)
    }

    const handleSearchChange = (val: string) => {
        setSearch(val)
        setCurrentPage(1)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
        )
    }

    const pageIds = paginatedProducts.map(p => p.id!)
    const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selectedProducts.has(id))
    const someOnPageSelected = pageIds.some(id => selectedProducts.has(id))

    return (
        <div className="bg-white">

            <div className="px-4 md:px-8 pt-8 pb-12 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <StatCard label="Total deals" value={stats.total} />
                    <StatCard label="Products with deal" value={stats.withDeal} />
                    <StatCard label="Without deal" value={stats.withoutDeal} />
                    <StatCard label="Highest discount" value={`${stats.highest}%`} />
                </div>

                {/* Create deal */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                    <h2 className="text-sm font-semibold  uppercase tracking-wider mb-4">Create new deal</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Coupon code (e.g. WINTER50)"
                                value={dealCoupon}
                                onChange={(e) => setDealCoupon(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateDeal()}
                                className="pl-9 bg-gray-50 uppercase"
                            />
                        </div>
                        <div className="relative sm:w-44">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Percentage"
                                type="number"
                                min={1}
                                max={100}
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateDeal()}
                                className="pl-9 bg-gray-50"
                            />
                        </div>
                        <Button
                            onClick={handleCreateDeal}
                            disabled={creating}
                            className="bg-gray-900 text-white hover:bg-gray-700 shrink-0"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create deal"}
                        </Button>
                    </div>
                </div>

                {/* Deal selector */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">
                        Select a deal to assign
                    </h2>
                    {deals.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {deals.map(deal => (
                                <DealChip
                                    key={deal.id}
                                    deal={deal}
                                    selected={activeDealId === deal.id}
                                    onClick={() => setActiveDealId(prev => prev === deal.id ? null : deal.id)}
                                    showDelete
                                    onDelete={async () => {
                                        try {
                                            const res = await fetch(`/api/discount/${deal.id}`, {
                                                method: "DELETE",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ dealId: deal.id }),
                                            });

                                            if (!res.ok) throw new Error("Request failed");

                                            const data = await res.json();
                                            if (data.success) {
                                                setDeals(prev => prev.filter(d => d.id !== deal.id));
                                                if (activeDealId === deal.id) setActiveDealId(null);
                                                toast.success("Deal deleted");
                                            } else {
                                                toast.error("Failed to delete deal");
                                            }
                                        } catch (error) {
                                            setDeals(deals!);
                                            toast.error("Failed to delete deal...");
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No deals yet — create one above.</p>
                    )}
                </div>

                {/* Active deal banner */}
                {activeDeal && (
                    <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-800">
                        <Tag className="w-4 h-4 shrink-0" />
                        <span>
                            Assigning <strong>{activeDeal.dealCoupon}</strong> ({activeDeal.percentage}% off) — select products below and click <strong>Apply deal</strong>
                        </span>
                        <button onClick={() => setActiveDealId(null)} className="ml-auto text-teal-500 hover:text-teal-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Products table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                    {/* Table toolbar */}
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'with', 'without'] as FilterDeal[]).map(f => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition
                                        ${filterDeal === f
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {f === 'all' ? 'All products' : f === 'with' ? 'With deal' : 'No deal'}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9 bg-gray-50 text-sm"
                            />
                        </div>
                    </div>

                    {/* Bulk action bar */}
                    {selectedProducts.size > 0 && (
                        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-blue-700 font-medium">
                                {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
                            </span>
                            <Button
                                size="sm"
                                onClick={handleLinkDeal}
                                disabled={linking || !activeDealId}
                                className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                            >
                                {linking ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply deal"}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleRemoveDealFromSelected}
                                className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            >
                                Remove deal
                            </Button>
                            <button
                                onClick={() => setSelectedProducts(new Set())}
                                className="ml-auto text-xs text-blue-500 hover:underline"
                            >
                                Clear selection
                            </button>

                            {/* Set deal time span */}
                            {activeDealId && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                            <Calendar className="w-3 h-3" /> Set dates
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Set time span for this deal</AlertDialogTitle>
                                            <div className="mt-3">
                                                <DatePicker selectedDealId={activeDealId} />
                                            </div>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Done</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 text-[10px] uppercase tracking-widest">

                                    <TableHead className="w-10">
                                        <input
                                            type="checkbox"
                                            checked={allOnPageSelected}
                                            ref={el => { if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected }}
                                            onChange={toggleAllOnPage}
                                            className="accent-teal-600 w-4 h-4 cursor-pointer"
                                        />
                                    </TableHead>
                                    <TableHead className="w-12">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Deal</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                                    {paginatedProducts.length > 0 ? (
                                        paginatedProducts.map(product => {
                                            const isSelected = selectedProducts.has(product.id!)
                                            return (
                                                <TableRow
                                                    key={product.id}
                                                    className={`transition ${isSelected ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                                >
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleProduct(product.id!)}
                                                            className="accent-teal-600 w-4 h-4 cursor-pointer"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.imageUrl ? (
                                                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                                <IKImage
                                                                    path={product.imageUrl}
                                                                    alt={product.productName}
                                                                    className="object-contain w-full h-full"
                                                                    width={36}
                                                                    height={36}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-lg bg-gray-100" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900 text-sm">
                                                        {product.productName}
                                                    </TableCell>
                                                    <TableCell className="text-gray-500 text-sm capitalize">
                                                        {product.productType || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-gray-500 text-sm">
                                                        {product.category || "—"}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-gray-900 text-sm">
                                                        R{product.price?.toFixed(2) ?? "0.00"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.dealCoupon ? (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">
                                                                {product.dealCoupon}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No deal</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Edit discount price inline */}
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-gray-500 hover:text-gray-900"
                                                                onClick={() => {
                                                                    const val = prompt("Enter new discount price:", product.discountPrice?.toString())
                                                                    if (val === null) return
                                                                    const num = parseFloat(val)
                                                                    if (isNaN(num)) return toast.error("Invalid price")
                                                                    // TODO: call your updateDiscountPrice({ productId: product.id, discountPrice: num })
                                                                    setProducts(prev => prev.map(p =>
                                                                        p.id === product.id ? { ...p, discountPrice: num } : p
                                                                    ))
                                                                    toast.success("Discount price updated")
                                                                }}
                                                            >
                                                                Edit price
                                                            </Button>
                                                            {/* Remove deal */}
                                                            {product.dealCoupon && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleRemoveDealFromProduct(product.id!)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-12 text-gray-400">
                                                No products match your filters
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </ImageKitProvider>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-4 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredProducts.length}
                            pageSize={PAGE_SIZE}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Discount