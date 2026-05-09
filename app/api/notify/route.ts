// app/api/notify/route.ts
import { db } from "@/database/drizzle"
import { cartTable, ordersTable } from "@/database/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const data = Object.fromEntries(params.entries())

    const {
      m_payment_id,
      pf_payment_id,
      payment_status,
      amount_gross,
    } = data

    console.log("ITN RECEIVED:", data)

    // ✅ Only process if payment is COMPLETE
    if (payment_status !== "COMPLETE") {
      // Update order status to reflect failure
      await db
        .update(ordersTable)
        .set({
          paymentStatus: payment_status,
          status: "CANCELLED",
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.mPaymentId, m_payment_id))

      return new Response("OK", { status: 200 })
    }

    // ✅ Find the order
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.mPaymentId, m_payment_id))
      .limit(1)

    if (!order) {
      console.error("Order not found for mPaymentId:", m_payment_id)
      return new Response("Order not found", { status: 404 })
    }

    // ✅ Update order to PAID
    await db
      .update(ordersTable)
      .set({
        pfPaymentId: pf_payment_id,
        paymentStatus: payment_status,
        status: "PAID",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.mPaymentId, m_payment_id))

    // ✅ Clear the user's cart
    await db
      .delete(cartTable)
      .where(eq(cartTable.userId, order.userId))

    console.log(`Order ${m_payment_id} marked PAID, cart cleared for user ${order.userId}`)

    return new Response("OK", { status: 200 })

  } catch (error) {
    console.error("ITN Error:", error)
    return new Response("Server Error", { status: 500 })
  }
}