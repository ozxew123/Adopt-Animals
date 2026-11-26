import type { NextAuthConfig } from "next-auth";

// Konfigurasi ringan (tanpa Prisma/bcrypt) supaya aman dipakai di middleware
export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const p = request.nextUrl.pathname;
      const role = auth?.user?.role;
      if (p.startsWith("/admin")) return role === "ADMIN";
      if (p.startsWith("/adopsi") || p.startsWith("/dashboard")) return role === "PENGADOPSI";
      return true;
    },
    jwt({ token, user }) {
      if (user) { token.role = user.role; token.uid = user.id; }
      return token;
    },
    session({ session, token }) {
      session.user.role = (token.role ?? "PENGADOPSI") as "PENGADOPSI" | "ADMIN";
      session.user.id = String(token.uid ?? "");
      return session;
    },
  },
} satisfies NextAuthConfig;
