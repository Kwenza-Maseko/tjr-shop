import { db } from "@/database/drizzle"
import { cartTable, ordersTable, pendingOrdersTable } from "@/database/schema"
import { eq, lt } from "drizzle-orm"
import crypto from "crypto"

interface PendingOrderData {
  amount: string | number
  successToken?: string 
  shipping_method: string
  cartItems: {
    productId: string
    productName: string
    imageUrl: string
    quantity: number
    priceSnapshot: number
    discountSnapshot: number | null
  }[]
  deliveryAddress: {
    streetAddress: string
    suburb: string
    city: string
    province: string
    postalCode: string
  } | null
  customer: {
    id: string
    name: string
    email: string
  }
}

function verifyPayfastSignature(data: Record<string, string>, passphrase: string): boolean {
  const phpEncode = (val: string) =>
    encodeURIComponent(val)
      .replace(/%20/g, "+")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")

  const { signature, ...rest } = data

  const queryString = Object.entries(rest)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}=${phpEncode(v.trim())}`)
    .join("&")

  const stringToSign = `${queryString}&passphrase=${phpEncode(passphrase.trim())}`
  const computed = crypto.createHash("md5").update(stringToSign).digest("hex")

  return computed === signature
}

function isValidPayfastIP(ip: string): boolean {
  const PAYFAST_IPS = [
    "197.97.145.144",
    "197.97.145.145",
    "197.97.145.146",
    "197.97.145.147",
    "196.33.227.224",
    "196.33.227.225",
    "196.33.227.226",
    "196.33.227.227",
  ]
  return PAYFAST_IPS.includes(ip)
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      ""

    if (!isValidPayfastIP(ip)) {
      console.warn("Notify request from unknown IP:", ip)
      return new Response("Forbidden", { status: 403 })
    }

    const body = await req.text()
    const params = new URLSearchParams(body)
    const data = Object.fromEntries(params.entries())

    const passphrase = process.env.PAYFAST_PASSPHRASE!
    if (!verifyPayfastSignature(data, passphrase)) {
      console.warn("Invalid PayFast signature, possible spoofed request")
      return new Response("Invalid signature", { status: 400 })
    }

    const { m_payment_id, pf_payment_id, payment_status, amount_gross } = data

    if (payment_status !== "COMPLETE") {
      await Promise.all([
        db.delete(pendingOrdersTable).where(eq(pendingOrdersTable.id, m_payment_id)),
        db.delete(pendingOrdersTable).where(lt(pendingOrdersTable.createdAt, new Date(Date.now() - 1000 * 60 * 60 * 24))),
      ])
      return new Response("OK", { status: 200 })
    }
    const [existing] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.mPaymentId, m_payment_id))
      .limit(1)

    if (existing) {
      return new Response("OK", { status: 200 })
    }

    const [pending] = await db
      .select()
      .from(pendingOrdersTable)
      .where(eq(pendingOrdersTable.id, m_payment_id))
      .limit(1)

    if (!pending) {
      console.error("Pending order not found for:", m_payment_id)
      return new Response("Pending order not found", { status: 404 })
    }

    const pendingData = pending.data as PendingOrderData

    if (Number(amount_gross) !== Number(pendingData.amount)) {
      console.error("Amount mismatch — possible tampering:", {
        expected: pendingData.amount,
        received: amount_gross,
      })
      return new Response("Amount mismatch", { status: 400 })
    }

    const { shipping_method, cartItems, deliveryAddress, customer } = pendingData

    const [order] = await db
      .insert(ordersTable)
      .values({
        userId: customer.id,
        mPaymentId: m_payment_id,
        pfPaymentId: pf_payment_id,
        paymentStatus: payment_status,
        status: "PAID",
        paidAt: new Date(),
        shippingMethod: shipping_method.toUpperCase() as "PICKUP" | "DELIVERY",
        subtotal: amount_gross,
        total: amount_gross,
        items: cartItems,
        customerName: customer.name,
        customerEmail: customer.email,
        ...(shipping_method === "delivery" && deliveryAddress ? {
          deliveryStreetAddress: deliveryAddress.streetAddress,
          deliverySuburb: deliveryAddress.suburb,
          deliveryCity: deliveryAddress.city,
          deliveryProvince: deliveryAddress.province,
          deliveryPostalCode: deliveryAddress.postalCode,
        } : {}),
        successToken: pendingData.successToken ?? null,
      })
      .returning()

    await Promise.all([
      db.delete(cartTable).where(eq(cartTable.userId, order.userId)),
      db.delete(pendingOrdersTable).where(eq(pendingOrdersTable.id, m_payment_id)),
    ])

    return new Response("OK", { status: 200 })

  } catch (error) {
    console.error("ITN Error:", error)
    return new Response("Server Error", { status: 500 })
  }
}