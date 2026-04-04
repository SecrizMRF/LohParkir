# Software Requirements Specification (SRS)
# Aplikasi LohParkir — Use Case Document

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini menjelaskan kebutuhan fungsional sistem LohParkir menggunakan pendekatan Use Case. Dokumen mencakup identifikasi aktor, deskripsi use case, serta hubungan antar use case dalam sistem.

### 1.2 Ruang Lingkup Sistem
LohParkir adalah aplikasi mobile yang berfungsi sebagai sistem verifikasi parkir resmi, pelaporan parkir liar, dan pembayaran digital. Sistem ini melibatkan tiga jenis pengguna: masyarakat umum (pengendara), admin Dinas Perhubungan (Dishub), dan petugas parkir terdaftar.

### 1.3 Definisi dan Singkatan
| Istilah | Definisi |
|---------|----------|
| QR Code | Quick Response Code, kode matriks dua dimensi |
| QRIS | Quick Response Code Indonesian Standard |
| Dishub | Dinas Perhubungan |
| GPS | Global Positioning System |
| Badge | Kartu identitas resmi petugas parkir yang dilengkapi QR Code |

---

## 2. Identifikasi Aktor

| No | Aktor | Deskripsi |
|----|-------|-----------|
| A1 | Masyarakat (Pengendara) | Pengguna umum yang menggunakan aplikasi untuk memverifikasi petugas parkir, melaporkan pelanggaran, dan melakukan pembayaran digital |
| A2 | Admin Dishub | Petugas Dinas Perhubungan yang mengelola data petugas parkir, memantau dashboard, dan mengelola laporan |
| A3 | Petugas Parkir | Juru parkir terdaftar yang membawa badge QR resmi. Tidak menggunakan aplikasi secara aktif |
| A4 | Sistem | Proses otomatis yang dijalankan oleh aplikasi (validasi QR, generate tiket, notifikasi) |

---

## 3. Diagram Use Case

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Sistem LohParkir                               │
│                                                                         │
│  ┌─────────────────┐    ┌──────────────────────┐                        │
│  │  UC-01: Scan     │    │  UC-02: Validasi QR  │                       │
│  │  QR Code         │───>│  Code                │                       │
│  └─────────────────┘    └──────────────────────┘                        │
│          │                        │                                     │
│          │               ┌────────┴────────┐                            │
│          │               │                 │                            │
│          │    ┌──────────▼──────┐  ┌───────▼────────────┐               │
│          │    │ UC-03: Lihat    │  │ UC-04: Laporkan    │               │
│  A1 ─────┤    │ Detail Petugas  │  │ QR Palsu/Parkir   │               │
│(Masya-   │    └──────────┬──────┘  │ Liar               │              │
│ rakat)   │               │         └───────┬────────────┘               │
│          │    ┌──────────▼──────┐          │                            │
│          │    │ UC-05: Bayar    │  ┌───────▼────────────┐               │
│          │    │ Digital (QRIS)  │  │ UC-06: Generate    │               │
│          │    └─────────────────┘  │ Nomor Tiket        │◄── A4        │
│          │                         └───────┬────────────┘  (Sistem)    │
│          │                        ┌────────▼───────────┐               │
│          │                        │ UC-07: Kirim       │               │
│          └───────────────────────>│ Notifikasi         │◄── A4        │
│                                   └────────────────────┘               │
│                                                                         │
│  ┌─────────────────┐    ┌──────────────────────┐                        │
│  │  UC-08: Lihat    │    │  UC-09: Lihat &      │                       │
│  │  Dashboard       │    │  Cetak Laporan       │                       │
│  └─────────────────┘    └──────────────────────┘                        │
│          │                        │                                     │
│  A2 ─────┤                        │                                     │
│(Admin    │    ┌───────────────────┘                                     │
│ Dishub)  │    │                                                         │
│          │    │  ┌──────────────────────┐                                │
│          │    │  │ UC-10: Kelola        │                                │
│          ├────┤  │ Laporan Masuk        │                                │
│          │    │  └──────────────────────┘                                │
│          │    │                                                         │
│          │    │  ┌──────────────────────┐                                │
│          └────┴─>│ UC-11: Buat Akun     │                               │
│                  │ Petugas & QR Badge   │──────────────────> A3          │
│                  └──────────────────────┘              (Petugas Parkir)  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Keterangan Relasi:
  ───>  : <<include>>  (selalu dipanggil)
  - - > : <<extend>>   (dipanggil jika kondisi terpenuhi)
