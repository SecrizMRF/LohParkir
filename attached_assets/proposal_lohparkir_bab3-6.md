# ISIAN PROPOSAL LOHPARKIR — BAB 3 s.d. BAB 6

> Bagian ini melengkapi template proposal lomba untuk aplikasi **LohParkir**, sebuah sistem verifikasi parkir berbasis QR Code untuk Dishub Kota Medan. Konten ditulis berdasarkan prototipe fungsional yang telah dibangun (Expo React Native + Express.js + PostgreSQL) dan tetap selaras dengan narasi BAB 1–2 (visi smart-city, transparansi PAD, pengawasan partisipatif).

---

## BAB 3 METODOLOGI PENGEMBANGAN

### 3.1 Metode Pengembangan Sistem

Pengembangan aplikasi LohParkir mengadopsi metode **Agile Development** dengan pendekatan **Scrum Sprint** berdurasi pendek (sprint 1 minggu). Pemilihan metode ini didasarkan pada karakteristik proyek yang memerlukan iterasi cepat, pengujian frekuentif terhadap tiga peran pengguna yang berbeda (warga, juru parkir, admin Dishub), serta kebutuhan untuk menyesuaikan fitur secara fleksibel berdasarkan umpan balik selama sesi prototyping. Setiap sprint menghasilkan increment fungsional yang dapat langsung dijalankan dan diverifikasi melalui Expo Go pada perangkat fisik, sehingga regresi dapat dideteksi sejak dini.

Aktivitas utama tiap sprint mencakup: (1) *sprint planning* untuk menentukan backlog fitur prioritas, (2) *daily stand-up* singkat untuk sinkronisasi tim, (3) *implementation & code review* berbasis pull-request, (4) *sprint review* dengan demo internal, dan (5) *sprint retrospective* untuk perbaikan proses berkelanjutan.

### 3.2 Tahapan Pengembangan

Pengembangan LohParkir dilaksanakan dalam enam tahap berikut:

| No | Tahapan | Aktivitas Utama | Output |
|---|---|---|---|
| 1 | **Analisis Kebutuhan** | Studi literatur kebijakan parkir Kota Medan (Perda No. 1/2024), wawancara konseptual peran Dishub, identifikasi pain-point pungli, perumusan 3 peran pengguna. | Dokumen *user requirements* dan *user stories* untuk warga, juru parkir, admin. |
| 2 | **Desain Sistem** | Penyusunan *use case diagram*, *activity diagram* alur scan-bayar, perancangan skema basis data relasional (users, officers, officer_qr_codes, payments, scans, reports), dan wireframe antarmuka. | ERD, mockup UI, dokumentasi API. |
| 3 | **Pengembangan (Implementasi)** | Implementasi backend REST API (Express + Drizzle ORM), implementasi aplikasi mobile lintas platform (Expo React Native), integrasi pembayaran QRIS dummy, sistem autentikasi berbasis JWT untuk admin/petugas dan device-ID untuk publik. | Kode sumber siap-jalan, build Expo Go. |
| 4 | **Pengujian** | *Black-box testing* per fitur, *integration testing* alur end-to-end (scan → bayar → karcis → rating), pengujian device-scoping data, validasi otorisasi tiap peran. | Laporan pengujian dan daftar bug yang telah diperbaiki. |
| 5 | **Implementasi/Deployment** | Build APK via EAS Build, deployment backend ke Replit Deployment dengan PostgreSQL terkelola, *seeding* data demo (3 petugas + 30 pembayaran historis). | APK distribusi internal, URL produksi backend. |
| 6 | **Evaluasi dan Iterasi** | Sesi *usability testing* internal, kalibrasi formula poin (Motor=1, Mobil=2, Rating=1), penyempurnaan UX (alert kustom, redirect login, dashboard read-only publik). | Catatan iterasi dan roadmap pengembangan lanjutan. |

### 3.3 Diagram Sistem

#### 3.3.1 Use Case Diagram (Ringkasan Naratif)

LohParkir memiliki **empat aktor**: *Warga (Publik)*, *Juru Parkir Resmi*, *Admin Dishub*, dan *Sistem Backend*.

