import { NextRequest, NextResponse } from "next/server"
import { db } from "@/database/drizzle"
import { userTable, adminTable } from "@/database/schema"
import { eq } from "drizzle-orm"
import crypto from "crypto"
import { hash } from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, token, password } = body

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Hash incoming token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Look for user or admin
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1)

    const admin = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.email, email))
      .limit(1)

    if (!user.length && !admin.length) {
      return NextResponse.json({ error: "Invalid link or account not found" }, { status: 400 })
    }

    // Decide which table + record to use
    const isUser = user.length > 0
    const record = isUser ? user[0] : admin[0]
    const table = isUser ? userTable : adminTable

    // Check token validity
    if (!record.passwordResetToken || !record.passwordResetExpires) {
      return NextResponse.json({ error: "Token expired or invalid" }, { status: 400 })
    }

    if (record.passwordResetToken !== hashedToken) {
      return NextResponse.json({ error: "Token expired or invalid" }, { status: 400 })
    }

    if (new Date() > record.passwordResetExpires) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(password, 10)

    // Update password + clear reset fields
    await db
      .update(table)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(table.id, record.id))

    return NextResponse.json({ message: "Password reset successful" })
  } catch (err) {
    console.error("Password reset error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
