'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { IKImage, ImageKitProvider } from "imagekitio-next"
import config from "@/lib/config"

const { urlEndpoint, publicKey } = config.env.imagekit

interface DealProduct {
  id?: string
  productName: string
  imageUrl?: string
  price?: number
  discountPrice?: number
  dealCoupon?: string | null
}

const DealsSlider = ({ products }: { products: DealProduct[] }) => {
  // 👉 Only products WITH deals
  const dealProducts = useMemo(
    () => products.filter(p => p.dealCoupon),
    [products]
  )

  const sliderRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!sliderRef.current || paused) return

    const slider = sliderRef.current
    let scrollAmount = 0

    const interval = setInterval(() => {
      slider.scrollLeft += 1
      scrollAmount += 1

      // Loop back smoothly
      if (scrollAmount >= slider.scrollWidth / 2) {
        slider.scrollLeft = 0
        scrollAmount = 0
      }
    }, 30) // 👈 slow & smooth speed

    return () => clearInterval(interval)
  }, [paused])

  if (dealProducts.length === 0) return null

  return (
    <div className="w-full py-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        🔥 Hot Deals
      </h2>

      <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
        <div
          ref={sliderRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="flex gap-6 overflow-x-hidden whitespace-nowrap scroll-smooth"
        >
          {[...dealProducts, ...dealProducts].map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="min-w-[220px] bg-white rounded-xl shadow-md p-4 hover:scale-105 transition"
            >
              <div className="relative h-32 mb-3">
                {product.imageUrl && (
                  <IKImage
                    path={product.imageUrl}
                    alt={product.productName}
                    className="object-contain h-full w-full"
                  />
                )}
                <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {product.dealCoupon}
                </span>
              </div>

              <h3 className="text-sm font-semibold truncate">
                {product.productName}
              </h3>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-gray-400 line-through text-xs">
                  R{product.price?.toFixed(2)}
                </span>
                <span className="text-green-600 font-bold text-sm">
                  R{product.discountPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ImageKitProvider>
    </div>
  )
}

export default DealsSlider
