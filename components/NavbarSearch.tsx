'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import config from '@/lib/config'
import { IKImage, ImageKitProvider } from "imagekitio-next"



interface SearchProduct {
    id: string
    productName: string
    imageUrl?: string | null
    productTarget: string
    category: string
    price: string | number
    discountPrice?: string | number | null
}

const { urlEndpoint, publicKey } = config.env.imagekit

export default function NavSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchProduct[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [showInput, setShowInput] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<NodeJS.Timeout | 0>(0)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false)
                setShowInput(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Debounced search
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([])
            setOpen(false)
            return
        }

        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                setResults(data.results ?? [])
                setOpen(true)
            } catch {
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(debounceRef.current)
    }, [query])

    const handleIconClick = () => {
        setShowInput(true)
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const handleResultClick = () => {
        setOpen(false)
        setShowInput(false)
        setQuery('')
        setResults([])
    }

    return (
        <div ref={wrapperRef} className="relative flex items-center">

            {showInput ? (
                <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white w-56 md:w-72">
                    {loading
                        ? <Loader2 className="w-4 h-4 text-zinc-400 animate-spin flex-none" />
                        : <Search className="w-4 h-4 text-zinc-400 flex-none" />
                    }
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 text-sm outline-none bg-transparent text-zinc-800 placeholder:text-zinc-400"
                    />
                    {query && (
                        <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }}>
                            <X className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-700" />
                        </button>
                    )}
                </div>
            ) : (
                <button
                    onClick={handleIconClick}
                    aria-label="Search"
                    className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                    <Search className="w-5 h-5 text-zinc-600" />
                </button>
            )}

            {/* Dropdown results */}
            {open && results.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-white border border-zinc-200 rounded-xl shadow-lg z-[200] overflow-hidden">
                    <div className="p-2 border-b border-zinc-100">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 px-2">
                            {results.length} result{results.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <ul className="max-h-80 overflow-y-auto divide-y divide-zinc-50">
                        <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                            {results.map(product => {
                                const href = `/product/${product.id}`
                                const price = Number(product.price)
                                const dealPrice = product.discountPrice ? Number(product.discountPrice) : null

                                return (
                                    <li key={product.id}>
                                        <Link
                                            href={href}
                                            onClick={handleResultClick}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 transition-colors"
                                        >
                                            {/* Product image */}
                                            <div className="w-10 h-10 flex-none rounded-lg bg-zinc-100 overflow-hidden relative">
                                                {product.imageUrl?.trim() && (
                                                    <IKImage
                                                        path={product.imageUrl}
                                                        alt={product.productName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}

                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-800 truncate">
                                                    {product.productName}
                                                </p>
                                                <p className="text-[11px] text-zinc-400 capitalize">
                                                    {product.productTarget} · {product.category}
                                                </p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right flex-none">
                                                {dealPrice ? (
                                                    <>
                                                        <p className="text-sm font-medium text-zinc-900">R{dealPrice.toFixed(2)}</p>
                                                        <p className="text-[11px] text-zinc-400 line-through">R{price.toFixed(2)}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm font-medium text-zinc-900">R{price.toFixed(2)}</p>
                                                )}
                                            </div>
                                        </Link>
                                    </li>

                                )
                            })}
                        </ImageKitProvider>
                    </ul>

                    {/* View all results link */}
                    <div className="border-t border-zinc-100 p-2">
                        <Link
                            href={`/store/search?q=${encodeURIComponent(query)}`}
                            onClick={handleResultClick}
                            className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 py-1.5 transition-colors"
                        >
                            View all results for &quot;{query}&quot;
                        </Link>
                    </div>
                </div>
            )}

            {/* No results state */}
            {open && results.length === 0 && !loading && query.length >= 2 && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-zinc-200 rounded-xl shadow-lg z-[200] p-6 text-center">
                    <p className="text-sm text-zinc-400">No products found for &quot;{query}&quot;</p>
                </div>
            )}
        </div>
    )
}