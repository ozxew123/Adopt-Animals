import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync } from "fs";
import path from "path";
import { Database, db } from "./core/Database";
import { AppError } from "./core/HttpError";
import { ScoringEngine, scoringEngine } from "../shared/scoring";
import { AuthService } from "./services/AuthService";
import { LocalUploadStorage } from "./services/StorageService";
import { PengajuanService } from "./services/PengajuanService";
import { KatalogService } from "./services/KatalogService";
import { AdminService } from "./services/AdminService";
import { AuthController } from "./controllers/AuthController";
import { KatalogController } from "./controllers/KatalogController";
import { PengajuanController } from "./controllers/PengajuanController";
import { AdminController } from "./controllers/AdminController";
import { RiwayatController } from "./controllers/RiwayatController";

export class AdopsiKuApp {
  public readonly hono = new Hono();
  private readonly authService: AuthService;
  private readonly pengajuanService: PengajuanService;
  private readonly katalogService: KatalogService;
  private readonly adminService: AdminService;

  constructor(
    private readonly database: Database = db,
    private readonly scoring: ScoringEngine = scoringEngine
  ) {
    const prisma = this.database.client;
    const storage = new LocalUploadStorage();

    this.authService = new AuthService(prisma);
    this.pengajuanService = new PengajuanService(prisma, this.scoring);
    this.katalogService = new KatalogService(prisma, this.pengajuanService);
    this.adminService = new AdminService(prisma, this.scoring, storage, this.pengajuanService);

    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.hono.onError((err, c) => {
      if (err instanceof AppError) {
        return c.json({ err: err.message, ...err.extra }, err.statusCode);
      }
      console.error(err);
      return c.json({ err: "Terjadi kesalahan pada server." }, 500);
    });
  }

  private configureRoutes(): void {
    this.hono.get("/api/health", async (c) => {
      await this.database.healthCheck();
      return c.json({ ok: true });
    });

    this.hono.route("/api/auth", new AuthController(this.authService).router);
    this.hono.route("/api", new KatalogController(this.authService, this.katalogService).router);
    this.hono.route("/api/pengajuan", new PengajuanController(this.authService, this.pengajuanService).router);
    this.hono.route("/api/admin", new AdminController(this.authService, this.adminService).router);
    this.hono.route("/api/riwayat", new RiwayatController(this.authService, this.adminService).router);

    this.hono.use("/uploads/*", serveStatic({ root: "./public" }));

    const clientDist = path.join(process.cwd(), "dist", "client");
    if (existsSync(clientDist)) {
      this.hono.use("/*", serveStatic({ root: "./dist/client" }));
      this.hono.get("*", serveStatic({ path: "./dist/client/index.html" }));
    }
  }

  public start(port: number): void {
    serve({ fetch: this.hono.fetch, port, hostname: "0.0.0.0" }, (info) => {
      console.log(`Hono API (OOP) berjalan di http://localhost:${info.port}`);
    });
  }
}
