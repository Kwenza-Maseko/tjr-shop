'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { IKImage, ImageKitProvider } from "imagekitio-next"
import { Loader2 } from "lucide-react"
import config from "@/lib/config"
import { getProductsWithDeals } from "@/lib/store/deals"

const { urlEndpoint, publicKey } = config.env.imagekit

import { ProductParams } from "@/types"

type ProductWithDeal = ProductParams & {
    dealCoupon?: string | null
}

const DisplayProductWithDeals = () => {
    const [products, setProducts] = useState<ProductWithDeal[]>([])
    const [loading, setLoading] = useState(true)
    const [paused, setPaused] = useState(false)
    const sliderRef = useRef<HTMLDivElement>(null)

    // Fetch products WITH deals
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getProductsWithDeals()
                if (res) setProducts(res)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    // Only products that actually have a deal
    const dealProducts = useMemo(
        () => products.filter(p => p.dealCoupon),
        [products]
    )

    // Auto-slide logic
    useEffect(() => {
        if (!sliderRef.current || paused) return

        const slider = sliderRef.current
        let position = 0

        const interval = setInterval(() => {
            slider.scrollLeft += 1
            position += 1

            // Infinite loop
            if (position >= slider.scrollWidth / 2) {
                slider.scrollLeft = 0
                position = 0
            }
        }, 35) // 👈 slow & smooth

        return () => clearInterval(interval)
    }, [paused])

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-gray-500" />
            </div>
        )
    }

    if (dealProducts.length === 0) return null

    return (
        <div className="w-full py-10 px-4 md:px-8">
            <h1 className='text-2xl md:text-3xl text-center font-medium mb-8'>🔥 Deals You’ll Love</h1>

            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                <div
                    ref={sliderRef}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    className="flex gap-6 overflow-x-hidden scroll-smooth"
                >
                    {[...dealProducts, ...dealProducts].map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            className="min-w-[240px] bg-white rounded-2xl shadow-lg p-4 hover:scale-105 transition"
                        >
                            <div className="relative h-40 mb-3">
                                {product.imageUrl && (
                                    <IKImage
                                        path={product.imageUrl}
                                        alt={product.productName}
                                        width={300}
                                        height={300}
                                        className="object-contain w-full h-full"
                                    />
                                )}

                                <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                                    {product.dealCoupon}
                                </span>
                            </div>

                            <h3 className="font-semibold text-sm truncate">
                                {product.productName}
                            </h3>

                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through">
                                    R{product.price?.toFixed(2)}
                                </span>
                                <span className="text-green-600 font-bold">
                                    R{product.discountPrice?.toFixed(2) || "0.00"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </ImageKitProvider>
        </div>
    )
}

export default DisplayProductWithDeals
