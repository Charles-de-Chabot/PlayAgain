import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    {
      id: "yahoo",
      name: "Yahoo",
      type: "oidc",
      issuer: "https://api.login.yahoo.com",
      clientId: process.env.AUTH_YAHOO_ID,
      clientSecret: process.env.AUTH_YAHOO_SECRET,
    },
    Credentials({
      name: "Connexion classique",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        if (dbUser) {
          token.role = dbUser.role;
          try {
            const { logUserActivity } = await import("@/lib/activity");
            await logUserActivity(dbUser.id, "LOGIN");
          } catch (e) {
            console.error("Failed to log login activity:", e);
          }
        }
      } else if (token.email && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).role = token.role || "USER";
      }
      return session;
    },
  },
});

