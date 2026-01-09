'use client';
import React, { use, useEffect, useState } from "react";
import { getStoreProducts } from "@/lib/store/product";
import { ProductParams } from "@/types";
import { IKImage, ImageKitProvider } from "imagekitio-next";
import config from "@/lib/config";
import Link from "next/link";
import { useFilter } from "@/components/FilterContext";
import { useProductStore } from "@/lib/store/productStore";
import { getProductsWithDeals } from "@/lib/store/deals";

const { urlEndpoint, publicKey } = config.env.imagekit;

interface RouteParams {
  category: string;
  subcategory: string;
  subsub: string;
}

interface Props {
  params: Promise<RouteParams>;
}

interface ProductWithDeal extends ProductParams {
  dealCoupon?: string | null
}

export default function SubSubPage({ params }: Props) {
  const { category, subcategory, subsub } = use(params) as RouteParams; // 👈 type assertion
  const [products, setProducts] = useState<ProductWithDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const { brand, color, priceRange } = useFilter();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await getProductsWithDeals()
        if (productData) setProducts(productData)
      } catch (err) {
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!subsub) return;

      const formattedTarget = subsub
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      let data = await getStoreProducts(category, formattedTarget);

      if (!data) return setProducts([]);

      // Apply filters locally
      if (brand) data = data.filter((p) => p.brand === brand);
      if (color) data = data.filter((p) => p.color?.toLowerCase() === color.toLowerCase());
      if (priceRange) {
        if (priceRange === "R0 - R500") data = data.filter((p) => p.price <= 500);
        else if (priceRange === "R500 - R1000")
          data = data.filter((p) => p.price > 500 && p.price <= 1000);
        else if (priceRange === "R1000+")
          data = data.filter((p) => p.price > 1000);
      }

      setProducts(data);
      useProductStore.getState().setProducts(data);

    };

    fetchProducts();
  }, [category, subcategory, subsub, brand, color, priceRange]);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold capitalize">Results</h1>
      <p className="text-gray-600 capitalize mb-4">
        You are viewing <strong>{subcategory.replace(/-/g, " ")}</strong> in{" "}
        <strong>{category.replace(/-/g, " ")}</strong> category.
      </p>

      {products && products.length > 0 ? (
        <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
          <div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-3"
          >
            {products.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                onClick={() =>
                  useProductStore.getState().setSelectedProduct(product)
                }
                className="overflow-hidden"
              >
                <div className="w-full h-[150px] md:h-[250px]">
                  <IKImage
                    path={product.imageUrl}
                    alt={product.productName || "Product Image"}
                    className="custom-light-shadow-box object-contain w-full h-full"
                    loading="lazy"
                    width={250}
                    height={250}
                  />
                </div>

                <div className="mt-3 space-y-1 md:space-y-3">
                  <div className="flex justify-between">
                    <p className="text-xs md:text-[16px] md:font-bold max-w-[99%] truncate">
                      {product.productName}
                    </p>

                    {product.brand && (
                      <div className="py-0.1 px-2 bg-green-200 border border-green-300 text-green-950 rounded flex items-center font-medium">
                        <p className="text-xs">{product.brand}</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs md:text-md font-medium truncate text-gray-600 hidden md:block">
                    {product.productTarget}
                  </p>

                  <div className="text-xs font-bold flex gap-0.5">
                    <span>R</span>
                    <p className="text-md md:text-lg font-bold">{product.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </ImageKitProvider>
      ) : (
        <p className="mt-6 text-gray-500">No products found for this category.</p>
      )}
    </div>
  );
}
