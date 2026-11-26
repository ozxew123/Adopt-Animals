import { BaseController } from "./BaseController";
import type { AuthService } from "../services/AuthService";
import type { AdminService } from "../services/AdminService";

export class RiwayatController extends BaseController {
  constructor(
    authService: AuthService,
    private readonly adminService: AdminService
  ) {
    super(authService);
  }

  protected registerRoutes(): void {
    // FR-17: ekspor laporan CSV
    this.router.get("/ekspor", this.requireAdmin(), async (c) => {
      const csv = await this.adminService.exportRiwayatCsv({
        dari: c.req.query("dari") || undefined,
        sampai: c.req.query("sampai") || undefined,
        kategoriId: Number(c.req.query("kategori")) || undefined,
      });

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="riwayat-adopsi.csv"',
        },
      });
    });
  }
}
