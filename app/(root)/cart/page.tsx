'use client'
import config from "@/lib/config";
import { IKImage, ImageKitProvider } from "imagekitio-next";
import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react";
import { toast } from "sonner";
import { Minus, Plus, RefreshCw, ShieldCheck, Trash2, Lock, Tag } from "lucide-react";
import CheckoutPage from "@/components/CheckoutPage";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button"

const { urlEndpoint, publicKey } = config.env.imagekit;

interface CartItem {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    imageUrl: string;
    quantity: number;

    priceSnapshot: string;
    discountSnapshot?: string | null;

    selectedOptions?: any | null;
    isActive?: boolean;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}
const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);

    const router = useRouter();
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch("/api/cart");
                const data = await res.json();

                if (!data.success) {
                    toast.error(data.message || "Failed to fetch cart");
                    setLoading(false);
                    return;
                }

                setCartItems(data.data);
            } catch (error) {
                console.error(error);
                toast.error("Error fetching cart");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleIncrease = async (cartId: string) => {
        const item = cartItems.find(i => i.id === cartId);
        if (!item) return;

        const newQty = item.quantity + 1;

        // Optimistic update
        setCartItems(prev =>
            prev.map(i =>
                i.id === cartId ? { ...i, quantity: newQty } : i
            )
        );

        try {
            const res = await fetch("/api/cart/quantity", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartItemId: cartId,
                    quantity: newQty,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error();
        } catch {
            // rollback
            setCartItems(prev =>
                prev.map(i =>
                    i.id === cartId ? { ...i, quantity: item.quantity } : i
                )
            );
            toast.error("Failed to update quantity");
        }
    };

    const handleDecrease = async (cartId: string) => {
        const item = cartItems.find(i => i.id === cartId);
        if (!item) return;

        if (item.quantity === 1) {
            handleDeleteItem(cartId);
            return;
        }

        const newQty = item.quantity - 1;

        setCartItems(prev =>
            prev.map(i =>
                i.id === cartId ? { ...i, quantity: newQty } : i
            )
        );

        try {
            const res = await fetch("/api/cart/quantity", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartItemId: cartId,
                    quantity: newQty,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error();
        } catch {
            setCartItems(prev =>
                prev.map(i =>
                    i.id === cartId ? { ...i, quantity: item.quantity } : i
                )
            );
            toast.error("Failed to update quantity");
        }
    };

    const handleDeleteItem = async (cartId: string) => {
        let snapshot: typeof cartItems;

        setCartItems(prev => {
            snapshot = prev; // save snapshot for rollback
            return prev.filter(item => item.id !== cartId);
        });

        try {
            const res = await fetch("/api/cart/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId: cartId }),
            });

            if (!res.ok) throw new Error("Request failed");

            const data = await res.json();
            if (!data.success) throw new Error("Delete failed");
        } catch (error) {
            setCartItems(snapshot!); // rollback safely
            toast.error("Failed to remove item");
        }
    };

    const handleDeleteCart = async (userId: string) => {
        try {
            const res = await fetch("/api/cart/delete-all-items", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId: userId }),
            });

            if (!res.ok) throw new Error("Request failed");

            const data = await res.json();
            if (!data.success) throw new Error("Delete failed");
        } catch (error) {
            toast.error("Failed to remove item");
        }
    }

    const getItemSubtotal = (item: CartItem) => {
        const price = Number(item.priceSnapshot);
        const discount = item.discountSnapshot ? Number(item.discountSnapshot) : 0;
        let finalPrice = 0
        if (discount > 0) {
            finalPrice = discount;
        }
        if (discount < 0) {
            finalPrice = price;
        }
        return finalPrice * item.quantity;
    };

    const cartSubtotal = cartItems.reduce(
        (total, item) => total + getItemSubtotal(item),
        0
    );

    const saved = (item: CartItem) => {
        const price = Number(item.priceSnapshot);
        const discount = item.discountSnapshot ? Number(item.discountSnapshot) : 0;
        const finalSavedAmount = price - discount;

        return finalSavedAmount * item.quantity
    }

    if (loading) return <p className="p-6 text-gray-500">Loading cart...</p>;
    if (cartItems.length === 0) return <p className="p-6 text-gray-500">Your cart is empty</p>;

    return (
        <div className='mt-8 px-6 md:px-8'>
            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                <div className="space-y-4 pb-32 ">
                    {/* Items list */}
                    <div className="space-y-3 pb-4 md:pb-0">
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
                            Your cart · <span className="text-foreground">{cartItems.length} items</span>
                        </p>

                        {cartItems.map(item => {
                            const effectivePrice = item.discountSnapshot
                                ? Number(item.discountSnapshot)
                                : Number(item.priceSnapshot)
                            const hasDiscount = item.discountSnapshot &&
                                Number(item.discountSnapshot) < Number(item.priceSnapshot)
                            const pctOff = hasDiscount
                                ? Math.round((1 - Number(item.discountSnapshot) / Number(item.priceSnapshot)) * 100)
                                : 0

                            return (
                                <div key={item.id} className="flex gap-4 p-4 bg-white border border-border/50 rounded-xl">
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-lg bg-muted border border-border/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        <IKImage path={item.imageUrl || ""} alt={item.productName || ""} width={80} height={80} className="object-cover w-full h-full" />
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.productName}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                                            {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                                        </p>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-sm font-semibold">R{(effectivePrice * item.quantity).toFixed(2)}</span>
                                            {hasDiscount && (
                                                <>
                                                    <span className="text-xs text-muted-foreground line-through">
                                                        R{(Number(item.priceSnapshot) * item.quantity).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded-full">
                                                        -{pctOff}%
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Qty controls */}
                                        <div className="flex items-center gap-2 mt-3">
                                            {item.quantity === 1 ? (
                                                <button onClick={() => handleDeleteItem(item.id)} className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors">
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleDecrease(item.id)} className="w-7 h-7 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                            )}
                                            <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                            <button onClick={() => handleIncrease(item.id)} className="w-7 h-7 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="ml-auto text-xs text-muted-foreground hover:text-red-500 transition-colors">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Order summary */}
                    <div className="bg-white border border-border/50 rounded-xl p-5 space-y-3">
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Order summary</p>

                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>R{cartSubtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-[11px] text-green-600">
                            <span className="flex items-center gap-1 ">
                                <Tag className="w-3 h-3" />
                                You Saved
                            </span>
                            <span className="">{saved.toString()}</span>
                        </div>


                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Delivery</span>
                            <span className="text-green-600">TBD by runner</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t border-border pt-3 mt-1">
                            <span>Total</span>
                            <span className="text-base">R{cartSubtotal.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => {
                                sessionStorage.setItem("checkout_cart", JSON.stringify(cartItems))
                                sessionStorage.setItem("checkout_total", JSON.stringify(cartSubtotal))
                                router.push("/checkout")
                            }}
                            className="w-full py-3 bg-black text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-black/80 transition-colors mt-2"
                        >
                            <Lock className="w-4 h-4" />
                            Proceed to checkout
                        </button>

                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> 100% authentic products
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <RefreshCw className="w-3.5 h-3.5 text-green-500" /> 30-day return policy
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Lock className="w-3.5 h-3.5 text-green-500" /> Secure checkout
                            </div>
                        </div>
                    </div>

                </div>

            </ImageKitProvider>
        </div>
    )
}

export default Cart;