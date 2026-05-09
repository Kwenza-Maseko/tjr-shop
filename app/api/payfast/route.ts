// app/api/payfast/route.ts
import { db } from "@/database/drizzle"
import { ordersTable } from "@/database/schema"
import crypto from "crypto"

function generateSignature(data: Record<string, string>, passphrase: string): string {
  const phpEncode = (val: string) =>
    encodeURIComponent(val)
      .replace(/%20/g, "+")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")

  const queryString = Object.entries(data)
    .map(([key, val]) => `${key}=${phpEncode(val.trim())}`)
    .join("&")

  const stringToSign = passphrase
    ? `${queryString}&passphrase=${phpEncode(passphrase.trim())}`
    : queryString

  return crypto.createHash("md5").update(stringToSign).digest("hex")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { amount, item_name, shipping_method, cartItems, deliveryAddress, customer } = body

    const merchant_id = process.env.PAYFAST_MERCHANT_ID!
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY!
    const passphrase = process.env.PAYFAST_PASSPHRASE!

    const paymentId = Date.now().toString()

    const nameParts = (customer?.name || "Customer User").trim().split(" ")
    const name_first = nameParts[0] || "Customer"
    const name_last = nameParts.slice(1).join(" ") || "User"

    // ✅ Create a PENDING order in DB before redirecting to PayFast
    await db.insert(ordersTable).values({
      userId: customer.id,
      mPaymentId: paymentId,
      paymentStatus: "PENDING",
      status: "PENDING",
      shippingMethod: shipping_method.toUpperCase() as "PICKUP" | "DELIVERY",
      subtotal: amount,
      total: amount,
      items: cartItems.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        discountSnapshot: item.discountSnapshot ?? null,
      })),
      customerName: customer.name,
      customerEmail: customer.email,
      // Only set delivery fields if applicable
      ...(shipping_method === "delivery" && deliveryAddress ? {
        deliveryStreetAddress: deliveryAddress.streetAddress,
        deliverySuburb: deliveryAddress.suburb,
        deliveryCity: deliveryAddress.city,
        deliveryProvince: deliveryAddress.province,
        deliveryPostalCode: deliveryAddress.postalCode,
      } : {}),
    })

    const data: Record<string, string> = {
      merchant_id: merchant_id.trim(),
      merchant_key: merchant_key.trim(),
      return_url: "https://x2cpx5sn-3000.inc1.devtunnels.ms/success",
      cancel_url: "https://x2cpx5sn-3000.inc1.devtunnels.ms/cancel",
      notify_url: "https://x2cpx5sn-3000.inc1.devtunnels.ms/api/notify",
      name_first,
      name_last,
      email_address: (customer?.email || "test@test.com").trim(),
      m_payment_id: paymentId,
      amount: Number(amount).toFixed(2),
      item_name: `${item_name} (${shipping_method})`,
    }

    const signature = generateSignature(data, passphrase)

    return Response.json({
      url: "https://sandbox.payfast.co.za/eng/process",
      ...data,
      signature,
    })

  } catch (error) {
    console.error("PayFast Error:", error)
    return Response.json({ error: "Payment error" }, { status: 500 })
  }
}