# Designer Guide — AI Marketing Coach untuk Perajin Tradisional Bali

> **Working title produk:** [NAMA_PRODUK]
> **Versi:** 0.1 | **Tanggal:** 30 Oktober 2026
> **Ditulis oleh:** [NAMA_PIC] | **Kontak:** [KONTAK] | **Designer:** [NAMA_DESIGNER]
> **Dokumen terkait:** PRD (PRD_AI_Marketing_Coach_Perajin_Bali.md) | **File desain (Figma/lainnya):** [LINK]

Panduan ini menjelaskan **apa yang perlu didesain, untuk siapa, dan bagaimana alurnya**. **Tema visual sepenuhnya ditentukan oleh designer** (nama gaya, warna, tipografi, ilustrasi, logo, motion). Bagian yang sudah ditetapkan tim hanyalah fungsi, alur, konten yang harus tampil, dan batasan teknis/aksesibilitas. Kalau ada yang tidak jelas atau menurutmu sebaiknya diubah demi pengalaman pengguna, **sampaikan**; alur ini bisa disesuaikan selama fungsinya tetap terpenuhi.

---

## 1. Konteks Singkat Produk

**Apa ini:** website + chatbot (di web dan WhatsApp) yang menjadi **pelatih marketing pribadi untuk perajin tradisional Bali**. Perajin mengirim foto dan detail produk; AI membuat poster yang unik, deskripsi Indonesia/Inggris, menjadwalkan dan memposting otomatis ke Instagram, lalu memberi tugas dan pengingat marketing mingguan.

**Masalah yang diselesaikan:** pelatihan digital marketing sudah banyak, tetapi perajin kembali ke cara lama. Produk ini ikut *mengerjakan* dan *menemani* secara rutin, lewat kanal yang sudah akrab (WhatsApp).

**Tujuan desain:** membuat perajin yang tidak terbiasa dengan aplikasi rumit merasa **mampu, ditemani, dan bangga dengan hasilnya**, dan menyelesaikan alur utama hanya dengan beberapa ketukan.

**Siapa yang menilai desain ini:**
1. **Perajin** (pengguna utama).
2. **Juri lomba** (menguji lewat web, kemungkinan di laptop, dan melihat video demo 16:9). Kriteria final mencakup UX/UI & Accessibility.

## 2. Pengguna dan Prinsip Desain

### 2.1 Pengguna utama
Perajin/UMKM mikro (tenun/endek, ukiran, perak, kuliner khas, jamu, dll.). Gambaran persona acuan: *Bu [Nama], 45 tahun, perajin tenun di [Kabupaten], HP Android kelas menengah ke bawah, aktif di WhatsApp, Instagram personal jarang dipakai, bahasa Inggris terbatas.*

**Kondisi nyata yang harus dipikirkan:**
- Layar kecil (±360 px lebar), kadang retak atau di bawah cahaya terik.
- Koneksi lambat atau putus-putus.
- Tangan sering kotor atau sibuk bekerja: **target sentuh harus besar**, voice note membantu.
- Mengetik panjang itu berat.
- Banyak yang takut salah pencet atau takut "merusak" sesuatu.
- Sebagian tidak punya Instagram atau website.

### 2.2 Prinsip desain yang diminta
1. **Sedikit langkah, satu tujuan per layar.** Jangan menumpuk banyak keputusan dalam satu layar.
2. **Bahasa sederhana.** Hindari jargon (caption, reach, engagement, brand kit). Kalau istilah harus ada, jelaskan singkat.
3. **Jangan pernah membuat pengguna merasa bodoh.** Pesan error dan petunjuk bernada hangat dan memberi jalan keluar.
4. **Selalu jelas statusnya:** apa yang sedang terjadi, apa yang sudah selesai, apa langkah berikutnya.
5. **Pengguna selalu memegang kendali.** Tidak ada posting tanpa persetujuan; semua hasil AI bisa diubah.
6. **Mobile-first.** Rancang ponsel dulu, lalu tablet dan desktop.
7. **Ikon selalu disertai teks**; warna tidak boleh menjadi satu-satunya penanda status.
8. **Hasil AI harus tampil sebagai pahlawan.** Poster adalah momen "wow" produk ini, jadi beri ruang dan hormati proporsinya.
9. **Transparan soal AI.** Beri penanda jelas pada konten buatan AI dan pada informasi yang "tebakan AI" (lihat §9).
10. **Menghormati budaya.** Pakai bahasa visual yang terasa Bali dan menghargai kerajinan, tanpa klise berlebihan.

### 2.3 Kepribadian brand (usulan, boleh diubah designer)
Hangat, membantu, tepercaya, sederhana, menghargai kerajinan tangan. Terasa seperti **teman yang paham marketing**, bukan perangkat lunak korporat.

## 3. Yang Ditentukan Designer vs yang Sudah Ditetapkan

### 3.1 Bebas ditentukan designer (tema)
Nama gaya visual, logo dan wordmark, palet warna, tipografi, gaya ikon, gaya ilustrasi/ornamen, bentuk komponen (sudut, bayangan), gaya foto, motion/animasi, mood keseluruhan, dan cara menerjemahkan unsur budaya Bali.

**Saran proses:** ajukan 2-3 arah gaya (moodboard singkat) sebelum masuk hi-fi supaya tim bisa memilih.