- **Warga**: scan QR jukir, bayar via QRIS, terima karcis digital, beri rating, laporkan pelanggaran, lihat riwayat & poin, akses statistik publik *read-only*.
- **Juru Parkir**: login dengan NIP, lihat 2 QR pribadi (Motor & Mobil), tampilkan QR untuk discan warga, catat pembayaran tunai sebagai cadangan.
- **Admin Dishub**: kelola data petugas (CRUD), kelola laporan pelanggaran (verifikasi, tindak lanjut), pantau dasbor analitik real-time (total scan, QR valid/palsu, pendapatan harian/total, petugas aktif).
- **Sistem Backend**: validasi QR, generate transaksi, agregasi statistik, scoping data per perangkat untuk privasi.

#### 3.3.2 Activity Diagram — Alur Inti "Scan & Bayar"

```
[Warga] --(buka aplikasi)--> [Tab Scan]
        --(scan QR jukir)---> [Backend: validasi QR]
              |
              ├── valid ────> [Halaman pembayaran]
              |                   ├── pilih QRIS ──> [Tampilkan QR pembayaran] ──> [Konfirmasi otomatis 5 dtk]
              |                   └── pilih Tunai ──> [Catat pembayaran tunai]
              |                              |
              |                   [Karcis digital + +1/+2 poin] ──> [Halaman rating]
              |                                                          └── [+1 poin]
              └── tidak valid ──> [Tampilkan peringatan QR PALSU + tombol laporkan pungli]
```

#### 3.3.3 Arsitektur Sistem (Lihat juga 4.4)

```
┌─────────────────────────┐      HTTPS/REST     ┌──────────────────────┐
│  Mobile App (Expo RN)   │ ◄──────────────────►│  Express API Server  │
│  - Warga                │                     │  - Auth (JWT/Session)│
│  - Juru Parkir          │                     │  - Validasi QR       │
│  - Admin Dishub         │                     │  - Logika bisnis     │
└─────────────────────────┘                     └──────────┬───────────┘
                                                           │ Drizzle ORM
                                                           ▼
                                                ┌──────────────────────┐
                                                │ PostgreSQL Database  │
                                                │ - users, officers    │
                                                │ - officer_qr_codes   │
                                                │ - payments, scans    │
                                                │ - reports            │
                                                └──────────────────────┘
```

---

## BAB 4 DESAIN DAN IMPLEMENTASI APLIKASI

### 4.1 Konsep Aplikasi

**LohParkir** adalah aplikasi mobile lintas platform (Android & iOS) yang berfungsi sebagai **ekosistem verifikasi & retribusi parkir terintegrasi** untuk wilayah operasional Dinas Perhubungan Kota Medan. Aplikasi ini menjawab tiga problem utama secara simultan dalam satu platform:

1. **Verifikasi keabsahan jukir** — setiap juru parkir resmi memiliki dua kode QR unik (Motor dan Mobil) yang di-generate sistem dan terhubung ke profil petugas (NIP, nama, area tugas, status aktif). Warga memindai QR untuk memastikan jukir terdaftar resmi.
2. **Retribusi nontunai yang akuntabel** — pembayaran via QRIS langsung tercatat di database backend dengan ID transaksi unik, nominal sesuai Perda Kota Medan (Motor Rp2.000, Mobil Rp4.000), dan terhubung ke identitas jukir penerima.
3. **Pengawasan partisipatif** — warga dapat melaporkan jukir liar/pungli langsung dari aplikasi (dengan bukti foto, lokasi GPS, kategori pelanggaran), memperoleh poin reward, serta menilai kinerja jukir.

Aplikasi mendukung **tiga peran pengguna** dengan antarmuka berbeda: *Warga (Publik)*, *Juru Parkir*, dan *Admin Dishub* — yang dapat dipilih melalui *role-select screen* saat pertama kali aplikasi dijalankan.

### 4.2 Fitur Utama Aplikasi

