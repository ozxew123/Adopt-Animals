export class Formatter {
  static tanggal(d: Date | string): string {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  }

  static kode(id: number): string {
    return "AD-" + String(id).padStart(3, "0");
  }

  static labelJK(v: "JANTAN" | "BETINA"): string {
    return v === "JANTAN" ? "Jantan" : "Betina";
  }

  static emoji(k: string): string {
    if (k === "Kucing") return "🐱";
    if (k === "Anjing") return "🐶";
    if (k === "Kelinci") return "🐰";
    return "🐾";
  }

  static pesan(kunci: "ok" | "err", teks: string): string {
    return `${kunci}=${encodeURIComponent(teks)}`;
  }
}

export const tanggal = Formatter.tanggal;
export const kode = Formatter.kode;
export const labelJK = Formatter.labelJK;
export const emoji = Formatter.emoji;
export const pesan = Formatter.pesan;
