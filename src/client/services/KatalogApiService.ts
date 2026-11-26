import type { ApiClient } from "./ApiClient";
import type { HewanItem, KategoriItem } from "@/client/components/ui/KatalogInteraktif";

export interface KatalogResponse {
  hewan: HewanItem[];
  kategori: KategoriItem[];
  total: number;
  totalHal: number;
  hal: number;
  aktifIds: number[];
}

export class KatalogApiService {
  constructor(private readonly client: ApiClient) {}

  public list(params: {
    q?: string;
    jenis?: number;
    urut?: "baru" | "umur";
    tersedia?: boolean;
    hal?: number;
  }): Promise<KatalogResponse> {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.jenis) sp.set("jenis", String(params.jenis));
    if (params.urut && params.urut !== "baru") sp.set("urut", params.urut);
    if (params.tersedia) sp.set("tersedia", "1");
    if (params.hal && params.hal > 1) sp.set("hal", String(params.hal));
    return this.client.get(`/api/katalog?${sp.toString()}`);
  }

  public detail(id: string | number): Promise<{ hewan: HewanItem; diajukan: boolean }> {
    return this.client.get(`/api/hewan/${id}`);
  }
}
