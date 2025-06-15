import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const users = await sql`
            SELECT * FROM users 
            WHERE email = ${credentials.email} AND provider = 'credentials'
          `

          const user = users[0]
          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar_url,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUsers = await sql`
            SELECT * FROM users 
            WHERE email = ${user.email} AND provider = 'google'
          `

          if (existingUsers.length === 0) {
            // Create new user
            await sql`
              INSERT INTO users (email, name, avatar_url, provider, provider_id)
              VALUES (${user.email}, ${user.name}, ${user.image}, 'google', ${account.providerAccountId})
            `
          } else {
            // Update existing user
            await sql`
              UPDATE users 
              SET name = ${user.name}, avatar_url = ${user.image}, updated_at = NOW()
              WHERE email = ${user.email} AND provider = 'google'
            `
          }
        } catch (error) {
          console.error("Google sign-in error:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          const users = await sql`
            SELECT id, email, name, avatar_url FROM users 
            WHERE email = ${user.email}
          `
          
          if (users.length > 0) {
            token.userId = users[0].id
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

export default NextAuth(authOptions) 