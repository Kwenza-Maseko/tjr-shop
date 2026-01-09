'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductParams } from "@/types"
import { useEffect, useState } from "react"
import { IKImage, ImageKitProvider } from "imagekitio-next"
import { Calendar, DotIcon, Loader2, MenuIcon } from "lucide-react"
import config from "@/lib/config"
import { createDeal, getDeals, getProductsWithDeals, linkDealToProduct } from "@/lib/store/deals"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DatePicker } from "@/components/Shop/DatePicker"
import DealTimeSpanDisplay from "@/components/DealTimeSpanDisplay"

const { urlEndpoint, publicKey } = config.env.imagekit

interface ProductWithDeal extends ProductParams {
    dealCoupon?: string | null
}

const Discount = () => {
    const [products, setProducts] = useState<ProductWithDeal[]>([])
    const [deals, setDeals] = useState<any[]>([])
    const [selectedDeal, setSelectedDeal] = useState<string | null>(null)
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [dealCoupon, setDealCoupon] = useState("")
    const [percentage, setPercentage] = useState("")
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [linking, setLinking] = useState(false)

    // Fetch all products with linked deals
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productData = await getProductsWithDeals()
                if (productData) setProducts(productData)
            } catch (err) {
                console.error("Error fetching products:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    // Fetch all deals
    useEffect(() => {
        const fetchDeals = async () => {
            const res = await getDeals()
            if (res.success) setDeals(res.data || [])
        }
        fetchDeals()
    }, [])


    const handleCreateDeal = async () => {
        if (!dealCoupon || !percentage) return toast("Please fill all fields")
        setCreating(true)
        const res = await createDeal({ dealCoupon, percentage: Number(percentage) })
        setCreating(false)
        if (res.success) {
            setDeals(prev => [...prev, res.data])
            setDealCoupon("")
            setPercentage("")
            toast("Deal created successfully")
        } else {
            toast("Error creating deal")
        }
    }

    // Handle product selection
    const toggleProduct = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        )
    }

    // Select all products
    const selectAllProducts = () => {
        if (selectedProducts.length === products.length) setSelectedProducts([])
        else setSelectedProducts(products.map(p => p.id!))
    }

    // Link deal to selected products
    const handleLinkDeal = async () => {
        if (!selectedDeal) return toast("Select a deal first")
        if (selectedProducts.length === 0) return toast("Select at least one product")
        setLinking(true)
        const res = await linkDealToProduct({ dealId: selectedDeal, productIds: selectedProducts })
        setLinking(false)
        if (res.success) {
            toast("Deal linked successfully!")
            setSelectedProducts([])

            // Refresh products to show newly linked deal
            const refreshedProducts = await getProductsWithDeals()
            if (refreshedProducts) setProducts(refreshedProducts)
        } else {
            toast("Error linking deal")
        }
    }

    const handleCancel = () => {
        setSelectedDeal(null)
    }

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin inline-block" />
            </div>
        )
    }

    return (
        <div>
            <DealTimeSpanDisplay />
            <div className="px-4 md:px-8 pt-30">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                    Manage Deals
                </h2>

                {/* Create Deal Form */}
                <div className="flex flex-col md:flex-row gap-3 items-center mb-6">
                    <Input
                        placeholder="Deal Coupon (e.g. WINTER50)"
                        value={dealCoupon}
                        onChange={(e) => setDealCoupon(e.target.value)}
                        className="w-full md:w-1/3 bg-white"
                    />
                    <Input
                        placeholder="Percentage (e.g. 20)"
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="w-full md:w-1/3 bg-white"
                    />
                    <Button onClick={handleCreateDeal} disabled={creating}
                        className="bg-orange-300 text-orange-900 hover:bg-orange-200">
                        {creating ? <Loader2 className="w-4 h-4 animate-spin inline-block" /> : "Create Deal"}
                    </Button>
                </div>

                {/* Deal List */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {deals.length > 0 ? (
                        deals.map((deal) => (
                            <div
                                key={deal.id}
                                className={`flex items-center gap-2 py-2 px-4 rounded-full cursor-pointer transition 
                    ${selectedDeal === deal.id ? "bg-teal-600 text-white shadow-md" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                                onClick={() => setSelectedDeal(deal.id)}
                            >
                                <span className="font-semibold">{deal.dealCoupon}</span>
                                <span className="text-xs font-medium bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                                    {deal.percentage}%
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No deals yet</p>
                    )}
                </div>


                {/* Link to All Products */}
                {selectedDeal && (
                    <div className="flex items-center gap-3 mb-6">
                        <Button onClick={selectAllProducts} variant="secondary">
                            {selectedProducts.length === products.length ? "Unselect All" : "Select All Products"}
                        </Button>
                        <Button onClick={handleLinkDeal} disabled={linking}>
                            {linking ? <Loader2 className="w-4 h-4 animate-spin inline-block" /> : "Apply Deal"}
                        </Button>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger className="bg-orange-800 py-1.5 px-4 rounded-md hover:bg-orange-700 text-white"><Calendar className="w-4" /></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Set time span for this deal</AlertDialogTitle>
                                    <section className="mt-3">
                                        <DatePicker selectedDealId={selectedDeal} />
                                    </section>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}

                {/* Products Table */}
                <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100 uppercase tracking-[1px]">
                                {selectedDeal && <TableHead></TableHead>}
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead className="text-right">Deal</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <TableRow key={product.id} className="hover:bg-gray-50 transition">
                                            {selectedDeal && (
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.includes(product.id!)}
                                                        onChange={() => toggleProduct(product.id!)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {product.imageUrl ? (
                                                    <div className="relative w-10 h-10 rounded overflow-hidden">
                                                        <IKImage
                                                            path={product.imageUrl}
                                                            alt={product.productName}
                                                            className="object-contain"
                                                            width={40}
                                                            height={40}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No Image</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-[10.5pt] text-gray-800">
                                                {product.productName}
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-[10.5pt] capitalize">
                                                {product.productType || "-"}
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-[10.5pt]">
                                                {product.category || "-"}
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900 text-[10.5pt]">
                                                R{product.price?.toFixed(2) || "0.00"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="py-1 px-3 text-center rounded-full bg-green-100 text-green-900 w-fit text-xs">
                                                    R{product.discountPrice?.toFixed(2) || "0.00"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="flex justify-end items-center h-full">
                                                <div className="py-1 px-3 text-center rounded-full bg-orange-100 text-orange-900 w-fit text-xs">
                                                    {product.dealCoupon ?? "No Deal"}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={selectedDeal ? 8 : 7} className="text-center py-8 text-gray-500">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </ImageKitProvider>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default Discount