```

---

## 4. Deskripsi Use Case

### UC-01: Scan QR Code

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-01 |
| **Nama** | Scan QR Code |
| **Aktor Utama** | Masyarakat (A1) |
| **Deskripsi** | Pengguna men-scan QR Code pada badge petugas parkir atau lokasi parkir menggunakan kamera smartphone |
| **Pre-condition** | Aplikasi terinstal, kamera smartphone tersedia dan izin akses diberikan |
| **Post-condition** | Sistem menampilkan hasil validasi QR Code |
| **Trigger** | Pengguna membuka aplikasi dan mengarahkan kamera ke QR Code |

**Alur Utama (Main Flow):**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | Membuka aplikasi LohParkir | Menampilkan tampilan kamera dengan frame scan QR |
| 2 | Mengarahkan kamera ke QR Code pada badge petugas | — |
| 3 | — | Mendeteksi dan membaca QR Code |
| 4 | — | Menjalankan UC-02 (Validasi QR Code) |
| 5 | — | Menampilkan hasil validasi |

**Alur Alternatif:**

| Kode | Kondisi | Aksi |
|------|---------|------|
| A1 | Kamera tidak tersedia/izin ditolak | Sistem menampilkan permintaan izin kamera atau opsi input manual |
| A2 | Pengguna memilih input manual | Sistem menampilkan form input kode QR secara manual |

---

### UC-02: Validasi QR Code

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-02 |
| **Nama** | Validasi QR Code |
| **Aktor Utama** | Sistem (A4) |
| **Deskripsi** | Sistem memvalidasi kode QR yang di-scan terhadap database petugas resmi Dishub |
| **Pre-condition** | QR Code telah berhasil di-scan atau diinput manual |
| **Post-condition** | Status validasi ditentukan (resmi/tidak resmi) |

**Alur Utama (Main Flow):**

| Langkah | Sistem |
|---------|--------|
| 1 | Menerima data QR Code dari UC-01 |
| 2 | Mencocokkan kode dengan database petugas terdaftar |
| 3a | **Jika valid**: Menampilkan status "Petugas Resmi" → lanjut ke UC-03 |
| 3b | **Jika tidak valid**: Menampilkan status "QR Tidak Valid" → opsi UC-04 |
| 4 | Menyimpan riwayat scan |

---

### UC-03: Lihat Detail Petugas

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-03 |
| **Nama** | Lihat Detail Petugas |
| **Aktor Utama** | Masyarakat (A1) |
| **Deskripsi** | Menampilkan informasi lengkap petugas parkir yang terverifikasi |
| **Pre-condition** | QR Code tervalidasi sebagai resmi (UC-02 hasil valid) |
| **Post-condition** | Informasi petugas ditampilkan, opsi pembayaran tersedia |

**Data yang Ditampilkan:**
- Nama petugas
- Nomor badge
- Area kerja
- Lokasi tugas
- Tarif resmi

**Alur Utama:**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | — | Menampilkan detail petugas beserta status verifikasi |
| 2 | Memilih "Bayar Digital" | Lanjut ke UC-05 |
| 3 | Memilih "Kembali" | Kembali ke layar scan |

---

### UC-04: Laporkan QR Palsu / Parkir Liar

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-04 |
| **Nama** | Laporkan QR Palsu / Parkir Liar |
| **Aktor Utama** | Masyarakat (A1) |
| **Aktor Pendukung** | Sistem (A4) |
| **Deskripsi** | Pengguna melaporkan QR Code palsu atau praktik parkir liar dengan bukti foto, lokasi GPS, dan deskripsi |
| **Pre-condition** | QR Code teridentifikasi tidak valid (UC-02 hasil tidak valid) atau pengguna menemukan parkir liar |
| **Post-condition** | Laporan tersimpan, nomor tiket diberikan |

**Alur Utama (Main Flow):**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | Memilih jenis laporan (QR Palsu / Parkir Liar) | Menampilkan form laporan |
| 2 | Mengisi deskripsi kejadian | — |
| 3 | Menambahkan bukti foto (opsional) | Membuka galeri/kamera |
| 4 | — | Mengambil lokasi GPS secara otomatis |
| 5 | Menekan "Kirim Laporan" | — |
| 6 | — | Menjalankan UC-06 (Generate Nomor Tiket) |
| 7 | — | Menyimpan laporan dengan status "Menunggu" |
| 8 | — | Menampilkan konfirmasi beserta nomor tiket |

**Alur Alternatif:**

| Kode | Kondisi | Aksi |
|------|---------|------|
| A1 | Deskripsi kosong | Sistem menampilkan pesan error validasi |
| A2 | GPS tidak tersedia | Sistem meminta izin lokasi atau melanjutkan tanpa koordinat |

---

### UC-05: Bayar Digital (QRIS)

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-05 |
| **Nama** | Bayar Digital (QRIS) |
| **Aktor Utama** | Masyarakat (A1) |
| **Deskripsi** | Pengguna melakukan pembayaran tarif parkir resmi secara digital melalui QRIS |
| **Pre-condition** | Petugas terverifikasi resmi (UC-03 selesai), tarif resmi diketahui |
| **Post-condition** | Pembayaran tercatat, bukti pembayaran tersedia |

**Alur Utama (Main Flow):**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | — | Menampilkan detail pembayaran (petugas, area, tarif) |
| 2 | — | Menampilkan QR Code QRIS pemerintah |
| 3 | Menekan "Bayar Sekarang" | — |
| 4 | — | Memproses pembayaran |
| 5 | — | Menampilkan konfirmasi "Pembayaran Berhasil" |
| 6 | — | Menampilkan bukti pembayaran (ID transaksi, detail, waktu) |
| 7 | Menekan "Kembali ke Beranda" | Kembali ke layar scan |

---

### UC-06: Generate Nomor Tiket

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-06 |
| **Nama** | Generate Nomor Tiket |
| **Aktor Utama** | Sistem (A4) |
| **Deskripsi** | Sistem secara otomatis membuat nomor tiket unik untuk setiap laporan yang diajukan |
| **Pre-condition** | Laporan baru diajukan melalui UC-04 |
| **Post-condition** | Nomor tiket unik dihasilkan dengan format LP-YYYYMMDD-XXXX |

**Format:** `LP-[TanggalBulanTahun]-[4 digit acak]`
**Contoh:** `LP-20260404-0837`

---

### UC-07: Kirim Notifikasi

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-07 |
| **Nama** | Kirim Notifikasi |
| **Aktor Utama** | Sistem (A4) |
| **Deskripsi** | Sistem mengirimkan notifikasi tindak lanjut terkait laporan yang diajukan |
| **Pre-condition** | Laporan telah diajukan atau status laporan berubah |
| **Post-condition** | Notifikasi terkirim ke pengguna terkait |

**Trigger Notifikasi:**
- Laporan berhasil diajukan → notifikasi ke pelapor
- Status laporan berubah (Menunggu → Diproses → Selesai) → notifikasi ke pelapor
- Laporan baru masuk → notifikasi ke Admin Dishub

---

### UC-08: Lihat Dashboard Real-time

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-08 |
| **Nama** | Lihat Dashboard Real-time |
| **Aktor Utama** | Admin Dishub (A2) |
| **Deskripsi** | Admin melihat ringkasan statistik operasional parkir secara real-time |
| **Pre-condition** | Pengguna login sebagai Admin Dishub |
| **Post-condition** | Dashboard ditampilkan dengan data terkini |

**Data Dashboard:**

| Metrik | Deskripsi |
|--------|-----------|
| Total Scan | Jumlah seluruh scan QR yang dilakukan |
| QR Valid | Jumlah scan yang terverifikasi resmi |
| QR Palsu | Jumlah scan yang teridentifikasi tidak valid |
| Total Laporan | Jumlah laporan yang masuk |
| Laporan Menunggu | Jumlah laporan yang belum ditangani |
| Total Pendapatan | Akumulasi pembayaran digital |
| Petugas Aktif | Jumlah petugas dengan status aktif |

**Alur Utama:**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | Memilih tab "Admin" | Menampilkan dashboard |
| 2 | — | Menampilkan kartu statistik real-time |
| 3 | — | Menampilkan aktivitas scan terbaru |
| 4 | Memilih menu kelola | Navigasi ke fitur terkait |

---

### UC-09: Lihat dan Cetak Laporan

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-09 |
| **Nama** | Lihat dan Cetak Laporan |
| **Aktor Utama** | Admin Dishub (A2) |
| **Deskripsi** | Admin melihat, memfilter, dan mencetak laporan operasional parkir |
| **Pre-condition** | Pengguna login sebagai Admin Dishub |
| **Post-condition** | Laporan ditampilkan sesuai filter, dapat dicetak |

**Alur Utama:**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | Memilih "Kelola Laporan" | Menampilkan daftar laporan |
| 2 | Memilih filter status (Semua/Menunggu/Diproses/Selesai) | Memfilter daftar laporan |
| 3 | Memilih laporan tertentu | Menampilkan detail laporan (UC terkait: Report Detail) |
| 4 | Mengubah status laporan | Memperbarui status dan menyimpan |

---

### UC-10: Kelola Laporan Masuk

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-10 |
| **Nama** | Kelola Laporan Masuk |
| **Aktor Utama** | Admin Dishub (A2) |
| **Deskripsi** | Admin meninjau, memproses, dan menyelesaikan laporan yang masuk dari masyarakat |
| **Pre-condition** | Terdapat laporan dengan status "Menunggu" atau "Diproses" |
| **Post-condition** | Status laporan diperbarui |

**Alur Utama:**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | Membuka detail laporan | Menampilkan informasi lengkap (tiket, deskripsi, foto, koordinat) |
| 2 | Menekan "Proses" | Mengubah status dari "Menunggu" ke "Diproses" |
| 3 | Menekan "Selesai" | Mengubah status menjadi "Selesai" |
| 4 | — | Menjalankan UC-07 (notifikasi ke pelapor) |

---

### UC-11: Buat Akun Petugas & QR Badge

| Komponen | Deskripsi |
|----------|-----------|
| **ID** | UC-11 |
| **Nama** | Buat Akun Petugas & QR Badge |
| **Aktor Utama** | Admin Dishub (A2) |
| **Aktor Terkait** | Petugas Parkir (A3) |
| **Deskripsi** | Admin mendaftarkan petugas parkir baru dan sistem secara otomatis membuat QR Code resmi untuk badge petugas |
| **Pre-condition** | Pengguna login sebagai Admin Dishub |
| **Post-condition** | Petugas terdaftar, QR Code badge dihasilkan |

**Alur Utama (Main Flow):**

| Langkah | Aktor | Sistem |
|---------|-------|--------|
| 1 | Memilih "Tambah Petugas" | Menampilkan form pendaftaran |
| 2 | Mengisi data petugas (Nama, Nomor Badge, Area Kerja, Lokasi, Tarif) | — |
| 3 | Menekan "Daftarkan Petugas" | — |
| 4 | — | Memvalidasi kelengkapan data |
| 5 | — | Membuat QR Code dengan format: LOHPARKIR-[Nomor Badge] |
| 6 | — | Menyimpan data petugas dengan status "Aktif" |
| 7 | — | Menampilkan konfirmasi beserta QR Code yang dihasilkan |

**Alur Alternatif:**

| Kode | Kondisi | Aksi |
|------|---------|------|
| A1 | Data tidak lengkap | Sistem menampilkan pesan error validasi |
| A2 | Nomor badge sudah terdaftar | Sistem menampilkan pesan duplikasi |

**Data Input:**

| Field | Tipe | Wajib | Contoh |
|-------|------|-------|--------|
| Nama Petugas | Text | Ya | Budi Santoso |
| Nomor Badge | Text | Ya | DSH-2024-004 |
| Area Kerja | Text | Ya | Zona D - Jl. Asia Afrika |
| Lokasi | Text | Ya | Jl. Asia Afrika No. 1-40 |
| Tarif (Rp) | Numeric | Ya | 3000 |

---

## 5. Matriks Aktor vs Use Case

| Use Case | A1 (Masyarakat) | A2 (Admin Dishub) | A3 (Petugas Parkir) | A4 (Sistem) |
|----------|:---:|:---:|:---:|:---:|
| UC-01: Scan QR Code | V | | | |
| UC-02: Validasi QR Code | | | | V |
| UC-03: Lihat Detail Petugas | V | | | |
| UC-04: Laporkan QR Palsu / Parkir Liar | V | | | |
| UC-05: Bayar Digital (QRIS) | V | | | |
| UC-06: Generate Nomor Tiket | | | | V |
| UC-07: Kirim Notifikasi | | | | V |
| UC-08: Lihat Dashboard | | V | | |
| UC-09: Lihat & Cetak Laporan | | V | | |
| UC-10: Kelola Laporan Masuk | | V | | |
| UC-11: Buat Akun Petugas & QR Badge | | V | Penerima | |

---

## 6. Hubungan Antar Use Case

### 6.1 Relasi Include (<<include>>)

| Use Case Utama | Use Case yang Di-include | Keterangan |
|----------------|--------------------------|------------|
| UC-01: Scan QR Code | UC-02: Validasi QR Code | Setiap scan selalu diikuti validasi |
| UC-04: Laporkan | UC-06: Generate Nomor Tiket | Setiap laporan selalu mendapat nomor tiket |

### 6.2 Relasi Extend (<<extend>>)

| Use Case Utama | Use Case Ekstensi | Kondisi |
|----------------|-------------------|---------|
| UC-02: Validasi QR Code | UC-03: Lihat Detail Petugas | Jika QR valid |
| UC-02: Validasi QR Code | UC-04: Laporkan QR Palsu | Jika QR tidak valid |
| UC-03: Lihat Detail Petugas | UC-05: Bayar Digital | Jika pengguna memilih bayar |
| UC-04: Laporkan | UC-07: Kirim Notifikasi | Setelah laporan terkirim |
| UC-10: Kelola Laporan | UC-07: Kirim Notifikasi | Saat status laporan diubah |

---

## 7. Alur Proses Utama (Activity Flow Summary)

### 7.1 Alur Masyarakat — Verifikasi & Pembayaran
```
Buka Aplikasi → Kamera Aktif → Scan QR Badge → Validasi
    ├── Valid   → Lihat Detail Petugas → Bayar Digital → Bukti Pembayaran
    └── Invalid → Laporkan QR Palsu → Isi Form + Foto + GPS → Kirim → Nomor Tiket
