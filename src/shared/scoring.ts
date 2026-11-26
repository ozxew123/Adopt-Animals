// Logika Scoring System (PRD bagian 4) berbasis OOP.
export type StatusPengajuan = "MENUNGGU_REVIEW" | "LOLOS_KUALIFIKASI" | "DISETUJUI" | "DITOLAK";
export type KategoriOtomatis = "Lolos Syarat" | "Dipertimbangkan" | "Tidak Memenuhi Syarat";
export interface Batas {
  batasLolos: number;
  batasTolak: number;
}

export const BATAS_DEFAULT: Batas = { batasLolos: 80, batasTolak: 50 };

export class ScoringEngine {
  static readonly LABEL_STATUS: Record<StatusPengajuan, string> = {
    MENUNGGU_REVIEW: "Menunggu Review",
    LOLOS_KUALIFIKASI: "Lolos Kualifikasi",
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
  };

  constructor(public readonly batas: Batas = BATAS_DEFAULT) { }

  hitungSkor(poin: number[]): number {
    return poin.reduce((total, nilai) => total + nilai, 0);
  }

  kategoriOtomatis(skor: number, batas: Batas = this.batas): KategoriOtomatis {
    if (skor > batas.batasLolos) return "Lolos Syarat";
    if (skor < batas.batasTolak) return "Tidak Memenuhi Syarat";
    return "Dipertimbangkan";
  }

  statusAwal(skor: number, batas: Batas = this.batas): StatusPengajuan {
    const kategori = this.kategoriOtomatis(skor, batas);
    if (kategori === "Lolos Syarat") return "LOLOS_KUALIFIKASI";
    if (kategori === "Tidak Memenuhi Syarat") return "DITOLAK";
    return "MENUNGGU_REVIEW";
  }

  warnaRekomendasi(kategori: KategoriOtomatis): "hijau" | "kuning" | "merah" {
    if (kategori === "Lolos Syarat") return "hijau";
    if (kategori === "Dipertimbangkan") return "kuning";
    return "merah";
  }

  warnaStatus(status: string): "ok" | "warn" | "bad" | "mute" {
    if (["Lolos Syarat", "Lolos Kualifikasi", "Disetujui", "Tersedia"].includes(status)) return "ok";
    if (["Dipertimbangkan", "Menunggu Review"].includes(status)) return "warn";
    if (["Tidak Memenuhi Syarat", "Ditolak"].includes(status)) return "bad";
    return "mute";
  }
}

export const scoringEngine = new ScoringEngine();
export const labelStatus = ScoringEngine.LABEL_STATUS;
export const hitungSkor = (poin: number[]): number => scoringEngine.hitungSkor(poin);
export const kategoriOtomatis = (skor: number, b: Batas): KategoriOtomatis => scoringEngine.kategoriOtomatis(skor, b);
export const statusAwal = (skor: number, b: Batas): StatusPengajuan => scoringEngine.statusAwal(skor, b);
export const warnaRekomendasi = (k: KategoriOtomatis): "hijau" | "kuning" | "merah" =>
  scoringEngine.warnaRekomendasi(k);
export const warnaStatus = (s: string): "ok" | "warn" | "bad" | "mute" => scoringEngine.warnaStatus(s);
