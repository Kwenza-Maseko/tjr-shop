'use server';

import { signIn } from "@/userAuth"; // ✅ user auth instance
import { db } from "@/database/drizzle";
import { userTable } from "@/database/schema";
import { AuthCredentails } from "@/types";
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
      { basePath: "/api/auth" } // ✅ user auth route
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
