# AdopsiKu

Sistem informasi adopsi hewan terlantar dengan penilaian kelayakan (Scoring System), mengikuti PRD Tugas SBD M3 Kelompok 5.
Next.js 15 (App Router) + TypeScript + Prisma 6 + PostgreSQL + Auth.js v5.

## Menjalankan
```bash
cp .env.example .env          # isi AUTH_SECRET dengan string acak panjang
npx auth secret
docker compose up -d          # PostgreSQL lokal
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev                   # http://localhost:3000
npm test                      # uji logika scoring
```
```bash
npx prisma studio             # melihat database
```

## Akun contoh (seed)
| Peran | Email | Password |
|---|---|---|
| Admin | admin@adopsiku.test | admin12345 |
| Pengadopsi | rina@contoh.com | rina12345 |
| Pengadopsi | dimas@contoh.com | dimas12345 |

## Sitemap (PRD bagian 6)
| Rute | Isi |
|---|---|
| `/` | Beranda dan katalog (filter kategori dan ketersediaan, pencarian, paginasi) |
| `/login`, `/register` | Autentikasi (FR-01, FR-02) |
| `/hewan/:id` | Detail hewan, tombol Ajukan aktif hanya jika Tersedia |
| `/adopsi/ajukan/:idHewan` | Kuesioner dinamis (FR-05 s.d. FR-07) |
| `/dashboard` | Riwayat pengajuan, total skor, status, Lembar Hasil Penilaian |
| `/admin/dashboard` | Ringkasan dan antrean semua pengajuan urut skor, label hijau/kuning/merah |
| `/admin/pengajuan/:id` | Detail jawaban dan keputusan Setujui/Tolak Adopsi |
| `/admin/hewan`, `/admin/kategori` | CRUD hewan (dengan foto dan deskripsi) dan kategori |
| `/admin/scoring` | CRUD kriteria, opsi jawaban, bobot poin, dan ambang batas |
| `/admin/riwayat` | Laporan riwayat adopsi, filter, ekspor CSV, cetak |

## Aturan scoring (PRD bagian 4)
| Skor | Rekomendasi admin | Status pengadopsi |
|---|---|---|
| > 80 | Lolos Syarat (hijau) | Lolos Kualifikasi |
| 50 sampai 80 | Dipertimbangkan (kuning) | Menunggu Review |
| < 50 | Tidak Memenuhi Syarat (merah) | Ditolak (otomatis) |

Ambang 80 dan 50 bisa diubah admin; status pengajuan yang belum diputuskan ikut disinkronkan.

## Penyimpangan dari ERD (disengaja, catat di laporan)
- Tabel tambahan `pengaturan_scoring` untuk ambang batas.
- Kolom tambahan `detail_penilaian.poin` (salinan nilai_poin saat dikirim, agar rincian tetap cocok dengan total_skor walau poin opsi diubah kemudian).
- Kolom tambahan `pengajuan_adopsi.tanggal_keputusan` (null = belum diputuskan admin).
- Kolom opsional `hewan.foto_hewan` dan `hewan.deskripsi` (catatan PRD bagian 5).
- Nama tabel dan kolom di database mengikuti ERD (`id_pengguna`, `nama_lengkap`, dst.) lewat `@map`.

## Keputusan desain yang perlu disepakati kelompok
- Saat satu pengajuan disetujui, pengajuan lain yang belum diputuskan untuk hewan yang sama ditolak otomatis (PRD tidak menyebut ini, dipakai untuk mencegah adopsi ganda).
- Penolakan otomatis (skor < 50) tetap bisa ditinjau admin lewat tombol Tinjau.

## Catatan teknis
- Persetujuan admin dan pengiriman pengajuan berjalan dalam satu transaksi; baris hewan dikunci (`FOR UPDATE`) saat persetujuan.
- Upload foto disimpan di `public/uploads/` (cocok untuk lokal/VPS; di hosting serverless perlu storage eksternal).
- Ekspor laporan berformat CSV (terbuka di Excel). Cetak memakai dialog cetak browser.
- Next.js 16 mengganti nama `middleware.ts` menjadi `proxy.ts`. Proyek ini memakai Next 15.
