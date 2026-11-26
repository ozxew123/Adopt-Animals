import type { ApiClient } from "./ApiClient";
import type { HewanItem, KategoriItem } from "@/client/components/ui/KatalogInteraktif";
import type { KriteriaItem, PengajuanDetail } from "./PengajuanApiService";
import type { Batas, StatusPengajuan } from "@/shared/scoring";

export interface AntreanItem {
  id: number;
  hewanId: number;
  tanggalPengajuan: string;
  tanggalKeputusan: string | null;
  totalSkor: number;
  statusPengajuan: StatusPengajuan;
  pengguna: { namaLengkap: string };
  hewan: { id: number; namaHewan: string; statusAdopsi: "TERSEDIA" | "TERADOPSI" };
}

export interface CompareApplicant {
  id: number;
  tanggalPengajuan: string;
  tanggalKeputusan: string | null;
  totalSkor: number;
  statusPengajuan: StatusPengajuan;
  pengguna: {
    id: number;
    namaLengkap: string;
    email: string;
    noTelp: string | null;
    alamat: string | null;
  };
  detail: {
    id: number;
    kriteriaId: number;
    poin: number;
    kriteria: { namaKriteria: string };
    opsi: { keteranganJawaban: string };
  }[];
}

export interface CompareResponse {
  hewan: HewanItem;
  kriteria: { id: number; namaKriteria: string }[];
  pengajuan: CompareApplicant[];
  batas: Batas;
}

export interface AdminDashboardResponse {
  antrean: AntreanItem[];
  batas: Batas;
  ringkas: { tersedia: number; masuk: number; teradopsi: number };
}

export interface KategoriRow {
  id: number;
  namaKategori: string;
  _count: { hewan: number };
}

export interface ScoringResponse {
  kriteria: KriteriaItem[];
  batas: Batas;
  maks: number;
}

export interface RiwayatRow {
  id: number;
  tanggalPengajuan: string;
  tanggalKeputusan: string;
  totalSkor: number;
  hewan: { namaHewan: string; kategori: { namaKategori: string } };
  pengguna: { namaLengkap: string; email: string; noTelp: string | null; alamat: string | null };
}

export class AdminApiService {
  constructor(private readonly client: ApiClient) {}

  public getDashboard(): Promise<AdminDashboardResponse> {
    return this.client.get("/api/admin/dashboard");
  }

  public getPengajuanDetail(id: string | number): Promise<{
    pengajuan: PengajuanDetail;
    batas: Batas;
    jumlahPelamarHewan: number;
  }> {
    return this.client.get(`/api/admin/pengajuan/${id}`);
  }

  public getCompare(hewanId: string | number): Promise<CompareResponse> {
    return this.client.get(`/api/admin/compare/${hewanId}`);
  }

  public putuskan(id: number, keputusan: "DISETUJUI" | "DITOLAK"): Promise<{ ok: string }> {
    return this.client.post(`/api/admin/pengajuan/${id}/keputusan`, { keputusan });
  }

  public listHewan(): Promise<{ hewan: HewanItem[]; kategori: KategoriItem[] }> {
    return this.client.get("/api/admin/hewan");
  }

  public saveHewan(id: number, formData: FormData): Promise<{ ok: string }> {
    return id
      ? this.client.put(`/api/admin/hewan/${id}`, formData)
      : this.client.post("/api/admin/hewan", formData);
  }

  public deleteHewan(id: number): Promise<{ ok: string }> {
    return this.client.delete(`/api/admin/hewan/${id}`);
  }

  public listKategori(): Promise<{ kategori: KategoriRow[] }> {
    return this.client.get("/api/admin/kategori");
  }

  public createKategori(nama: string): Promise<{ ok: string }> {
    return this.client.post("/api/admin/kategori", { nama });
  }

  public updateKategori(id: number, nama: string): Promise<{ ok: string }> {
    return this.client.put(`/api/admin/kategori/${id}`, { nama });
  }

  public deleteKategori(id: number): Promise<{ ok: string }> {
    return this.client.delete(`/api/admin/kategori/${id}`);
  }

  public getScoring(): Promise<ScoringResponse> {
    return this.client.get("/api/admin/scoring");
  }

  public createKriteria(nama: string): Promise<{ ok: string }> {
    return this.client.post("/api/admin/scoring/kriteria", { nama });
  }

  public updateKriteria(id: number, nama: string): Promise<{ ok: string }> {
    return this.client.put(`/api/admin/scoring/kriteria/${id}`, { nama });
  }

  public deleteKriteria(id: number): Promise<{ ok: string }> {
    return this.client.delete(`/api/admin/scoring/kriteria/${id}`);
  }

  public createOpsi(kriteriaId: number, label: string, poin: number): Promise<{ ok: string }> {
    return this.client.post("/api/admin/scoring/opsi", { kriteriaId, label, poin });
  }

  public updateOpsi(id: number, label: string, poin: number): Promise<{ ok: string }> {
    return this.client.put(`/api/admin/scoring/opsi/${id}`, { label, poin });
  }

  public deleteOpsi(id: number): Promise<{ ok: string }> {
    return this.client.delete(`/api/admin/scoring/opsi/${id}`);
  }

  public getRiwayat(params: { dari?: string; sampai?: string; kategori?: string }): Promise<{
    rows: RiwayatRow[];
    kategori: KategoriItem[];
  }> {
    const sp = new URLSearchParams();
    if (params.dari) sp.set("dari", params.dari);
    if (params.sampai) sp.set("sampai", params.sampai);
    if (params.kategori) sp.set("kategori", params.kategori);
    return this.client.get(`/api/admin/riwayat?${sp.toString()}`);
  }
}
