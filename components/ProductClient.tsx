'use client';

import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductParams } from "@/types";
import { getStoreProducts } from "@/lib/store/product"; // fallback fetch
import { useProductStore } from "@/lib/store/productStore";
import config from "@/lib/config";
import { IKImage, ImageKitProvider } from "imagekitio-next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrUpdateCart } from "@/lib/store/cart";
import { auth } from '@/userAuth';

const { urlEndpoint, publicKey } = config.env.imagekit;

const ProductClient = ({ userId }: { userId: string }) => {

    const { id } = useParams<{ id: string }>();

    const { getProductById, selectedProduct } = useProductStore();

    const [product, setProduct] = useState<ProductParams | null>(null);

    // 🆕 state for user selections
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    useEffect(() => {
        let found = getProductById(id);
        if (found) {
            setProduct(found);
        } else if (selectedProduct?.id === id) {
            setProduct(selectedProduct);
        } else {
            (async () => {
                const data = await getStoreProducts();
                const fetched = data?.find((p) => p.id === id) ?? null;
                setProduct(fetched);
            })();
        }
    }, [id, getProductById, selectedProduct]);

    const getPercentage = (
        discountPrice?: number | null,
        price?: number | null
    ): number | null => {
        if (!discountPrice || !price || price <= 0) return null;
        const discount = ((Number(price) - Number(discountPrice)) / Number(price)) * 100;
        return Math.round(discount);
    };

    const getDiscount = (
        discountPrice?: number | null,
        price?: number | null
    ): number | null => {
        if (!discountPrice || !price || price <= 0) return null;
        const discount = Number(price) - Number(discountPrice);
        return Math.round(discount);
    };

    const discountAmount = getDiscount(product?.discountPrice ?? undefined, product?.price ?? undefined);
    const discountPercentage = getPercentage(product?.discountPrice ?? undefined, product?.price ?? undefined);

    if (!product) return <p className="p-6 text-gray-500">Loading product...</p>;

    // 🧠 Add to Cart handler
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

                // numeric → string (Drizzle)
                priceSnapshot: Number(
                    product.price
                ).toFixed(2),

                discountSnapshot: product.discountPrice
                    ? Number(product.discountPrice).toFixed(2)
                    : null,

                selectedOptions: {
                    color: selectedColor,
                    size: selectedSize,
                },
            });

            toast.success(`${product.productName} added to cart 🛒`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add item to cart");
        }
    };




    return (
        <div className="w-full p-6">
            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                <div className="flex flex-col lg:flex-row  gap-8 md:gap-18 mx-auto">
                    <div className="block lg:hidden">
                        <h1 className="text-xl font-semibold">{product.productName}</h1>
                        <p className="text-gray-600 capitalize">{product.productType}</p>
                    </div>
                    <div className="w-full h-full md:w-[350px] md:h-[350px]">
                        <IKImage
                            path={product.imageUrl}
                            alt={product.productName || "Product Image"}
                            className="custom-light-shadow-box object-cover w-full h-full"
                            loading="lazy"
                            width={350}        // Required for optimization
                            height={350}
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6">
                        <div className="space-y-5 w-[450px]">
                            <div >
                                <div className="lg:block hidden">
                                    <h1 className="text-xl font-semibold">{product.productName}</h1>
                                    <p className="text-gray-600 capitalize">{product.productType}</p>
                                </div>

                                <div className="flex gap-4 items-end">
                                    {discountPercentage !== null && (
                                        <p className="text-green-600 text-lg md:text-2xl ">
                                            -{discountPercentage}%
                                        </p>
                                    )}
                                    {discountAmount !== null ? (
                                        <div className="text-xs font-semibold flex gap-0.5 mt-2">
                                            <p className="mt-1 text-xs">R</p>
                                            <p className="text-lg md:text-2xl ">{discountAmount}</p>
                                        </div>
                                    ) : (
                                        <div className="text-xs font-semibold flex gap-0.5 mt-2">
                                            <p className="mt-1  text-xs">R</p>
                                            <p className="text-lg md:text-2xl ">{product.price}</p>
                                        </div>
                                    )}
                                </div>
                                {discountAmount !== null && (
                                    <p className="text-xs text-zinc-600">Actual Price: <span className="font-semibold line-through">R{product.price}</span>
                                    </p>
                                )}


                                <p
                                    className={`${product.isActive ? "text-green-900 bg-green-200" : "text-red-900 bg-red-200"
                                        } font-semibold py-1 px-2 w-fit mt-3 text-xs rounded-full`}
                                >
                                    {product.isActive ? "On Stock" : "Out Of Stock"}
                                </p>
                            </div>

                            <div className="w-full h-[1px] bg-gray-300 " />

                            {/* 🎨 Color Selection */}
                            <div>
                                <h3 className="text-md font-semibold mb-4">Color</h3>
                                <div
                                    onClick={() => setSelectedColor(product.color ?? null)}
                                    className={`w-[30px] h-[30px] rounded-full border-2 cursor-pointer transition ${selectedColor === product.color
                                        ? "border-black scale-110"
                                        : "border-gray-300"
                                        }`}
                                    style={{ background: product.color?.toLowerCase() }}
                                />
                            </div>

                            <div className="space-y-2">
                                <p className="font-semibold">Size</p>
                                <div className="flex gap-3">
                                    {["XS", "S", "M", "L", "XL"].map((size) => (
                                        <Button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-[40px] h-[40px] p-3 rounded border font-semibold ${selectedSize === size
                                                ? "bg-black text-white"
                                                : "bg-white text-black border-gray-300"
                                                }`}
                                        >
                                            {size}
                                        </Button>
                                    ))}
                                </div>
                            </div>



                            <div className="space-y-1">
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
                                            <p>{product.productTarget}</p>
                                            <p>{product.productType}</p>
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