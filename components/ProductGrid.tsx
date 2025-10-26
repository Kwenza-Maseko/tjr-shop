'use client';
import { IKImage } from 'imagekitio-next';
import { ProductParams } from '@/types';

export default function ProductGrid({ products }: { products: ProductParams[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <IKImage
          key={product.id}
          path={product.imageUrl}
          alt={product.productName ?? "Product"}
          className="object-cover rounded shadow-md"
          loading="lazy"
          transformation={[{ width: 500, height: 500, quality: 80 }]} // compression
          lqip={{ active: true, quality: 20 }} // blurred placeholder
        />
      ))}
    </div>
  );
}
