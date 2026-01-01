/**
 * NextAuth.js v5 Configuration
 * Handles authentication with Google OAuth and database sessions
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user }) {
      // Auto-create UserProfile on first sign-in
      if (user.id) {
        const existingProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
        });

        if (!existingProfile) {
          await prisma.userProfile.create({
            data: {
              userId: user.id,
              companyName: "", // User will fill this in later
              industry: "", // User will fill this in later
              obsessionScore: 5.0, // Default neutral score
            },
          });
        }
      }
      return true;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === "development",
});
