import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const DIR = path.join(process.cwd(), "public", "uploads");
export const MAKS_BYTE = 2 * 1024 * 1024;

// Nama file dibuat sendiri (bukan dari nama asli) supaya aman dari path traversal
export async function simpanFoto(file: File): Promise<{ url?: string; err?: string }> {
  const ext = EXT[file.type];
  if (!ext) return { err: "Foto harus berformat JPG, PNG, atau WebP." };
  if (file.size > MAKS_BYTE) return { err: "Ukuran foto maksimal 2 MB." };
  await mkdir(DIR, { recursive: true });
  const nama = `${randomUUID()}.${ext}`;
  await writeFile(path.join(DIR, nama), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${nama}` };
}

export async function hapusFoto(url?: string | null) {
  if (!url || !url.startsWith("/uploads/")) return;
  await unlink(path.join(DIR, path.basename(url))).catch(() => {});
}