### 3.2 Batasan yang harus dipenuhi
- **Kontras teks** minimal setara WCAG AA (teks biasa 4.5:1, teks besar 3:1).
- **Ukuran teks isi** minimal 16 px; desain harus tetap rapi saat pengguna membesarkan teks sistem.
- **Target sentuh** minimal ±44-48 px, dengan jarak antar target yang cukup.
- **Responsif:** ponsel (360-414 px) sebagai acuan utama, tablet, dan desktop (1280 px ke atas) untuk juri.
- **Bahasa utama Indonesia**, dengan pilihan Inggris. Rancang untuk teks yang panjangnya berbeda-beda (Indonesia biasanya lebih panjang dari Inggris).
- **Isi dari AI tidak bisa diprediksi:** poster bisa berbeda rasio (feed 4:5, story 9:16), caption bisa panjang (batas Instagram ±2.200 karakter, verifikasi), nama produk bisa sangat panjang. Komponen harus tahan terhadap itu.
- **Lisensi aset:** semua font, ikon, ilustrasi, foto stok, dan aset lain harus berlisensi yang boleh dipakai dan **dicatat** (lomba mewajibkan credits pihak ketiga). Jika memakai alat AI untuk membuat aset desain, beri tahu tim supaya dicantumkan di disclosure.
- **Konten sakral:** hindari memakai simbol, sesajen, atau elemen keagamaan secara dekoratif tanpa konsultasi (misalnya dengan perajin pilot atau orang yang paham konteksnya).

## 4. Deliverable yang Diminta

| # | Deliverable | Isi |
|---|---|---|
| 1 | **Arah gaya** | 2-3 moodboard/style direction, pilih satu bersama tim |
| 2 | **Wireframe alur P0** | Semua layar P0 (lihat §7) dalam low-fi, mengikuti alur §5 |
| 3 | **Style guide + design tokens** | Warna, tipografi, spasi, radius, bayangan, ikon, grid (rincian §10) |
| 4 | **Library komponen** | Semua komponen §8 dengan semua state |
| 5 | **Layar hi-fi P0** | Mobile dan desktop, termasuk state kosong/loading/error/sukses |
| 6 | **Desain percakapan WhatsApp** | Isi pesan, tombol, dan template (lihat §7.R) |
| 7 | **Prototype klik** | Menjalankan alur utama §5.1-5.4 |
| 8 | **Aset** | Logo, favicon, ikon, ilustrasi/empty state, gambar landing, contoh data untuk mockup |
| 9 | **Handoff untuk developer** | File tertata, anotasi, ekspor aset (lihat §14) |
| 10 | **Layar hi-fi P1** | Setelah P0 selesai |

**Urutan kerja yang disarankan:** (1) alur dan wireframe, (2) arah gaya, (3) tokens + komponen dasar (**kirim lebih awal ke developer agar bisa mulai membangun**), (4) hi-fi P0 berurutan: onboarding → chat + hasil poster → jadwal + posting → dashboard, (5) prototype dan handoff, (6) P1.

## 5. Alur Pengguna (User Flows)

### 5.1 Daftar dan onboarding
1. Landing → **Daftar** (nama, nama usaha, jenis produk, nomor WhatsApp).
2. **Tautkan WhatsApp:** layar menampilkan kode unik + tombol "Buka WhatsApp" (dan QR untuk desktop). Pengguna mengirim kode ke nomor bot. Layar menunggu dan otomatis berpindah saat tertaut.
3. **Persetujuan penggunaan AI:** jelaskan sederhana data apa yang dikirim ke AI, untuk apa, dan bahwa bisa dihapus. Wajib disetujui untuk lanjut.
4. **Sumber usaha (opsional, bisa dilewati):** pilihan kartu: *Instagram*, *Website*, *Foto katalog/brosur*, *Ceritakan lewat chat*, *Lewati*.
   - **Instagram:** langkah login resmi. Jika akun masih personal, tampilkan **panduan bergambar** mengubah ke akun Business/Creator (gratis), lalu coba lagi.
   - **Website (P1):** tempel URL.
   - **Foto katalog:** unggah beberapa foto.
   - **Chat terpandu:** 5-7 pertanyaan seperti ngobrol (ini jalur dasar untuk yang tanpa medsos).
5. **Review profil dan gaya visual (draft):** AI menampilkan apa yang ia pahami (nama usaha, produk, gaya bahasa, palet/mood). Setiap isian berlabel sumbernya. Pengguna **mengonfirmasi atau mengoreksi**.
6. Selesai → ajakan "**Buat poster pertamamu**" (menuju alur 5.2).

### 5.2 Membuat konten baru (alur inti)
1. Pengguna memilih **produk baru** atau produk yang ada.
2. Mengirim **foto (1-5)** dan **detail** (teks atau voice note): nama, bahan, proses, harga, cerita.
3. Jika ada data penting yang kurang, AI bertanya (maks. 2 pertanyaan sekaligus).
4. Layar **sedang dibuat** (±1-2 menit): progres yang jujur, boleh ditinggal; pengguna diberi tahu saat selesai.
5. Tampil **2-3 opsi poster** + caption Indonesia dan Inggris + usulan jadwal.
6. Pengguna **memilih satu opsi**.

### 5.3 Revisi dan persetujuan
1. Dari opsi terpilih: **minta revisi** (kolom bahasa biasa, plus pilihan cepat seperti "lebih hangat", "tulisan lebih besar", "lebih sederhana") atau **edit caption** langsung.
2. AI membuat versi baru; riwayat versi tersimpan dan bisa dibuka.
3. Pengguna menekan **Setujui dan jadwalkan** setelah melihat pratinjau akhir.
4. Ada batas jumlah revisi; saat hampir habis, tampilkan pesan yang ramah, bukan blokir keras.

### 5.4 Penjadwalan dan auto-post Instagram
1. Setelah disetujui, tampil **jadwal usulan** yang bisa diubah.
2. Status posting: **Draf → Disetujui → Terjadwal → Terbit** (atau **Gagal**).
3. Saat terbit, kirim pemberitahuan (di chat/WA) dan tampilkan di dashboard.
4. **Jika gagal:** jelaskan penyebab dengan bahasa sederhana, tawarkan "Coba lagi" dan "Unduh paket posting" (gambar + caption + hashtag) untuk diunggah manual.
5. **Tanpa Instagram:** tampilkan **paket siap-upload** sebagai hasil akhir yang setara, bukan jalur "kelas dua".

