-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PENGADOPSI', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusHewan" AS ENUM ('TERSEDIA', 'TERADOPSI');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('JANTAN', 'BETINA');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('MENUNGGU_REVIEW', 'LOLOS_KUALIFIKASI', 'DISETUJUI', 'DITOLAK');

-- CreateTable
CREATE TABLE "pengguna" (
    "id_pengguna" SERIAL NOT NULL,
    "nama_lengkap" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "no_telp" VARCHAR(30),
    "alamat" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PENGADOPSI',

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id_pengguna")
);

-- CreateTable
CREATE TABLE "kategori_hewan" (
    "id_kategori" SERIAL NOT NULL,
    "nama_kategori" VARCHAR(100) NOT NULL,

    CONSTRAINT "kategori_hewan_pkey" PRIMARY KEY ("id_kategori")
);

-- CreateTable
CREATE TABLE "hewan" (
    "id_hewan" SERIAL NOT NULL,
    "id_kategori" INTEGER NOT NULL,
    "nama_hewan" VARCHAR(100) NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "umur_bulan" INTEGER NOT NULL,
    "status_adopsi" "StatusHewan" NOT NULL DEFAULT 'TERSEDIA',
    "foto_hewan" TEXT,
    "deskripsi" TEXT,

    CONSTRAINT "hewan_pkey" PRIMARY KEY ("id_hewan")
);

-- CreateTable
CREATE TABLE "kriteria_scoring" (
    "id_kriteria" SERIAL NOT NULL,
    "nama_kriteria" VARCHAR(100) NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "kriteria_scoring_pkey" PRIMARY KEY ("id_kriteria")
);

-- CreateTable
CREATE TABLE "opsi_kriteria" (
    "id_opsi" SERIAL NOT NULL,
    "id_kriteria" INTEGER NOT NULL,
    "keterangan_jawaban" TEXT NOT NULL,
    "nilai_poin" INTEGER NOT NULL,

    CONSTRAINT "opsi_kriteria_pkey" PRIMARY KEY ("id_opsi")
);

-- CreateTable
CREATE TABLE "pengajuan_adopsi" (
    "id_pengajuan" SERIAL NOT NULL,
    "id_pengguna" INTEGER NOT NULL,
    "id_hewan" INTEGER NOT NULL,
    "tanggal_pengajuan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_skor" INTEGER NOT NULL,
    "status_pengajuan" "StatusPengajuan" NOT NULL DEFAULT 'MENUNGGU_REVIEW',
    "tanggal_keputusan" TIMESTAMP(3),

    CONSTRAINT "pengajuan_adopsi_pkey" PRIMARY KEY ("id_pengajuan")
);

-- CreateTable
CREATE TABLE "detail_penilaian" (
    "id_detail" SERIAL NOT NULL,
    "id_pengajuan" INTEGER NOT NULL,
    "id_kriteria" INTEGER NOT NULL,
    "id_opsi" INTEGER NOT NULL,
    "poin" INTEGER NOT NULL,

    CONSTRAINT "detail_penilaian_pkey" PRIMARY KEY ("id_detail")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_hewan_nama_kategori_key" ON "kategori_hewan"("nama_kategori");

-- CreateIndex
CREATE INDEX "hewan_id_kategori_idx" ON "hewan"("id_kategori");

-- CreateIndex
CREATE INDEX "opsi_kriteria_id_kriteria_idx" ON "opsi_kriteria"("id_kriteria");

-- CreateIndex
CREATE INDEX "pengajuan_adopsi_id_pengguna_idx" ON "pengajuan_adopsi"("id_pengguna");

-- CreateIndex
CREATE INDEX "pengajuan_adopsi_id_hewan_tanggal_keputusan_idx" ON "pengajuan_adopsi"("id_hewan", "tanggal_keputusan");

-- CreateIndex
CREATE INDEX "detail_penilaian_id_pengajuan_idx" ON "detail_penilaian"("id_pengajuan");

-- AddForeignKey
ALTER TABLE "hewan" ADD CONSTRAINT "hewan_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "kategori_hewan"("id_kategori") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opsi_kriteria" ADD CONSTRAINT "opsi_kriteria_id_kriteria_fkey" FOREIGN KEY ("id_kriteria") REFERENCES "kriteria_scoring"("id_kriteria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_adopsi" ADD CONSTRAINT "pengajuan_adopsi_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_adopsi" ADD CONSTRAINT "pengajuan_adopsi_id_hewan_fkey" FOREIGN KEY ("id_hewan") REFERENCES "hewan"("id_hewan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penilaian" ADD CONSTRAINT "detail_penilaian_id_pengajuan_fkey" FOREIGN KEY ("id_pengajuan") REFERENCES "pengajuan_adopsi"("id_pengajuan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penilaian" ADD CONSTRAINT "detail_penilaian_id_kriteria_fkey" FOREIGN KEY ("id_kriteria") REFERENCES "kriteria_scoring"("id_kriteria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penilaian" ADD CONSTRAINT "detail_penilaian_id_opsi_fkey" FOREIGN KEY ("id_opsi") REFERENCES "opsi_kriteria"("id_opsi") ON DELETE RESTRICT ON UPDATE CASCADE;
