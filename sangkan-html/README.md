# Sangkan Resort Aqua Park — E-Ticketing (HTML / CSS / JavaScript native)

Konversi dari proyek CodeIgniter (PHP + MySQL) ke situs statis tanpa framework dan tanpa backend.
Tampilan dipertahankan; logika (login, pesan tiket, POS, verifikasi, laporan, CRUD) dijalankan JavaScript,
data disimpan di `localStorage` browser.

## Cara menjalankan
- Cara paling aman: taruh folder ini di `htdocs` XAMPP atau buka dengan ekstensi **Live Server** (VS Code), lalu buka `index.html`.
- Bisa juga klik dua kali `index.html` di **Chrome/Edge**. Firefox memisahkan penyimpanan per file jika dibuka lewat `file://`, jadi gunakan server lokal untuk Firefox.
- Perlu internet hanya untuk Google Maps (iframe). Semua CSS, JS, dan ikon (SVG garis) buatan sendiri; tanpa framework, library, font ikon, atau CDN.

## Akun awal
| Peran | Username / Email | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Manajer | `manajer1` / `manajer2` | `manajer123` |
| Customer | daftar lewat `register.html` | — |

Login Admin & Manajer lewat tab **Staff**. Di Dashboard Admin ada tombol **Isi Data Contoh** dan **Reset Semua Data**.

## Fitur per peran
**Customer / pengunjung**: landing page, pilih & pesan tiket, checkout (Transfer / Bayar di Tempat), e-tiket dengan **QR Code asli**, unggah bukti transfer, cetak tiket, riwayat, profil, cek status tiket publik.

**Manajer** (menggantikan Kasir): Dashboard (pendapatan hari/bulan, pengunjung masuk, kapasitas harian & kuota 7 hari, tiket terlaris, antrean persetujuan) · Point of Sale · Verifikasi/check-in tiket · Data Transaksi (verifikasi / tolak pembayaran) · Riwayat Saya · Laporan (filter periode, rekap per metode & tiket, unduh CSV, cetak).

**Admin**: semua fitur di atas pada sisi data + Kelola Layanan & Tiket, Data Customer, Kelola Staff (Admin/Manajer), Pesan Masuk (dari formulir kontak).

**Landing page (baru)**: status buka/tutup (WIB), Wahana & Fasilitas, **Denah resmi (bisa diperbesar)**, **Google Maps + tombol Petunjuk Arah**, Cek Status Tiket, FAQ, formulir kontak yang berfungsi.

## Struktur
```
index.html login.html register.html pesan.html checkout.html sukses.html tiket.html
print-tiket.html riwayat.html profil.html
panel/            halaman Admin & Manajer (satu kerangka, menu mengikuti peran)
assets/css        base.css (UI kit sendiri) icons.css landing.css auth.css customer.css panel.css print.css
assets/js         core.js (data, sesi, model) qr.js ui.js (modal, dropdown, accordion) panel.js ticket.js  +  pages/*.js
```

## Yang perlu Anda ganti / lengkapi
- Foto hero memakai `assets/images/gambar-sangkan.webp`.
- Denah memakai gambar resmi `assets/img/denah-sangkan.jpg` (ganti file ini bila denah berubah; keterangan area ada di `assets/js/pages/landing.js`).
- Alamat, telepon, email, nomor rekening, nomor WhatsApp (`628123456789`) masih data placeholder dari proyek asli.

## Catatan teknis
- Ini simulasi front-end: password di-hash di browser dan data hanya ada di browser tersebut. Untuk produksi nyata tetap perlu backend + database.
- Kuota harian: pemesanan online ditolak jika melebihi kapasitas (diatur Manajer, default 1.500).
