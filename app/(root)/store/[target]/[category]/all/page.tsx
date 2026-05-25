'use client'
import React, { use, useEffect, useState, useCallback } from "react"
import { IKImage, ImageKitProvider } from "imagekitio-next"
import config from "@/lib/config"
import Link from "next/link"
import { useFilter } from "@/components/FilterContext"
import { useProductStore } from "@/lib/store/productStore"
import { PackageX, Star, Tag } from "lucide-react"
import { getAllProductsType, ProductWithDeal } from "@/lib/store/deals"
import { resolveEffectivePrice } from "@/lib/price"

const { urlEndpoint, publicKey } = config.env.imagekit


interface RouteParams { target: string; category: string; }
interface Props { params: Promise<RouteParams> }

export default function AllCategory({ params }: Props) {
    const { target, category } = use(params) as RouteParams
    const [products, setProducts] = useState<ProductWithDeal[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const { brand, color, priceRange } = useFilter()
    const priceFilter = (() => {
        if (priceRange === "R0 - R500") return { priceMin: 0, priceMax: 500 }
        if (priceRange === "R500 - R1000") return { priceMin: 500, priceMax: 1000 }
        if (priceRange === "R1000+") return { priceMin: 1000 }
        return undefined
    })()

    const formattedCategory = category.replace(/-/g, " ")

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getAllProductsType(
                formattedCategory,
                target,
                {
                    brand: brand || undefined,
                    color: color || undefined,
                    ...priceFilter
                }
            )

            if (result) {
                setProducts(result.products)
                setTotal(result.total)
                useProductStore.getState().setProducts(result.products)
            } else {
                setProducts([])
                setTotal(0)
            }
        } finally {
            setLoading(false)
        }
    }, [formattedCategory, target, brand, color, priceRange])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    return (
        <div className="p-4 md:p-10 space-y-5">
            {/* Header */}
            <div className="flex items-end justify-between">
                {!loading && (
                    <p className="text-xs text-muted-foreground">
                        {total} result{total !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse space-y-2">
                            <div className="bg-muted rounded-xl h-[200px] md:h-[260px]" />
                            <div className="h-3 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <PackageX className="w-10 h-10 opacity-30" />
                    <p className="text-sm">No products found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                </div>
            )}

            {!loading && products.length > 0 && (
                <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {products.map(product => {
                            const { effectivePrice, originalPrice, badge } =
                                resolveEffectivePrice(product.price, product.discountPrice, product.dealPercentage)
                            const hasDiscount = effectivePrice < originalPrice
                            const pctOff = hasDiscount
                                ? Math.round((1 - effectivePrice / originalPrice) * 100)
                                : 0

                            return (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={() => useProductStore.getState().setSelectedProduct(product)}
                                    className="group"
                                >
                                    <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
                                        <IKImage
                                            path={product.imageUrl}
                                            alt={product.productName || "Product"}
                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                            width={300}
                                            height={300}
                                        />

                                        {/* Deal badge */}
                                        {badge === 'deal' && (
                                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                <Tag className="w-2.5 h-2.5" />
                                                DEAL
                                            </div>
                                        )}

                                        {/* % off badge */}
                                        {hasDiscount && (
                                            <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                -{pctOff}%
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-2.5 space-y-1 px-0.5">
                                        <div className="flex items-start justify-between gap-1">
                                            <p className="text-sm font-medium leading-snug truncate flex-1">
                                                {product.productName}
                                            </p>
                                            {product.brand && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex-shrink-0 capitalize">
                                                    {product.brand}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-muted-foreground truncate hidden md:block capitalize">
                                            {product.productTarget}
                                        </p>

                                        {product.rating > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="text-[11px] text-muted-foreground">
                                                    {product.rating}
                                                    {product.reviewCount > 0 && ` (${product.reviewCount})`}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-base font-bold">R{effectivePrice}</span>
                                            {hasDiscount && (
                                                <span className="text-xs text-muted-foreground line-through">
                                                    R{originalPrice}
                                                </span>
                                            )}
                                        </div>

                                        {/* Show deal coupon label if applicable */}
                                        {badge === 'deal' && product.dealCoupon && (
                                            <p className="text-[10px] text-red-500 font-medium">
                                                {product.dealCoupon}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </ImageKitProvider>
            )}
        </div>
    )
}