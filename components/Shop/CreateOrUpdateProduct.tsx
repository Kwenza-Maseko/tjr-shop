'use client'

import { productValidation } from '@/lib/validation';
import { ProductParams } from '@/types';
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

import config from '@/lib/config';
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import MediaImages from './MediaImages';
import ColorPicker from '../ColorPicker';
import { createOrUpdateProduct } from '@/lib/store/product';
import { useForm, UseFormReturn, DefaultValues, SubmitHandler, FieldValues, Path, Resolver } from "react-hook-form"
import {
    ImageIcon, Loader2, Check, ChevronsUpDown,
    Tag, Package, Ruler, Star, Zap, Users, Award, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    PRODUCT_TARGETS,
    CATEGORIES_BY_TARGET,
    PRODUCT_TYPES_BY_CATEGORY,
} from '@/lib/constants/nav'

type CreateOrUpdateProductParams = {
    productToEdit?: ProductParams
    mode: 'create' | 'update'
    onSuccess: (newProduct: ProductParams, mode: 'create' | 'update') => void
}

type MediaItem = { id: string; imageUrl: string }

const { urlEndpoint, publicKey } = config.env.imagekit

const COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#ff0000' },
    { name: 'Blue', hex: '#0000ff' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#ffff00' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Purple', hex: '#800080' },
]

