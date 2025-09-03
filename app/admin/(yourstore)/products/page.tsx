'use client'

import config from '@/lib/config';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ProductParams } from '@/types';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/store/product';
import CreateOrUpdateProduct from '@/components/Shop/CreateOrUpdateProduct';

const { urlEndpoint, publicKey } = config.env.imagekit;

const page = () => {
    const [products, setProducts] = useState<ProductParams[] | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductParams | null>(null);


    useEffect(() => {
        const fetchProduct = async () => {
            const productData = await getProducts();
            setProducts(productData);
        };

        fetchProduct();
    }, []);

    const handleFormSuccess = (newProduct: ProductParams, action: "create" | "update") => {
        setProducts((prev) => {
            if (!prev) return [newProduct];

            if (action === "create") {
                return [...prev, newProduct];
            }

            // update
            return prev.map((item) => (item.id === newProduct.id ? newProduct : item));
        });

        setSelectedProduct(null); // clear form state
    };


    return (
        <div className="flex gap-4 ">

            <div className="custom-light-shadow-box relative bg-white p-2 border-r">
                <div className='w-[150px] min-h-screen'>
                    <div className="absolute top-0 right-0 left-0 bg-white border-b p-2 ">
                        <Button
                            className="bg-green-300 font-bold hover:bg-green-400 rounded text-green-900 text-xs w-full"
                            onClick={() => setSelectedProduct(null)}
                        >
                            <span className='text-lg'>+</span> New Product
                        </Button>
                    </div>
                    <div className="mt-12">
                        {products && products.length > 0 ? (
                            <ImageKitProvider
                                urlEndpoint={urlEndpoint}
                                publicKey={publicKey}
                            >
                                <ul className="space-y-2">
                                    {products.map((product) => (
                                        <li
                                            key={product.id}
                                            className={`flex gap-1 text-gray-700 cursor-pointer p-1 rounded-md ${selectedProduct?.id === product.id ? "bg-blue-100" : "hover:bg-gray-100"
                                                }`}
                                            onClick={() => setSelectedProduct(product)}
                                        >

                                            <IKImage
                                                path={product?.imageUrl}
                                                alt="Store Banner"
                                                className="object-cover custom-light-shadow-box rounded-md"
                                                loading="lazy"
                                                width={35}
                                                height={35}
                                            />

                                            <p className='truncate text-xs text-gray-600 font-medium '>{product.productName}</p>
                                        </li>
                                    ))}
                                </ul>

                            </ImageKitProvider>
                        ) : (
                            <p className="text-xs text-gray-400">No products found</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <CreateOrUpdateProduct
                    productToEdit={selectedProduct || undefined}
                    mode={selectedProduct ? "update" : "create"}
                    onSuccess={handleFormSuccess}
                />
            </div>

        </div>
    );
};

export default page;
