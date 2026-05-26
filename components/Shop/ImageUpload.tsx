'use client'
import config from "@/lib/config";
import {
    ImageKitProvider,
    IKUpload,
} from "imagekitio-next";
import { LucideGalleryThumbnails } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

const { env: { imagekit: { publicKey, urlEndpoint } } } = config;

const authenticator = async () => {
    try {
        const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status} : ${errorText}`)
        }

        const data = await response.json();
        const { signature, expire, token } = data;

        return { token, expire, signature };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`Authenticate request failed: ${message}`)
    }
}

interface IKUploadError {
    message: string
}

interface IKUploadResponse {
    filePath: string
    url: string
    fileId: string
    name: string
}

type ImageUploadProps = {
    type: 'image'
    accept: string
    folder: string
    placeholder: string
    onFileChange: (filePath: string) => void
}

const ImageUpload = ({
    type,
    accept,
    folder,
    placeholder,
    onFileChange
}: ImageUploadProps) => {
    const ikUploadRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0);

    const onError = (error: IKUploadError) => {
        toast(error.message)
    };

    const onSuccess = (res: IKUploadResponse) => {
        onFileChange(res.filePath);
    };

    const onValidate = (file: File) => {
        if (type === 'image') {
            if (file.size > 5 * 1024 * 1024) {
                toast('File is too large — upload a file smaller than 5 MB')
                return false;
            }
        }
        return true;
    };

    return (
        <ImageKitProvider
            publicKey={publicKey}
            urlEndpoint={urlEndpoint}
            authenticator={authenticator}
        >
            <IKUpload
                className="hidden"
                ref={ikUploadRef}
                onError={onError}
                onSuccess={onSuccess}
                useUniqueFileName={true}
                validateFile={onValidate}
                onUploadStart={() => setProgress(0)}
                onUploadProgress={({ loaded, total }) => {
                    const percent = Math.round((loaded / total) * 100);
                    setProgress(percent);
                }}
                folder={folder}
                accept={accept}
            />

            <Button
                className="flex gap-2 items-center bg-green-500 hover:bg-green-700 text-sm cursor-pointer rounded"
                onClick={(e) => {
                    e.preventDefault();
                    ikUploadRef.current?.click();
                }}
            >
                <LucideGalleryThumbnails size={18} />
                <p>{placeholder}</p>
            </Button>

            {progress > 0 && progress !== 100 && (
                <div className="w-full">
                    <div className="w-full rounded-full bg-green-200 mt-2">
                        <div
                            className="bg-green-400 rounded-full text-xs p-1 text-white px-4"
                            style={{ width: `${progress}%` }}
                        >
                            {progress}%
                        </div>
                    </div>
                    <p className="mt-1 capitalize">{type} uploading...</p>
                </div>
            )}
        </ImageKitProvider>
    )
}

export default ImageUpload