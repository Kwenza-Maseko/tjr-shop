'use client'

import {
  Loader2,
  Mail,
  User2,
  Lock,
  Package,
  Truck,
  MapPin
} from "lucide-react"

import { Button } from '@/components/ui/button'
import { useState } from "react"
import { useAuth } from "./providers/AuthProvider"

interface CheckoutProps {
  cartItems: any[]
  cartSubtotal: number
}

type ShippingMethod = "pickup" | "delivery" | null

interface DeliveryAddress {
  streetAddress: string
  suburb: string
  city: string
  province: string
  postalCode: string
}

const CheckoutPage = ({ cartItems, cartSubtotal }: CheckoutProps) => {

  const [load, setLoading] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(null)
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    streetAddress: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: "",
  })
  const [addressErrors, setAddressErrors] = useState<Partial<DeliveryAddress>>({})

  const { user, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  const handleShipping = (method: ShippingMethod) => {
    setSelectedShipping(method)
    setAddressErrors({})
  }

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }))
    if (addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateAddress = (): boolean => {
    const errors: Partial<DeliveryAddress> = {}
    if (!deliveryAddress.streetAddress.trim()) errors.streetAddress = "Street address is required"
    if (!deliveryAddress.city.trim()) errors.city = "City is required"
    if (!deliveryAddress.province.trim()) errors.province = "Province is required"
    if (!deliveryAddress.postalCode.trim()) errors.postalCode = "Postal code is required"
    else if (!/^\d{4}$/.test(deliveryAddress.postalCode.trim())) errors.postalCode = "Enter a valid 4-digit postal code"
    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const redirectToPayfast = (data: any) => {
    const form = document.createElement("form")
    form.method = "POST"
    form.action = data.url

    const fieldOrder = [
      "merchant_id",
      "merchant_key",
      "return_url",
      "cancel_url",
      "notify_url",
      "name_first",
      "name_last",
      "email_address",
      "m_payment_id",
      "amount",
      "item_name",
      "signature",
    ]

    fieldOrder.forEach((key) => {
      if (data[key] === undefined || data[key] === null || key === "url") return
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = String(data[key])
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  const payWithPayfast = async () => {
    try {
      if (!selectedShipping) {
        alert("Please select a shipping method")
        return
      }

      if (selectedShipping === "delivery" && !validateAddress()) {
        return
      }

      setLoading(true)

      const res = await fetch("/api/payfast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartSubtotal.toFixed(2),
          item_name: "Order Payment",
          shipping_method: selectedShipping,
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot,
            discountSnapshot: item.discountSnapshot ?? null,
          })),
          deliveryAddress: selectedShipping === "delivery" ? deliveryAddress : null,
          customer: {
            id: user?.id,       // ✅ needed to insert order and clear cart
            email: user?.email,
            name: user?.name,
          }
        }),
      })

      const data = await res.json()

      if (!data?.url) throw new Error("Invalid PayFast response")

      redirectToPayfast(data)

    } catch (error) {
      console.error("PayFast Error:", error)
      alert("Payment failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (error?: string) =>
    `w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors
    ${error ? "border-red-400 bg-red-50" : "border-zinc-200 bg-white focus:border-black"}`

  const SA_PROVINCES = [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
    "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ]

  return (
    <div className='mt-8 px-6 md:px-8 flex justify-center'>
      <div className="w-full md:w-[800px] flex flex-col gap-4 items-center">

        <h1 className="text-lg font-bold">Checkout</h1>

        <div className="p-6 rounded-md bg-zinc-100 w-full text-center">
          <p>Total</p>
          <p className="text-lg font-bold">R{cartSubtotal.toFixed(2)}</p>
        </div>

        <div className="w-full mt-6 bg-white p-4 rounded-md space-y-8">

          <h1 className="mb-4 font-bold">CONTACT</h1>

          <div className="space-y-1 text-sm">
            <div className="flex gap-2 items-center">
              <Mail className="w-3.5" /> {user?.email}
            </div>
            <div className="flex gap-2 items-center">
              <User2 className="w-3.5" /> {user?.name}
            </div>
          </div>

          <div className="border-b" />

          {/* PAYMENT */}
          <div className="space-y-4">
            <div>
              <div className="flex gap-1 items-center">
                <h1 className="font-bold">PAYMENT</h1>
                <Lock className="w-3.5 text-zinc-400" />
              </div>
              <p className="text-green-500 text-sm">Secure payment via PayFast</p>
            </div>

            <div className="bg-zinc-100 rounded-md p-4 text-center text-sm text-gray-600">
              You'll be redirected to PayFast to complete your payment.
            </div>

            {/* SHIPPING METHOD */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleShipping("pickup")}
                className={`p-4 rounded-md flex flex-col items-center gap-2 w-full transition-colors
                  ${selectedShipping === "pickup" ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <Package className="w-6 h-6" />
                Pick Up
              </button>

              <button
                type="button"
                onClick={() => handleShipping("delivery")}
                className={`p-4 rounded-md flex flex-col items-center gap-2 w-full transition-colors
                  ${selectedShipping === "delivery" ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <Truck className="w-6 h-6" />
                Delivery
              </button>
            </div>

            {/* DELIVERY ADDRESS FORM */}
            {selectedShipping === "delivery" && (
              <div className="border border-zinc-200 rounded-md p-4 space-y-4">

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </div>

                {/* Street Address */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-medium">Street Address *</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Main Road"
                    value={deliveryAddress.streetAddress}
                    onChange={(e) => handleAddressChange("streetAddress", e.target.value)}
                    className={inputClass(addressErrors.streetAddress)}
                  />
                  {addressErrors.streetAddress && (
                    <p className="text-xs text-red-500">{addressErrors.streetAddress}</p>
                  )}
                </div>

                {/* Suburb */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-medium">Suburb</label>
                  <input
                    type="text"
                    placeholder="e.g. Sandton"
                    value={deliveryAddress.suburb}
                    onChange={(e) => handleAddressChange("suburb", e.target.value)}
                    className={inputClass()}
                  />
                </div>

                {/* City + Province */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="space-y-1 w-full">
                    <label className="text-xs text-zinc-500 font-medium">City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Durban"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className={inputClass(addressErrors.city)}
                    />
                    {addressErrors.city && (
                      <p className="text-xs text-red-500">{addressErrors.city}</p>
                    )}
                  </div>

                  <div className="space-y-1 w-full">
                    <label className="text-xs text-zinc-500 font-medium">Province *</label>
                    <select
                      value={deliveryAddress.province}
                      onChange={(e) => handleAddressChange("province", e.target.value)}
                      className={inputClass(addressErrors.province) + " cursor-pointer"}
                    >
                      <option value="">Select province</option>
                      {SA_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {addressErrors.province && (
                      <p className="text-xs text-red-500">{addressErrors.province}</p>
                    )}
                  </div>
                </div>

                {/* Postal Code */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-medium">Postal Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. 4001"
                    maxLength={4}
                    value={deliveryAddress.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value.replace(/\D/g, ""))}
                    className={inputClass(addressErrors.postalCode) + " w-32"}
                  />
                  {addressErrors.postalCode && (
                    <p className="text-xs text-red-500">{addressErrors.postalCode}</p>
                  )}
                </div>

              </div>
            )}

          </div>

          <div className="border-b" />

          <Button
            type="button"
            onClick={payWithPayfast}
            disabled={load}
            className="bg-black hover:bg-black/80 w-full py-7 text-white font-bold"
          >
            {load && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Pay R{cartSubtotal.toFixed(2)}
          </Button>

        </div>
      </div>
    </div>
  )
}

export default CheckoutPage