### 5.5 Tugas mingguan
1. Tiap minggu pengguna menerima daftar **tugas kecil** lewat WhatsApp dan di dashboard (misal: "promosikan produk yang belum pernah diposting", "buat cerita di balik produk").
2. Pengguna membalas/menekan **Selesai / Nanti / Lewati**.
3. Tugas tertentu langsung membuka alur 5.2 dengan konteks yang sudah terisi.
4. Pengingat jarang (1-2 per minggu), tidak boleh terasa seperti spam.

### 5.6 Menyambung ulang Instagram
Token Instagram berumur terbatas. Saat perlu otorisasi ulang: tampilkan **peringatan jelas** di dashboard dan chat, dengan satu tombol untuk menyambung ulang dan penjelasan bahwa jadwal tetap aman.

### 5.7 Mengelola data
Pengguna dapat melihat, mengubah, dan **menghapus** profil, memori, dan sumber yang pernah dimasukkan, serta mencabut persetujuan.

### 5.8 Laporan dan rekomendasi (P1)
Ringkasan mingguan: tugas selesai, posting terbit, produk yang belum pernah dipromosikan, dan saran langkah berikutnya dalam kartu rekomendasi.

## 6. Peta Situs (Sitemap)

```
Publik
 ├─ Landing
 ├─ Masuk
 └─ Daftar
      └─ Onboarding (wizard)
           1 Info usaha → 2 Tautkan WA → 3 Persetujuan AI → 4 Sumber usaha → 5 Review profil & gaya

Aplikasi (setelah masuk)
 ├─ Beranda (dashboard)
 ├─ Chat  ←→ sama dengan WhatsApp
 ├─ Buat Konten
 │    └─ Hasil & Revisi (opsi poster, caption, jadwal)
 ├─ Jadwal (kalender + daftar status)
 ├─ Galeri Konten
 ├─ Tugas Mingguan
 ├─ Produk (katalog)
 ├─ Profil Usaha & Gaya Visual
 ├─ Laporan & Rekomendasi (P1)
 └─ Pengaturan (akun, WhatsApp, Instagram, privasi/hapus data, bahasa)

Sistem
 └─ 404 / Error / Sesi habis / Kuota habis / Pemeliharaan / Pusat notifikasi
```

**Navigasi:** ponsel memakai navigasi bawah (4-5 item utama + akses ke lainnya); desktop memakai sidebar. Usulan item utama ponsel: *Beranda, Chat, Buat, Jadwal, Lainnya*. Designer boleh mengusulkan pola lain.

## 7. Daftar Layar yang Harus Didesain

Prioritas: **P0** wajib (Tahap 1), **P1** jika waktu cukup. Setiap layar perlu versi **mobile dan desktop**, dengan state yang disebut di §9.

### 7.0 Tabel Ringkas Semua Halaman (Daftar Kerja Designer)

Gunakan tabel ini sebagai **daftar kerja dan pelacak progres**. Rincian tiap layar ada di bagian A sampai S setelah tabel. Kolom "Status desain" diisi designer: `[ ]` belum, `[~]` sedang, `[x]` selesai.

**Ringkasan jumlah:** ±25 layar P0, 4 layar P1, ditambah 2 deliverable non-layar (R dan S). Setiap layar dibuat dalam versi mobile dan desktop.

#### Tabel A: Layar Publik dan Onboarding

| Kode | Halaman | Tujuan | Isi utama | Prioritas | Alur | State wajib | Status desain |
|---|---|---|---|---|---|---|---|
| A | Landing | Juri dan calon pengguna langsung paham nilai produk | Hero + tombol Daftar, cara kerja 3-4 langkah, contoh hasil (beberapa poster berbeda untuk satu produk), manfaat, FAQ singkat, pilihan ID/EN | P0 | 5.1 | Loading gambar, rapi di desktop | [ ] |
| B | Masuk dan Daftar | Membuat akun / masuk | Form singkat, validasi ramah, tombol besar | P0 | 5.1 | Error validasi, gagal masuk | [ ] |
| C1 | Onboarding 1: Info usaha | Mengenali usaha | Nama usaha, jenis produk, lokasi, indikator langkah | P0 | 5.1 | Validasi, simpan draf | [ ] |
| C2 | Onboarding 2: Tautkan WhatsApp | Menghubungkan nomor WA ke akun | Kode unik, tombol Buka WhatsApp, QR (desktop), status menunggu | P0 | 5.1 | Menunggu, berhasil, gagal, kirim ulang kode | [ ] |
| C3 | Onboarding 3: Persetujuan AI | Persetujuan pemrosesan data oleh AI | Penjelasan sederhana (data apa, untuk apa), kotak persetujuan, tautan detail | P0 | 5.1 | Belum disetujui (tombol lanjut nonaktif) | [ ] |
| C4 | Onboarding 4: Pilih sumber usaha | Memilih cara AI mengenal usaha (opsional) | Kartu: Instagram, Website, Foto katalog, Ceritakan lewat chat, Lewati | P0 | 5.1 | Sudah terhubung / belum | [ ] |
| C4a | Hubungkan Instagram | Membaca konten lama dan memungkinkan posting | Manfaat singkat, tombol sambungkan, **panduan bergambar ubah ke akun Business/Creator** | P0 | 5.1, 5.6 | Berhasil, gagal, akun personal ditolak, izin ditolak | [ ] |
| C4b | Import website | Mengambil info dari website milik pengguna | Kolom URL, status membaca, ringkasan temuan | P1 | 5.1 | Membaca, gagal, URL tidak valid | [ ] |
| C4c | Unggah foto katalog | Memberi sumber dari brosur/katalog/nota | Unggah banyak foto, progres per foto, hapus/ganti | P0 | 5.1 | Unggah gagal, format salah, kosong | [ ] |
| C4d | Chat terpandu | Jalur dasar bagi yang tanpa medsos | 5-7 pertanyaan seperti ngobrol, jawab teks (voice P1), bisa lanjut nanti | P0 | 5.1 | Jeda dan lanjut, jawaban kosong | [ ] |
| C5 | Review profil dan gaya (draf) | Pengguna mengonfirmasi apa yang AI pahami | Kartu isian dengan **label sumber**, tombol Benar/Ubah, pratinjau palet dan mood | P0 | 5.1 | Tanpa sumber (kosong), isian "Tebakan AI" | [ ] |
| C6 | Onboarding selesai | Mengarahkan ke poster pertama | Ringkasan singkat, tombol Buat poster pertama | P0 | 5.1 | Sukses | [ ] |

