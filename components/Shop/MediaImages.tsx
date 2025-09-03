'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ImageKitProvider, IKImage } from "imagekitio-next";
import config from "@/lib/config";
import { getImages, uploadImage } from '@/lib/store/media';
import ImageUpload from './ImageUpload';

type MediaItem = {
  id: string;
  imageUrl: string;
};

const { urlEndpoint, publicKey } = config.env.imagekit;

interface MediaImagesProps {
  onSelect: (item: MediaItem) => void; // Callback when user clicks image
}

const MediaImages = ({ onSelect }: MediaImagesProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const fetchMedia = async () => {
    const response = await getImages();

    if (response.success) {
      setMediaItems(response.data ?? []);
    } else {
      setMediaItems([]);
    }
  };

  const handleImageChange = async (filePath: string) => {
    const result = await uploadImage(filePath);
    if (result.success) {
      toast("✅ Image inserted into media table");
      fetchMedia();
    } else {
      toast("❌ Failed to insert image");
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <div className="h-full overflow-y-scroll">
      <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
        <div className="w-full">
          <ImageUpload
            type="image"
            accept="image/*"
            folder="images"
            placeholder="Upload your image"
            onFileChange={handleImageChange}
          />

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="aspect-[4/3] bg-gray-100 rounded overflow-hidden relative group cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <IKImage
                  path={item.imageUrl.replace(urlEndpoint, '')}
                  alt="Media"
                  className="object-cover w-full h-full"
                  loading="lazy"
                  lqip={{ active: true }}
                  transformation={[{ height: 180, width: 240, crop: "maintain_ratio" }]}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>
      </ImageKitProvider>
    </div>
  );
};

export default MediaImages;
