import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/database/drizzle"
import { eq } from "drizzle-orm"
import { compare } from "bcryptjs"
import { userTable } from "@/database/schema"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, credentials.email.toString()))
          .limit(1)
        if (!user.length) return null

        const isPasswordValid = await compare(credentials.password.toString(), user[0].password)
        if (!isPasswordValid) return null

        return { id: user[0].id.toString(), email: user[0].email, name: user[0].fullName }
      },
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
      }
      return session
    },
  },
})
