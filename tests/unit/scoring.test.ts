import { describe, expect, it } from "vitest";
import { hitungSkor, kategoriOtomatis, statusAwal } from "../../src/features/pengajuan/scoring";

const b = { batasLolos: 80, batasTolak: 50 };

describe("scoring system (PRD bagian 4)", () => {
  it("menjumlahkan nilai poin", () => expect(hitungSkor([35, 35, 20])).toBe(90));
  it("skor 81 = Lolos Syarat -> Lolos Kualifikasi", () => {
    expect(kategoriOtomatis(81, b)).toBe("Lolos Syarat");
    expect(statusAwal(81, b)).toBe("LOLOS_KUALIFIKASI");
  });
  it("skor tepat 80 = Dipertimbangkan -> Menunggu Review", () => {
    expect(kategoriOtomatis(80, b)).toBe("Dipertimbangkan");
    expect(statusAwal(80, b)).toBe("MENUNGGU_REVIEW");
  });
  it("skor tepat 50 = Dipertimbangkan", () => expect(kategoriOtomatis(50, b)).toBe("Dipertimbangkan"));
  it("skor 49 = Tidak Memenuhi Syarat -> Ditolak", () => {
    expect(kategoriOtomatis(49, b)).toBe("Tidak Memenuhi Syarat");
    expect(statusAwal(49, b)).toBe("DITOLAK");
  });
});
