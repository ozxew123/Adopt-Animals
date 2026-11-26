import { Hono, type Context, type MiddlewareHandler } from "hono";
import type { AuthService, Role, SessionUser } from "../services/AuthService";
import { ForbiddenError, UnauthorizedError } from "../core/HttpError";

export type AppEnv = {
  Variables: {
    user: SessionUser;
  };
};

export abstract class BaseController {
  public readonly router = new Hono<AppEnv>();

  constructor(protected readonly authService: AuthService) {
    this.registerRoutes();
  }

  protected abstract registerRoutes(): void;

  protected requireLogin(): MiddlewareHandler<AppEnv> {
    return async (c, next) => {
      const user = await this.authService.getSession(c);
      if (!user) throw new UnauthorizedError();
      c.set("user", user);
      await next();
    };
  }

  protected requireRole(role: Role, message: string): MiddlewareHandler<AppEnv> {
    return async (c, next) => {
      const user = await this.authService.getSession(c);
      if (!user) throw new UnauthorizedError();
      if (user.role !== role) throw new ForbiddenError(message);
      c.set("user", user);
      await next();
    };
  }

  protected requirePengadopsi(): MiddlewareHandler<AppEnv> {
    return this.requireRole("PENGADOPSI", "Hanya pengadopsi yang dapat mengakses.");
  }

  protected requireAdmin(): MiddlewareHandler<AppEnv> {
    return this.requireRole("ADMIN", "Akses khusus administrator.");
  }

  protected parseId(c: Context, param = "id"): number {
    return Number(c.req.param(param)) || 0;
  }

  protected async parseJson(c: Context): Promise<Record<string, unknown>> {
    return (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  }
}
