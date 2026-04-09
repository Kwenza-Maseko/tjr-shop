'use client'

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  Mail,
  Phone,
  User2,
  Lock,
  Package,
  Truck
} from "lucide-react"

import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

import { Input } from "./ui/input"
import { checkoutContactDetails } from "@/lib/validation"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

interface CheckoutProps {
  cartItems: any[]
  cartSubtotal: number
}

type ShippingMethod = "pickup" | "delivery" | null

const CheckoutPage = ({ cartItems, cartSubtotal }: CheckoutProps) => {

  const [loading, setLoading] = useState(false)
  const [useDifferentContact, setUseDifferentContact] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(null)

  const form = useForm<z.infer<typeof checkoutContactDetails>>({
    resolver: zodResolver(checkoutContactDetails),
    defaultValues: {
      email: "",
      phone: "",
      firstname: "",
      lastname: "",
    },
  })

  const handleShipping = (method: ShippingMethod) => {
    setSelectedShipping(method)
  }

  const payWithPayfast = async (values: any) => {
    try {

      if (!selectedShipping) {
        alert("Please select a shipping method")
        return
      }

      setLoading(true)

      const res = await fetch("/api/payfast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: cartSubtotal.toFixed(2),
          item_name: "Order Payment",
          shipping_method: selectedShipping,
          cartItems
        }),
      })

      const data = await res.json()

      const paymentForm = document.createElement("form")
      paymentForm.method = "POST"
      paymentForm.action = data.url

      Object.entries(data).forEach(([key, value]) => {
        if (key !== "url") {
          const input = document.createElement("input")
          input.type = "hidden"
          input.name = key
          input.value = value as string
          paymentForm.appendChild(input)
        }
      })

      document.body.appendChild(paymentForm)
      paymentForm.submit()

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const submitContact = async (values: z.infer<typeof checkoutContactDetails>) => {
    await payWithPayfast(values)
  }

  return (
    <div className='mt-8 px-6 md:px-8 flex justify-center'>
      <div className="w-full md:w-[800px] flex flex-col gap-4 items-center">

        <h1 className="text-lg font-bold">Checkout</h1>

        <div className="p-6 rounded-md bg-zinc-100 w-full text-center">
          <p>Total</p>
          <p className="text-lg font-bold">R{cartSubtotal}</p>
        </div>

        <div className="w-full mt-6 bg-white p-4 rounded-md">

          <h1 className="mb-4 font-bold">CONTACT</h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitContact)}
              className="space-y-6 w-full"
            >

              {useDifferentContact ? (

                <div className="space-y-3">

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Email" className="py-5"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Phone Number"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">

                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input {...field} placeholder="Firstname"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastname"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input {...field} placeholder="Lastname"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>
                </div>

              ) : (

                <div className="space-y-1 text-sm">

                  <div className="flex gap-2 items-center">
                    <Mail className="w-3.5"/> username@gmail.com
                  </div>

                  <div className="flex gap-2 items-center">
                    <Phone className="w-3.5"/> 0123456789
                  </div>

                  <div className="flex gap-2 items-center">
                    <User2 className="w-3.5"/> Kwenza Maseko
                  </div>

                </div>

              )}

              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox
                    checked={useDifferentContact}
                    onCheckedChange={() =>
                      setUseDifferentContact(prev => !prev)
                    }
                  />
                  <Label>Use different contact details</Label>
                </Field>
              </FieldGroup>

              <div className="border-b"/>

              {/* PAYMENT */}

              <div className="space-y-4">

                <div>
                  <div className="flex gap-1 items-center">
                    <h1 className="font-bold">PAYMENT</h1>
                    <Lock className="w-3.5 text-zinc-400"/>
                  </div>
                  <p className="text-green-500 text-sm">
                    Secure and encrypted payment
                  </p>
                </div>

                <div className="bg-zinc-100 rounded-md h-20 flex items-center justify-center">
                  Pay with PayFast
                </div>

                {/* SHIPPING */}

                <div className="flex flex-col sm:flex-row gap-3">

                  <button
                    type="button"
                    onClick={() => handleShipping("pickup")}
                    className={`p-4 rounded-md flex flex-col items-center gap-2 w-full
                    ${selectedShipping === "pickup"
                      ? "bg-black text-white"
                      : "bg-gray-100"}`}
                  >
                    <Package className="w-6 h-6"/>
                    Pick Up
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShipping("delivery")}
                    className={`p-4 rounded-md flex flex-col items-center gap-2 w-full
                    ${selectedShipping === "delivery"
                      ? "bg-black text-white"
                      : "bg-gray-100"}`}
                  >
                    <Truck className="w-6 h-6"/>
                    Pep Store Delivery
                  </button>

                </div>

              </div>

              <div className="border-b"/>

              <Button
                type="submit"
                disabled={loading}
                className="bg-black hover:bg-black/80 w-full py-7 text-white font-bold"
              >

                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}

                Pay R{cartSubtotal}

              </Button>

            </form>
          </Form>

        </div>
      </div>
    </div>
  )
}

export default CheckoutPage