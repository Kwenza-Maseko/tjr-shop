'use client'

import { productValidation } from '@/lib/validation';
import { ProductParams } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import config from '@/lib/config';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import MediaImages from './MediaImages';
import { Edit2, Loader2 } from 'lucide-react';
import { createOrUpdateProduct } from '@/lib/store/product';
import { Input } from '../ui/input';

type CreateOrUpdateProductParams = {
    productToEdit?: ProductParams;
    mode: 'create' | 'update';
    onSuccess: (newProduct: ProductParams, mode: 'create' | 'update') => void;
};

type MediaItem = {
    id: string;
    imageUrl: string;
};

const { urlEndpoint, publicKey } = config.env.imagekit;

const CreateOrUpdateProduct = ({ productToEdit, mode, onSuccess }: CreateOrUpdateProductParams) => {
    const [isPending, startTransition] = useTransition();
    const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
    const [openMedia, setOpenMedia] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof productValidation>>({
        resolver: zodResolver(productValidation),
        defaultValues: {
            id: productToEdit?.id ?? "",
            productName: productToEdit?.productName ?? "",
            imageUrl: productToEdit?.imageUrl ?? "",
            description: productToEdit?.description ?? "",
            productTarget: productToEdit?.productTarget ?? "",
            price: productToEdit?.price,
            discountPrice: productToEdit?.discountPrice ?? null,
            stock: productToEdit?.stock ?? 0,
            sku: productToEdit?.sku ?? "",
            category: productToEdit?.category ?? "",
            tags: productToEdit?.tags ?? "",
            weight: productToEdit?.weight ?? null,
            dimensions: productToEdit?.dimensions ?? "",
            rating: productToEdit?.rating ?? 0,
            reviewCount: productToEdit?.reviewCount ?? 0,
            isActive: productToEdit?.isActive ?? true,
            relatedProducts: productToEdit?.relatedProducts ?? [],
            variants: productToEdit?.variants ?? [],
        },
    });

    useEffect(() => {
        if (productToEdit) {
            // Editing existing product → prefill values
            form.reset({
                id: productToEdit.id,
                productName: productToEdit.productName,
                imageUrl: productToEdit.imageUrl,
                description: productToEdit.description,
                productTarget: productToEdit.productTarget,
                price: productToEdit.price,
                discountPrice: productToEdit.discountPrice,
                stock: productToEdit.stock,
                sku: productToEdit.sku,
                category: productToEdit.category,
                tags: productToEdit.tags,
                weight: productToEdit.weight,
                dimensions: productToEdit.dimensions,
                rating: productToEdit.rating,
                reviewCount: productToEdit.reviewCount,
                isActive: productToEdit.isActive,
                relatedProducts: productToEdit.relatedProducts,
                variants: productToEdit.variants,
            });
        } else {
            // Creating new product → reset to empty defaults
            form.reset({
                id: "",
                productName: "",
                imageUrl: "",
                description: "",
                productTarget: "",
                price: "" as any,          // 👈 depends if your zod schema expects string or number
                discountPrice: null,
                stock: 0,
                sku: "",
                category: "",
                tags: "",
                weight: null,
                dimensions: "",
                rating: 0,
                reviewCount: 0,
                isActive: true,
                relatedProducts: [],
                variants: [],
            });
            setSelectedImage(null); // also clear selected image
        }
    }, [productToEdit, form]);


    const submitProduct = async (values: z.infer<typeof productValidation>) => {
        // 🔹 Ensure image exists
        console.log("✅ SUBMITTING PRODUCT", values); // <--- add this

        const imageUrl = selectedImage?.imageUrl || values.imageUrl;
        if (!imageUrl) {
            toast.error("Please select an image");
            return;
        }

        setLoading(true);

        const payload: ProductParams = {
            id: form.getValues("id"),
            productName: form.getValues("productName"),
            imageUrl: selectedImage?.imageUrl ?? form.getValues("imageUrl"),
            description: form.getValues("description") ?? null,
            productTarget: form.getValues("productTarget"),
            price: form.getValues("price"), // string is fine here
            discountPrice: form.getValues("discountPrice") ?? null,
            stock: form.getValues("stock") ? Number(form.getValues("stock")) : 0,
            sku: form.getValues("sku"),
            category: form.getValues("category") ?? null,
            tags: form.getValues("tags") ?? null,
            weight: form.getValues("weight") ? Number(form.getValues("weight")) : null,
            dimensions: form.getValues("dimensions") ?? null,
            rating: form.getValues("rating") ?? 0,
            reviewCount: form.getValues("reviewCount") ? Number(form.getValues("reviewCount")) : 0,
            isActive: form.getValues("isActive") ?? true,
            relatedProducts: Array.isArray(form.getValues("relatedProducts"))
                ? (form.getValues("relatedProducts") as string[])
                : null,
            variants: form.getValues("variants") ?? null,
        };


        const result = await createOrUpdateProduct(payload);

        setLoading(false);

        if (result.success && result.data) {
            toast.success(`Product ${result.action} successfully`);

            const normalizedData: ProductParams = {
                ...result.data,
                price: Number(result.data.price),
                discountPrice: result.data.discountPrice ? Number(result.data.discountPrice) : 0,
                stock: result.data.stock ? Number(result.data.stock) : 0,
                weight: result.data.weight ? Number(result.data.weight) : null,
                rating: result.data.rating ? Number(result.data.rating) : 0,
                reviewCount: result.data.reviewCount ? Number(result.data.reviewCount) : 0,
                isActive: result.data.isActive ? Boolean(result.data.isActive) : true,
                relatedProducts: Array.isArray(result.data.relatedProducts)
                    ? (result.data.relatedProducts as string[])
                    : null,
                variants: Array.isArray(result.data.variants)
                    ? (result.data.variants as string[])
                    : null,
            };


            onSuccess(normalizedData, result.action === "updated" ? "update" : "create");
            setSelectedImage(null);
        } else {
            toast.error(result.message || "Failed to create/update product");
        }

    };

    return (
        <div className=' w-full'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(submitProduct)} className="space-y-6 w-full">
                    <div className="flex gap-4 w-full bg-white p-4 rounded">
                        <div className="rounded w-[300px] h-[300px] flex items-center justify-center overflow-hidden relative border border-dashed border-gray-300">
                            <div className="absolute top-0 p-4 w-full backdrop-blur-sm flex justify-end gap-3 rounded-t">
                                <Button
                                    type="button"
                                    className='cursor-pointer bg-blue-100 shadow-none hover:bg-blue-400/50'
                                    onClick={() => setOpenMedia((prev) => !prev)}
                                >
                                    <Edit2 className='w-4 h-4 text-blue-400' />
                                </Button>

                            </div>

                            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                                {selectedImage?.imageUrl || productToEdit?.imageUrl ? (
                                    <IKImage
                                        path={(selectedImage?.imageUrl || productToEdit?.imageUrl) ?? ''}
                                        alt="Product Image"
                                        className="object-cover"
                                        loading="lazy"
                                        width={300}
                                        height={300}
                                    />
                                ) : (
                                    <p className='text-gray-400'>Select product image</p>
                                )}
                            </ImageKitProvider>

                        </div>

                        <div className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="productName"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex gap-2">
                                            <FormLabel>Product Name</FormLabel>
                                            <p className='text-red-500'>*</p>
                                        </div>
                                        <FormControl>
                                            <Input className="py-6 bg-[#edededed]" {...field} placeholder="Product Name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                className="py-6 bg-[#edededed] text-lg" placeholder="Description" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className='bg-white p-4 rounded custom-light-shadow-box'>

                        <h1 className='text-gray-500 font-bold text-[12pt] mb-4'>Pricing & Inventory</h1>

                        <div className="space-y-3 p-3">
                            {/* Price */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}   // 👈 fallback to ""
                                                type="number"
                                                step="0.01"
                                                className="py-6 bg-[#edededed]"
                                                placeholder="Product price"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Discount Price */}
                            <FormField
                                control={form.control}
                                name="discountPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                type="number" step="0.01" className="py-6 bg-[#edededed]" placeholder="Discounted price (optional)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Stock */}
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                type="number" className="py-6 bg-[#edededed]" placeholder="Available stock" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* SKU */}
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex gap-2">
                                            <FormLabel>SKU</FormLabel>
                                            <p className='text-red-500'>*</p>
                                        </div>
                                        <FormControl>
                                            <Input className="py-6 bg-[#edededed]" {...field} placeholder="Unique SKU" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>

                    <div className='bg-white p-4 rounded custom-light-shadow-box'>

                        <h1 className='text-gray-500 font-bold text-[12pt] mb-4'>Categories & Tags</h1>

                        <div className="space-y-3 p-3">
                            {/* Category */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                className="py-6 bg-[#edededed]" placeholder="Category" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tags */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                className="py-6 bg-[#edededed]" placeholder="Comma-separated tags" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </div>

                    <div className='bg-white p-4 rounded custom-light-shadow-box'>

                        <h1 className='text-gray-500 font-bold text-[12pt] mb-4'>Size</h1>

                        <div className="space-y-3">
                            {/* Weight */}
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight</FormLabel>
                                        <FormControl>
                                            <Input

                                                {...field}
                                                value={field.value ?? ""}
                                                className="py-6 bg-[#edededed]" placeholder="Weight (e.g., 1kg)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dimensions */}
                            <FormField
                                control={form.control}
                                name="dimensions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dimensions</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                className="py-6 bg-[#edededed]"
                                                placeholder="Dimensions (e.g., 10x20x5 cm)"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                    </div>

                    <div className='bg-white p-4 rounded custom-light-shadow-box'>

                        <h1 className='text-gray-500 font-bold text-[12pt] mb-4'>Size</h1>

                        <div className="space-y-3">
                            {/* Rating */}
                            <FormField
                                control={form.control}
                                name="rating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rating</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                type="number" step="0.1" min="0" max="5" className="py-6 bg-[#edededed]" placeholder="0 - 5 rating" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Review Count */}
                            <FormField
                                control={form.control}
                                name="reviewCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Review Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                type="number" className="py-6 bg-[#edededed]" placeholder="Number of reviews" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className='bg-white p-4 rounded custom-light-shadow-box'>

                        <h1 className='text-gray-500 font-bold text-[12pt] mb-4'>Product Status</h1>

                        <div className="space-y-3">

                            {/* Is Active */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(val) => field.onChange(val === "true")}
                                                defaultValue={String(field.value ?? true)}   // 👈 ensure string always set
                                            >
                                                <SelectTrigger className="py-6 w-full bg-[#edededed]">
                                                    <SelectValue placeholder="Active or Inactive" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Active</SelectItem>
                                                    <SelectItem value="false">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className='bg-white p-4 rounded custom-light-shadow-box'>

                        <h1 className='text-gray-500 font-bold text-[12pt] mb-4'>Targeted Market</h1>

                        <div className="space-y-3">

                            {/* Is Active */}
                            <FormField
                                control={form.control}
                                name="productTarget"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex gap-2">
                                            <FormLabel>Target Market</FormLabel>
                                            <p className='text-red-500'>*</p>
                                        </div>
                                        <FormControl>
                                            <Input className="py-6 bg-[#edededed]" {...field} placeholder="Target Market" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>


                    <Button type="submit" disabled={loading}

                        className='bg-teal-600 w-full hover:bg-teal-500 text-white py-7'
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {mode === 'create' ? 'Create Product' : 'Update Product'}
                    </Button>
                </form>
            </Form>

            {openMedia && (
                <div className='fixed inset-0 bg-black/50 p-8 z-50'>
                    <div className="flex flex-col justify-center h-full">
                        <div className='w-full bg-white rounded teal-shadow-box p-4 flex flex-col gap-4 justify-center h-[500px] overflow-y-hidden'>
                            <div className="flex justify-end">
                                <Button
                                    className='text-lg text-end w-fit font-bold cursor-pointer text-gray-400 bg-gray-100 hover:bg-gray-200 border border-gray-300'
                                    onClick={() => setOpenMedia(false)}
                                >
                                    x
                                </Button>
                            </div>
                            <MediaImages
                                onSelect={(image) => {
                                    setSelectedImage(image);
                                    form.setValue('imageUrl', image.imageUrl);
                                    setOpenMedia(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateOrUpdateProduct;
