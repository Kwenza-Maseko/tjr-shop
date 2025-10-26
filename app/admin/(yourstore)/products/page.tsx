'use client'

import config from '@/lib/config';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ProductParams } from '@/types';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import { Button } from '@/components/ui/button';
import { deleteProduct, getProducts } from '@/lib/store/product';
import CreateOrUpdateProduct from '@/components/Shop/CreateOrUpdateProduct';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const { urlEndpoint, publicKey } = config.env.imagekit;


const page = () => {
    const [products, setProducts] = useState<ProductParams[] | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductParams | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


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

    const handleDelete = async (id?: string) => {
        if (!id) {
            toast.error("Product ID is missing, cannot delete");
            return;
        }

        setDeleteLoading(true);
        const deleted = await deleteProduct(id);
        setDeleteLoading(false);

        if (deleted.success) {
            toast.success("Product deleted successfully");
            setProducts((prev) => prev?.filter((p) => p.id !== id) || []);
            if (selectedProduct?.id === id) setSelectedProduct(null);
        } else {
            toast.error(deleted.message || "Failed to delete product");
        }
    };



    return (
        <div className="flex gap-4">

            <div className="custom-light-shadow-box bg-white p-2 border-r">
                <div className='w-[220px] min-h-screen'>
                    <div className="bg-white border-b p-2">
                        <Button
                            className="bg-green-300 font-bold hover:bg-green-400 rounded text-green-900 text-xs w-full"
                            onClick={() => setSelectedProduct(null)}
                        >
                            <span className='text-lg'>+</span> New Product
                        </Button>
                    </div>
                    <div className="mt-4">
                        {products && products.length > 0 ? (
                            <ImageKitProvider
                                urlEndpoint={urlEndpoint}
                                publicKey={publicKey}
                            >
                                <ul className="space-y-2">
                                    {products.map((product) => (
                                        <li
                                            key={product.id}
                                            className={`flex justify-between gap-1 text-gray-700 cursor-pointer p-1 rounded-md ${selectedProduct?.id === product.id ? "bg-blue-100" : "hover:bg-gray-100"
                                                }`}
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            <div className="flex gap-2">
                                                <IKImage
                                                    path={product?.imageUrl}
                                                    alt="Store Banner"
                                                    className="object-cover custom-light-shadow-box rounded"
                                                    loading="lazy"
                                                    width={35}
                                                    height={35}
                                                />

                                                <div className='w-[120px]'>
                                                    <p className='truncate text-xs text-gray-600 font-medium '>{product.productName}
                                                    </p>

                                                    <p className='truncate text-xs text-gray-600 font-medium '>{product.sku}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                disabled={deleteLoading}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(product.id); // now safe
                                                }}
                                            >
                                                {deleteLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>

                            </ImageKitProvider>
                        ) : (
                            <p className="text-xs text-gray-400 text-center">No products found</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <CreateOrUpdateProduct
                    key={selectedProduct ? selectedProduct.id : "new"}
                    productToEdit={selectedProduct || undefined}
                    mode={selectedProduct ? "update" : "create"}
                    onSuccess={handleFormSuccess}
                />
            </div>

        </div >
    );
};

export default page;
