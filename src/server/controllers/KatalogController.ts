import { BaseController } from "./BaseController";
import type { AuthService } from "../services/AuthService";
import type { KatalogService } from "../services/KatalogService";

export class KatalogController extends BaseController {
  constructor(
    authService: AuthService,
    private readonly katalogService: KatalogService
  ) {
    super(authService);
  }

  protected registerRoutes(): void {
    // FR-03, FR-04: Katalog hewan publik
    this.router.get("/katalog", async (c) => {
      const user = await this.authService.getSession(c);
      const data = await this.katalogService.list(
        {
          q: c.req.query("q")?.trim() ?? "",
          jenis: Number(c.req.query("jenis")) || 0,
          urut: c.req.query("urut") === "umur" ? "umur" : "baru",
          tersedia: c.req.query("tersedia") === "1",
          hal: Math.max(1, Number(c.req.query("hal")) || 1),
        },
        user
      );
      return c.json(data);
    });

    // Detail hewan publik
    this.router.get("/hewan/:id", async (c) => {
      const user = await this.authService.getSession(c);
      const data = await this.katalogService.getDetail(this.parseId(c), user);
      return c.json(data);
    });
  }
}
