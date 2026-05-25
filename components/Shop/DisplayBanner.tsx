'use client';

import { useEffect, useState } from 'react';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import config from '@/lib/config';
import { getBanners } from '@/lib/store/banner';
import Link from 'next/link';

const { urlEndpoint, publicKey } = config.env.imagekit;

const DisplayBanner = () => {
  const [banner, setBanner] = useState<{ id: string; imageUrl: string } | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      const bannerData = await getBanners();
      setBanner(bannerData);
    };
    fetchBanner();
  }, []);

  return (
    <div className="w-full">
      {banner?.imageUrl ? (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
          {/* Glow effects */}
          <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-violet-500/30 blur-3xl rounded-full z-0" />
          <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-cyan-400/20 blur-3xl rounded-full z-0" />

          <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
            <IKImage
              path={banner.imageUrl}
              alt="Store Banner"
              className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
              loading="lazy"
              fill
            />
          </ImageKitProvider>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 z-10" />

          {/* Welcome content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 px-6 py-3 rounded-full mb-5 shadow-2xl">
              <p className="text-white text-sm font-medium tracking-wide">
                Discover Premium Fashion
              </p>
            </div>

            <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight drop-shadow-lg">
              Elevate Your Style With
              <span className="block text-violet-300">
                New Season Arrivals
              </span>
            </h1>

            <p className="text-zinc-200 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
              Shop trending collections, premium brands, and exclusive deals
              designed to match your lifestyle.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {[
                "Free Shipping",
                "Exclusive Deals",
                "New Arrivals",
                "Top Brands",
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full shadow-lg hover:bg-white/20 transition-all duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 border-b border-zinc-800 flex flex-col items-center justify-center">

          {/* Background glow */}
          <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-cyan-400/20 rounded-full blur-3xl" />

          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Floating cards */}
          <div className="absolute inset-0 flex items-center justify-center gap-5 opacity-40 pointer-events-none">
            {[
              "w-24 h-32 -rotate-6 -translate-y-4",
              "w-28 h-36 rotate-3",
              "w-20 h-28 rotate-6 translate-y-4",
              "w-24 h-32 -rotate-3",
              "w-20 h-28 rotate-3 translate-y-3",
            ].map((cls, i) => (
              <div
                key={i}
                className={`rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 backdrop-blur-md shadow-2xl ${cls}`}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">

            <div className="mb-5 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hidden md:block">
              <span className="text-violet-300 text-xs font-medium uppercase tracking-wide">
                Welcome to TJRStore
              </span>
            </div>

            <h1 className="text-white text-4xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl">
              Style That Speaks
              <span className="block bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                Before You Do
              </span>
            </h1>

            <p className="text-zinc-300 text-sm  max-w-xl mt-3 leading-relaxed">
              Explore curated collections, trending styles, and premium fashion
              essentials built for modern shopping experiences.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
                <Link href={"/store"} className="px-6 py-3 rounded-full bg-white text-zinc-900 text-sm font-semibold shadow-2xl hover:scale-105 transition-transform duration-300">
                  Shop Now
                </Link>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                "Free Shipping",
                "Premium Brands",
                "Weekly Drops",
                "Secure Checkout",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-white/80 border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full shadow-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayBanner;
