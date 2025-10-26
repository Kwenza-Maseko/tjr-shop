'use client';

import { useEffect, useState } from 'react';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import config from '@/lib/config';
import { getBanners } from '@/lib/store/banner';

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
        <div>
            {banner?.imageUrl && (
                <div className="relative w-full h-[300px] md:h-[500px]">
                    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                        <IKImage
                            path={banner.imageUrl}
                            alt="Store Banner"
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            fill
                        />
                    </ImageKitProvider>

                    {/* Black gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white flex flex-col md:flex-row justify-center items-center md:items-end pb-4 gap-6">
                        {/* WhatsApp */}
                        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400">
                            WhatsApp: +27 123 456 789
                        </a>

                        {/* Phone */}
                        <a href="tel:+27123456789" className="flex items-center gap-2 hover:text-blue-400">
                            Call:  +27 123 456 789
                        </a>

                        {/* Email */}
                        <a href="mailto:info@example.com" className="flex items-center gap-2 hover:text-red-400">
                            Email Us: tjrshoponline@gmail.com
                        </a>
                    </div>
                </div>
            )}
        </div>

    );
}

export default DisplayBanner;