#### A. Fitur untuk Warga (Publik)
1. **Scan QR Jukir** dengan kamera perangkat untuk verifikasi keabsahan secara real-time.
2. **Input QR Manual** sebagai fallback ketika kamera tidak tersedia.
3. **Pembayaran QRIS** dengan QR pembayaran dinamis dan konfirmasi otomatis.
4. **Pembayaran Tunai (cadangan)** ketika kondisi tidak memungkinkan transaksi digital.
5. **Karcis Digital** sebagai bukti transaksi sah, tersimpan di riwayat per perangkat.
6. **Rating Jukir** dengan skala bintang dan reward 1 poin per rating.
7. **Lapor Pungli** dengan deskripsi, kategori, foto opsional, dan koordinat GPS.
8. **Sistem Poin & Diskon** — Motor: +1 poin, Mobil: +2 poin, Rating: +1 poin.
9. **Statistik Publik *Read-Only*** — total scan, QR valid, QR palsu, jumlah laporan kota.
10. **Login/Daftar opsional** untuk migrasi poin & riwayat antar perangkat (mode tamu juga didukung).

#### B. Fitur untuk Juru Parkir
1. **Login NIP + Password** dengan otorisasi backend.
2. **Dashboard QR Pribadi** menampilkan 2 QR (Motor & Mobil) siap discan warga.
3. **QR Code Display** beresolusi tinggi untuk pemindaian optimal.
4. **Pencatatan Pembayaran Tunai** untuk situasi warga tidak mampu QRIS.
5. **Tampilan Tarif Resmi** sesuai Perda untuk transparansi ke warga.

#### C. Fitur untuk Admin Dishub
1. **Dashboard Statistik Real-time** — 8 widget seragam: Total Scan, Laporan, QR Valid, QR Palsu, Scan Hari Ini, Petugas Aktif, Total Pendapatan, Pendapatan Hari Ini.
2. **Manajemen Petugas** — CRUD juru parkir lengkap dengan generate QR otomatis untuk Motor & Mobil.
3. **Manajemen Laporan** — daftar, filter, verifikasi, dan tindak-lanjut laporan warga.
4. **Manajemen Pembayaran** — riwayat seluruh transaksi (tunai & QRIS) untuk audit PAD.
5. **Aktivitas Scan Terbaru** — feed live aktivitas pemindaian QR seluruh kota.

#### D. Fitur Sistem Lintas-Peran
1. **Custom Alert In-App** — pop-up bergaya aplikasi (animasi fade + scale) menggantikan alert default perangkat untuk konsistensi UX.
2. **Device-Scoping Data** — riwayat pembayaran/laporan/poin warga ter-scope per perangkat (deviceId), sehingga privasi tetap terjaga tanpa wajib login.
3. **Mode Offline Fallback** — pemuatan data dari cache lokal saat backend tidak terjangkau.
4. **Multi-platform** — satu basis kode untuk Android & iOS (via Expo).

### 4.3 Desain Antarmuka (UI/UX)

LohParkir menggunakan **design system konsisten** berbasis tipografi *Atkinson Hyperlegible* (font dirancang khusus untuk keterbacaan tinggi, mendukung aksesibilitas), palet warna primer biru Dishub (`#1565C0`) dengan aksen warning (oranye), success (hijau), dan destructive (merah). Setiap kartu menggunakan radius 12-18 dan bayangan ringan untuk memberi kesan modern namun ramah.

Prinsip UX yang diterapkan:
- **Single-tap critical action** — tombol scan dan tombol bayar selalu paling besar dan kontras.
- **Progressive disclosure** — informasi teknis (transaction ID, koordinat) hanya muncul setelah aksi inti tuntas.
- **Aksesibilitas** — font hyperlegible, kontras WCAG AA, ukuran tap-target ≥44px.
- **Konsistensi visual** — seluruh widget dashboard admin memiliki dimensi & padding identik.

> *Lampiran*: tangkapan layar 8 halaman utama (Role Select, Scan, QR Camera, Payment, Karcis, Rating, Officer Dashboard, Admin Dashboard) disertakan terpisah pada appendix proposal.

### 4.4 Arsitektur Sistem

LohParkir mengadopsi arsitektur **client-server tiga lapis (3-tier)** sebagaimana umum digunakan dalam aplikasi mobile modern:

