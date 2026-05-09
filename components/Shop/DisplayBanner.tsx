'use client';

import { useEffect, useState } from 'react';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import config from '@/lib/config';
import { getBanners } from '@/lib/store/banner';
import { Truck, Lock, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { useDeals } from '../providers/DealContext';

const { urlEndpoint, publicKey } = config.env.imagekit;

const DisplayBanner = () => {
  const [banner, setBanner] = useState<{ id: string; imageUrl: string } | null>(null);

  // ✅ Use deals from context (DO NOT fetch again)
  const { deals, expired } = useDeals();

  useEffect(() => {
    const fetchBanner = async () => {
      const bannerData = await getBanners();
      setBanner(bannerData);
    };
    fetchBanner();
  }, []);

  return (
    <div className="w-full">
      {/* Banner Section */}
      {banner?.imageUrl && (
        <div className="relative w-full h-[400px] md:h-[500px]">
          <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
            <IKImage
              path={banner.imageUrl}
              alt="Store Banner"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              fill
            />
          </ImageKitProvider>
        </div>
      )}

      {/* Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-purple-50 py-6 px-4 md:px-12 text-center custom-shadow-box-second">
        <div className="flex flex-col items-center text-gray-700 hover:text-black transition">
          <Truck className="w-8 h-8 mb-2 text-purple-600" />
          <p className="font-medium text-sm tracking-widest uppercase ">Free Shipping</p>
          <span className="text-xs text-gray-500">On all orders</span>
        </div>

        <div className="flex flex-col items-center text-gray-700 hover:text-black transition">
          <Lock className="w-8 h-8 mb-2 text-purple-600" />
          <p className="font-medium text-sm tracking-widest uppercase ">Secure Payment</p>
          <span className="text-xs text-gray-500">100% protected checkout</span>
        </div>

        <div className="flex flex-col items-center text-gray-700 hover:text-black transition">
          <RefreshCw className="w-8 h-8 mb-2 text-purple-600" />
          <p className="font-medium text-sm tracking-widest uppercase ">Free Return</p>
          <span className="text-xs text-gray-500">Within 30 days</span>
        </div>

        <div className="flex flex-col items-center text-gray-700 hover:text-black transition">
          <Clock className="w-8 h-8 mb-2 text-purple-600" />
          <p className="font-medium text-sm tracking-widest uppercase ">Available 24/7</p>
          <span className="text-xs text-gray-500">We’re always here</span>
        </div>
      </div>
    </div>
  );
};

export default DisplayBanner;
