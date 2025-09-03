import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { adminTable, userTable } from "@/database/schema";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    const admin = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.email, email))
      .limit(1);


    if (!user.length && !admin.length) {
      // Don't reveal if email exists or not
      return NextResponse.json({ message: "If an account exists, an email was sent" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    // Save hashed token and expiry

    if (user.length) {
      await db
        .update(userTable)
        .set({
          passwordResetToken: hashedToken,
          passwordResetExpires: resetTokenExpiry
        })
        .where(eq(userTable.id, user[0].id));

    } else if (admin.length) {
      await db
        .update(adminTable)
        .set({
          passwordResetToken: hashedToken,
          passwordResetExpires: resetTokenExpiry
        })
        .where(eq(adminTable.id, admin[0].id));
    }
    // Email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: `"TJR Shop" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "If an account exists, an email was sent" });
  } catch (error) {
    console.error("Error sending reset email:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}
