
'use client';

import { ImageKitProvider } from 'imagekitio-next';
import config from '@/lib/config';

const { urlEndpoint, publicKey } = config.env.imagekit;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
      {children}
    </ImageKitProvider>
  );
}
