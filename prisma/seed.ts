import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/server/core/Database";
import { scoringEngine } from "../src/shared/scoring";

const prisma = db.client;

async function main() {
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const u = (namaLengkap: string, email: string, pw: string, noTelp: string, alamat: string, role: "ADMIN" | "PENGADOPSI" = "PENGADOPSI") =>
    prisma.pengguna.upsert({ where: { email }, update: {}, create: { namaLengkap, email, password: hash(pw), noTelp, alamat, role } });
  await u("Admin Shelter", "admin@adopsiku.test", "admin12345", "0812-0000-0000", "Shelter AdopsiKu", "ADMIN");
  const rina = await u("Rina A.", "rina@contoh.com", "rina12345", "0812-0000-0001", "Jl. Melati No. 5, Jakarta");
  const dimas = await u("Dimas P.", "dimas@contoh.com", "dimas12345", "0812-0000-0002", "Jl. Kenanga No. 8, Depok");
  const sari = await u("Sari W.", "sari@contoh.com", "sari12345", "0812-0000-0003", "Jl. Anggrek No. 2, Bekasi");
  const budi = await u("Budi H.", "budi@contoh.com", "budi12345", "0812-0000-0004", "Jl. Mawar No. 9, Jakarta");

  if ((await prisma.kriteriaScoring.count()) > 0) return; // data contoh hanya dibuat sekali

  const kat: Record<string, number> = {};
  for (const n of ["Kucing", "Anjing", "Kelinci"]) kat[n] = (await prisma.kategoriHewan.create({ data: { namaKategori: n } })).id;

  const data = [
    { nama: "Status tempat tinggal", opsi: [["Rumah milik sendiri", 35], ["Rumah kontrak/sewa (diizinkan memelihara hewan)", 20], ["Kos/apartemen (tanpa izin jelas)", 10]] },
    { nama: "Komitmen finansial", opsi: [["Siap menanggung makan, vaksin, dan dokter hewan rutin", 35], ["Siap menanggung makan dan vaksin saja", 20], ["Belum yakin dengan kesiapan biaya", 5]] },
    { nama: "Jam kerja", opsi: [["Fleksibel/WFH, banyak waktu di rumah", 30], ["Kerja kantoran, ada waktu pagi/malam", 20], ["Sering di luar rumah lebih dari 12 jam", 10]] },
  ];
  
  type KriteriaSeed = {
  id: number;
  namaKriteria: string;
  urutan: number;
  opsi: {
    id: number;
    keteranganJawaban: string;
    nilaiPoin: number;
    kriteriaId: number;
  }[];
};

const kriteria: KriteriaSeed[] = [];
  for (const [i, k] of data.entries()) {
    kriteria.push(await prisma.kriteriaScoring.create({
      data: { namaKriteria: k.nama, urutan: i, opsi: { create: k.opsi.map(([l, p]) => ({ keteranganJawaban: l as string, nilaiPoin: p as number })) } },
      include: { opsi: { orderBy: { id: "asc" } } },
    }));
  }

  const hewan: Record<string, number> = {};
  const list: [string, string, "JANTAN" | "BETINA", number, string][] = [
    ["Mochi", "Kucing", "BETINA", 8, "Kucing kampung manis, sudah steril dan terbiasa di dalam rumah."],
    ["Bruno", "Anjing", "JANTAN", 14, "Anjing aktif dan ramah anak. Butuh ruang bermain dan jalan pagi."],
    ["Luna", "Kucing", "BETINA", 5, "Anak kucing penyayang, sudah vaksin pertama."],
    ["Oreo", "Kelinci", "JANTAN", 10, "Kelinci jinak, makan sayur dan hay."],
    ["Coco", "Anjing", "BETINA", 24, "Anjing dewasa tenang, sudah terlatih dasar."],
    ["Simba", "Kucing", "JANTAN", 18, "Kucing oranye yang suka bermain."],
  ];
  for (const [nama, k, jk, umur, deskripsi] of list)
    hewan[nama] = (await prisma.hewan.create({ data: { namaHewan: nama, kategoriId: kat[k], jenisKelamin: jk, umurBulan: umur, deskripsi } })).id;

  // pilihan = indeks opsi per kriteria
  async function ajukan(penggunaId: number, nama: string, pilihan: number[], final = false) {
    const detail = kriteria.map((k, i) => ({ kriteriaId: k.id, opsiId: k.opsi[pilihan[i]].id, poin: k.opsi[pilihan[i]].nilaiPoin }));
    const total = detail.reduce((t, d) => t + d.poin, 0);
    await prisma.pengajuanAdopsi.create({
      data: {
        penggunaId, hewanId: hewan[nama], totalSkor: total, detail: { create: detail },
        statusPengajuan: final ? "DISETUJUI" : scoringEngine.statusAwal(total), ...(final ? { tanggalKeputusan: new Date() } : {}),
      },
    });
  }
  await ajukan(rina.id, "Mochi", [0, 0, 1]);          // 90 -> Lolos Kualifikasi
  await ajukan(rina.id, "Bruno", [1, 1, 1]);          // 60 -> Menunggu Review
  await ajukan(sari.id, "Luna", [0, 0, 0], true);     // disetujui
  await prisma.hewan.update({ where: { id: hewan["Luna"] }, data: { statusAdopsi: "TERADOPSI" } });
  await ajukan(budi.id, "Simba", [0, 0, 0], true);    // disetujui
  await prisma.hewan.update({ where: { id: hewan["Simba"] }, data: { statusAdopsi: "TERADOPSI" } });
  await ajukan(dimas.id, "Mochi", [0, 1, 0]);         // 85 -> Lolos Kualifikasi
  await ajukan(dimas.id, "Oreo", [2, 2, 2]);          // 25 -> Ditolak otomatis
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
