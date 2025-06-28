import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Debug environment variables
console.log("🔍 Environment variables check:")
console.log("- DATABASE_URL exists:", !!process.env.DATABASE_URL)
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
console.log("- GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID)
console.log("- GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET)

export const authOptionsDebug: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔍 SignIn callback triggered:", { 
        userEmail: user.email, 
        provider: account?.provider,
        accountId: account?.providerAccountId 
      })
      return true // Always allow sign in for debugging
    },
    async jwt({ token, user, account }) {
      console.log("🔍 JWT callback triggered:", { 
        tokenEmail: token.email, 
        userEmail: user?.email,
        provider: account?.provider 
      })
      return token
    },
    async session({ session, token }) {
      console.log("🔍 Session callback triggered:", { 
        sessionEmail: session.user?.email,
        tokenSub: token.sub 
      })
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: true, // Enable debug mode
  logger: {
    error(code, metadata) {
      console.error("🚨 NextAuth Error:", code, metadata)
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code)
    },
    debug(code, metadata) {
      console.log("🔍 NextAuth Debug:", code, metadata)
    },
  },
} 