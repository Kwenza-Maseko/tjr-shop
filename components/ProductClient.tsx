'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProductStore } from "@/lib/store/productStore";
import config from "@/lib/config";
import { IKImage, ImageKitProvider } from "imagekitio-next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrUpdateCart } from "@/lib/store/cart";
import { getProductById, ProductWithDeal } from "@/lib/store/deals";
import { resolveEffectivePrice } from "@/lib/price";
import { Star, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const { urlEndpoint, publicKey } = config.env.imagekit;

// ─── Color name → hex ────────────────────────────────────────────────────────
const COLOR_HEX: Record<string, string> = {
    black: '#000000', white: '#ffffff', red: '#ff0000', blue: '#0000ff',
    green: '#008000', yellow: '#ffff00', gray: '#808080', grey: '#808080',
    purple: '#800080', orange: '#ff6600', pink: '#ff69b4', brown: '#8b4513',
    navy: '#001f5b', teal: '#008080', maroon: '#800000', beige: '#f5f0dc',
}
const getSwatchBg = (color: string) => COLOR_HEX[color.toLowerCase()] ?? color

// ─── Slider ───────────────────────────────────────────────────────────────────
function ProductImageSlider({
    thumbnail,
    slideImages,
    productName,
}: {
    thumbnail: string
    slideImages: string[]
    productName: string
}) {
    // All images: thumbnail first, then the rest of the slides
    const allImages = [thumbnail, ...slideImages.filter(s => s !== thumbnail)]
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => { setActiveIndex(0) }, [thumbnail])

    const prev = () => setActiveIndex(i => (i - 1 + allImages.length) % allImages.length)
    const next = () => setActiveIndex(i => (i + 1) % allImages.length)

    return (
        <div className="flex flex-col gap-3 w-full">

            {/* ── Big active image ── */}
            <div className="relative overflow-hidden rounded-xl bg-muted/10 w-full aspect-square">
                <IKImage
                    key={allImages[activeIndex]}
                    path={allImages[activeIndex]}
                    alt={`${productName} — view ${activeIndex + 1}`}
                    className="object-cover w-full h-full custom-light-shadow-box"
                    loading="eager"
                    width={500}
                    height={500}
                />

                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors z-10"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors z-10"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-4 h-4 text-zinc-700" />
                        </button>
                    </>
                )}
            </div>

            {/* ── Small thumbnail strip — click to replace main image ── */}
            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {allImages.map((path, i) => (
                        <button
                            key={path + i}
                            onClick={() => setActiveIndex(i)}
                            className={cn(
                                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                i === activeIndex
                                    ? "border-black opacity-100 scale-105"
                                    : "border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400"
                            )}
                            aria-label={`View ${i + 1}`}
                        >
                            <IKImage
                                path={path}
                                alt={`${productName} ${i + 1}`}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
// ─── Main component ───────────────────────────────────────────────────────────
const ProductClient = ({ userId }: { userId: string }) => {
    const { id } = useParams<{ id: string }>()
    const { selectedProduct } = useProductStore()
    const [product, setProduct] = useState<ProductWithDeal | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [productQty, setProductQty] = useState<number>(0)

    useEffect(() => {
        // Always fetch from DB so sizes are guaranteed to be included.
        // The store's selectedProduct never carries sizes (it's set on the
        // listing page before navigation), so we can't rely on it here.
        setProduct(null)
        setSelectedColor(null)
        setSelectedSize(null)
        setProductQty(0)

        getProductById(id).then(data => {
            if (data) setProduct(data)
        })
    }, [id])

    if (!product) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-400 text-sm animate-pulse">Loading product…</p>
        </div>
    )

    const { effectivePrice, originalPrice, badge } = resolveEffectivePrice(
        product.price,
        product.discountPrice,
        product.dealPercentage
    )
    const hasDiscount = effectivePrice < originalPrice
    const pctOff = hasDiscount ? Math.round((1 - effectivePrice / originalPrice) * 100) : 0

    // Build image list: slideImages first, fall back to thumbnail only
    const sliderImages: string[] =
        Array.isArray(product.slideImages) && product.slideImages.length > 0
            ? product.slideImages
            : [product.imageUrl]

    // Colors from the array field
    const colors: string[] =
        Array.isArray(product.color) && product.color.length > 0
            ? product.color
            : []

    const handleAddToCart = async () => {
        if (!selectedColor || !selectedSize) {
            toast.error("Please select both color and size before adding to cart.")
            return
        }
        if (!product?.id) { toast.error("Invalid product"); return }
        if (!product.imageUrl) { toast.error("Product image missing"); return }

        try {
            await createOrUpdateCart({
                userId,
                productId: product.id,
                imageUrl: product.imageUrl,
                quantity: 1,
                priceSnapshot: originalPrice.toFixed(2),
                discountSnapshot: effectivePrice ? effectivePrice.toFixed(2) : null,
                selectedOptions: { color: selectedColor, size: selectedSize },
            })
            toast.success(`${product.productName} added to cart`)
        } catch (error) {
            console.error(error)
            toast.error("Failed to add item to cart")
        }
    }

    const ProductHeader = () => (
        <>
            <h1 className="text-xl font-semibold">{product.productName}</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.productType}</p>
            {product.rating && (
                <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] text-zinc-400">
                        {product.rating.toFixed(1)}
                        {product.reviewCount != null && product.reviewCount > 0 && ` (${product.reviewCount})`}
                    </span>
                </div>
            )}
        </>
    )

    return (
        <div className="w-full p-6 md:mt-8">
            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                <div className="flex flex-col lg:flex-row gap-8 md:gap-18 mx-auto">

                    {/* Mobile header */}
                    <div className="block lg:hidden">
                        <ProductHeader />
                    </div>

                    {/* ── Image slider ──────────────────────────────────── */}
                    {/* ── Image section ──────────────────────────────────── */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <ProductImageSlider
                            thumbnail={product.imageUrl}
                            slideImages={Array.isArray(product.slideImages) ? product.slideImages : []}
                            productName={product.productName}
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 flex-1">
                        <div className="space-y-5 w-full md:w-[450px]">

                            {/* Desktop header */}
                            <div className="hidden lg:block">
                                <ProductHeader />
                            </div>

                            {/* ── Pricing ───────────────────────────────── */}
                            <div>
                                <div className="flex gap-4 items-end">
                                    {hasDiscount && (
                                        <p className="text-green-600 text-lg md:text-2xl">-{pctOff}%</p>
                                    )}
                                    {badge === 'deal' && product.dealCoupon && (
                                        <span className="flex items-center gap-1 text-[11px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                                            <Tag className="w-3 h-3" />
                                            {product.dealCoupon}
                                        </span>
                                    )}
                                    <div className="text-xs font-semibold flex gap-0.5 mt-2">
                                        <p className="mt-1 text-xs">R</p>
                                        <p className="text-lg md:text-2xl">{effectivePrice}</p>
                                    </div>
                                </div>
                                {hasDiscount && (
                                    <p className="text-xs text-zinc-600">
                                        Original: <span className="font-semibold line-through">R{originalPrice}</span>
                                    </p>
                                )}
                                <p className={cn(
                                    "font-semibold py-1 px-2 w-fit mt-3 text-[11px] rounded-full uppercase",
                                    product.isActive
                                        ? "text-green-700 bg-green-100 border border-green-300"
                                        : "text-red-700 bg-red-100 border border-red-300 line-through"
                                )}>
                                    {product.isActive ? "On Stock" : "Out Of Stock"}
                                </p>
                            </div>

                            <div className="w-full h-px bg-gray-200" />

                            {/* ── Colors ────────────────────────────────── */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3">
                                    Color
                                    {selectedColor && (
                                        <span className="ml-2 font-normal text-zinc-500 capitalize">
                                            — {selectedColor}
                                        </span>
                                    )}
                                </h3>
                                {colors.length === 0 ? (
                                    <p className="text-xs text-zinc-400">No colors available</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                title={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 cursor-pointer transition-all relative flex items-center justify-center",
                                                    selectedColor === color
                                                        ? "border-black scale-110 shadow-md"
                                                        : "border-zinc-200 hover:border-zinc-400",
                                                    color.toLowerCase() === 'white' && "outline outline-1 outline-zinc-200"
                                                )}
                                                style={{ backgroundColor: getSwatchBg(color) }}
                                            >
                                                {selectedColor === color && (
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full block"
                                                        style={{
                                                            backgroundColor: ['white', 'yellow', 'beige'].includes(color.toLowerCase())
                                                                ? '#000' : '#fff'
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Sizes ─────────────────────────────────── */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Size</p>
                                {product.sizes && product.sizes.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map(s => (
                                            <button
                                                key={s.id}
                                                disabled={!s.isAvailable}
                                                onClick={() => {
                                                    setSelectedSize(s.size)
                                                    setProductQty(s.quantity)
                                                }}
                                                className={cn(
                                                    "px-4 py-2 text-sm font-medium rounded-xl border transition-colors",
                                                    s.isAvailable
                                                        ? selectedSize === s.size
                                                            ? "bg-black text-white border-black"
                                                            : "bg-white text-zinc-700 border-zinc-200 hover:border-black hover:bg-zinc-50"
                                                        : "bg-zinc-50 text-zinc-300 border-zinc-100 line-through cursor-not-allowed"
                                                )}
                                            >
                                                {s.size}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-400">No sizes available</p>
                                )}

                                {productQty > 0 && (
                                    <div className="p-2 bg-zinc-100 border-l-2 border-red-400">
                                        <p className="text-[11px] text-red-500">{productQty} Units Left</p>
                                    </div>
                                )}
                            </div>

                            {/* ── Add to cart ───────────────────────────── */}
                            <Button
                                className="w-full py-6"
                                disabled={!selectedColor || !selectedSize}
                                onClick={handleAddToCart}
                            >
                                Add To Cart
                            </Button>

                            <div className="w-full h-px bg-gray-200" />

                            {/* ── About ─────────────────────────────────── */}
                            <div className="mt-3">
                                <h4 className="text-lg font-semibold">About This Item</h4>
                                <div className="space-y-0.5 mt-3">
                                    <p className="text-sm mb-6 font-semibold">{product.description}</p>
                                    <div className="flex gap-3">
                                        <div className="w-[150px] font-bold space-y-2 text-sm">
                                            <p>Product Type:</p>
                                            <p>Product Target:</p>
                                            <p>Brand:</p>
                                            <p>Weight:</p>
                                        </div>
                                        <div className="capitalize space-y-2 text-sm">
                                            <p>{product.productType}</p>
                                            <p>{product.productTarget}</p>
                                            <p>{product.brand ?? "No Name"}</p>
                                            <p>{product.weight ?? "Not Specified"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Shipping info ──────────────────────────────── */}
                        <div className="w-full lg:w-[350px] lg:mt-0 mt-8 rounded-xl border border-zinc-200 bg-white shadow-sm p-4 md:p-6 self-start">
                            <h6 className="text-base font-semibold text-zinc-800">
                                This price applies specifically to this item — delivery fee not included.
                            </h6>
                            <p className="mt-1 text-sm text-zinc-500">
                                Any applicable delivery fee will be communicated by the runner.
                            </p>
                            <div className="mt-4 bg-green-50 text-sm space-y-2 p-4 rounded-md">
                                <h6 className="font-semibold text-green-900 mb-3 text-lg">Seller Information</h6>
                                <p className="text-green-800">TJR Shop — Runner</p>
                                <p className="text-green-800">Contact: tjr.shoponline@gmail.com</p>
                                <p className="text-green-800">Based in: Durban, South Africa</p>
                            </div>
                            <div className="mt-4 border-t border-zinc-100 pt-4">
                                <div className="flex gap-6 text-sm">
                                    <div className="font-medium text-zinc-700 space-y-2">
                                        <p>Sold By</p>
                                        <p>Returns</p>
                                        <p>Help</p>
                                    </div>
                                    <div className="text-zinc-600 space-y-2">
                                        <p className="font-semibold text-zinc-800">TJR Shop</p>
                                        <p>30-day refund or replacement</p>
                                        <a href="mailto:tjr.shoponline@gmail.com" className="text-blue-600 hover:underline">
                                            tjr.shoponline@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4 text-sm text-zinc-600 space-y-2">
                                <p>✅ 100% Authentic Product</p>
                                <p>🔒 Secure Payments Accepted</p>
                                <p>🚚 Estimated delivery: <span className="font-medium">10–15 business days</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </ImageKitProvider>
        </div>
    )
}

export default ProductClient;