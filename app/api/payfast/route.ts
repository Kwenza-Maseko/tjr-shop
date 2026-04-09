import { NextResponse } from "next/server";
import crypto from "crypto";

function generateSignature(data: Record<string, string>, passphrase?: string) {
  let pfOutput = "";

  for (let key in data) {
    pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}&`;
  }

  if (passphrase) {
    pfOutput += `passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  } else {
    pfOutput = pfOutput.slice(0, -1);
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
}

export async function POST(req: Request) {
  const { amount, item_name } = await req.json();

  const data = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: "http://localhost:3000/payment-success",
    cancel_url: "http://localhost:3000/payment-cancel",
    notify_url: "http://localhost:3000/api/payfast/notify",
    amount,
    item_name,
  };

  const signature = generateSignature(data, process.env.PAYFAST_PASSPHRASE);

  return NextResponse.json({
    ...data,
    signature,
    url: process.env.PAYFAST_URL,
  });
}