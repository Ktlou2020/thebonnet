import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [algorithm, salt, storedKey] = hash.split(":");
  if (algorithm !== "scrypt" || !salt || !storedKey) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const stored = Buffer.from(storedKey, "hex");
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password || !db) return null;

        const profile = await db.profile.findUnique({ where: { email } });
        if (!profile?.passwordHash) return null;

        const valid = await verifyPassword(password, profile.passwordHash);
        if (!valid) return null;

        return {
          id: profile.id,
          email: profile.email,
          name: profile.fullName ?? profile.email,
          role: profile.userRole,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/onboarding",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as typeof user & { role?: string }).role ?? "DRIVER";
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as typeof session.user & { role: string }).role =
          (token.role as string) ?? "DRIVER";
      }
      return session;
    },
  },
});
