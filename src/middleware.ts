import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Next.js 15 memakai middleware.ts. Di Next.js 16 ganti nama file menjadi proxy.ts.
export const { auth: middleware } = NextAuth(authConfig);
export const config = { matcher: ["/admin/:path*", "/adopsi/:path*", "/dashboard"] };
