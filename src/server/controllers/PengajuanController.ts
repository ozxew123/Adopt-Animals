import { BaseController } from "./BaseController";
import type { AuthService } from "../services/AuthService";
import type { PengajuanService } from "../services/PengajuanService";

export class PengajuanController extends BaseController {
  constructor(
    authService: AuthService,
    private readonly pengajuanService: PengajuanService
  ) {
    super(authService);
  }

  protected registerRoutes(): void {
    // FR-05, FR-06: kuesioner dinamis
    this.router.get("/kuesioner/:idHewan", this.requirePengadopsi(), async (c) => {
      const data = await this.pengajuanService.getKuesioner(this.parseId(c, "idHewan"));
      return c.json(data);
    });

    // FR-05 s.d. FR-11: kirim pengajuan adopsi
    this.router.post("/", this.requirePengadopsi(), async (c) => {
      const user = c.get("user");
      const body = await this.parseJson(c);
      const result = await this.pengajuanService.submit(
        Number(user.id),
        Number(body.hewanId),
        (body.jawaban ?? {}) as Record<string, number>
      );
      return c.json(result, 201);
    });

    // Dashboard pengadopsi
    this.router.get("/saya", this.requirePengadopsi(), async (c) => {
      const user = c.get("user");
      const daftar = await this.pengajuanService.listMine(Number(user.id));
      return c.json({ daftar });
    });

    // Detail & cetak (pemilik atau admin)
    this.router.get("/:id", this.requireLogin(), async (c) => {
      const user = c.get("user");
      const data = await this.pengajuanService.getDetailForUser(this.parseId(c), user);
      return c.json(data);
    });
  }
}
