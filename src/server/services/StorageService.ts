import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { BadRequestError } from "../core/HttpError";

export class LocalUploadStorage {
  private static readonly EXT_BY_MIME: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  public static readonly MAX_BYTES = 2 * 1024 * 1024;

  constructor(private readonly uploadDir: string = path.join(process.cwd(), "public", "uploads")) {}

  // Nama file dibuat sendiri (bukan dari nama asli) supaya aman dari path traversal
  public async save(file: File): Promise<string> {
    const ext = LocalUploadStorage.EXT_BY_MIME[file.type];
    if (!ext) {
      throw new BadRequestError("Foto harus berformat JPG, PNG, atau WebP.");
    }
    if (file.size > LocalUploadStorage.MAX_BYTES) {
      throw new BadRequestError("Ukuran foto maksimal 2 MB.");
    }

    await mkdir(this.uploadDir, { recursive: true });
    const nama = `${randomUUID()}.${ext}`;
    await writeFile(path.join(this.uploadDir, nama), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${nama}`;
  }

  public async remove(url?: string | null): Promise<void> {
    if (!url || !url.startsWith("/uploads/")) return;
    await unlink(path.join(this.uploadDir, path.basename(url))).catch(() => {});
  }
}