#### Tabel B: Layar Utama Aplikasi

| Kode | Halaman | Tujuan | Isi utama | Prioritas | Alur | State wajib | Status desain |
|---|---|---|---|---|---|---|---|
| D | Beranda (Dashboard) | Pusat ringkasan dan aksi utama | Sapaan, tombol besar Buat konten baru, tugas minggu ini, jadwal terdekat, posting terbit, status koneksi IG/WA, aktivitas terbaru | P0 | 5.5, 5.6 | Pengguna baru (kosong yang memandu), peringatan sambung ulang | [ ] |
| E | Chat Web | Percakapan dengan AI (cermin WhatsApp); **paling krusial untuk juri** | Gelembung teks/foto, kartu opsi poster (carousel), tombol cepat, pesan status, kartu tugas, input teks + foto (+ rekam suara P1) | P0 | 5.2, 5.3 | Memproses, error, pesan di luar konteks, lanjut setelah ditinggal | [ ] |
| F | Buat Konten | Alur terpandu membuat konten (boleh digabung dengan Chat) | Pilih/buat produk, unggah foto 1-5, isi detail, pertanyaan data kurang, proses | P0 | 5.2 | Validasi foto, loading AI 1-2 menit, gagal | [ ] |
| G | Hasil dan Revisi | **Layar terpenting**: memilih, merevisi, menyetujui | 2-3 opsi poster, pratinjau gaya Instagram (feed/story), caption tab ID/EN, hashtag, usulan jadwal, kolom revisi + chip cepat, riwayat versi, tombol Setujui dan jadwalkan, penanda "dibuat AI" | P0 | 5.2, 5.3, 5.4 | Batas revisi hampir habis, gagal buat, sukses terjadwal | [ ] |
| H | Jadwal | Memantau dan mengatur posting | Kalender + daftar, lencana status (Draf, Disetujui, Terjadwal, Terbit, Gagal), detail posting, ubah/batalkan/coba lagi/unduh paket | P0 | 5.4, 5.6 | IG belum terhubung, token kedaluwarsa, posting gagal | [ ] |
| I | Galeri Konten | Melihat semua hasil | Grid poster, filter produk/status, detail dengan semua versi dan status posting | P0 | 5.3 | Kosong, banyak item | [ ] |
| J | Tugas Mingguan | Menjaga kebiasaan marketing | Daftar tugas, progres mingguan, kartu tugas (Mulai/Selesai/Nanti/Lewati), riwayat minggu lalu | P0 | 5.5 | Tugas kosong, semua selesai | [ ] |
| K | Produk (Katalog) | Mengelola produk | Daftar produk (foto, nama, status promosi), detail dan edit, tambah produk | P0 | 5.2 | Kosong, validasi | [ ] |
| L | Profil Usaha dan Gaya Visual | Melihat dan mengubah yang AI ketahui | Profil dengan **label sumber**, gaya visual (palet, mood, logo, referensi), sumber terhubung, tampilan memori yang bisa dihapus | P0 | 5.7 | Konfirmasi hapus, sinkron ulang | [ ] |
| M | Pengaturan | Akun dan kendali data | Akun, nomor WA, Instagram (status/sambung ulang/putus), bahasa, privasi dan persetujuan, hapus semua data | P0 | 5.6, 5.7 | Konfirmasi tindakan tidak bisa dibatalkan | [ ] |

#### Tabel C: Halaman Sistem, Tambahan (P1), dan Deliverable Non-Layar

| Kode | Halaman / Deliverable | Tujuan | Isi utama | Prioritas | State wajib | Status desain |
|---|---|---|---|---|---|---|
| SYS1 | 404, error umum, pemeliharaan | Tersesat atau sistem bermasalah | Penjelasan hangat + tombol kembali | P0 | Tiap jenis | [ ] |
| SYS2 | Sesi habis dan offline | Koneksi/sesi putus | Pesan jelas, draf tidak hilang, tombol coba lagi | P0 | Offline, sesi habis | [ ] |
| SYS3 | Kuota harian habis | Menjelaskan batas pemakaian | Pesan ramah, kapan bisa lagi, apa yang masih bisa dilakukan | P0 | Hampir habis, habis | [ ] |
| SYS4 | Pusat notifikasi | Melihat pemberitahuan | Daftar sederhana + lencana (posting terbit/gagal, tugas) | P0 | Kosong, banyak | [ ] |
| N | Laporan dan Rekomendasi | Ringkasan minggu dan saran | Tugas selesai, posting terbit, produk belum dipromosikan, kartu rekomendasi; ruang untuk metrik masa depan | P1 | Data sedikit, kosong | [ ] |
| O | Kalender Momen Bali | Memicu kampanye musiman | Momen mendatang (hari raya, libur, musim turis) + ajakan membuat kampanye | P1 | Tidak ada momen | [ ] |
| Q | Mode Juri/Demo | Memandu juri | Penanda akun demo, data contoh realistis, tur singkat 3-4 petunjuk (bisa dilewati) | P1 | Tur aktif/dilewati | [ ] |
| R | Desain percakapan WhatsApp (**bukan layar**) | Menentukan isi, nada, dan template pesan | Skrip per skenario, daftar template (pengingat, tugas mingguan, status), contoh mock chat | P0 | Pesan gagal, penolakan ramah | [ ] |
| S | Panduan output poster (**bukan layar**) | Kerangka agar poster AI bagus | Safe area feed 4:5 dan story 9:16, skema bidang gaya visual dan cara menampilkannya ke perajin, contoh poster referensi | P0 | - | [ ] |

