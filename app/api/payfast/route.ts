
import { db } from "@/database/drizzle"
import { pendingOrdersTable } from "@/database/schema"
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

    const orderMeta = {
      shipping_method,
      cartItems,
      deliveryAddress: shipping_method === "delivery" ? deliveryAddress : null,
      customer,
    }

    await db.insert(pendingOrdersTable).values({
      id: paymentId,
      data: {
        amount,
        shipping_method,
        cartItems,
        deliveryAddress: shipping_method === "delivery" ? deliveryAddress : null,
        customer,
      },
    })

    const data: Record<string, string> = {
      merchant_id: merchant_id.trim(),
      merchant_key: merchant_key.trim(),
      return_url: "https://tjr-shop.vercel.app/success",
      cancel_url: "https://tjr-shop.vercel.app/cancel",
      notify_url: "https://tjr-shop.vercel.app/api/notify",
      name_first,
      name_last,
      email_address: (customer?.email || "tjrshoponlinecustomer@tjr.com").trim(),
      m_payment_id: paymentId,
      amount: Number(amount).toFixed(2),
      item_name: `${item_name} (${shipping_method})`,
    }
    const signature = generateSignature(data, passphrase)

    return Response.json({
      url: "https://www.payfast.co.za/eng/process",
      ...data,
      signature,
    })

  } catch (error) {
    console.error("PayFast Error:", error)
    return Response.json({ error: "Payment error" }, { status: 500 })
  }
}