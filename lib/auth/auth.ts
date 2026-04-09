'use server';

import { signIn } from "@/userAuth"; // 
import { db } from "@/database/drizzle";
import { userTable } from "@/database/schema";
import { AuthCredentails, User } from "@/types";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

type SignInResult =
  | { success: true; role?: string }
  | { success: false; error: string };

export const signInWithCredentials = async (
  params: Pick<AuthCredentails, "email" | "password">
): Promise<SignInResult> => {
  try {
    const { email, password } = params;

    const result = await signIn(
      "credentials",
      {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      },
      { basePath: "/api/auth" }
    );

    if (result?.error) {
      return { success: false, error: result.error };
    }

    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    if (!user.length) {
      return { success: false, error: "User not found after sign-in" };
    }

    // ✅ update lastLogin with only the date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    await db
      .update(userTable)
      .set({ lastLogin: today })
      .where(eq(userTable.id, user[0].id));

    return {
      success: true,
      role: user[0].role ?? undefined,
    };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};


export const signUp = async (params: AuthCredentails) => {
  const { fullName, email, password } = params;

  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(userTable).values({
      fullName,
      email,
      password: hashedPassword,
    });

    // Sign in automatically after signup
    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};

export async function updateLastLogin(userId: string) {
  const today = new Date().toISOString().split("T")[0]; // "2025-09-06"

  await db
    .update(userTable)
    .set({
      lastLogin: today, // ✅ only date string
    })
    .where(eq(userTable.id, userId));
}

export const getUsers = async (): Promise<User[]> => {
  const result = await db.select().from(userTable);

  if (result.length === 0) {
    console.log("no users found");
    return [];
  }

  return result.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    password: row.password,
    role: row.role,
    phoneNumber: row.phoneNumber,
    createdAt: row.createdAt,
    lastLogin: row.lastLogin ? new Date(row.lastLogin) : null, // ✅ convert string → Date
    passwordResetToken: row.passwordResetToken,
    passwordResetExpires: row.passwordResetExpires,
  }));
};


