import type { ApiClient } from "./ApiClient";

export type Role = "PENGADOPSI" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterPayload {
  nama: string;
  email: string;
  password: string;
  telp?: string;
  alamat?: string;
}

export class AuthApiService {
  constructor(private readonly client: ApiClient) {}

  public me(): Promise<{ user: AuthUser | null }> {
    return this.client.get("/api/auth/me");
  }

  public login(email: string, password: string): Promise<{ user: AuthUser }> {
    return this.client.post("/api/auth/login", { email, password });
  }

  public register(payload: RegisterPayload): Promise<{ user: AuthUser }> {
    return this.client.post("/api/auth/register", payload);
  }

  public logout(): Promise<{ ok: boolean }> {
    return this.client.post("/api/auth/logout");
  }
}
