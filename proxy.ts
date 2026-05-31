
import { auth } from "@/userAuth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  const protectedPrefixes = [
    "/account",
    "/cart",
    "/checkout",
  ]

  const isProtected = protectedPrefixes.some(prefix =>
    pathname.startsWith(prefix)
  )

  if (isProtected && !session) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/account/:path*",
    "/cart/:path*",
    "/checkout/:path*",
  ],
}