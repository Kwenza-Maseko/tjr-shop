'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductParams } from "@/types";
import { getStoreProducts } from "@/lib/store/product"; // fallback fetch
import { useProductStore } from "@/lib/store/productStore";
import config from "@/lib/config";
import { IKImage, ImageKitProvider } from "imagekitio-next";
import { Button } from "@/components/ui/button";

const { urlEndpoint, publicKey } = config.env.imagekit;

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { getProductById, selectedProduct } = useProductStore();

    const [product, setProduct] = useState<ProductParams | null>(null);

    useEffect(() => {
        // Try Zustand first
        let found = getProductById(id);
        if (found) {
            setProduct(found);
        } else if (selectedProduct?.id === id) {
            setProduct(selectedProduct);
        } else {
            // fallback to DB fetch
            (async () => {
                const data = await getStoreProducts();
                const fetched = data?.find((p) => p.id === id) ?? null;
                setProduct(fetched);
            })();
        }
    }, [id, getProductById, selectedProduct]);

    if (!product) return <p className="p-6 text-gray-500">Loading product...</p>;

    return (
        <div className="p-6">
            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>

                <div className="flex gap-18">
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

                    <div className="space-y-5 w-[450px]">
                        <div >
                            <h1 className="text-xl font-semibold">{product.productName}</h1>
                            <p className="text-gray-600 capitalize">{product.productType}</p>
                            <div className="text-xs font-semibold flex gap-0.5 mt-2">
                                <p className="md:mt-1 text-xs">R</p>
                                <p className="text-md md:text-2xl ">{product.price}</p>
                            </div>

                              <p
                            className={`${product.isActive ? "text-green-900 bg-green-200" : "text-red-900 bg-red-200"
                                } font-semibold py-1 px-2 rounded w-fit mt-3`}
                        >
                            {product.isActive ? "On Stock" : "Out Of Stock"}
                        </p>
                        </div>

                        <div className="w-full h-[1px] bg-gray-300 " />

                        <div>
                            <h3 className="text-md font-semibold mb-4">Colors</h3>
                            <div className='w-[30px] h-[30px] rounded-full'
                            style={{ background: product.color?.toLocaleLowerCase() }}
                        />
                        </div>

                        
                        <div className="space-y-2">
                            <p className="font-semibold">Sizes</p>

                            <div className="flex gap-3">
                                <Button className="w-[40px] h-[40px] p-3 rounded bg-white text-black border font-semibold">
                                    {product.dimensions == "Extra Small" ? "XS" : ""}
                                    {product.dimensions == "Small" ? "S" : ""}
                                    {product.dimensions == "Medium" ? "M" : ""}
                                    {product.dimensions == "Large" ? "L" : ""}
                                    {product.dimensions == "Extra Large" ? "XL" : ""}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Button className="w-full ">
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
                </div>
            </ImageKitProvider>
        </div>
    );
}
