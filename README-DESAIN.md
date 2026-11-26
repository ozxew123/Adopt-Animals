# Catatan desain AdopsiKu

Gaya visual mengikuti dua screenshot referensi (halaman beranda dan halaman katalog). Tidak ada logo, nama merek, teks, atau gambar yang disalin.

## Warna yang diambil dari screenshot
Sampel piksel dari kedua screenshot (resolusi 1918x851 dan 1920x853):

| Token | Hex sampel | Sumber | Dipakai di |
|---|---|---|---|
| `--brand` | `#219F9B` | screenshot 1 dan 2, area hero dan tombol Cari | latar hero, dekorasi |
| `--cta` | `#EB1F4A` | screenshot 1 dan 2, tombol CTA | tombol utama (digelapkan ke `#D91A43`) |
| `--surface-2` | `#F5F5F5` | screenshot 1 dan 2, bilah atas | bilah utilitas, latar admin |
| `--peach` | `#F6C3B0` | screenshot 1 dan 2, bentuk organik hero | dekorasi hero |
| `--amber` | `#FCBB77` | screenshot 1 dan 2, bentuk organik hero | dekorasi hero, penanda menu admin |
| `--brand-light` | `#7DCED1` | screenshot 1 dan 2, gelombang hero | dekorasi hero |
| `--choco` | `#5B2C11` | screenshot 1, jejak kaki dan ilustrasi | jejak kaki hero |

Dua penyesuaian demi kontras WCAG AA:
- Teks dan tombol teal memakai `--primary` `#187E7B`, karena putih di atas `#219F9B` hanya 3,3:1. `#219F9B` tetap dipakai untuk latar hero dan judul besar.
- Tombol merah memakai `#D91A43`, karena putih di atas `#EB1F4A` sekitar 4,3:1. Paragraf hero diberi panel gelap tipis.

## Gaya yang ditiru
- Bilah utilitas abu-abu, baris merek + menu huruf kapital berjarak lebar, lalu baris pencarian dengan tombol teal dan CTA merah.
- Hero teal rata dengan bentuk organik dan jejak kaki.
- Tombol dan input persegi, huruf kapital berjarak, font Cairo (`next/font`).
- Katalog: filter di kiri dengan judul tebal besar, kartu foto dengan latar hitam dan badge di atas foto, baris "Halaman X dari total Y halaman".

Mengganti palet cukup dengan mengubah blok `:root` di `src/app/globals.css`.
