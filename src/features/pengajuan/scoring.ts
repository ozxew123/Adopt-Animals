// Logika Scoring System (PRD bagian 4). Murni, tanpa database, jadi mudah dites.
export type StatusPengajuan = "MENUNGGU_REVIEW" | "LOLOS_KUALIFIKASI" | "DISETUJUI" | "DITOLAK";
export type KategoriOtomatis = "Lolos Syarat" | "Dipertimbangkan" | "Tidak Memenuhi Syarat";
export interface Batas { batasLolos: number; batasTolak: number }

export const hitungSkor = (poin: number[]): number => poin.reduce((t, p) => t + p, 0);

// Skor > 80 -> Lolos Syarat | 50 <= skor <= 80 -> Dipertimbangkan | skor < 50 -> Tidak Memenuhi Syarat
export function kategoriOtomatis(skor: number, b: Batas): KategoriOtomatis {
  if (skor > b.batasLolos) return "Lolos Syarat";
  if (skor < b.batasTolak) return "Tidak Memenuhi Syarat";
  return "Dipertimbangkan";
}

// Status awal yang dilihat pengadopsi
export function statusAwal(skor: number, b: Batas): StatusPengajuan {
  const k = kategoriOtomatis(skor, b);
  return k === "Lolos Syarat" ? "LOLOS_KUALIFIKASI" : k === "Tidak Memenuhi Syarat" ? "DITOLAK" : "MENUNGGU_REVIEW";
}

export const labelStatus: Record<StatusPengajuan, string> = {
  MENUNGGU_REVIEW: "Menunggu Review",
  LOLOS_KUALIFIKASI: "Lolos Kualifikasi",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
};

// Label warna rekomendasi untuk admin
export const warnaRekomendasi = (k: KategoriOtomatis): "hijau" | "kuning" | "merah" =>
  k === "Lolos Syarat" ? "hijau" : k === "Dipertimbangkan" ? "kuning" : "merah";

export function warnaStatus(s: string): "ok" | "warn" | "bad" | "mute" {
  if (["Lolos Syarat", "Lolos Kualifikasi", "Disetujui", "Tersedia"].includes(s)) return "ok";
  if (["Dipertimbangkan", "Menunggu Review"].includes(s)) return "warn";
  if (["Tidak Memenuhi Syarat", "Ditolak"].includes(s)) return "bad";
  return "mute";
}
