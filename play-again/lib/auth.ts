import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

// Custom adapter to map "name" to "username" and handle Int IDs
const customAdapter: Adapter = {
  createUser: (data: any) => {
    const { id, name, ...rest } = data;
    return prisma.user.create({
      data: {
        ...rest,
        username: name || rest.username || null,
      },
    }) as any;
  },
  getUser: (id: string) => {
    return prisma.user.findUnique({
      where: { id: Number(id) },
    }) as any;
  },
  getUserByEmail: (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    }) as any;
  },
  getUserByAccount: async (provider_providerAccountId: any) => {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId },
      select: { user: true },
    });
    return (account?.user as any) ?? null;
  },
  updateUser: (data: any) => {
    const { id, name, ...rest } = data;
    return prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        username: name || rest.username,
      },
    }) as any;
  },
  linkAccount: (data: any) => {
    const { userId, ...rest } = data;
    return prisma.account.create({
      data: {
        ...rest,
        userId: Number(userId),
      },
    }) as any;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    {
      id: "yahoo",
      name: "Yahoo",
      type: "oidc",
      issuer: "https://api.login.yahoo.com",
      clientId: process.env.AUTH_YAHOO_ID,
      clientSecret: process.env.AUTH_YAHOO_SECRET,
    },
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        credentialToken: { label: "Google Credential Token", type: "text" },
        isOneTap: { label: "Is One Tap", type: "text" },
      },
      async authorize(credentials) {
        // --- CAS A : Connexion Google One Tap ---
        if (credentials?.isOneTap === "true" && credentials?.credentialToken) {
          try {
            // Validation du jeton de sécurité auprès de l'API de Google
            const response = await fetch(
              `https://oauth2.googleapis.com/tokeninfo?id_token=${credentials.credentialToken}`
            );

            if (!response.ok) return null;

            const payload = await response.json();

            // Vérification de sécurité : le client_id doit correspondre
            if (payload.aud !== process.env.AUTH_GOOGLE_ID) {
              console.error("Audience Google mismatch");
              return null;
            }

            const email = payload.email;
            if (!email) return null;

            // Recherche ou création à la volée de l'utilisateur
            let user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) {
              const username = payload.name || email.split("@")[0];
              user = await prisma.user.create({
                data: {
                  email,
                  username,
                  image: payload.picture,
                },
              });

              // Log de l'activité d'inscription
              try {
                const { logUserActivity } = await import("@/lib/activity");
                await logUserActivity(user.id, "REGISTER");
              } catch (e) {
                console.error("Failed to log registration activity:", e);
              }
            }

            return {
              id: user.id.toString(),
              email: user.email,
              name: user.username,
            };
          } catch (error) {
            console.error("Error during Google One Tap verification:", error);
            return null;
          }
        }

        // --- CAS B : Connexion classique par Email / Mot de passe ---
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