const BRANDS = ['Nike', 'Adidas', 'Gucci', 'Louis Vuitton', 'New Balance', 'Puma', 'North Face', 'Umbro']

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon, title, children }: {
    icon: React.ReactNode; title: string; children: React.ReactNode
}) {
    return (
        <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
                <span className="text-muted-foreground">{icon}</span>
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {title}
                </p>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function FieldRow({ label, required, children }: {
    label: string; required?: boolean; children: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    )
}

const inputClass = "h-9 text-sm bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0"

// ─── Main ─────────────────────────────────────────────────────────────────────

const CreateOrUpdateProduct = ({ productToEdit, mode, onSuccess }: CreateOrUpdateProductParams) => {
    const [loading, setLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null)
    const [openMedia, setOpenMedia] = useState(false)
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
    const [textColor, setTextColor] = useState('#000000')
    const [brandOpen, setBrandOpen] = useState(false)
    const [customBrand, setCustomBrand] = useState('')

    const form = useForm<z.infer<typeof productValidation>>({
        resolver: zodResolver(productValidation) as any,
        defaultValues: {
            id: productToEdit?.id ?? '',
            productName: productToEdit?.productName ?? '',
            imageUrl: productToEdit?.imageUrl ?? '',
            description: productToEdit?.description ?? null,
            productTarget: productToEdit?.productTarget ?? '',
            productType: productToEdit?.productType ?? null,
            color: productToEdit?.color ?? null,
            price: productToEdit?.price ?? ('' as any),   // empty string shows blank input
            discountPrice: productToEdit?.discountPrice ?? null,
            stock: productToEdit?.stock ?? 0,
            sku: productToEdit?.sku ?? '',
            category: productToEdit?.category ?? null,
            tags: productToEdit?.tags ?? null,
            weight: productToEdit?.weight ?? null,
            dimensions: productToEdit?.dimensions ?? null,
            rating: productToEdit?.rating ?? null,
            reviewCount: productToEdit?.reviewCount ?? 0,
            isActive: productToEdit?.isActive ?? true,
            relatedProducts: productToEdit?.relatedProducts ?? null,
            variants: productToEdit?.variants ?? null,
            brand: productToEdit?.brand ?? null,
        },
    })
    const watchedTarget = form.watch('productTarget')   // e.g. "men"
    const watchedCategory = form.watch('category')
    const availableCategories = watchedTarget
        ? (CATEGORIES_BY_TARGET[watchedTarget] ?? [])
        : []

    const availableTypes = watchedCategory
        ? (PRODUCT_TYPES_BY_CATEGORY[watchedCategory] ?? [])
        : []

    useEffect(() => {
        if (productToEdit) {
            // Editing — fill form with product data
            form.reset({
                id: productToEdit.id,
                productName: productToEdit.productName,
                imageUrl: productToEdit.imageUrl,
                description: productToEdit.description ?? null,
                productTarget: productToEdit.productTarget,
                productType: productToEdit.productType ?? null,
                color: productToEdit.color ?? null,
                price: productToEdit.price,
                discountPrice: productToEdit.discountPrice ?? null,
                stock: productToEdit.stock ?? 0,
                sku: productToEdit.sku,
                category: productToEdit.category ?? null,
                tags: productToEdit.tags ?? null,
                weight: productToEdit.weight ?? null,
                dimensions: productToEdit.dimensions ?? null,
                rating: productToEdit.rating ?? null,
                reviewCount: productToEdit.reviewCount ?? 0,
                isActive: productToEdit.isActive ?? true,
                relatedProducts: productToEdit.relatedProducts ?? null,
                variants: productToEdit.variants ?? null,
                brand: productToEdit.brand ?? null,
            })
        } else {
            // New product — clear everything
            form.reset({
                id: '', productName: '', imageUrl: '', description: null,
                productTarget: '', productType: null, color: null,
                price: '' as any, discountPrice: null, stock: 0, sku: '',
                category: null, tags: null, weight: null, dimensions: null,
                rating: null, reviewCount: 0, isActive: true,
                relatedProducts: null, variants: null, brand: null,
            })
            setSelectedImage(null)
        }
    }, [productToEdit])


    const submitProduct = async (values: z.infer<typeof productValidation>) => {
        const imageUrl = selectedImage?.imageUrl || values.imageUrl
        if (!imageUrl) { toast.error('Please select an image'); return }

        setLoading(true)

        const payload: ProductParams = {
            id: values.id,
            productName: values.productName,
            imageUrl: selectedImage?.imageUrl ?? values.imageUrl,
            description: values.description ?? null,
            productTarget: values.productTarget,
            productType: values.productType ?? null,
            color: values.color ?? null,
            price: values.price,
            discountPrice: values.discountPrice ?? null,
            stock: values.stock ?? 0,
            sku: values.sku,
            category: values.category ?? null,
            tags: values.tags ?? null,
            weight: values.weight ?? null,
            dimensions: values.dimensions ?? null,
            rating: values.rating ?? 0,
            reviewCount: values.reviewCount ?? 0,
            isActive: values.isActive ?? true,
            relatedProducts: values.relatedProducts ?? null,
            variants: values.variants ?? null,
            brand: values.brand ?? null,
        }

        const result = await createOrUpdateProduct(payload)
        setLoading(false)

        if (result.success && result.data) {
            toast.success(`Product ${result.action} successfully`)

            // ✅ Normalize DB response (numeric columns come back as strings from Drizzle)
            const normalized: ProductParams = {
                id: result.data.id,
                productName: result.data.productName,
                imageUrl: result.data.imageUrl,
                description: result.data.description ?? null,
                productTarget: result.data.productTarget,
                productType: result.data.productType ?? null,
                color: result.data.color ?? null,
                price: Number(result.data.price),
                discountPrice: result.data.discountPrice != null ? Number(result.data.discountPrice) : null,
                stock: result.data.stock ?? 0,
                sku: result.data.sku,
                category: result.data.category ?? null,
                tags: result.data.tags ?? null,
                weight: result.data.weight != null ? Number(result.data.weight) : null,
                dimensions: result.data.dimensions ?? null,
                rating: result.data.rating != null ? Number(result.data.rating) : 0,
                reviewCount: result.data.reviewCount ?? 0,
                isActive: result.data.isActive ?? true,
                relatedProducts: Array.isArray(result.data.relatedProducts)
                    ? result.data.relatedProducts as string[]
                    : null,
                variants: result.data.variants as Record<string, string[]> | null ?? null,
                brand: result.data.brand ?? null,
            }

            onSuccess(normalized, result.action === 'updated' ? 'update' : 'create')
            setSelectedImage(null)
        } else {
            toast.error(result.message || 'Failed to save product')
        }
    }

    const previewImage = selectedImage?.imageUrl || productToEdit?.imageUrl

    return (
        <div className="w-full max-w-2xl space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(submitProduct)} className="space-y-4">

                    {/* ── Image + basic info ─────────────────────────────── */}
                    <Section icon={<ImageIcon className="w-4 h-4" />} title="Product">
                        <div className="flex gap-4">

                            {/* Image picker */}
                            <div
                                onClick={() => setOpenMedia(true)}
                                className="relative w-32 h-32 rounded-xl border-2 border-dashed border-border flex-shrink-0 overflow-hidden cursor-pointer hover:border-black transition-colors group bg-muted/30"
                            >
                                <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                                    {previewImage ? (
                                        <IKImage
                                            path={previewImage}
                                            alt="Product"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-1.5 text-muted-foreground">
                                            <ImageIcon className="w-6 h-6" />
                                            <p className="text-[10px] uppercase tracking-widest">Image</p>
                                        </div>
                                    )}
                                </ImageKitProvider>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white text-xs font-medium">Change</p>
                                </div>
                            </div>

                            {/* Name + description */}
                            <div className="flex-1 space-y-3">
                                <FormField
                                    control={form.control}
                                    name="productName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FieldRow label="Product Name" required>
                                                <FormControl>
                                                    <Input className={inputClass} {...field} placeholder="e.g. Classic White Tee" />
                                                </FormControl>
                                            </FieldRow>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FieldRow label="Description">
                                                <FormControl>
                                                    <Input className={inputClass} {...field} value={field.value ?? ''} placeholder="Short product description" />
                                                </FormControl>
                                            </FieldRow>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Color picker */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FieldRow label="Color">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {COLORS.map(color => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    title={color.name}
                                                    onClick={() => field.onChange(color.name)}
                                                    className={`w-7 h-7 rounded-full border-2 transition-all
                                                        ${field.value === color.name
                                                            ? 'border-black scale-110 shadow-md'
                                                            : 'border-transparent hover:border-gray-300'}`}
                                                    style={{ backgroundColor: color.hex, outline: color.hex === '#ffffff' ? '1px solid #e5e7eb' : undefined }}
                                                />
                                            ))}
                                            {/* Custom color */}
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsColorPickerOpen(p => !p)}
                                                    className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 hover:border-black transition-colors"
                                                    style={{ backgroundColor: textColor }}
                                                    title="Custom color"
                                                />
                                                {isColorPickerOpen && (
                                                    <div className="absolute top-9 left-0 z-20 bg-white shadow-lg rounded-xl border border-border p-2">
                                                        <ColorPicker
                                                            value={textColor}
                                                            onPickerChange={(color) => {
                                                                setTextColor(color)
                                                                field.onChange(color)
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {field.value && (
                                                <span className="text-xs text-muted-foreground">
                                                    Selected: <strong>{field.value}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </FieldRow>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Section>

                    {/* ── Pricing & Inventory ────────────────────────────── */}
                    <Section icon={<Tag className="w-4 h-4" />} title="Pricing & Inventory">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Price" required>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R</span>
                                                    <Input className={`${inputClass} pl-7`} {...field}
                                                        value={field.value === null || field.value === undefined ? '' : String(field.value)} type="number" step="0.01" placeholder="0.00" />
                                                </div>
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="discountPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Sale Price">
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R</span>
                                                    <Input className={`${inputClass} pl-7`} {...field}
                                                        value={field.value === null || field.value === undefined ? '' : String(field.value)} type="number" step="0.01" placeholder="0.00" />
                                                </div>
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Stock">
                                            <FormControl>
                                                <Input className={inputClass} {...field}
                                                    value={field.value === null || field.value === undefined ? '' : String(field.value)} type="number" placeholder="0" />
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="SKU" required>
                                            <FormControl>
                                                <Input className={`${inputClass} font-mono`} {...field} placeholder="e.g. TJR-001" />
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Section>

                    {/* ── Categories & Tags ──────────────────────────────── */}
                    <Section icon={<Package className="w-4 h-4" />} title="Categories & Tags">
                        <div className="grid grid-cols-2 gap-3">

                            {/* productTarget — men / women / kids / sport */}
                            <FormField
                                control={form.control}
                                name="productTarget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Target Audience" required>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val)
                                                    // Reset downstream when target changes
                                                    form.setValue('category', null)
                                                    form.setValue('productType', null)
                                                }}
                                                value={field.value ?? ''}
                                            >
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue placeholder="Select audience" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRODUCT_TARGETS.map(t => (
                                                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* category — Clothing / Shoes / Brand etc */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Category">
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val)
                                                    // Reset productType when category changes
                                                    form.setValue('productType', null)
                                                }}
                                                value={field.value ?? ''}
                                                disabled={!watchedTarget}
                                            >
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue placeholder={watchedTarget ? "Select category" : "Select audience first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableCategories.map(c => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* productType — Hoodies / Sneakers / Nike etc */}
                            <FormField
                                control={form.control}
                                name="productType"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FieldRow label="Product Type">
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''}
                                                disabled={!watchedCategory}
                                            >
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue placeholder={watchedCategory ? "Select type" : "Select category first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTypes.map(t => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Keep tags as free text */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FieldRow label="Tags">
                                            <FormControl>
                                                <Input
                                                    className={inputClass}
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    placeholder="sale, new, trending"
                                                />
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Section>

                    {/* ── Size & Dimensions ─────────────────────────────── */}
                    <Section icon={<Ruler className="w-4 h-4" />} title="Size & Dimensions">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Weight">
                                            <FormControl>
                                                <Input className={inputClass} {...field}
                                                    value={field.value === null || field.value === undefined ? '' : String(field.value)} placeholder="e.g. 1.2kg" />
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dimensions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Dimensions">
                                            <FormControl>
                                                <Input className={inputClass} {...field} value={field.value ?? ''} placeholder="10x20x5 cm" />
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Section>

                    {/* ── Ratings ───────────────────────────────────────── */}
                    <Section icon={<Star className="w-4 h-4" />} title="Ratings">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="rating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Rating (0–5)">
                                            <FormControl>
                                                <Input className={inputClass} {...field}
                                                    value={field.value === null || field.value === undefined ? '' : String(field.value)} type="number" step="0.1" min="0" max="5" placeholder="0.0" />
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reviewCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FieldRow label="Review Count">
                                            <FormControl>
                                                <Input className={inputClass} {...field} value={field.value === null || field.value === undefined ? '' : String(field.value)} type="number" placeholder="0" />
                                            </FormControl>
                                        </FieldRow>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Section>

                    {/* ── Status + Target ───────────────────────────────── */}
                    <Section icon={<Zap className="w-4 h-4" />} title="Status & Visibility">
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem>
                                    <FieldRow label="Status">
                                        <Select
                                            onValueChange={val => field.onChange(val === 'true')}
                                            defaultValue={String(field.value ?? true)}
                                        >
                                            <SelectTrigger className={inputClass}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="false">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Inactive
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FieldRow>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Section>

                    {/* ── Brand ─────────────────────────────────────────── */}
                    <Section icon={<Award className="w-4 h-4" />} title="Brand">
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FieldRow label="Brand">
                                        <FormControl>
                                            <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        role="combobox"
                                                        className={`${inputClass} w-full justify-between font-normal`}
                                                    >
                                                        {field.value || <span className="text-muted-foreground">Select or type a brand</span>}
                                                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search or type brand…" onValueChange={setCustomBrand} />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                <div className="p-3 space-y-2">
                                                                    <p className="text-xs text-muted-foreground">Brand not listed?</p>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        className="w-full h-7 text-xs"
                                                                        onClick={() => { field.onChange(customBrand); setBrandOpen(false) }}
                                                                    >
                                                                        Add &quot;{customBrand}&quot;
                                                                    </Button>
                                                                </div>
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {BRANDS.map(brand => (
                                                                    <CommandItem
                                                                        key={brand}
                                                                        value={brand}
                                                                        onSelect={val => { field.onChange(val); setBrandOpen(false) }}
                                                                    >
                                                                        <Check className={cn('mr-2 h-3.5 w-3.5', field.value === brand ? 'opacity-100' : 'opacity-0')} />
                                                                        {brand}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                    </FieldRow>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Section>

                    {/* ── Submit ────────────────────────────────────────── */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-black hover:bg-black/80 text-white font-medium rounded-xl"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {mode === 'create' ? 'Create Product' : 'Save Changes'}
                    </Button>

                </form>
            </Form>

            {/* ── Media modal ───────────────────────────────────────────── */}
            {openMedia && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <p className="text-sm font-medium">Select Image</p>
                            <button
                                type="button"
                                onClick={() => setOpenMedia(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <MediaImages
                                onSelect={image => {
                                    setSelectedImage(image)
                                    form.setValue('imageUrl', image.imageUrl)
                                    setOpenMedia(false)
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateOrUpdateProduct