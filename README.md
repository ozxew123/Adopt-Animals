# AdopsiKu

Sistem informasi adopsi hewan terlantar dengan penilaian kelayakan (Scoring System), mengikuti PRD Tugas SBD M3 Kelompok 5.
Vite + React 19 + TypeScript + Hono + Prisma 6 + Neon PostgreSQL.

## Menjalankan
```bash
cp .env.example .env          # isi DATABASE_URL Neon dan AUTH_SECRET
npm install
npx prisma migrate deploy     # atau npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
npm run dev                   # Vite (http://localhost:5173) + Hono API (http://localhost:3001)
npm test                      # uji logika scoring
npm run build                 # build frontend Vite + typecheck
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
| `/admin/scoring` | CRUD kriteria, opsi jawaban, dan bobot poin |
| `/admin/riwayat` | Laporan riwayat adopsi, filter, ekspor CSV, cetak |

## Aturan scoring (PRD bagian 4)
| Skor | Rekomendasi admin | Status pengadopsi |
|---|---|---|
| > 80 | Lolos Syarat (hijau) | Lolos Kualifikasi |
| 50 sampai 80 | Dipertimbangkan (kuning) | Menunggu Review |
| < 50 | Tidak Memenuhi Syarat (merah) | Ditolak (otomatis) |

## Skema Database (ERD 7 Entitas)
- `pengguna` (`id_pengguna`, `nama_lengkap`, `email`, `password`, `no_telp`, `alamat`, `role`)
- `kategori_hewan` (`id_kategori`, `nama_kategori`)
- `hewan` (`id_hewan`, `id_kategori`, `nama_hewan`, `jenis_kelamin`, `umur_bulan`, `status_adopsi`, `foto_hewan`, `deskripsi`)
- `kriteria_scoring` (`id_kriteria`, `nama_kriteria`, `urutan`)
- `opsi_kriteria` (`id_opsi`, `id_kriteria`, `keterangan_jawaban`, `nilai_poin`)
- `pengajuan_adopsi` (`id_pengajuan`, `id_pengguna`, `id_hewan`, `tanggal_pengajuan`, `total_skor`, `status_pengajuan`, `tanggal_keputusan`)
- `detail_penilaian` (`id_detail`, `id_pengajuan`, `id_kriteria`, `id_opsi`, `poin`)

## Catatan teknis
- Database mendukung Neon serverless (`@neondatabase/serverless` + `@prisma/adapter-neon`) otomatis saat `DATABASE_URL` mengarah ke Neon (`neon.tech`), maupun PostgreSQL standar untuk pengembangan lokal.
- Persetujuan admin dan pengiriman pengajuan berjalan dalam satu transaksi; baris hewan dikunci (`FOR UPDATE`) saat persetujuan untuk mencegah adopsi ganda.
- Upload foto disimpan di `public/uploads/`.
- Ekspor laporan berformat CSV (terbuka di Excel). Cetak memakai dialog cetak browser.
