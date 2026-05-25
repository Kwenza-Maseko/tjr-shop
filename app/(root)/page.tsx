'use client'
import CategoryGrid from '@/components/CategoryGrid';
import Copyright from '@/components/Copyright';
import DisplayDeals from '@/components/DisplayDeals';
import Footer from '@/components/Footer';
import DisplayBanner from '@/components/Shop/DisplayBanner'
import config from '@/lib/config';
import { getLatestProducts } from '@/lib/store/product';
import { ProductParams } from '@/types';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const { urlEndpoint, publicKey } = config.env.imagekit;

const HomePage = () => {

  const [products, setProducts] = useState<ProductParams[] | null>(null);
  useEffect(() => {
    const fetchProduct = async () => {
      const productData = await getLatestProducts();
      setProducts(productData);
    };

    fetchProduct();
  }, []);

  return (
    <div className='w-full space-y-5'>
      <DisplayBanner />
      <CategoryGrid />
      <DisplayDeals />
      <div className='space-y-5 px-0  md:px-6'>
        <div className="">
          <h1 className="text-medium mb-8 px-6 md:px-2 uppercase tracking-widest">Latest on a Catalog</h1>
          {products && products.length > 0 && (
            <ImageKitProvider
              urlEndpoint={urlEndpoint}
              publicKey={publicKey}
            >
              <div className="flex gap-4 relative flex-wrap">
                {products.map((product) => (
                  <div key={product?.id} className="mx-auto relative w-[600px] h-[600px] overflow-hidden">
                    {/* Product Image */}
                    <IKImage
                      path={product?.imageUrl}
                      alt={product?.productName || "Product Image"}
                      className=" object-cover"
                      loading="lazy"
                      fill
                    />

                    {/* Gradient Overlay with Product Name */}
                    {product?.productName && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-start justify-end gap-3  px-8 md:px-10 py-4 md:py-10">
                        <p className='capitalize text-lg  text-white'>Category: {product.category}</p>
                        <div className="w-full">
                          <Link href={`/product/${product.id}`} className="bg-white/90 backdrop-blur-sm text-black text-md md:text-lg font-semibold w-fit rounded-full truncate  px-8 py-2 ">
                            {product.productName}
                          </Link>
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
      <Footer />
      <Copyright />
    </div>
  )
}

export default HomePage