#### Tabel D: Alur Pengguna ke Layar yang Terlibat

| Alur | Nama | Layar yang dilewati |
|---|---|---|
| 5.1 | Daftar dan onboarding | A → B → C1 → C2 → C3 → C4 (C4a-d) → C5 → C6 |
| 5.2 | Membuat konten baru | D / J → F atau E → G |
| 5.3 | Revisi dan persetujuan | G (berulang) → H |
| 5.4 | Penjadwalan dan auto-post Instagram | G → H → notifikasi (SYS4) / E; jika gagal: H (coba lagi / unduh paket) |
| 5.5 | Tugas mingguan | WhatsApp/E → J → F atau E |
| 5.6 | Menyambung ulang Instagram | D / H (peringatan) → M atau C4a |
| 5.7 | Mengelola data | L / M |
| 5.8 | Laporan dan rekomendasi (P1) | D → N |

---

### A. Landing (publik) — P0
- **Tujuan:** juri dan calon pengguna langsung paham nilai produk.
- **Isi:** hero (janji utama + tombol Daftar), cara kerja 3-4 langkah, **contoh hasil nyata** (foto produk → poster; tampilkan beberapa poster berbeda untuk produk yang sama agar kesan "selalu unik" terlihat), manfaat utama, untuk siapa, jawaban pertanyaan umum singkat, tombol Daftar/Masuk, pilihan bahasa ID/EN, tautan kebijakan privasi.
- **Catatan:** layar ini yang pertama dilihat juri; perlu rapi di desktop.

### B. Masuk dan Daftar — P0
- Form singkat, validasi ramah, pesan error jelas, tombol besar. Pilihan masuk (email/nomor) disesuaikan keputusan teknis tim: [ISI].

### C. Onboarding (wizard) — P0
Sesuai alur §5.1. Indikator langkah ("Langkah 2 dari 5"), tombol Kembali, kemampuan melanjutkan nanti.
- **C1 Info usaha:** nama usaha, jenis produk, lokasi.
- **C2 Tautkan WhatsApp:** kode unik, tombol buka WA, QR untuk desktop, status menunggu/berhasil/gagal, tombol kirim ulang kode.
- **C3 Persetujuan AI:** penjelasan ringkas, kotak persetujuan, tautan detail.
- **C4 Sumber usaha:** kartu pilihan + sub-layar tiap sumber.
  - **C4a Instagram:** penjelasan manfaat, tombol sambungkan, **panduan bergambar konversi ke akun Business/Creator**, status berhasil/gagal.
  - **C4b Website (P1):** kolom URL, status membaca, ringkasan temuan.
  - **C4c Foto katalog:** unggah banyak foto, progres per foto, hapus/ganti.
  - **C4d Chat terpandu:** tampilan percakapan 5-7 pertanyaan, dengan opsi jawab teks atau voice note (P1).
- **C5 Review profil & gaya (draft):** kartu per isian (nama, produk, gaya bahasa, palet/mood, contoh gaya), **label sumber** di setiap isian, tombol Benar/Ubah, pratinjau palet.
- **C6 Selesai:** ajakan membuat poster pertama.

### D. Beranda (Dashboard) — P0
- Sapaan singkat dan satu **aksi utama besar** ("Buat konten baru").
- Ringkasan minggu ini: tugas (berapa dari berapa), jadwal terdekat, posting terbit.
- Kartu status koneksi (Instagram/WhatsApp) dengan peringatan bila perlu sambung ulang.
- Aktivitas terbaru dan (P1) kartu rekomendasi/momen mendatang.
- **Pertimbangan:** untuk pengguna baru tampilkan *empty state yang memandu*, bukan dasbor kosong.

### E. Chat (Web) — P0 (paling krusial untuk juri)
Cerminan percakapan WhatsApp, memakai agent yang sama.
- **Tipe pesan:** teks, foto yang diunggah, voice note (P1), pesan status "sedang dibuat", **kartu opsi poster** (2-3 gambar yang bisa digeser), tombol cepat (Setujui, Revisi, Ubah jadwal), kartu tugas, pesan error, pesan sistem (misal posting terbit).
- **Input:** kolom teks, tombol lampirkan foto/kamera, tombol rekam suara (P1), saran balasan cepat.
- **Perilaku:** riwayat percakapan, indikator mengetik/memproses, kemampuan melanjutkan setelah ditinggal.
- **Batasan:** bot dibatasi pada fungsi marketing; di luar itu menjawab singkat dan mengarahkan balik. Desain pesan penolakan yang ramah.

### F. Buat Konten (alur terpandu, alternatif dari chat) — P0
Langkah: pilih/buat produk → unggah foto → isi detail (atau rekam suara) → konfirmasi data kurang → proses → hasil. Mengikuti §5.2; boleh digabung dengan Chat jika designer menilai lebih sederhana, selama kedua jalur tersedia.

