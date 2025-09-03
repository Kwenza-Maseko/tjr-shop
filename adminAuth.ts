import NextAuth, { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./database/drizzle";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs"
import { adminTable } from "./database/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: "jwt"
    },
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const admin = await db
                    .select()
                    .from(adminTable)
                    .where(eq(adminTable.email, credentials.email.toString()))
                    .limit(1);

                if (admin.length === 0) return null;

                const isPasswordValid = await compare(credentials.password.toString(), admin[0].password);

                if (!isPasswordValid) return null;

                return {
                    id: admin[0].id.toString(),
                    email: admin[0].email,
                    name: admin[0].fullName
                } as User
            }
        })],
    pages: {
        signIn: "/admin/sign-in"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },
        async session({session, token}){
            if(session.user){
                session.user.id = token.id as string;
                session.user.name =  token.name as string;
            }
            return session;
        },
    }
})