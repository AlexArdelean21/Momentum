import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

// Add this line for debugging at the top level
console.log("🚀 [auth.ts] NEXTAUTH_URL read by server:", process.env.NEXTAUTH_URL);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development-only",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 Authorize called with email:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("🔍 Missing credentials")
          return null
        }

        try {
          const users = await sql`
            SELECT id, email, name, avatar_url FROM users 
            WHERE email = ${credentials.email} AND provider = 'credentials'
          `

          const user = users[0]
          console.log("🔍 User found in database:", !!user)
          
          if (!user) {
            console.log("🔍 No user found for email:", credentials.email)
            return null
          }

          // Get the password hash separately for security
          const passwordQuery = await sql`
            SELECT password_hash FROM users 
            WHERE id = ${user.id}
          `
          
          const isPasswordValid = await bcrypt.compare(credentials.password, passwordQuery[0].password_hash)
          console.log("🔍 Password valid:", isPasswordValid)
          
          if (!isPasswordValid) {
            console.log("🔍 Invalid password")
            return null
          }

          console.log("🔍 Authorization successful for user:", user.id)
          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.avatar_url || null,
          }
        } catch (error) {
          console.error("🔍 Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔍 JWT callback - user present:", !!user)
      console.log("🔍 JWT callback - token before:", { email: token.email, userId: token.userId })
      
      // If this is the first time (user object is present), store user data in token
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        console.log("🔍 JWT callback - stored user data in token:", token.userId)
      }
      
      console.log("🔍 JWT callback - token after:", { email: token.email, userId: token.userId })
      return token
    },
    async session({ session, token }) {
      console.log("🔍 Session callback - token:", { email: token.email, userId: token.userId })
      
      if (token.userId) {
        session.user.id = token.userId as string
        session.user.email = token.email as string
        session.user.name = token.name as string || null
        session.user.image = token.picture as string || null
        console.log("🔍 Session callback - final session user id:", session.user.id)
      }
      
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)

// For v4 compatibility, we need to create the auth function manually
import { getServerSession } from "next-auth/next"

export async function auth() {
  return await getServerSession(authOptions)
} 