#### 4.4.1 Lapisan Klien (Mobile Application)
- **Framework**: Expo SDK 54 + React Native (lintas platform Android/iOS).
- **Routing**: Expo Router (file-based routing, mendukung deep-linking).
- **State Management**: React Context API untuk *global app state* (peran pengguna, autentikasi, data ter-cache).
- **Akses Perangkat**: `expo-camera` untuk pemindaian QR, `expo-haptics` untuk umpan balik taktil, `expo-location` untuk koordinat laporan.
- **Penyimpanan Lokal**: AsyncStorage untuk cache offline, deviceId, dan kredensial.

#### 4.4.2 Lapisan Server (Backend API)
- **Framework**: Express.js (Node.js + TypeScript) berbasis arsitektur REST.
- **Autentikasi**: Sesi berbasis token untuk admin & petugas, deviceId-based scoping untuk publik (privacy-by-default).
- **Endpoint Utama**:
  - `POST /auth/login` — autentikasi admin/petugas
  - `GET /qr/validate/:code` — validasi QR jukir oleh warga
  - `POST /qr/cash-payment` — catatan pembayaran tunai oleh petugas
  - `POST /payments` — pencatatan pembayaran QRIS
  - `GET /payments`, `POST /reports`, `GET /reports` (dengan filter deviceId)
  - `GET /dashboard/stats` — agregasi statistik real-time
  - `GET/POST/PATCH/DELETE /officers` — manajemen petugas oleh admin
- **Validasi**: Zod schema untuk seluruh payload request.

#### 4.4.3 Lapisan Data (Database)
- **DBMS**: PostgreSQL (relational, ACID-compliant).
- **ORM**: Drizzle ORM (type-safe, schema-first).
- **Skema Utama**:
  - `users` — kredensial admin & petugas
  - `officers` — profil juru parkir (NIP, nama, area, status)
  - `officer_qr_codes` — relasi 1-ke-banyak ke `officers`, satu baris per jenis kendaraan dengan kolom rate (Motor 2000, Mobil 4000)
  - `payments` — seluruh transaksi (transactionId, officerId, amount, method, deviceId, createdAt)
  - `scans` — log pemindaian (valid/invalid, deviceId, timestamp)
  - `reports` — laporan pelanggaran warga (kategori, deskripsi, lokasi, status, reporterDeviceId)

#### 4.4.4 Diagram Arsitektur Detail

```
   ┌────────────────────────────────────────────┐
   │             MOBILE APP (Expo RN)           │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
   │  │  Warga   │  │  Petugas │  │  Admin   │ │
   │  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
   │       └─────────────┼──────────────┘      │
   │                     │  React Context      │
   │                     │  + AsyncStorage     │
   └─────────────────────┼──────────────────────┘
                         │ HTTPS/JSON
                         ▼
   ┌────────────────────────────────────────────┐
   │         EXPRESS API SERVER (Node.js)       │
   │   Routes: auth | qr | payments | reports   │
   │           officers | dashboard | seed      │
   │   Middleware: authMiddleware, validation   │
   └─────────────────────┬──────────────────────┘
                         │ Drizzle ORM
                         ▼
   ┌────────────────────────────────────────────┐
   │             PostgreSQL Database            │
   └────────────────────────────────────────────┘
```

> Catatan integrasi: arsitektur ini kompatibel dengan migrasi ke layanan BaaS (mis. Firebase/Supabase) untuk skala produksi yang lebih besar, karena kontrak API sudah terdefinisi rapi melalui REST + Zod schema.

---

## BAB 5 HASIL DAN DEMO APLIKASI

### 5.1 Implementasi Aplikasi

Prototipe LohParkir telah berhasil diimplementasikan secara fungsional dengan cakupan sebagai berikut:

