import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BadRequestError, ConflictError, UnauthorizedError } from "../core/HttpError";

export type Role = "PENGADOPSI" | "ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterDto {
  nama: string;
  email: string;
  password: string;
  telp?: string | null;
  alamat?: string | null;
}

export const PENGGUNA_PUBLIK_SELECT = {
  id: true,
  namaLengkap: true,
  email: true,
  noTelp: true,
  alamat: true,
  role: true,
} as const;

export class AuthService {
  private static readonly COOKIE_NAME = "adopsiku_session";
  private static readonly MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

  constructor(private readonly prisma: PrismaClient) {}

  private getSecret(): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET belum diatur di environment (.env).");
    return secret;
  }

  public async setSessionCookie(c: Context, user: SessionUser): Promise<void> {
    const exp = Math.floor(Date.now() / 1000) + AuthService.MAX_AGE_SECONDS;
    const token = await sign({ ...user, exp }, this.getSecret(), "HS256");
    const isHttps = c.req.url.startsWith("https://") || c.req.header("x-forwarded-proto") === "https";

    setCookie(c, AuthService.COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      secure: isHttps,
      maxAge: AuthService.MAX_AGE_SECONDS,
    });
  }

  public clearSessionCookie(c: Context): void {
    deleteCookie(c, AuthService.COOKIE_NAME, { path: "/" });
  }

  public async getSession(c: Context): Promise<SessionUser | null> {
    const token = getCookie(c, AuthService.COOKIE_NAME);
    if (!token) return null;
    try {
      const payload = await verify(token, this.getSecret(), "HS256");
      return {
        id: String(payload.id ?? ""),
        name: String(payload.name ?? ""),
        email: String(payload.email ?? ""),
        role: (payload.role === "ADMIN" ? "ADMIN" : "PENGADOPSI") as Role,
      };
    } catch {
      return null;
    }
  }

  public async login(emailRaw: string, password: string): Promise<SessionUser> {
    const email = emailRaw.toLowerCase().trim();
    if (!email || !password) {
      throw new BadRequestError("Email dan password wajib diisi.");
    }

    const user = await this.prisma.pengguna.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError("Email atau password salah.");
    }

    return {
      id: String(user.id),
      name: user.namaLengkap,
      email: user.email,
      role: user.role,
    };
  }

  public async register(dto: RegisterDto): Promise<SessionUser> {
    const nama = dto.nama.trim();
    const email = dto.email.toLowerCase().trim();
    const password = dto.password;

    if (!nama || !email) {
      throw new BadRequestError("Nama lengkap dan email wajib diisi.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new BadRequestError("Format email tidak valid.");
    }
    if (password.length < 8) {
      throw new BadRequestError("Password minimal 8 karakter.");
    }
    if (await this.prisma.pengguna.findUnique({ where: { email } })) {
      throw new ConflictError("Email sudah terdaftar. Silakan masuk.");
    }

    const user = await this.prisma.pengguna.create({
      data: {
        namaLengkap: nama,
        email,
        password: await bcrypt.hash(password, 10),
        role: "PENGADOPSI",
        noTelp: dto.telp?.trim() || null,
        alamat: dto.alamat?.trim() || null,
      },
    });

    return {
      id: String(user.id),
      name: user.namaLengkap,
      email: user.email,
      role: user.role,
    };
  }
}
