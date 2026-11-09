# Undangan Digital Premium

Template undangan digital statis, responsif, romantis, dan mudah dikustomisasi. Dibuat dari konsep undangan Dhafa & Virsya yang Anda kirim, dengan pemisahan konfigurasi, aset, CSS, dan JavaScript.

## Struktur folder

```text
undangan-digital-premium/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── config.js
    │   └── app.js
    ├── images/
    │   └── (foto milik Anda)
    └── music/
        └── (backsound MP3 milik Anda)
```

## 1. Mengganti nama pasangan dan detail acara

Buka `assets/js/config.js`. Ubah bagian `couple`, `event`, `gift`, dan `rsvpWhatsApp`. Contoh:

```js
couple: {
  one: {
    firstName: "Nama Pria",
    fullName: "Nama Lengkap Pria",
    parents: "Putra dari Bapak ... dan Ibu ...",
    photo: "assets/images/pria.jpg"
  },
  two: {
    firstName: "Nama Wanita",
    fullName: "Nama Lengkap Wanita",
    parents: "Putri dari Bapak ... dan Ibu ...",
    photo: "assets/images/wanita.jpg"
  },
  coverPhoto: "assets/images/cover.jpg"
}
```

Tanggal countdown harus mengikuti format ISO dan menyertakan zona waktu. Untuk WIB gunakan `+07:00`, WITA `+08:00`, dan WIT `+09:00`.

## 2. Mengganti nama tamu satu per satu

Setiap tamu mendapat URL berbeda. Contoh:

- `https://domainanda.com/?to=Budi+Setiawan`
- `https://domainanda.com/?to=Andi+dan+Keluarga`
- `https://domainanda.com/?to=Ibu+Siti`

Nama akan tampil otomatis di halaman cover dan terisi pada kolom RSVP. Tombol **Buat Link Tamu** di kiri bawah juga dapat membuat link dan pesan WhatsApp. Buat link setelah website diunggah ke hosting agar domain yang muncul benar.

Catatan: parameter URL cocok untuk personalisasi nama, bukan untuk data rahasia. Siapa pun yang mengubah `?to=` dapat mengganti nama yang tampil.

## 3. Mengganti foto

1. Buka folder `assets/images/`.
2. Ganti foto dengan foto milik sendiri.
3. Pertahankan nama `cover.jpg`, `pria.jpg`, `wanita.jpg`, dan `galeri-1.jpg` sampai `galeri-6.jpg`.
4. Jika memakai nama lain, ubah path di `assets/js/config.js`.

Gunakan foto yang tajam, orientasi sesuai frame, dan ukuran file yang sudah dikompres agar website cepat dibuka.

## 4. Mengganti musik

1. Masukkan file MP3 ke `assets/music/`.
2. Beri nama `backsound-undangan.mp3`, atau ubah nilai `music` di `assets/js/config.js`.
3. Upload folder musik bersama website.

Autoplay audio bersuara biasanya diblokir browser. Karena itu pengunjung perlu menekan tombol musik atau Buka Undangan terlebih dahulu.

## 5. Mengganti warna / tema

Di `assets/js/config.js`, edit:

```js
theme: {
  accent: "#b58b68",
  background: "#f8f0ec",
  text: "#453a36"
}
```

Contoh warna:
- Rose gold: `#b58b68`
- Dusty pink: `#c98f91`
- Sage: `#879681`
- Navy: `#29364b`

Untuk perubahan layout dan animasi lebih lanjut, edit `assets/css/style.css`.

## 6. Mengganti lokasi Google Maps

Edit di `event` pada `config.js`:
- `venue`: nama gedung/tempat
- `address`: alamat lengkap
- `mapQuery`: koordinat atau nama tempat yang dapat dicari Google Maps

Contoh `mapQuery: "-6.257574,106.883386"`.

## 7. RSVP dan WhatsApp

Ubah `rsvpWhatsApp` dengan nomor WhatsApp admin/penerima, format internasional tanpa `+`, spasi, atau tanda hubung. Contoh Indonesia: `6281234567890`.

Form RSVP membuka WhatsApp pengelola dengan pesan yang sudah disiapkan. Template ini tidak menyimpan RSVP ke database. Jika ingin rekap otomatis lintas perangkat, hubungkan ke Google Sheets, Firebase, Supabase, atau layanan form backend.

## 8. Mengganti rekening hadiah

Edit objek `gift` di `config.js`:
- `bank`
- `account`
- `owner`

Jangan memasukkan data rekening asli ke template demo sebelum siap dipublikasikan.

## 9. Cara mengganti domain dan online-kan website

### Pilihan A — Netlify (mudah, drag & drop)
1. Buka https://www.netlify.com/ dan buat akun.
2. Pilih Add new site / Deploy manually.
3. Drag folder `undangan-digital-premium` (atau isi foldernya) ke area deploy.
4. Netlify memberikan alamat sementara seperti `nama-acak.netlify.app`.
5. Untuk domain sendiri, beli domain di registrar pilihan Anda.
6. Di Netlify buka Site configuration → Domain management → Add a domain.
7. Ikuti instruksi DNS yang ditampilkan Netlify pada panel registrar domain Anda. Propagasi DNS bisa memerlukan waktu.

### Pilihan B — GitHub Pages
1. Buat repository baru di https://github.com/.
2. Upload semua isi folder project ke root repository.
3. Buka Settings → Pages.
4. Pada Build and deployment pilih Deploy from a branch, pilih branch `main` dan folder `/ (root)`, lalu Save.
5. Gunakan alamat `username.github.io/nama-repo`.
6. Untuk domain sendiri, isi Custom domain di halaman Pages, lalu ikuti petunjuk DNS GitHub.

### Pilihan C — Hosting cPanel
1. Login ke cPanel hosting.
2. Buka File Manager → `public_html`.
3. Upload ZIP project dan Extract.
4. Pastikan `index.html` berada langsung di `public_html` atau document root domain/subdomain.
5. Aktifkan SSL/HTTPS melalui fitur SSL hosting.

**Penting:** Domain hanya alamat website. File website tetap harus diunggah ke hosting. Setelah domain terhubung, tes halaman di HP dan komputer.

## 10. Batasan template

- Website ini adalah static website; tidak memerlukan build atau instalasi Node.js.
- Generator nama membuat link personal melalui parameter URL.
- RSVP dikirim ke WhatsApp, bukan tersimpan otomatis di dashboard.
- Musik dan foto harus ikut diunggah ke hosting.
- Tombol generator bersifat praktis untuk pengelola, bukan sistem admin dengan login. Jangan menganggapnya sebagai panel privat.