- **Aplikasi mobile** terbangun untuk Android dan iOS melalui satu basis kode Expo React Native, dengan distribusi internal via APK (EAS Build).
- **Backend API** berjalan di lingkungan produksi melalui Replit Deployment dengan PostgreSQL terkelola.
- **Database** memuat data demo realistis: 3 petugas aktif (NIP 198501012010011001, dst.), 6 QR code (Motor & Mobil per petugas), 30 pembayaran historis selama 7 hari, 12 catatan scan, dan 6 laporan dengan status bervariasi.
- **Tiga peran pengguna** sepenuhnya operasional dengan otorisasi yang ketat: warga tidak dapat mengakses dasbor admin, petugas hanya melihat QR miliknya, admin memiliki visibilitas penuh.
- **Kredensial demo**:
  - Admin: `admin / admin123`
  - Super Admin: `superadmin / superadmin123`
  - Petugas: `198501012010011001 / petugas001` (dan 002, 003)

### 5.2 Pengujian Aplikasi

Pengujian dilakukan dengan dua pendekatan komplementer:

#### 5.2.1 Black-box Testing
Pengujian berbasis spesifikasi fungsional terhadap setiap fitur tanpa mempertimbangkan struktur kode internal. Skenario pengujian mencakup:

| No | Fitur | Skenario | Hasil |
|---|---|---|---|
| 1 | Validasi QR | Scan QR valid dari petugas aktif | ✅ Berhasil, redirect ke pembayaran |
| 2 | Validasi QR | Scan QR palsu/random | ✅ Tampilkan peringatan + tombol lapor |
| 3 | Pembayaran QRIS | Tap "Bayar QRIS" → tunggu konfirmasi | ✅ Karcis muncul, poin bertambah sesuai jenis |
| 4 | Pembayaran Tunai (petugas) | Tap "USER BAYAR TUNAI" dari QRIS | ✅ Langsung tercatat tanpa modal redundan |
| 5 | Lapor Pungli | Submit laporan dengan/ tanpa foto | ✅ Tersimpan, muncul ticket number |
| 6 | Dashboard Admin | Login admin → dilihat dashboard | ✅ Redirect tepat ke `/(tabs)/admin` |
| 7 | Statistik Publik | Buka tab scan tanpa login | ✅ Stats card muncul read-only |
| 8 | Sistem Poin | Bayar Motor / Mobil / Rating | ✅ +1 / +2 / +1 sesuai formula |
| 9 | Device Scoping | Lihat riwayat dari 2 perangkat berbeda | ✅ Data terpisah per deviceId |
| 10 | Custom Alert | Trigger berbagai alert | ✅ Tampil modal in-app, bukan default OS |

#### 5.2.2 Usability Testing
Sesi *think-aloud* internal terhadap 3 partisipan yang merepresentasikan setiap peran pengguna. Temuan utama yang telah ditindaklanjuti antara lain: (a) penyeragaman ukuran widget dashboard admin, (b) penghilangan redundansi pemilihan kendaraan saat catat pembayaran tunai, (c) penambahan dashboard publik *read-only* untuk meningkatkan transparansi, dan (d) penggantian alert default OS dengan modal kustom yang konsisten dengan tema aplikasi.

### 5.3 Kelebihan Aplikasi

1. **Holistik & Terintegrasi** — verifikasi jukir, pembayaran QRIS, pelaporan pungli, dan analitik admin tersedia dalam satu aplikasi (bukan empat aplikasi terpisah seperti pada kebanyakan solusi parkir kota lain).
2. **Privacy-by-Default** — data warga ter-scope per perangkat tanpa wajib login, namun tetap dapat di-migrasi ke akun login bila pengguna memilih untuk membuat akun.
3. **Lintas Platform Efisien** — satu basis kode untuk Android & iOS menekan biaya pengembangan & pemeliharaan.
4. **Multi-Peran dengan Otorisasi Ketat** — 3 peran (warga, petugas, admin) dengan separasi hak akses berbasis JWT dan middleware backend.
5. **Skalabel & Modular** — backend REST + PostgreSQL siap migrasi ke skala produksi (cluster, replikasi) tanpa perubahan klien.
6. **Aksesibilitas** — penggunaan font hyperlegible, kontras WCAG-compliant, ukuran tap-target ramah pengguna lansia.
7. **Resilient terhadap koneksi terbatas** — fallback ke cache lokal & dukungan input QR manual ketika kamera/internet bermasalah.
8. **UX Konsisten** — alert kustom, animasi feedback haptic, dan widget dashboard seragam memberi kesan profesional dan terpercaya — penting untuk aplikasi pemerintahan.
9. **Sistem Insentif Adil** — formula poin terdokumentasi dan adil (Motor 1, Mobil 2, Rating 1) mendorong partisipasi tanpa eksploitasi.
10. **Auditability** — setiap transaksi memiliki ID unik, terhubung ke jukir & perangkat asal, sehingga sangat mudah diaudit oleh inspektorat daerah.

