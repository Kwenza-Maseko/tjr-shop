'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import MediaImages from './MediaImages';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import config from '@/lib/config';
import { toast } from 'sonner';
import { createOrUpdateBanner, deleteBannerStore, getBanners } from '@/lib/store/banner';

const { urlEndpoint, publicKey } = config.env.imagekit;

const Banner = () => {
  const [openMedia, setOpenMedia] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [banner, setBanner] = useState<{ id: string; imageUrl: string } | null>(null); // current banner from DB
  const [selectedImage, setSelectedImage] = useState<{ id: string; imageUrl: string } | null>(null); // temporary selection
  const [initialBanner, setInitialBanner] = useState<{ id: string; imageUrl: string } | null>(null); // keep original

  useEffect(() => {
    const fetchBanner = async () => {
      const bannerData = await getBanners();
      setBanner(bannerData);
      setInitialBanner(bannerData); // save original DB banner
    };
    fetchBanner();
  }, []);

  const handleDelete = async () => {
    if (!banner?.id) return;

    setDeleteLoading(true);
    const deletedId = await deleteBannerStore(banner?.id);
    setDeleteLoading(false);

    if (deletedId) {
      toast.success("Banner deleted successfully");
      setBanner(null);
      setInitialBanner(null);
      setSelectedImage(null);
    } else {
      toast.error("Failed to delete banner");
    }
  };

  const submitBanner = async () => {
    if (!selectedImage?.imageUrl) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    const result = await createOrUpdateBanner(selectedImage.id);
    setLoading(false);

    if (result.success) {
      toast.success("New banner has been created/updated");
      setBanner({ id: selectedImage.id, imageUrl: selectedImage.imageUrl }); // update current
      setInitialBanner({ id: selectedImage.id, imageUrl: selectedImage.imageUrl }); // update original
      setSelectedImage(null); // clear temporary selection
    } else {
      toast.error("Failed to create new banner");
    }
  };

  return (
    <div className='w-full'>
      <div className="w-full flex flex-col items-center relative h-dvh">
        <div className="rounded w-full h-80 bg-gray-300 flex items-center justify-center overflow-hidden">
          {(selectedImage || banner)?.imageUrl ? (
            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
              <IKImage
                path={(selectedImage || banner)!.imageUrl}
                alt="Store Banner"
                className="object-cover"
                loading="lazy"
                width={1000}
                height={400}
              />
            </ImageKitProvider>
          ) : (
            <p className="font-black text-xl text-gray-500">1100 x 400 px</p>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-400">
          This is the banner section. Add your banner images here. You can use it to advertise your store.
        </p>

        <div className="absolute top-0 p-4 w-full backdrop-blur-sm flex gap-3 rounded-t">
          <Button
            className='flex gap-2 items-center bg-teal-400 hover:bg-teal-500 text-sm cursor-pointer rounded custom-shadow-box py-1.5'
            onClick={() => setOpenMedia(true)}
          >
            Select Media
          </Button>

          {/* Show delete button for current banner (not when previewing new selection) */}
          {banner?.imageUrl && !selectedImage?.imageUrl && (
            <Button
              className='flex gap-2 items-center bg-red-500 hover:bg-red-600 text-sm cursor-pointer rounded custom-shadow-box py-1'
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 size={18} className='w-5 h-5 animate-spin' />
              ) : (
                <div className='flex gap-2 items-center'>
                  <Trash2 size={18} /> Remove
                </div>
              )}
            </Button>
          )}

          {/* Show controls when new image is selected */}
          {selectedImage?.imageUrl && (
            <div className="flex gap-4">
              <Button
                className='flex gap-2 items-center bg-green-500 hover:bg-green-600 text-sm cursor-pointer rounded custom-shadow-box py-1'
                onClick={submitBanner}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={18} className='w-5 h-5 animate-spin' />
                ) : (
                  <div className='flex gap-2 items-center'>
                    <Upload size={18} /> Upload
                  </div>
                )}
              </Button>

              {/* Remove selection → restore original banner */}
              <Button
                className='flex gap-2 items-center bg-red-500 hover:bg-red-600 text-sm cursor-pointer rounded custom-shadow-box py-1'
                onClick={() => {
                  setSelectedImage(null);
                  setBanner(initialBanner); // restore from saved DB banner
                }}
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {openMedia && (
          <div className='fixed inset-0 bg-black/50 p-8 z-50'>
            <div className="flex flex-col justify-center h-full">
              <div className='w-full bg-white rounded custom-shadow-box p-4 flex flex-col gap-4 justify-center h-[500px] overflow-y-hidden'>
                <div className="flex justify-end">
                  <Button
                    className='text-lg text-end w-fit font-bold cursor-pointer text-gray-400 bg-gray-100 hover:bg-gray-200 border border-gray-300'
                    onClick={() => setOpenMedia(false)}
                  >
                    x
                  </Button>
                </div>
                <MediaImages
                  onSelect={(item) => {
                    setSelectedImage(item);
                    setBanner(item);
                    setOpenMedia(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
