// components/Shop/SizeManager.tsx
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, RotateCcw } from 'lucide-react'

interface ProductSize {
    id: string
    size: string
    quantity: number
    isAvailable: boolean
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']

export default function SizeManager({ productId }: { productId: string }) {
    const [sizes, setSizes] = useState<ProductSize[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [newSize, setNewSize] = useState('')
    const [newQty, setNewQty] = useState(1)
    const [customSize, setCustomSize] = useState('')

    const fetchSizes = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/sizes`)
            const data = await res.json()
            setSizes(data.sizes ?? [])
        } catch {
            toast.error('Failed to load sizes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchSizes() }, [productId])

    const totalStock = sizes.reduce((sum, s) => sum + s.quantity, 0)

    const handleAdd = async () => {
        const sizeToAdd = customSize.trim() || newSize
        if (!sizeToAdd) { toast.error('Select or enter a size'); return }
        if (newQty < 0) { toast.error('Quantity must be 0 or more'); return }

        setAdding(true)
        try {
            const res = await fetch(`/api/products/${productId}/sizes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ size: sizeToAdd, quantity: newQty }),
            })
            const data = await res.json()
            if (res.ok) {
                setSizes(prev => [...prev, data.data])
                setNewSize('')
                setNewQty(1)
                setCustomSize('')
                toast.success(`Size ${sizeToAdd} added`)
            } else {
                toast.error(data.error ?? 'Failed to add size')
            }
        } catch {
            toast.error('Network error')
        } finally {
            setAdding(false)
        }
    }

    const handleQtyChange = async (sizeId: string, quantity: number) => {
        setSizes(prev => prev.map(s =>
            s.id === sizeId ? { ...s, quantity, isAvailable: quantity > 0 } : s
        ))
        try {
            await fetch(`/api/products/${productId}/sizes/${sizeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
            })
        } catch {
            toast.error('Failed to update quantity')
            fetchSizes()
        }
    }

    const handleToggleAvailable = async (sizeId: string, current: boolean) => {
        setSizes(prev => prev.map(s =>
            s.id === sizeId ? { ...s, isAvailable: !current } : s
        ))
        try {
            await fetch(`/api/products/${productId}/sizes/${sizeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !current }),
            })
        } catch {
            toast.error('Failed to update availability')
            fetchSizes()
        }
    }

    const handleDelete = async (sizeId: string, size: string) => {
        setSizes(prev => prev.filter(s => s.id !== sizeId))
        try {
            await fetch(`/api/products/${productId}/sizes/${sizeId}`, {
                method: 'DELETE',
            })
            toast.success(`Size ${size} removed`)
        } catch {
            toast.error('Failed to delete size')
            fetchSizes()
        }
    }

    if (loading) return (
        <div className="space-y-2">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
        </div>
    )

    return (
        <div className="space-y-4">

            {/* Total stock badge */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                    Total stock: <span className="font-medium text-zinc-900">{totalStock} units</span>
                </p>
                <button
                    type="button"
                    onClick={fetchSizes}
                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Existing sizes */}
            {sizes.length > 0 && (
                <div className="space-y-2">
                    {sizes.map(s => (
                        <div
                            key={s.id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                                s.isAvailable
                                    ? 'border-zinc-200 bg-white'
                                    : 'border-zinc-100 bg-zinc-50'
                            }`}
                        >
                            {/* Size label */}
                            <span className={`w-12 text-sm font-medium text-center ${
                                s.isAvailable ? 'text-zinc-900' : 'text-zinc-400 line-through'
                            }`}>
                                {s.size}
                            </span>

                            {/* Quantity input */}
                            <div className="flex items-center gap-1.5 flex-1">
                                <button
                                    type="button"
                                    onClick={() => handleQtyChange(s.id, Math.max(0, s.quantity - 1))}
                                    className="w-6 h-6 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 flex items-center justify-center text-sm"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={0}
                                    value={s.quantity}
                                    onChange={e => handleQtyChange(s.id, Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-14 text-center text-sm border border-zinc-200 rounded px-1 py-0.5 outline-none focus:border-zinc-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleQtyChange(s.id, s.quantity + 1)}
                                    className="w-6 h-6 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-100 flex items-center justify-center text-sm"
                                >
                                    +
                                </button>
                            </div>

                            {/* Available toggle */}
                            <button
                                type="button"
                                onClick={() => handleToggleAvailable(s.id, s.isAvailable)}
                                className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-colors ${
                                    s.isAvailable
                                        ? 'border-green-200 bg-green-50 text-green-700'
                                        : 'border-zinc-200 bg-zinc-100 text-zinc-500'
                                }`}
                            >
                                {s.isAvailable ? 'Available' : 'Sold out'}
                            </button>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() => handleDelete(s.id, s.size)}
                                className="text-zinc-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add new size */}
            <div className="border border-dashed border-zinc-200 rounded-lg p-3 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Add size</p>

                {/* Quick size pills */}
                <div className="flex flex-wrap gap-1.5">
                    {COMMON_SIZES.filter(s => !sizes.find(existing => existing.size === s)).map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setNewSize(s)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                newSize === s
                                    ? 'border-zinc-900 bg-zinc-900 text-white'
                                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Custom size input */}
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Custom size (e.g. 3XL)"
                        value={customSize}
                        onChange={e => { setCustomSize(e.target.value); setNewSize('') }}
                        className="flex-1 text-sm border border-zinc-200 rounded-lg px-3 py-1.5 outline-none focus:border-zinc-400"
                    />
                    <input
                        type="number"
                        min={0}
                        value={newQty}
                        onChange={e => setNewQty(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 text-sm text-center border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-400"
                        placeholder="Qty"
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={adding}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}