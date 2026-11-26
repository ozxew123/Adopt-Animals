import type { ApiClient } from "./ApiClient";
import type { Batas, StatusPengajuan } from "@/shared/scoring";

export interface OpsiItem {
  id: number;
  keteranganJawaban: string;
  nilaiPoin: number;
}

export interface KriteriaItem {
  id: number;
  namaKriteria: string;
  opsi: OpsiItem[];
}

export interface HewanSingkat {
  id: number;
  namaHewan: string;
  statusAdopsi: "TERSEDIA" | "TERADOPSI";
}

export interface PengajuanRow {
  id: number;
  tanggalPengajuan: string;
  totalSkor: number;
  statusPengajuan: StatusPengajuan;
  hewan: { namaHewan: string };
}

export interface PengajuanDetail {
  id: number;
  penggunaId: number;
  hewanId: number;
  tanggalPengajuan: string;
  tanggalKeputusan: string | null;
  totalSkor: number;
  statusPengajuan: StatusPengajuan;
  pengguna: { namaLengkap: string; email: string; noTelp: string | null; alamat: string | null };
  hewan: {
    namaHewan: string;
    jenisKelamin: "JANTAN" | "BETINA";
    umurBulan: number;
    kategori: { namaKategori: string };
  };
  detail: { id: number; poin: number; kriteria: { namaKriteria: string }; opsi: { keteranganJawaban: string } }[];
}

export class PengajuanApiService {
  constructor(private readonly client: ApiClient) {}

  public getKuesioner(idHewan: string | number): Promise<{ hewan: HewanSingkat; kriteria: KriteriaItem[] }> {
    return this.client.get(`/api/pengajuan/kuesioner/${idHewan}`);
  }

  public submit(hewanId: number, jawaban: Record<number, number>): Promise<{ ok: string; id: number }> {
    return this.client.post("/api/pengajuan", { hewanId, jawaban });
  }

  public listMine(): Promise<{ daftar: PengajuanRow[] }> {
    return this.client.get("/api/pengajuan/saya");
  }

  public getDetail(id: string | number): Promise<{ pengajuan: PengajuanDetail; batas: Batas }> {
    return this.client.get(`/api/pengajuan/${id}`);
  }
}
