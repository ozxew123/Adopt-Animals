import { emoji } from "@/lib/format";

// Tanpa `tinggi`, foto memakai rasio 4:3 yang konsisten. Dengan `tinggi`, tinggi dikunci (dipakai di tabel admin).
export function Foto({ url, kategori, nama, tinggi }: { url?: string | null; kategori: string; nama: string; tinggi?: number }) {
  const kelas = tinggi ? "foto" : "foto rasio";
  const gaya = tinggi ? { height: tinggi } : undefined;
  if (url) return <img className={kelas} src={url} alt={`Foto ${nama}`} style={gaya} />;
  return <div className={`ph ${kelas}`} style={gaya} role="img" aria-label={`Foto ${nama} belum tersedia`}>{emoji(kategori)}</div>;
}
