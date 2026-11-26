import { describe, expect, it } from "vitest";
import { ScoringEngine, hitungSkor, kategoriOtomatis, statusAwal } from "../../src/shared/scoring";

const b = { batasLolos: 80, batasTolak: 50 };
const engine = new ScoringEngine(b);

describe("scoring system (PRD bagian 4)", () => {
  it("menjumlahkan nilai poin", () => {
    expect(hitungSkor([35, 35, 20])).toBe(90);
    expect(engine.hitungSkor([35, 35, 20])).toBe(90);
  });
  it("skor 81 = Lolos Syarat -> Lolos Kualifikasi", () => {
    expect(kategoriOtomatis(81, b)).toBe("Lolos Syarat");
    expect(statusAwal(81, b)).toBe("LOLOS_KUALIFIKASI");
    expect(engine.kategoriOtomatis(81)).toBe("Lolos Syarat");
    expect(engine.statusAwal(81)).toBe("LOLOS_KUALIFIKASI");
  });
  it("skor tepat 80 = Dipertimbangkan -> Menunggu Review", () => {
    expect(kategoriOtomatis(80, b)).toBe("Dipertimbangkan");
    expect(statusAwal(80, b)).toBe("MENUNGGU_REVIEW");
    expect(engine.kategoriOtomatis(80)).toBe("Dipertimbangkan");
    expect(engine.statusAwal(80)).toBe("MENUNGGU_REVIEW");
  });
  it("skor tepat 50 = Dipertimbangkan", () => {
    expect(kategoriOtomatis(50, b)).toBe("Dipertimbangkan");
    expect(engine.kategoriOtomatis(50)).toBe("Dipertimbangkan");
  });
  it("skor 49 = Tidak Memenuhi Syarat -> Ditolak", () => {
    expect(kategoriOtomatis(49, b)).toBe("Tidak Memenuhi Syarat");
    expect(statusAwal(49, b)).toBe("DITOLAK");
    expect(engine.kategoriOtomatis(49)).toBe("Tidak Memenuhi Syarat");
    expect(engine.statusAwal(49)).toBe("DITOLAK");
  });
});
