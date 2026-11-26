import type { Context } from "hono";
import { BaseController, type AppEnv } from "./BaseController";
import type { AuthService } from "../services/AuthService";
import type { AdminService } from "../services/AdminService";

export class AdminController extends BaseController {
  constructor(
    authService: AuthService,
    private readonly adminService: AdminService
  ) {
    super(authService);
  }

  private async extractHewanPayload(c: Context<AppEnv>) {
    const body = await c.req.parseBody();
    return {
      nama: String(body.nama ?? ""),
      umur: Number(body.umur),
      kategoriId: Number(body.kategoriId),
      jk: String(body.jk ?? "JANTAN"),
      status: String(body.status ?? "TERSEDIA"),
      deskripsi: String(body.deskripsi ?? ""),
      foto: body.foto,
    };
  }

  protected registerRoutes(): void {
    this.router.use("*", this.requireAdmin());

    // FR-12, FR-13: Antrean seleksi admin
    this.router.get("/dashboard", async (c) => {
      return c.json(await this.adminService.getDashboard());
    });

    this.router.get("/pengajuan/:id", async (c) => {
      return c.json(await this.adminService.getPengajuanDetail(this.parseId(c)));
    });

    this.router.get("/compare/:hewanId", async (c) => {
      return c.json(await this.adminService.getCompareByHewan(this.parseId(c, "hewanId")));
    });

    // FR-14, FR-15: Keputusan admin
    this.router.post("/pengajuan/:id/keputusan", async (c) => {
      const body = await this.parseJson(c);
      return c.json(await this.adminService.putuskan(this.parseId(c), body.keputusan));
    });

    // CRUD Hewan
    this.router.get("/hewan", async (c) => c.json(await this.adminService.listHewan()));
    this.router.post("/hewan", async (c) => c.json(await this.adminService.saveHewan(0, await this.extractHewanPayload(c))));
    this.router.put("/hewan/:id", async (c) =>
      c.json(await this.adminService.saveHewan(this.parseId(c), await this.extractHewanPayload(c)))
    );
    this.router.delete("/hewan/:id", async (c) => c.json(await this.adminService.deleteHewan(this.parseId(c))));

    // CRUD Kategori
    this.router.get("/kategori", async (c) => c.json(await this.adminService.listKategori()));
    this.router.post("/kategori", async (c) => {
      const body = await this.parseJson(c);
      return c.json(await this.adminService.createKategori(String(body.nama ?? "")), 201);
    });
    this.router.put("/kategori/:id", async (c) => {
      const body = await this.parseJson(c);
      return c.json(await this.adminService.updateKategori(this.parseId(c), String(body.nama ?? "")));
    });
    this.router.delete("/kategori/:id", async (c) => c.json(await this.adminService.deleteKategori(this.parseId(c))));

    // FR-16: CRUD Kriteria & Opsi Scoring
    this.router.get("/scoring", async (c) => c.json(await this.adminService.getScoring()));
    this.router.post("/scoring/kriteria", async (c) => {
      const body = await this.parseJson(c);
      return c.json(await this.adminService.createKriteria(String(body.nama ?? "")), 201);
    });
    this.router.put("/scoring/kriteria/:id", async (c) => {
      const body = await this.parseJson(c);
      return c.json(await this.adminService.updateKriteria(this.parseId(c), String(body.nama ?? "")));
    });
    this.router.delete("/scoring/kriteria/:id", async (c) => c.json(await this.adminService.deleteKriteria(this.parseId(c))));
    this.router.post("/scoring/opsi", async (c) => {
      const body = await this.parseJson(c);
      return c.json(
        await this.adminService.createOpsi(Number(body.kriteriaId), String(body.label ?? ""), Number(body.poin)),
        201
      );
    });
    this.router.put("/scoring/opsi/:id", async (c) => {
      const body = await this.parseJson(c);
      return c.json(
        await this.adminService.updateOpsi(this.parseId(c), String(body.label ?? ""), Number(body.poin))
      );
    });
    this.router.delete("/scoring/opsi/:id", async (c) => c.json(await this.adminService.deleteOpsi(this.parseId(c))));

    // FR-17: Riwayat Adopsi
    this.router.get("/riwayat", async (c) => {
      const data = await this.adminService.getRiwayat({
        dari: c.req.query("dari") || undefined,
        sampai: c.req.query("sampai") || undefined,
        kategoriId: Number(c.req.query("kategori")) || undefined,
      });
      return c.json(data);
    });
  }
}