---

## BAB 6 PENUTUP

### 6.1 Kesimpulan

Pengembangan aplikasi LohParkir telah berhasil mengimplementasikan sebuah ekosistem digital terpadu untuk pengelolaan retribusi parkir tepi jalan di Kota Medan, sebagaimana rumusan masalah pada BAB 1. Aplikasi mengintegrasikan tiga komponen kritis dalam satu platform: (1) **verifikasi identitas juru parkir resmi melalui pemindaian QR Code**, (2) **pembayaran retribusi nontunai berbasis QRIS** yang setiap transaksinya tercatat secara real-time pada basis data terpusat, dan (3) **mekanisme pelaporan partisipatif oleh warga** yang dilengkapi sistem insentif poin sebagai pendorong keterlibatan masyarakat.

Implementasi prototipe membuktikan bahwa pendekatan terintegrasi seperti ini layak secara teknis dengan menggunakan tumpukan teknologi modern (Expo React Native + Express.js + PostgreSQL) yang efisien biaya namun tetap memenuhi standar kualitas produksi. Pengujian *black-box* dan *usability* menunjukkan seluruh alur bisnis utama berjalan sesuai spesifikasi, dengan iterasi penyempurnaan UX yang berfokus pada konsistensi visual, transparansi data publik, dan akurasi sistem reward.

Lebih dari sekadar solusi teknis, LohParkir merepresentasikan kontribusi mahasiswa Ilmu Komputer Universitas Sumatera Utara dalam mendukung visi *Smart City* Kota Medan dan Indonesia Emas 2045 melalui digitalisasi tata kelola publik yang transparan, akuntabel, dan partisipatif.

### 6.2 Rencana Pengembangan

Pengembangan LohParkir ke depan diarahkan pada lima jalur prioritas berikut:

1. **Integrasi Pembayaran QRIS Resmi** — bermitra dengan *payment gateway* berlisensi Bank Indonesia (mis. Midtrans, Xendit) untuk koneksi langsung ke rekening kas umum daerah Kota Medan, menggantikan QRIS dummy dalam prototipe.
2. **Geofencing & Heatmap Prediktif** — implementasi penuh fitur peta zona rawan pungli, notifikasi geografis preventif berbasis poligon zona, dan heatmap prediksi pelanggaran berbasis data historis laporan, sebagaimana dijanjikan pada BAB 1 poin (4) dan BAB 2.2.3.
3. **Pengawasan Kehadiran Petugas Berbasis Radius** — pemantauan koordinat GPS aplikasi petugas untuk memverifikasi kehadiran fisik di zona penugasan, dengan flagging otomatis di dasbor admin bagi petugas yang beroperasi di luar zona.
4. **Modul Penukaran Poin (Reward Marketplace)** — katalog mitra (UMKM, parkir berbayar, e-commerce lokal) untuk penukaran poin pengguna menjadi diskon nyata, sehingga insentif partisipatif menjadi lebih konkret.
5. **Dasbor Inspektorat & Open Data** — penyediaan endpoint *open data* (anonim, agregat) untuk transparansi PAD parkir kepada publik, serta dasbor khusus inspektorat untuk audit lintas-OPD.

Pada jangka menengah, LohParkir juga direncanakan dapat **direplikasi ke kota-kota lain di Sumatera dan Indonesia** dengan pendekatan multi-tenant, sehingga menjadi *blueprint* nasional untuk digitalisasi retribusi parkir tepi jalan dalam kerangka Gerakan Nasional 1000 Smart City.