### G. Hasil dan Revisi — P0 (layar paling penting)
- Tampilan **2-3 opsi poster** berdampingan (desktop) atau digeser (mobile), dengan pembesaran.
- Pilih satu → detail: poster besar, **pratinjau bergaya Instagram** (feed dan story), caption dengan **tab Indonesia/Inggris**, hashtag (dapat dihapus/ditambah), usulan jadwal.
- **Revisi:** kolom instruksi + chip cepat; riwayat versi dapat dibuka.
- Aksi utama: **Setujui dan jadwalkan**. Aksi sekunder: Revisi, Edit caption, Buang.
- Penanda **"dibuat dengan AI"** terlihat jelas tetapi tidak mengganggu.
- Nyatakan batas revisi secara halus.

### H. Jadwal — P0
- Tampilan **kalender** dan **daftar**, dengan **lencana status** (Draf, Disetujui, Terjadwal, Terbit, Gagal).
- Detail posting: pratinjau, caption, waktu; aksi ubah jadwal, batalkan, coba lagi, unduh paket.
- Filter menurut status/produk.
- **Kondisi khusus:** Instagram belum terhubung (arahkan ke paket siap-upload), token kedaluwarsa (peringatan).

### I. Galeri Konten — P0
- Grid poster dengan filter produk dan status, detail poster dengan semua versi, caption, dan status posting.

### J. Tugas Mingguan — P0
- Daftar tugas minggu ini dengan progres, kartu tugas (judul jelas, alasan singkat, tombol Mulai / Selesai / Nanti / Lewati).
- Riwayat minggu lalu (ringkas).
- Tombol Mulai membuka alur pembuatan konten dengan konteks sudah terisi.

### K. Produk (Katalog) — P0
- Daftar produk (foto, nama, status promosi: belum/sudah pernah diposting), detail dan edit (nama, deskripsi, harga, foto), tambah produk.

### L. Profil Usaha dan Gaya Visual — P0
- Profil (nama, lokasi, cerita, bahasa, gaya bahasa) dengan **label sumber** per isian dan status konfirmasi.
- **Gaya visual:** palet, mood, logo, contoh referensi (cara menampilkan dan mengubahnya perlu rancangan yang mudah dipahami non-desainer).
- Sumber yang terhubung (Instagram, website, katalog) dengan status dan opsi sinkron ulang/putus.
- "Yang AI ketahui tentang usaha ini": tampilan memori yang bisa dilihat dan dihapus.

### M. Pengaturan — P0
- Akun, nomor WhatsApp (ganti/tautkan ulang), **Instagram** (status, sambung ulang, putus), bahasa, **privasi dan persetujuan** (cabut, hapus semua data) dengan konfirmasi untuk tindakan yang tidak bisa dibatalkan.

### N. Laporan dan Rekomendasi — P1
- Ringkasan mingguan (tugas selesai, posting terbit, konsistensi), kartu rekomendasi dengan alasan singkat dan tombol aksi.
- Sediakan ruang untuk metrik performa di masa depan (jangan mengisi grafik palsu).
- Catatan: rekomendasi berupa **indikasi**, bukan kepastian; rancang bahasa penyajiannya.

### O. Kalender Momen Bali — P1
- Widget/bagian di Beranda atau Jadwal yang menampilkan momen mendatang (hari raya, libur nasional, musim turis) dan ajakan membuat kampanye.

### P. Halaman Sistem (SYS1-SYS4 di tabel) — P0
- 404, error umum, sesi habis, **kuota harian habis** (ramah, jelaskan kapan bisa lagi), pemeliharaan, tidak ada koneksi, **pusat notifikasi** (atau cukup lencana dan daftar sederhana).

### Q. Mode Juri/Demo — P1
- Penanda "akun demo", data contoh yang realistis, dan **tur singkat** (3-4 petunjuk) yang menunjukkan alur utama. Dirancang agar bisa dilewati.

### R. Desain Percakapan WhatsApp — P0
Perajin akan banyak berinteraksi di sini, jadi desain isinya sama pentingnya dengan layar web. Designer (bersama penulis konten) merancang **isi, nada, dan struktur pesan**, bukan tampilan aplikasi WhatsApp-nya.
- **Pesan yang perlu dirancang:** sambutan dan penautan akun, permintaan foto/detail, pertanyaan data kurang, status "sedang dibuat", pengiriman 2-3 opsi poster (gambar + ringkasan), konfirmasi persetujuan dan jadwal, pemberitahuan terbit, pemberitahuan gagal + jalan keluar, **tugas mingguan**, **pengingat**, ajakan sambung ulang Instagram, pesan di luar konteks (penolakan ramah).
- **Batasan:** pesan di luar jendela 24 jam hanya bisa memakai **template yang disetujui Meta**, jadi pengingat harus ringkas dan baku. Tombol balasan cepat jumlahnya terbatas (verifikasi batas terbaru). Gambar poster dikirim sebagai foto.
- **Hasil:** skrip percakapan per skenario + daftar template + contoh tampilan (mock chat).

### S. Panduan Output Poster — P0
Poster dihasilkan AI, bukan didesain manual, tetapi designer menentukan **kerangka yang membuat hasilnya bagus**:
- Format dan **safe area** untuk feed 4:5 dan story 9:16 (zona yang tertutup elemen UI Instagram).
- **Skema "gaya visual"** yang dikumpulkan saat onboarding: bidang apa saja yang membantu AI menghasilkan poster berkarakter (palet, mood, kepadatan teks, gaya tipografi dalam deskripsi, contoh referensi), dan **bagaimana menampilkan bidang itu ke perajin dengan bahasa awam**.
- Contoh poster referensi (tanpa menyalin karya orang lain) untuk membantu tim menilai kualitas hasil AI.

