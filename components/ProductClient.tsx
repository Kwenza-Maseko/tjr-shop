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
import { Star, Tag } from "lucide-react";

const { urlEndpoint, publicKey } = config.env.imagekit;

const ProductClient = ({ userId }: { userId: string }) => {

    const { id } = useParams<{ id: string }>()
    const { selectedProduct } = useProductStore()
    const [product, setProduct] = useState<ProductWithDeal | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [productQty, setProductQty] = useState<number>(0);


    const handleQtyDisplay = (qyt: number) => {
        setProductQty(qyt)
    };

    useEffect(() => {
        if (selectedProduct?.id === id) {
            setProduct(selectedProduct as ProductWithDeal)
            return
        }
        const fromStore = useProductStore.getState().getProductById(id)
        if (fromStore) {
            setProduct(fromStore as ProductWithDeal)
            return
        }
        getProductById(id).then(data => {
            if (data) setProduct(data)
        })
    }, [id, selectedProduct]);

    if (!product) return <p className="p-6 text-gray-500">Loading product...</p>

    const { effectivePrice, originalPrice, badge } = resolveEffectivePrice(
        product.price,
        product.discountPrice,
        product.dealPercentage
    )
    const hasDiscount = effectivePrice < originalPrice
    const pctOff = hasDiscount
        ? Math.round((1 - effectivePrice / originalPrice) * 100)
        : 0

    const handleAddToCart = async () => {

        if (!selectedColor || !selectedSize) {
            toast.error("Please select both color and size before adding to cart.");
            return;
        }

        if (!product?.id) {
            toast.error("Invalid product");
            return;
        }

        if (!product.imageUrl) {
            toast.error("Product image missing");
            return;
        }

        try {
            await createOrUpdateCart({
                userId,
                productId: product.id,
                imageUrl: product.imageUrl,
                quantity: 1,
                priceSnapshot: originalPrice.toFixed(2),
                discountSnapshot: effectivePrice
                    ? effectivePrice.toFixed(2)
                    : null,
                selectedOptions: {
                    color: selectedColor,
                    size: selectedSize,
                },
            });

            toast.success(`${product.productName} added to cart`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add item to cart");
        }
    };

    return (
        <div className="w-full p-6 md:mt-8">
            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                <div className="flex flex-col lg:flex-row  gap-8 md:gap-18 mx-auto">
                    <div className="block lg:hidden">
                        <h1 className="text-xl font-semibold">{product.productName}</h1>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.productType}</p>
                        {product.rating && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-amber-400 text-xs">★</span>
                                <span className="text-[11px] text-zinc-400">
                                    {product.rating.toFixed(1)}
                                    {product.reviewCount != null && product.reviewCount > 0 && ` (${product.reviewCount})`}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="w-full h-full md:w-[350px] md:h-[350px]">
                        <IKImage
                            path={product.imageUrl}
                            alt={product.productName || "Product Image"}
                            className="custom-light-shadow-box object-cover w-full h-full"
                            loading="lazy"
                            width={350}
                            height={350}
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6">
                        <div className="space-y-5 w-full md:w-[450px]">
                            <div >
                                <div className="lg:block hidden">
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
                                </div>

                                <div className="flex gap-4 items-end">
                                    {hasDiscount && (
                                        <p className="text-green-600 text-lg md:text-2xl">-{pctOff}%</p>
                                    )}
                                    {/* Deal badge */}
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

                                <div className="flex gap-3 items-center uppercase">
                                    <p
                                        className={`${product.isActive ? "text-green-700 bg-green-100 border-green-300 border" : "text-red-700 bg-red-100 border-red-300 border line-through"
                                            } font-semibold py-1 px-2 w-fit mt-3 text-[11px] rounded-full`}
                                    >
                                        {product.isActive ? "On Stock" : "Out Of Stock"}
                                    </p>
                                </div>

                            </div>

                            <div className="w-full h-[1px] bg-gray-300 " />
                            {/* 🎨 Color Selection */}
                            <div>
                                <h3 className="text-md font-semibold mb-4">
                                    Color
                                    {selectedColor && (
                                        <span className="ml-2 text-sm font-normal text-zinc-500 capitalize">
                                            — {selectedColor}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const variantColors = product.variants?.colors as string[] | undefined
                                        const colors = variantColors?.length
                                            ? variantColors
                                            : product.color
                                                ? [product.color]
                                                : []

                                        if (colors.length === 0) return (
                                            <p className="text-xs text-zinc-400">No colors available</p>
                                        )

                                        return colors.map(color => (
                                            <div
                                                key={color}
                                                title={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all
            ${selectedColor === color
                                                        ? 'border-black scale-110 shadow-md'
                                                        : 'border-zinc-200 hover:border-zinc-400'
                                                    }
            ${color.toLowerCase() === 'white' ? 'outline outline-zinc-200' : ''}
          `}
                                                style={{ backgroundColor: color.toLowerCase() }}
                                            />
                                        ))
                                    })()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="font-semibold">Size</p>

                                {product?.sizes && product.sizes.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((s) => (
                                            <div
                                                key={s.id}>
                                                <button
                                                    disabled={!s.isAvailable}
                                                    onClick={() => (
                                                        setSelectedSize(s.size),
                                                        handleQtyDisplay(s.quantity)
                                                    )}
                                                    className={`
           px-4 py-2 text-sm font-medium rounded-xl border
          ${s.isAvailable
                                                            ? selectedSize === s.size
                                                                ? "bg-black text-white border-black"
                                                                : "bg-white text-zinc-700 border-zinc-200 hover:border-black hover:bg-zinc-50"
                                                            : "bg-zinc-50 text-zinc-300 border-zinc-100 line-through cursor-not-allowed"
                                                        }
        `}
                                                >
                                                    {s.size}
                                                </button>

                                            </div>
                                        ))}
                                    </div>
                                )}


                                {productQty != 0 && (
                                    <div className="p-2 w-full bg-zinc-100 border-l-2 border-red-400">
                                        <p className="text-[11px] text-red-500 mt-1">{productQty} Units Left</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 w-full mt-8">
                                <Button
                                    className="w-full py-6"
                                    disabled={!selectedColor || !selectedSize}
                                    onClick={handleAddToCart}
                                >
                                    Add To Cart
                                </Button>
                            </div>
                            <div className="w-full h-[1px] bg-gray-300" />

                            <div className="mt-3">
                                <h4 className="text-lg font-semibold">About This Item</h4>
                                <div className="space-y-0.5 mt-3">
                                    <p className="text-md mb-6 font-semibold">{product.description}</p>

                                    <div className="flex gap-3">
                                        <div className="w-[150px] font-bold space-y-2">
                                            <p>Product Type:</p>
                                            <p>Product Target:</p>
                                            <p>Brand:</p>
                                            <p>Weight:</p>
                                        </div>

                                        <div className="capitalize space-y-2">
                                            <p>{product.productType}</p>
                                            <p>{product.productTarget}</p>
                                            <p>{product.brand == null ? "No Name" : product.brand}</p>
                                            <p>{product?.weight == null ? "Not Specified" : product.weight}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/*Shipping Info*/}

                        <div className="w-full lg:w-[350px] lg:mt-0 mt-8 rounded-xl border border-zinc-200 bg-white shadow-sm p-4 md:p-6">
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
                                    {/* Left column */}
                                    <div className="font-medium text-zinc-700 space-y-2">
                                        <p>Sold By</p>
                                        <p>Returns</p>
                                        <p>Help</p>
                                    </div>

                                    {/* Right column */}
                                    <div className="text-zinc-600 space-y-2">
                                        <p className="font-semibold text-zinc-800">TJR Shop</p>
                                        <p>30-day refund or replacement</p>
                                        <a
                                            href="mailto:tjr.shoponline@gmail.com"
                                            className="text-blue-600 hover:underline"
                                        >
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
    );
}

export default ProductClient;