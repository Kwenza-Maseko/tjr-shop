'use server';

import { signIn } from "@/adminAuth"; // ✅ Import from adminAuth, not "@/auth"
import { db } from "@/database/drizzle";
import { adminTable } from "@/database/schema";
import { AuthCredentails } from "@/types";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

type SignInResult =
  | { success: true; accessGranted?: string }
  | { success: false; error: string };

export const adminSignInWithCredentials = async (
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
        callbackUrl: "/admin/dashboard",
      },
      { basePath: "/api/admin/auth" } // ✅ make sure this matches your admin route
    );

    if (result?.error) {
      return { success: false, error: result.error };
    }

    const admin = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.email, email))
      .limit(1);

    if (!admin.length) {
      return { success: false, error: "Admin not found after sign-in" };
    }

    return {
      success: true,
      accessGranted: admin[0].accessGranted ?? undefined,
    };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};



export const adminSignUp = async (params: AuthCredentails) => {
  const { fullName, email, password } = params;

  const existingAdmin = await db
    .select()
    .from(adminTable)
    .where(eq(adminTable.email, email))
    .limit(1);

  if (existingAdmin.length > 0) {
    return { success: false, error: "Admin already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(adminTable)
      .values({
        fullName,
        email,
        password: hashedPassword,
        accessGranted: "NOT GRANTED" // or false if you store boolean
      });

    await adminSignInWithCredentials({ email, password });

    return { success: true, accessGranted: "NOT GRANTED" }; // ✅ important

  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" }
  }
};