## 8. Komponen UI yang Dibutuhkan

Rancang dengan semua state (default, hover/fokus, aktif, nonaktif, loading, error).

| Kelompok | Komponen |
|---|---|
| Navigasi | Navigasi bawah (ponsel), sidebar (desktop), header halaman, tombol kembali, stepper onboarding, pemilih bahasa ID/EN |
| Aksi | Tombol utama/sekunder/teks/bahaya, tombol ikon, tombol melayang (aksi utama) |
| Input | Kolom teks, area teks, pemilih file/kamera (dropzone di desktop), perekam suara (P1), pemilih tanggal-waktu, pemilih warna/palet, chip pilihan, toggle, kotak centang, kolom kode (WA) |
| Chat | Gelembung (pengguna/bot), gelembung berisi gambar, kartu opsi poster (carousel), chip balasan cepat, indikator memproses, pesan sistem |
| Konten | Kartu poster, pratinjau gaya Instagram (feed/story), tab bahasa Indonesia/Inggris, chip hashtag, pemilih versi |
| Status | **Lencana status posting** (Draf, Disetujui, Terjadwal, Terbit, Gagal), **label sumber data** (Diisi kamu, Instagram, Website, Katalog, Tebakan AI), penanda "dibuat AI", indikator keyakinan |
| Tugas | Kartu tugas, bilah progres mingguan |
| Jadwal | Kalender, item jadwal, tampilan daftar |
| Umpan balik | Toast, banner, dialog konfirmasi, lembar bawah (bottom sheet), skeleton/loading, bilah progres, empty state, error state |
| Koneksi | Kartu status koneksi (Instagram/WhatsApp), panduan bergambar bertahap |
| Lain | Avatar/logo usaha, tooltip/bantuan singkat, tur (P1) |

## 9. State dan Kondisi yang Wajib Didesain

1. **Loading pembuatan AI (1-2 menit):** progres yang jujur dan tidak menipu, boleh ditinggal, pengguna diberi tahu saat selesai. Jangan menampilkan spinner tanpa penjelasan.
2. **Kosong:** belum ada produk, belum ada jadwal, belum ada tugas, galeri kosong; semua memandu ke langkah berikutnya.
3. **Error:** AI gagal membuat poster, unggah gagal, Instagram gagal terbit, token kedaluwarsa, jaringan lemah/terputus, kuota habis. Bahasa hangat + **jalan keluar yang jelas**.
4. **Sukses:** poster siap, jadwal tersimpan, posting terbit; rayakan secukupnya.
5. **Validasi form:** pesan spesifik dan dekat dengan isian.
6. **Konfirmasi tindakan berisiko:** hapus data, batalkan jadwal, putus akun.
7. **Izin ditolak/dicabut:** misal Instagram tidak diizinkan; tawarkan jalur paket siap-upload.
8. **Penanda transparansi AI:** pada poster/caption buatan AI, dan pada isian profil yang bersumber "Tebakan AI" (perlu konfirmasi). Rancang agar jelas tetapi tidak menakutkan.
9. **Persetujuan eksplisit sebelum posting:** tombol dan pratinjau akhir yang tidak mungkin terlewat.
10. **Offline/jaringan lambat:** pesan jelas dan data draf tidak hilang.

## 10. Design Tokens yang Dibutuhkan Developer

Bentuk token (nama dan nilai ditentukan designer; gunakan variabel di alat desain agar mudah diekspor):

- **Warna (peran, bukan nama warna):** primary, secondary, accent; background, surface, surface-alt; text, text-muted, text-on-primary; border; success, warning, error, info; **warna status posting** (Draf, Disetujui, Terjadwal, Terbit, Gagal); **warna label sumber** (5 jenis). Sertakan versi untuk mode gelap **hanya jika** dirancang; kalau tidak, nyatakan eksplisit "mode terang saja".
- **Tipografi:** keluarga font (dengan cadangan), skala (display, H1-H3, body besar/normal, kecil, tombol, caption), berat, tinggi baris. Pilih font gratis/berlisensi yang mendukung karakter bahasa Indonesia dengan baik.
- **Spasi:** skala (misal kelipatan 4/8 px), padding layar, jarak antar komponen.
- **Radius, bayangan, ketebalan garis.**
- **Grid dan breakpoint:** ponsel, tablet, desktop; lebar konten maksimum.
- **Ikon:** satu keluarga ikon yang konsisten, ukuran standar.
- **Motion:** durasi dan kurva standar, dan aturan mengurangi gerakan (hormati preferensi "reduce motion").

## 11. Konten dan Microcopy

### 11.1 Nada suara
Hangat, singkat, sopan, tidak menggurui, tidak teknis. Menyapa seperti teman yang membantu. Sapaan ke pengguna (misal Bapak/Ibu/Kak) sebaiknya mengikuti pilihan pengguna: **sediakan pengaturan sapaan** atau pilih netral.

### 11.2 Istilah
Hindari atau jelaskan: *caption* (→ "tulisan pendamping foto"), *reach/engagement*, *brand kit* (→ "gaya tampilan usahamu"), *scheduler*, *OAuth*, *token*. Daftar istilah akhir ditetapkan bersama tim.

### 11.3 Contoh momen penting yang perlu ditulis
- Sambutan setelah daftar.
- Penjelasan persetujuan penggunaan AI (sederhana dan jujur).
- Menunggu poster dibuat.
- Poster siap (2-3 opsi).
- Meminta revisi dan batas revisi hampir habis.
- Posting terbit dan posting gagal.
- Pengingat tugas mingguan.
- Instagram perlu disambung ulang.
- Penolakan ramah untuk permintaan di luar marketing.
- Kuota harian habis.
- Menghapus data.

