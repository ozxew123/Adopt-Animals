import { BaseController } from "./BaseController";
import type { AuthService } from "../services/AuthService";

export class AuthController extends BaseController {
  constructor(authService: AuthService) {
    super(authService);
  }

  protected registerRoutes(): void {
    this.router.get("/me", async (c) => {
      const user = await this.authService.getSession(c);
      return c.json({ user });
    });

    // FR-02: Login
    this.router.post("/login", async (c) => {
      const body = await this.parseJson(c);
      const user = await this.authService.login(
        String(body.email ?? ""),
        String(body.password ?? "")
      );
      await this.authService.setSessionCookie(c, user);
      return c.json({ user });
    });

    // FR-01: Register
    this.router.post("/register", async (c) => {
      const body = await this.parseJson(c);
      const user = await this.authService.register({
        nama: String(body.nama ?? ""),
        email: String(body.email ?? ""),
        password: String(body.password ?? ""),
        telp: body.telp ? String(body.telp) : null,
        alamat: body.alamat ? String(body.alamat) : null,
      });
      await this.authService.setSessionCookie(c, user);
      return c.json({ user }, 201);
    });

    this.router.post("/logout", (c) => {
      this.authService.clearSessionCookie(c);
      return c.json({ ok: true });
    });
  }
}
