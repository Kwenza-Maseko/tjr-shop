"use server"

import { signIn } from "@/userAuth"
import { auth } from "@/userAuth"
import { db } from "@/database/drizzle"
import { userTable } from "@/database/schema"
import { AuthCredentails, PublicUser } from "@/types"
import { hash } from "bcryptjs"
import { eq } from "drizzle-orm"

type SignInResult =
  | { success: true; role?: string }
  | { success: false; error: string }

export const signInWithCredentials = async (
  params: Pick<AuthCredentails, "email" | "password">
): Promise<SignInResult> => {
  try {
    const { email, password } = params

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { success: false, error: result.error }
    }

    const session = await auth()

    if (session?.user?.id) {
      updateLastLogin(session.user.id).catch(console.error)
    }

    return {
      success: true,
      role: session?.user?.role ?? undefined,
    }
  } catch (error) {
    console.error("Signin error:", error)
    return { success: false, error: "Signin error" }
  }
}

export const signUp = async (params: AuthCredentails) => {
  const { fullName, email, password } = params
  const hashedPassword = await hash(password, 10)

  try {
    await db.insert(userTable).values({
      fullName,
      email,
      password: hashedPassword,
    })

    await signInWithCredentials({ email, password })
    return { success: true }
  } catch (error: any) {
    if (error?.code === "23505") {
      return { success: false, error: "User already exists" }
    }
    console.error("Signup error:", error)
    return { success: false, error: "Signup error" }
  }
}

export async function updateLastLogin(userId: string) {
  const today = new Date().toISOString().split("T")[0]
  await db
    .update(userTable)
    .set({ lastLogin: today })
    .where(eq(userTable.id, userId))
}

export const getUsers = async (): Promise<PublicUser[]> => {
  const result = await db
    .select({
      id: userTable.id,
      fullName: userTable.fullName,
      email: userTable.email,
      role: userTable.role,
      phoneNumber: userTable.phoneNumber,
      createdAt: userTable.createdAt,
      lastLogin: userTable.lastLogin,
    })
    .from(userTable)
    .limit(100)

  return result.map((row) => ({
    ...row,
    lastLogin: row.lastLogin ? new Date(row.lastLogin) : null,
  }))
}