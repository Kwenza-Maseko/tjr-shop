'use client'
import DisplayBanner from '@/components/Shop/DisplayBanner'
import config from '@/lib/config';
import { getProducts } from '@/lib/store/product';
import { ProductParams } from '@/types';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import React, { useEffect, useState } from 'react'

const { urlEndpoint, publicKey } = config.env.imagekit;

const HomePage = () => {

  const [products, setProducts] = useState<ProductParams[] | null>(null);
  useEffect(() => {
    const fetchProduct = async () => {
      const productData = await getProducts();
      setProducts(productData);
    };

    fetchProduct();
  }, []);

  return (
    <div className='w-full space-y-5'>
      <DisplayBanner />
      <div className='space-y-5 p-3 md:px-6'>
        <div className="">
          <h1 className='text-2xl font-black mb-5'>Latest on a Catalog</h1>
          {products && products.length > 0 && (
            <ImageKitProvider
              urlEndpoint={urlEndpoint}
              publicKey={publicKey}
            >
              <div className="flex gap-4 justify-between p-3 custom relative flex-wrap">
                {products.map((product) => (
                  <div key={product?.id} className="relative rounded-lg overflow-hidden">
                    {/* Product Image */}
                    <IKImage
                      path={product?.imageUrl}
                      alt={product?.productName || "Product Image"}
                      className="custom-light-shadow-box rounded-lg object-cover"
                      loading="lazy"
                      width={300}
                      height={300}
                    />

                    {/* Gradient Overlay with Product Name */}
                    {product?.productName && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center">
                        <div className="mb-3 w-full px-2 text-center">
                          <p className="bg-white/90 backdrop-blur-sm text-black text-sm font-semibold px-4 py-1 rounded-full max-w-[99%] truncate">
                            {product.productName} 
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </ImageKitProvider>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage