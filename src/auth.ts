import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(c) {
        const email = String(c?.email ?? "").toLowerCase().trim();
        const pw = String(c?.password ?? "");
        if (!email || !pw) return null;
        const u = await prisma.pengguna.findUnique({ where: { email } });
        if (!u || !(await bcrypt.compare(pw, u.password))) return null;
        return { id: String(u.id), name: u.namaLengkap, email: u.email, role: u.role };
      },
    }),
  ],
});
