export const tanggal = (d: Date | string): string =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
export const kode = (id: number): string => "AD-" + String(id).padStart(3, "0");
export const labelJK = (v: "JANTAN" | "BETINA"): string => (v === "JANTAN" ? "Jantan" : "Betina");
export const emoji = (k: string): string => (k === "Kucing" ? "🐱" : k === "Anjing" ? "🐶" : k === "Kelinci" ? "🐰" : "🐾");
export const pesan = (kunci: "ok" | "err", teks: string): string => `${kunci}=${encodeURIComponent(teks)}`;
