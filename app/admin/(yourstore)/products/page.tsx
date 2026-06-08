'use client'

import config from '@/lib/config';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ProductParams } from '@/types';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteProduct } from '@/lib/store/product';
import CreateOrUpdateProduct from '@/components/Shop/CreateOrUpdateProduct';
import { Loader2, Trash2, Plus, Search, Package } from 'lucide-react';
import { toast } from 'sonner';

const { urlEndpoint, publicKey } = config.env.imagekit;

const PAGE_SIZE = 20

// ─── Sidebar list item ────────────────────────────────────────────────────────

const ProductListItem = ({
    product,
    isSelected,
    onSelect,
    onDelete,
    deleteLoading,
}: {
    product: ProductParams
    isSelected: boolean
    onSelect: () => void
    onDelete: () => void
    deleteLoading: boolean
}) => (
    <li
        onClick={onSelect}
        className={`group flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition-colors
      ${isSelected ? 'bg-black text-white' : 'hover:bg-muted/60 text-gray-700'}`}
    >
        <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted border border-border">
                <IKImage
                    path={product.imageUrl}
                    alt={product.productName}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                    loading="lazy"
                />
            </div>
            <div className="min-w-0">
                <p className={`text-xs font-medium truncate leading-none
          ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                    {product.productName}
                </p>
                <p className={`text-[10px] font-mono mt-0.5 truncate
          ${isSelected ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {product.sku}
                </p>
            </div>
        </div>

        <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            disabled={deleteLoading}
            className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
        ${isSelected
                    ? 'hover:bg-white/20 text-white'
                    : 'hover:bg-red-100 text-red-500'}`}
        >
            {deleteLoading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Trash2 className="w-3 h-3" />}
        </button>
    </li>
)

// ─── Main page ────────────────────────────────────────────────────────────────

const ProductsPage = () => {
    const [products, setProducts] = useState<ProductParams[]>([])
    const [selectedProduct, setSelectedProduct] = useState<ProductParams | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [sidebarLoading, setSidebarLoading] = useState(false)
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchProducts = useCallback(async (q: string, p: number) => {
        setSidebarLoading(true)
        try {
            const res = await fetch(
                `/api/products?search=${encodeURIComponent(q)}&page=${p}&limit=${PAGE_SIZE}`
            )
            const json = await res.json()
            if (json.success) {
                setProducts(json.data)
                setTotal(json.total)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSidebarLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProducts(search, page)
    }, [page])

    const handleSearch = (value: string) => {
        setSearch(value)
        setPage(1)
        if (searchTimeout.current) clearTimeout(searchTimeout.current)  
        searchTimeout.current = setTimeout(() => {
            fetchProducts(value, 1)
        }, 300)
    }

    const handleFormSuccess = (newProduct: ProductParams, action: 'create' | 'update') => {
        if (action === 'create') {
            setProducts(prev => [newProduct, ...prev])
            setTotal(t => t + 1)
        } else {
            setProducts(prev => prev.map(p => p.id === newProduct.id ? newProduct : p))
        }
        setSelectedProduct(action === 'update' ? newProduct : null)
        toast.success(action === 'create' ? 'Product created' : 'Product updated')
    }

    const handleDelete = async (product: ProductParams) => {
        if (!product.id) return
        setDeletingId(product.id)
        const result = await deleteProduct(product.id)
        setDeletingId(null)

        if (result.success) {
            toast.success('Product deleted')
            setProducts(prev => prev.filter(p => p.id !== product.id))
            setTotal(t => t - 1)
            if (selectedProduct?.id === product.id) setSelectedProduct(null)
        } else {
            toast.error(result.message || 'Failed to delete')
        }
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
            <div className="flex ">

                {/* ── Sidebar ─────────────────────────────────────────────────────── */}
                <div className="w-[240px] flex-shrink-0 flex flex-col border-r border-border bg-white">

                    {/* New product button */}
                    <div className="p-3 border-b border-border">
                        <Button
                            className="w-full h-8 text-xs font-medium bg-black hover:bg-black/80 text-white rounded-lg"
                            onClick={() => setSelectedProduct(null)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" /> New Product
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                                className="pl-8 h-7 text-xs rounded-lg"
                                placeholder="Search products…"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Count */}
                    <div className="px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {total} product{total !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto px-2">
                        {sidebarLoading ? (
                            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-xs">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Loading…
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                                <Package className="w-8 h-8 opacity-30" />
                                <p className="text-xs">No products found</p>
                            </div>
                        ) : (
                            <ul className="space-y-1 pb-4">
                                {products.map(product => (
                                    <ProductListItem
                                        key={product.id}
                                        product={product}
                                        isSelected={selectedProduct?.id === product.id}
                                        onSelect={() => setSelectedProduct(product)}
                                        onDelete={() => handleDelete(product)}
                                        deleteLoading={deletingId === product.id}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-border p-2 flex items-center justify-between">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="text-xs px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                            >
                                ←
                            </button>
                            <p className="text-[10px] text-muted-foreground">
                                {page} / {totalPages}
                            </p>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="text-xs px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Form panel ──────────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto bg-muted/20">
                    {selectedProduct === null && (
                        <div className="px-4 pt-4">
                            <div className="bg-white border border-black/5 rounded-xl px-4 py-3 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm font-medium">New Product</p>
                            </div>
                        </div>
                    )}
                    <div className="p-4">
                        <CreateOrUpdateProduct
                            key={selectedProduct ? selectedProduct.id : 'new'}
                            productToEdit={selectedProduct || undefined}
                            mode={selectedProduct ? 'update' : 'create'}
                            onSuccess={handleFormSuccess}
                        />
                    </div>
                </div>

            </div>
        </ImageKitProvider>
    )
}

export default ProductsPage