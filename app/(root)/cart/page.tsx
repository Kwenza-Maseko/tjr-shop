'use client'
import config from "@/lib/config";
import { IKImage, ImageKitProvider } from "imagekitio-next";
import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react";
import { toast } from "sonner";
import { Minus, Plus, Trash2 } from "lucide-react";
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

    const handleDeleteCart = async(userId: string) => {
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

    // Calculate the subtotal for a single cart item
    const getItemSubtotal = (item: CartItem) => {
        const price = Number(item.priceSnapshot); // original price
        const discount = item.discountSnapshot ? Number(item.discountSnapshot) : 0; // discount amount

        const finalPrice = price - discount; // actual price after discount
        return finalPrice * item.quantity;
    };

    // Calculate total cart subtotal
    const cartSubtotal = cartItems.reduce(
        (total, item) => total + getItemSubtotal(item),
        0
    );

    const getDiscount = (priceSnapshot?: string | null, discountSnapshot?: string | null): number | null => {
        if (!priceSnapshot || !discountSnapshot) return null;

        const price = Number(priceSnapshot);
        const discount = Number(discountSnapshot);

        if (isNaN(price) || isNaN(discount) || price <= 0) return null;

        return Math.round(price - discount);
    };


    if (loading) return <p className="p-6 text-gray-500">Loading cart...</p>;
    if (cartItems.length === 0) return <p className="p-6 text-gray-500">Your cart is empty</p>;

    return (
        <div className='mt-8 px-6 md:px-8'>
            <div className="flex justify-between items-center mb-6">
                <p className="text-lg font-bold">My Cart</p>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button
                            className="text-xs text-gray-600 hover:underline"
                            onClick={() => handleDeleteCart("hdhhhdhjhd")}
                        >
                            Clear All
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to remove all items?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove your items
                                from your cart.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setCartItems([])}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                <div className="space-y-4 pb-32">
                    {cartItems.map((item) => {
                        // Calculate discount for this specific item
                        const discountAmount = getDiscount(item.priceSnapshot, item.discountSnapshot);

                        return (
                            <div
                                key={item.id}
                                className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm"
                            >
                                <IKImage
                                    path={item.imageUrl || ""}
                                    alt={item.productName || "Product Image"}
                                    className="w-20 h-20 object-cover rounded-xl"
                                    width={80}
                                    height={80}
                                />

                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">
                                        {item.productName}
                                    </p>

                                    <p className="text-xs text-gray-500 capitalize">
                                        {item.selectedOptions &&
                                            Object.entries(item.selectedOptions)
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join(", ")}
                                    </p>

                                    {/* Show discount if exists */}
                                    {discountAmount !== null ? (
                                        <>
                                            <p className="text-sm font-semibold text-gray-600 mt-2">
                                                R{discountAmount}
                                            </p>
                                            <p className="text-xs text-zinc-600">
                                                Actual Price: <span className="font-semibold line-through">R{item.priceSnapshot}</span>
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-600 mt-2">
                                            R{item.priceSnapshot}
                                        </p>
                                    )}

                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-3 mt-6">
                                        {item.quantity === 1 ? (
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-2 rounded-full border hover:bg-red-50"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDecrease(item.id)}
                                                className="p-2 rounded-full border"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        )}

                                        <span className="font-semibold w-6 text-center">
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() => handleIncrease(item.id)}
                                            className="p-2 rounded-full border"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>

            </ImageKitProvider>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 px-6 md:px-8">
                <div className="space-y-6">
                    <div className="flex justify-between border-b border-gray-300 py-3 text-gray-500 text-[10pt]">
                        <p className="">Subtotal</p>
                        <p className="font-bold">
                            R{cartSubtotal.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex justify-between font-bold">
                        <p className="">Total</p>
                        <p className="text-lg">
                            R{cartSubtotal.toFixed(2)}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            sessionStorage.setItem("checkout_cart", JSON.stringify(cartItems));
                            sessionStorage.setItem("checkout_total", JSON.stringify(cartSubtotal));
                            router.push("/checkout");
                        }}
                        className="bg-black text-white px-6 py-3 rounded-xl font-semibold w-full"
                    >
                        Proceed to Checkout
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Cart;