### 11.4 Dua bahasa
Semua teks utama tersedia dalam Indonesia dan Inggris. Rancang agar teks bisa memanjang tanpa merusak tata letak. Penerjemahan konten buatan AI (caption Inggris) tampil sebagai tab terpisah, bukan menggantikan.

## 12. Aksesibilitas dan Kondisi Penggunaan

- Kontras WCAG AA, ukuran teks yang dapat diperbesar, target sentuh besar.
- Status tidak hanya dengan warna (selalu ikon + teks).
- Pesan error dikaitkan jelas dengan isian yang bermasalah.
- Alternatif teks untuk gambar penting (misal ringkasan poster yang dibuat AI).
- Dukungan pembaca layar dasar (urutan fokus logis, label tombol jelas).
- Hormati "reduce motion".
- Hindari tulisan kecil di atas gambar.
- Rancang untuk layar kecil, koneksi lambat (jangan bergantung pada animasi berat atau gambar sangat besar), dan penggunaan satu tangan.

## 13. Aturan Lomba dan Kepatuhan yang Memengaruhi Desain

- **Juri menguji lewat web:** alur chat web (§7.E-G) harus bisa diselesaikan penuh tanpa WhatsApp.
- **Video demo 16:9, minimal 1080p (jika lolos final):** layar harus tampil baik di desktop saat direkam, dan alur dari kondisi awal ke hasil harus jelas terlihat.
- **Kriteria UX/UI & Accessibility** dinilai di final: kemudahan, kejelasan alur, aksesibilitas dasar.
- **Transparansi AI dan persetujuan** adalah bagian dari tanggung jawab penggunaan AI dan akan ditanyakan juri.
- **Aset pihak ketiga** (font, ikon, ilustrasi, foto) wajib berlisensi dan dicatat di credits.
- **Jangan memakai data pribadi asli** di mockup yang dipublikasikan; gunakan data contoh.

## 14. Handoff ke Developer

**Struktur file desain yang diminta:**
1. Cover (nama proyek, versi, status, kontak).
2. Style (tokens, tipografi, warna, ikon).
3. Komponen (dengan varian/state).
4. Alur (diagram alur dan wireframe).
5. Layar P0 (mobile dan desktop).
6. Layar P1.
7. Prototype.
8. Aset siap ekspor.

**Aturan:**
- Gunakan variabel/token, auto layout, dan komponen berprop/varian agar mudah dipetakan ke kode.
- Penamaan lapisan dan halaman konsisten dan bermakna.
- Anotasi perilaku yang tidak terlihat dari gambar (validasi, batas karakter, perilaku loading, kondisi error, urutan fokus).
- Ekspor: ikon SVG; gambar WebP/PNG sesuai kebutuhan; logo SVG; favicon berbagai ukuran.
- Sertakan **contoh data realistis** di mockup (jangan "lorem ipsum"), misalnya produk tenun, ukiran, jamu, dengan nama, harga, dan caption yang masuk akal, supaya panjang teks nyata teruji.
- Sertakan catatan bila ada keputusan desain yang membutuhkan dukungan teknis khusus.
- Stack front-end tim: [ISI] (disampaikan supaya token dapat dipetakan ke sistem gaya yang dipakai).

## 15. Hal yang Perlu Dijawab Designer di Awal

1. Bagaimana menyampaikan **"pelatih yang hangat"** dan **"kerajinan Bali"** tanpa klise dan tanpa memakai unsur sakral secara sembarangan?
2. Bagaimana tampilan produk ini bisa terasa **modern tetapi tetap ramah untuk perajin yang tidak terbiasa aplikasi**?
3. Bagaimana **poster hasil AI menjadi pusat perhatian** dan dasbor tidak menenggelamkannya?
4. Bagaimana menunjukkan **keunikan tiap poster** (tidak pernah kembar) di landing dan di galeri?
5. Bagaimana menyajikan **label sumber data** dan **penanda AI** supaya jujur tetapi tidak menakutkan?

## 16. Definition of Done (untuk Setiap Layar)

- [ ] Mobile dan desktop selesai.
- [ ] Semua state (kosong, loading, error, sukses) ada.
- [ ] Teks nyata (Indonesia dan Inggris), bukan placeholder.
- [ ] Kontras dan ukuran sentuh lolos pemeriksaan.
- [ ] Menggunakan token dan komponen dari library.
- [ ] Anotasi perilaku ditulis.
- [ ] Sudah ditinjau tim (alur dan fungsi sesuai PRD).
- [ ] Aset berlisensi dan tercatat.

## 17. Lampiran

### 17.1 Daftar status posting
`Draf` → `Disetujui` → `Terjadwal` → `Terbit` / `Gagal`

### 17.2 Label sumber data (untuk profil/memori)
`Diisi kamu` · `Dari Instagram` · `Dari website` · `Dari katalog` · `Tebakan AI (perlu dikonfirmasi)`

### 17.3 Contoh data realistis untuk mockup
- Usaha: "Tenun Endek [Nama]" (Karangasem), "Ukiran Kayu [Nama]" (Gianyar), "Jamu Tradisional [Nama]" (Denpasar).
- Produk: kain endek motif [ISI], patung kayu ukuran sedang, paket jamu tradisional.
- Harga rupiah yang masuk akal; cerita singkat 2-3 kalimat tentang proses pembuatan.
- Caption Indonesia 3-5 kalimat dan terjemahan Inggris setara; 5-10 hashtag.
- Gunakan foto yang berlisensi atau foto dari perajin pilot yang telah memberi izin.

### 17.4 Referensi
- PRD produk (alur, kebutuhan fungsional, aturan platform).
- Panduan Peserta AI Web Innovation Challenge, Bali DigiFest 2026 (kriteria penilaian dan aturan demo).