```

### 7.2 Alur Admin — Manajemen Operasional
```
Login sebagai Admin → Dashboard Real-time
    ├── Tambah Petugas → Isi Data → Generate QR Badge → Selesai
    ├── Kelola Laporan → Filter Status → Lihat Detail → Ubah Status
    └── Lihat Statistik → Total Scan, QR Valid/Palsu, Pendapatan, Petugas Aktif
```

---

## 8. Kebutuhan Non-Fungsional Terkait

| ID | Kategori | Deskripsi |
|----|----------|-----------|
| NF-01 | Performa | Hasil validasi QR Code harus muncul dalam < 2 detik |
| NF-02 | Ketersediaan | Aplikasi harus dapat berfungsi secara offline untuk scan (dengan database lokal) |
| NF-03 | Keamanan | QR Code menggunakan format unik yang sulit dipalsukan |
| NF-04 | Usability | Antarmuka harus intuitif dan dapat digunakan tanpa pelatihan khusus |
| NF-05 | Kompatibilitas | Mendukung Android dan iOS melalui Expo/React Native |
| NF-06 | Akurasi GPS | Lokasi laporan harus akurat minimal 100 meter (Balanced accuracy) |

---

*Dokumen ini merupakan bagian dari SRS Aplikasi LohParkir. Versi 1.0 — April 2026.*
