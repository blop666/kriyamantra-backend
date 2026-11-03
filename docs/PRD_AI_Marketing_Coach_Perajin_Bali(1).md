# PRD — AI Marketing Coach untuk Perajin Tradisional Bali

> **Working title:** [NAMA_PRODUK]
> **Kompetisi:** Bali DigiFest 2026 — AI Web Innovation Challenge ("Build with AI, Solve for Bali")
> **Versi:** 0.1 (draft) | **Tanggal:** 30 Oktober 2026 | **Status:** Siap direview tim
> **Ketua tim / PIC:** [NAMA_KETUA] | **Anggota:** [ANGGOTA_2], [ANGGOTA_3] | **Instansi:** [NAMA_SEKOLAH/KAMPUS] | **Kontak:** [KONTAK]
> **Kategori lomba:** [SMA/SMK atau Mahasiswa/Umum]

Catatan penulisan: semua `[PLACEHOLDER]` diisi manual oleh tim. Angka target bertanda *(target awal)* adalah hipotesis yang harus disesuaikan setelah pengujian. Fakta eksternal (aturan platform, harga) berubah cepat, jadi verifikasi ulang sebelum proposal final.

---

## 1. Ringkasan Produk

**Satu kalimat:** Website + chatbot (web dan WhatsApp) yang berperan sebagai pelatih marketing pribadi bagi perajin tradisional Bali: perajin cukup mengirim foto dan detail produk, lalu AI membuat poster unik, deskripsi ID/EN, menjadwalkan dan memposting otomatis ke Instagram, serta memberi tugas dan pengingat marketing mingguan.

**Inti masalah yang diselesaikan:** pelatihan digital marketing sudah banyak, tetapi perajin kembali ke cara lama setelah pelatihan selesai. Produk ini tidak mengajari, tetapi **mengerjakan dan menemani secara terus-menerus** lewat kanal yang sudah dipakai perajin sehari-hari (WhatsApp).

**Pembeda utama:**
1. **Poster dihasilkan AI setiap kali dan tidak pernah kembar** (bukan template tetap), dengan identitas brand tetap konsisten.
2. **Memori per usaha:** AI mengenal usaha, produk, gaya visual, dan gaya bahasa perajin.
3. **Pelatih berkelanjutan:** jadwal, tugas mingguan, dan pengingat, bukan generator sekali pakai.
4. **Satu otak, dua kanal:** chat di web dan WhatsApp memakai agent dan database yang sama.
5. **Onboarding opsional dari sumber yang sudah ada** (Instagram, website, katalog) sekaligus jalur wawancara untuk perajin tanpa medsos.

## 2. Konteks Lomba dan Pemetaan Kriteria

Produk harus berupa **MVP web yang berfungsi saat submission Tahap 1** dan AI harus menjadi bagian material dari fungsi utama (bukan hanya membantu coding).

### 2.1 Technical gate Tahap 1 (PASS/FAIL)

| Pemeriksaan | Bagaimana produk ini memenuhinya |
|---|---|
| Identitas dan komposisi peserta | Maks. 3 orang, satu kategori |
| Proposal lengkap, terbaca | PDF A4, maks. 5 halaman isi, struktur sesuai Lampiran A (lihat §17) |
| Repository dapat diakses | Public, atau private dengan akses read-only untuk akun panitia |
| Website/MVP dapat diakses | Deployment URL aktif + akun demo khusus juri |
| Fungsi utama dapat diuji | Alur inti §7 dapat dijalankan juri lewat chat di web |
| AI terintegrasi secara material | Creative engine, ekstraksi profil, memori, quality gate (§9) |
| Tidak ada pelanggaran esensial | Disclosure jujur, tanpa secret di repo, privasi terjaga |

### 2.2 Pemetaan rubrik

| Rubrik Tahap 1 | Bobot | Jawaban produk |
|---|---|---|
| Problem Relevance & Impact | 20% | Masalah nyata perajin; bukti dari pilot 3-5 perajin |
| Innovation & Differentiation | 15% | Poster unik per permintaan + pelatih berkelanjutan + memori |
| AI Relevance & Implementation | 25% | Pipeline AI berlapis dengan evaluasi terukur (§9) |
| MVP Functionality | 20% | Alur foto → poster → persetujuan → auto-post Instagram berjalan |
| Technical Feasibility & Repo Quality | 15% | Arsitektur jelas, README lengkap, reproducible |
| Compliance & Documentation | 5% | Disclosure, `.env.example`, tag versi |

Rubrik final (jika lolos): AI Depth 25%, Functionality & Reliability 25%, Problem-Solution Fit 15%, Innovation 15%, UX/UI & Accessibility 10%, Scalability 5%, Demo & Communication 5%. Skor Tahap 1 tidak dibawa ke final.

## 3. Latar Belakang Masalah

**Temuan awal** (perlu divalidasi ulang dan dilengkapi data lapangan sebelum masuk proposal; sebagian dari jurnal pengabdian masyarakat):

- Dinas terkait di Bali menyatakan UMKM belum sepenuhnya terdigitalisasi dan Pemprov mendorong digitalisasi pemasaran serta keuangan UMKM.
- Kajian digitalisasi UMKM menyimpulkan kendala utama bukan kepemilikan perangkat, tetapi **kemampuan memanfaatkan teknologi**.
- Bank Indonesia mencatat program onboarding UMKM berbasis budaya (termasuk di Bali) masih menghadapi banyak kendala.
- Contoh lapangan: perajin tenun di Karangasem masih mengandalkan cara tradisional seperti menitipkan produk ke toko lokal.

**Kesenjangan:** pelatihan dan alat generator konten sudah ada, tetapi tidak menjawab (a) kebiasaan yang tidak terbentuk, (b) beban membuat konten yang konsisten dan menarik, (c) kebutuhan konten dalam dua bahasa untuk turis.

**Bukti yang akan dikumpulkan sendiri (wajib untuk proposal):** wawancara singkat dan pilot dengan [JUMLAH] perajin di [LOKASI]; catat kebiasaan marketing sebelum produk dipakai.

**Sumber awal:**
- https://bali.antaranews.com/berita/376565/pemprov-bali-dongkrak-digitalisasi-pemasaran-dan-keuangan-umkm
- https://ejournal.unma.ac.id/index.php/entrepreneur/article/download/19140/8561/81244
- https://www.bi.go.id/id/bi-institute/BI-Epsilon/Pages/Tantangan-Digitalisasi-UMKM-Berbasis-Budaya.aspx
- https://ejurnal.umri.ac.id/index.php/PengabdianUMRI/article/download/9288/3718

## 4. Target Pengguna

### 4.1 Pengguna utama: Perajin/UMKM tradisional Bali
- Usaha mikro (ukiran, tenun/endek, perak, kuliner khas, jamu, dll.).
- Literasi digital rendah-menengah; nyaman dengan WhatsApp, kurang nyaman dengan dashboard rumit dan mengetik panjang.
- Sebagian tidak punya Instagram/website; sebagian punya akun personal.
- Pain point: tidak tahu harus posting apa, tidak punya waktu/skill desain, sulit konsisten, bahasa Inggris terbatas untuk turis.

### 4.2 Pengguna sekunder
- **Juri:** menguji alur lewat web dengan akun demo.
- **Pendamping/penyuluh UMKM (opsional, masa depan):** memantau banyak perajin.

### 4.3 Persona acuan
**Bu [Nama Persona], 45 tahun, perajin tenun di [Kabupaten].** Punya HP Android, aktif WhatsApp, Instagram personal jarang dipakai. Menjual lewat titip toko dan pesanan WhatsApp. Ingin lebih dikenal turis, tetapi bingung membuat poster dan caption bahasa Inggris.

## 5. Tujuan, Non-Tujuan, dan Metrik Keberhasilan

### 5.1 Tujuan
1. Perajin dapat menghasilkan dan memposting konten promosi berkualitas dalam **satu percakapan singkat**.
2. Perajin **tetap melakukan marketing secara rutin** berkat tugas dan pengingat mingguan.
3. Setiap poster **unik** namun tetap terasa satu brand.
4. Produk terbukti **berfungsi dan dapat diuji juri** pada Tahap 1.

### 5.2 Non-tujuan (Tahap 1)
- Auto-post TikTok (lihat §12.4).
- Pelacakan klik WhatsApp dan laporan performa lanjutan.
- Import dari marketplace (Tokopedia/Shopee/dll.).
- Pembayaran, e-commerce, atau manajemen stok.
- Model AI yang dilatih sendiri (memakai model via API).
- Aplikasi mobile native.

### 5.3 Metrik

| Metrik | Cara ukur | Target awal *(target awal)* |
|---|---|---|
| Waktu dari kirim foto hingga poster siap | Log sistem | ≤ 2 menit |
| Poster diterima pada percobaan pertama | % opsi langsung disetujui | ≥ 60% |
| Akurasi teks di poster (nama, harga) | OCR vs input | ≥ 95% |
| Kesetiaan produk (bentuk/warna tidak berubah) | Vision model + cek manual sampel | ≥ 90% lolos |
| Keunikan antar poster produk yang sama | Skor kemiripan | di bawah ambang (§9.3) |
| Penyelesaian tugas mingguan (pilot) | % tugas selesai | ≥ 60% |
| Waktu onboarding | Log sistem | ≤ 10 menit |
| Akurasi ekstraksi profil dari sumber | % field benar saat direview | ≥ 80% |
| Keberhasilan auto-post Instagram | % terjadwal yang terbit | ≥ 95% |

## 6. Cakupan

| Prioritas | Fitur |
|---|---|
| **P0 (wajib Tahap 1)** | Akun + onboarding; tautkan Instagram (OAuth); wawancara terpandu + upload foto katalog; profil/brand kit + memori; chat web dan WhatsApp; input foto + detail produk; creative engine (poster unik + deskripsi ID/EN) + quality gate + cek keunikan; persetujuan dan revisi; **penjadwalan dan auto-post Instagram**; tugas mingguan + pengingat; dashboard dasar |
| **P1 (jika waktu cukup)** | Import website via URL; voice note (speech-to-text); brand kit draft otomatis dari foto lama; kalender momen Bali; laporan aktivitas + rekomendasi dasar |
| **P2 (nanti)** | Metrik performa Instagram untuk rekomendasi; klik WA lewat QR/redirect; auto-post TikTok; import marketplace; mode pendamping UMKM |

**Urutan pemotongan jika waktu mepet:** P1 dipotong dari bawah ke atas (kalender momen → rekomendasi → import website → voice note). **P0 tidak dikurangi**, kecuali WhatsApp yang punya rencana cadangan di §12.1.

## 7. Alur Pengguna Utama (End-to-End)

1. **Daftar di web:** isi nama usaha, jenis produk, nomor WhatsApp.
2. **Tautkan WhatsApp:** sistem memberi kode unik; pengguna mengirim kode itu ke nomor bot.
3. **Sumber usaha (opsional):** hubungkan Instagram, tempel URL website, upload foto katalog, atau lewati.
4. **Wawancara terpandu** (5-7 pertanyaan) bila sumber kosong atau kurang.
5. **Review profil dan brand kit draft:** pengguna mengonfirmasi atau mengoreksi.
6. **Kirim foto + detail produk** lewat WhatsApp atau chat web.
7. **AI membuat 2-3 opsi poster + deskripsi ID/EN + usulan jadwal**, menyimpan data produk ke memori.
8. **Pengguna memilih, menyetujui, atau meminta revisi** ("lebih hangat", "tulisan lebih besar").
9. **Sistem memposting otomatis ke Instagram** sesuai jadwal.
10. **Tiap minggu bot mengirim tugas marketing** dan pengingat; hasil terlihat di dashboard.

## 8. Kebutuhan Fungsional

Format: **ID — kebutuhan — prioritas — kriteria penerimaan**.

### M1. Akun dan Onboarding
- **FR-101 (P0)** Registrasi dan login pengguna. *Diterima jika:* pengguna baru dapat membuat akun dan masuk; sesi aman.
- **FR-102 (P0)** Penautan nomor WhatsApp dengan kode unik sekali pakai. *Diterima jika:* kode kedaluwarsa dalam waktu terbatas dan nomor yang tertaut tidak dapat dipakai akun lain.
- **FR-103 (P0)** Persetujuan eksplisit (consent) untuk pemrosesan foto/data oleh layanan AI, tersimpan sebagai log. *Diterima jika:* onboarding tidak bisa lanjut tanpa persetujuan.
- **FR-104 (P0)** Onboarding berbahasa sederhana, ramah ponsel, dapat dilewati bertahap. 

### M2. Sumber Usaha (Import Opsional)
- **FR-201 (P0)** Hubungkan Instagram lewat OAuth resmi untuk membaca caption/media milik akun dan posting. *Diterima jika:* akun Business/Creator tersambung; akun personal ditolak dengan panduan konversi yang jelas.
- **FR-202 (P0)** Upload foto katalog/brosur/nota; ekstraksi isi lewat vision/OCR. 
- **FR-203 (P0)** Wawancara terpandu 5-7 pertanyaan (teks) sebagai jalur dasar bila tidak ada sumber digital. 
- **FR-204 (P1)** Import website: pengguna menempel URL miliknya; sistem mengambil halaman publik secara terbatas dan menghormati `robots.txt`.
- **FR-205 (P1)** Voice note cerita usaha dan detail produk lewat speech-to-text, dengan fallback teks.
- **FR-206 (P0)** **Semua hasil ekstraksi tampil sebagai draft** dan hanya masuk memori setelah dikonfirmasi pengguna.
- **FR-207 (P0)** Setiap fakta di profil berlabel sumber (`diisi_pengguna`, `instagram`, `website`, `katalog`, `tebakan_ai`) dan status konfirmasi.
- **FR-208 (P0)** Konten hasil import diperlakukan sebagai **data, bukan instruksi** (anti prompt injection).
- **FR-209 (P0)** Batas import: maks. 30 postingan terbaru, sekali saat onboarding, dengan opsi sinkron ulang manual.
- **FR-210 (P0)** Tidak menyimpan komentar atau foto orang lain; hanya konten milik akun.

### M3. Profil Usaha, Brand Kit, dan Memori
- **FR-301 (P0)** Profil usaha terstruktur: nama, lokasi, kategori, cerita asal usul, target pembeli, bahasa, gaya bahasa.
- **FR-302 (P0)** Brand kit: palet warna, mood visual, logo (jika ada), 2-3 contoh poster yang disukai, gaya tipografi (deskriptif). 
- **FR-303 (P1)** Draft brand kit otomatis dari analisis foto lama.
- **FR-304 (P0)** Katalog produk: nama, deskripsi, harga (dari input pengguna), foto, status promosi.
- **FR-305 (P0)** Memori konten: untuk setiap poster/post disimpan deskriptor, embedding, brief, dan status, dipakai untuk cek keunikan.
- **FR-306 (P0)** Pengguna dapat melihat, mengubah, dan menghapus isi memorinya. 

### M4. Kanal: Chat Web dan WhatsApp
- **FR-401 (P0)** Chat di web memakai agent yang sama dengan WhatsApp. *Diterima jika:* alur §7 langkah 6-9 dapat diselesaikan penuh di web.
- **FR-402 (P0)** Integrasi WhatsApp Business Cloud API: webhook masuk, balasan keluar, tautan ke akun.
- **FR-403 (P0)** Bot dibatasi pada **fungsi marketing** (bukan asisten serba-bisa); pesan di luar konteks dijawab singkat dan diarahkan kembali.
- **FR-404 (P0)** Pesan di luar jendela 24 jam hanya memakai template yang disetujui (pengingat).
- **FR-405 (P0)** Penanganan pesan ganda dari webhook (idempotency) dan retry aman.
- **FR-406 (P0)** Riwayat percakapan lintas kanal tampil konsisten di dashboard.

### M5. Input Produk
- **FR-501 (P0)** Terima foto produk (1-5 gambar) + detail teks (nama, bahan, proses, harga, cerita).
- **FR-502 (P1)** Terima voice note sebagai detail produk, ditranskripsi dan dikonfirmasi.
- **FR-503 (P0)** Bot menanyakan data penting yang kurang (misal harga, ukuran) sebelum generate, maksimal 2 pertanyaan sekaligus.
- **FR-504 (P0)** Validasi foto: ukuran, format, dan kualitas minimum; pesan error yang jelas.

### M6. Creative Engine
- **FR-601 (P0)** Membuat **creative brief** baru tiap permintaan (konsep, komposisi, mood, copy, format).
- **FR-602 (P0)** Memilih **sudut kreatif** yang berbeda dari beberapa poster terakhir (daftar sudut: close-up tekstur, proses pembuatan, cerita budaya, suasana pemakaian, promo, dll.).
- **FR-603 (P0)** Menghasilkan 2-3 opsi poster oleh model gambar dengan foto produk sebagai referensi dan brand kit sebagai batasan.
- **FR-604 (P0)** **Quality gate** otomatis (teks, kesetiaan produk, brand, artefak); retry terbatas.
- **FR-605 (P0)** **Cek keunikan** terhadap poster sebelumnya; regenerate bila terlalu mirip.
- **FR-606 (P0)** Menghasilkan deskripsi/caption Bahasa Indonesia dan terjemahan Inggris, plus hashtag, dengan gaya bahasa sesuai profil.
- **FR-607 (P0)** Format output: feed (4:5) dan story (9:16) *(dapat disesuaikan)*.
- **FR-608 (P0)** Fallback: jika quality gate gagal berulang, tampilkan opsi terbaik dengan penanda jelas atau gunakan template sebagai jaring pengaman (ditandai, bukan jalur utama).
- **FR-609 (P0)** Guardrail klaim: tidak membuat klaim produk yang tidak disebut pengguna (asli, organik, halal, bersertifikat, medis, dll.); harga hanya dari input.

### M7. Persetujuan dan Revisi
- **FR-701 (P0)** Tidak ada posting tanpa persetujuan eksplisit pengguna.
- **FR-702 (P0)** Revisi lewat bahasa alami; sistem membuat versi baru, riwayat versi tersimpan.
- **FR-703 (P0)** Pengguna dapat mengedit caption sebelum diposting.
- **FR-704 (P0)** Batas revisi per poster *(target awal: 5)* untuk mengontrol biaya, dengan pesan yang ramah.

### M8. Penjadwalan dan Auto-post Instagram *(wajib Tahap 1)*
- **FR-801 (P0)** Sistem mengusulkan jadwal dari aturan awal (jam umum, jarak antar posting); pengguna dapat mengubah.
- **FR-802 (P0)** **Auto-post ke Instagram** sesuai jadwal setelah persetujuan. *Diterima jika:* posting terbit di akun Instagram pengguna pada waktu terjadwal, dibuktikan di demo.
- **FR-803 (P0)** Penjadwalan dijalankan scheduler internal (queue/cron) agar tidak bergantung fitur penjadwalan platform.
- **FR-804 (P0)** Status posting: `draft → disetujui → terjadwal → terbit / gagal`, tampil di dashboard dan diberitahukan lewat chat.
- **FR-805 (P0)** Penanganan kegagalan: retry dengan batas, notifikasi ke pengguna, jalur manual ("unduh paket posting").
- **FR-806 (P0)** Pemantauan token Instagram (masa berlaku terbatas): pembaruan otomatis dan peringatan bila perlu otorisasi ulang.
- **FR-807 (P0)** Untuk pengguna tanpa Instagram: tersedia **paket siap-upload** (gambar + caption + hashtag) yang bisa diunduh atau dikirim lewat chat.

### M9. Tugas Mingguan dan Pengingat
- **FR-901 (P0)** Setiap minggu sistem membuat daftar tugas marketing kecil dan spesifik (misal: promosikan produk yang belum pernah diposting, buat cerita di balik produk, balas komentar, perbarui foto).
- **FR-902 (P0)** Tugas dikirim lewat WhatsApp (template) dan tampil di dashboard dengan status selesai/belum.
- **FR-903 (P0)** Pengingat terbatas *(target awal: 1-2 per minggu)* untuk menghemat biaya dan menghindari spam.
- **FR-904 (P0)** Pengguna dapat menandai selesai, menunda, atau melewati tugas lewat balasan singkat.
- **FR-905 (P1)** Kalender momen Bali (hari raya, libur nasional, musim kunjungan turis) memicu tugas dan kampanye. Tanggal wajib diverifikasi dari sumber resmi.

### M10. Dashboard Web
- **FR-1001 (P0)** Beranda: ringkasan minggu ini (tugas, jadwal terdekat, posting terbit).
- **FR-1002 (P0)** Kalender jadwal posting dengan status.
- **FR-1003 (P0)** Galeri hasil generate (poster, deskripsi) dengan riwayat versi.
- **FR-1004 (P0)** Halaman profil usaha, brand kit, katalog, dan sumber (dengan label sumber/konfirmasi).
- **FR-1005 (P0)** Pengaturan: akun Instagram, nomor WA, persetujuan, hapus data.
- **FR-1006 (P0)** Antarmuka mobile-first, teks besar, istilah sederhana.

### M11. Laporan dan Rekomendasi
- **FR-1101 (P1)** Laporan aktivitas mingguan: tugas selesai, posting terbit, konsistensi, produk yang belum pernah dipromosikan.
- **FR-1102 (P1)** Rekomendasi berbasis aturan dan dinarasikan LLM ("Minggu ini 2 dari 4 tugas selesai; produk B belum pernah diposting, coba…").
- **FR-1103 (P2)** Metrik performa Instagram (reach, interaksi) untuk rekomendasi tema dan jam; ditampilkan sebagai **indikasi**, bukan klaim sebab-akibat, karena sampel kecil.
- **FR-1104 (P2)** Klik ke WhatsApp dilacak lewat QR di poster / tautan redirect milik sendiri.

## 9. Spesifikasi Implementasi AI

### 9.1 Komponen AI

| Komponen | Fungsi | Input | Output | Kegagalan ditangani dengan |
|---|---|---|---|---|
| Ekstraksi profil | Mengubah sumber (caption, halaman, foto katalog, wawancara) jadi profil terstruktur | Teks/gambar sumber | JSON profil + label sumber + keyakinan | Tampil sebagai draft; field ragu ditanyakan ke pengguna |
| Agent percakapan | Mengatur alur chat marketing, bertanya data yang kurang, menangani revisi | Pesan pengguna + memori | Balasan + aksi terstruktur | Jawaban fallback singkat; batas konteks |
| Memori | Menyimpan dan mengambil profil, katalog, riwayat konten | Data terstruktur + embedding | Konteks ringkas untuk prompt | Retrieval terbatas, ringkasan berkala |
| Creative brief generator | Membuat brief unik tiap permintaan | Produk + brand kit + riwayat + momen | Brief terstruktur | Validasi skema; ulang bila tidak valid |
| Generator poster | Membuat gambar poster | Brief + foto referensi + brand kit | 2-3 gambar | Retry; fallback sesuai FR-608 |
| Quality gate | Memeriksa hasil | Gambar + brief + input asli | Skor + alasan lulus/gagal | Retry dengan brief diperbaiki |
| Cek keunikan | Membandingkan dengan poster lama | Embedding/deskriptor | Skor kemiripan | Regenerate dengan sudut berbeda |
| Penulis caption/terjemahan | Caption ID + EN + hashtag | Profil + produk + brief | Teks | Validasi panjang/bahasa |
| Speech-to-text (P1) | Transkripsi voice note | Audio | Teks + konfirmasi | Fallback minta ketik |
| Pembuat tugas/rekomendasi | Menyusun tugas mingguan dan saran | Aktivitas + katalog + momen | Daftar tugas/narasi | Template tugas dasar |

Model spesifik: **[MODEL_TEKS/AGENT], [MODEL_GAMBAR], [MODEL_EMBEDDING], [MODEL_STT]** (isi manual; alasan pemilihan wajib dijelaskan untuk technical verification).

### 9.2 Pipeline poster unik

1. **Brief:** LLM menulis brief baru dari konteks produk + brand kit + deskriptor N poster terakhir + momen.
2. **Sudut kreatif:** dipilih dari daftar dan tidak boleh sama dengan sudut beberapa poster terakhir.
3. **Generate:** model gambar memakai foto produk asli sebagai referensi; brand kit sebagai batasan (palet, vibe, gaya).
4. **Quality gate:**
   - Teks pada gambar dibaca OCR dan dicocokkan dengan teks yang diminta (nama, harga).
   - Produk tidak berubah bentuk/warna dibanding foto asli (penilaian vision model).
   - Sesuai brand kit (palet, mood).
   - Tidak ada artefak jelas (tangan/objek rusak, teks tidak terbaca).
5. **Cek keunikan:** bandingkan dengan poster sebelumnya; di atas ambang → regenerate dengan sudut/komposisi lain.
6. **Opsi:** 2-3 hasil terbaik dikirim untuk persetujuan.

**Konsistensi vs keunikan:** identitas (palet, vibe, logo, gaya bahasa) dijaga tetap; komposisi, konsep, dan sudut selalu berubah.

### 9.3 Ambang dan parameter *(target awal, dituning lewat uji)*
- Retry maksimal per opsi: 3.
- Ambang kemiripan keunikan: titik awal cosine similarity 0,85 (lebih tinggi = ditolak); disetel dari uji internal.
- Jumlah poster terakhir yang dibandingkan: 20.
- Kuota generate per pengguna per hari dan per jam untuk mengontrol biaya.

### 9.4 Guardrail dan Responsible AI
- **Klaim produk:** tidak mengarang; klaim sensitif hanya jika disebut pengguna.
- **Cerita budaya:** hanya dari penjelasan perajin; bila ragu tentang makna motif, AI bertanya, bukan menebak. Hasil import ditandai asalnya.
- **Foto produk:** tidak mengubah bentuk/warna produk asli; fitur kesetiaan produk diuji.
- **Prompt injection:** isi caption/website/dokumen impor tidak pernah dijalankan sebagai instruksi.
- **Label konten AI:** cek kebijakan platform tentang pelabelan konten buatan AI sebelum auto-post dan patuhi.
- **Moderasi:** tolak permintaan yang melanggar hukum atau etika; batasi bot ke konteks marketing.
- **Human-in-the-loop:** tidak ada posting tanpa persetujuan eksplisit.

### 9.5 Rencana evaluasi (untuk proposal dan verifikasi teknis)
- **Benchmark:** 20-30 produk berbeda (foto + detail). Ukur akurasi teks (OCR), kesetiaan produk, keunikan, tingkat lolos quality gate, tingkat diterima percobaan pertama, latensi, dan biaya per poster.
- **Ekstraksi profil:** bandingkan hasil dengan kebenaran yang diisi perajin; hitung % field benar dan % dikoreksi.
- **Pilot 3-5 perajin:** tugas mingguan selesai, jumlah posting, waktu pembuatan konten sebelum vs sesudah.
- Semua hasil dilaporkan jujur termasuk kegagalan dan keterbatasan.

## 10. Arsitektur Sistem

```
Perajin ──(Chat Web)────────────┐
Perajin ──(WhatsApp)──► WhatsApp Cloud API ──webhook──┤
                                                      ▼
                                   ┌─────────── Backend (API + Agent Core) ───────────┐
                                   │ Channel Adapter (Web, WA)                         │
                                   │ Agent: percakapan, memori, tugas                  │
                                   │ Creative Engine: brief → generate → gate → unik   │
                                   │ Import Service: IG OAuth, URL, katalog (OCR)      │
                                   │ Scheduler/Queue: jadwal posting, pengingat        │
                                   └───────┬─────────────┬───────────────┬─────────────┘
                                           │             │               │
                                       Database      Penyimpanan     Layanan AI/API
                                    (profil, memori,   media          (LLM, gambar,
                                     jadwal, log)    (poster, foto)   embedding, STT)
                                           │
                                   Dashboard Web ◄───── pengguna
                                           │
                                   Instagram API (publish) ──► akun Instagram perajin
```

**Prinsip:** satu agent inti, banyak kanal (adapter). Dashboard dan WhatsApp membaca/menulis database yang sama.

**Stack (isi manual):** Frontend [FRAMEWORK]; Backend [FRAMEWORK/RUNTIME]; Database [DB]; Queue/Scheduler [MEKANISME]; Storage media [STORAGE]; Hosting [PLATFORM]; Model AI sesuai §9.1.

## 11. Model Data (Entitas Utama)

| Entitas | Atribut kunci |
|---|---|
| `users` | id, nama, email/login, no_wa (terverifikasi), kode_tautan, dibuat_pada |
| `businesses` | id, user_id, nama_usaha, lokasi, kategori, cerita, bahasa, gaya_bahasa |
| `business_facts` | id, business_id, field, nilai, sumber, keyakinan, dikonfirmasi |
| `sources` | id, business_id, jenis (instagram/website/katalog/wawancara), status, diimpor_pada |
| `brand_kits` | id, business_id, palet, mood, logo_url, contoh_referensi, tipografi_deskriptif |
| `products` | id, business_id, nama, deskripsi, harga, status_promosi |
| `product_images` | id, product_id, url, jenis |
| `creative_briefs` | id, product_id, sudut, konsep, komposisi, copy, format |
| `posters` | id, brief_id, versi, url, deskriptor, embedding, skor_gate, skor_kemiripan, status |
| `approvals` | id, poster_id, keputusan, catatan_revisi, waktu |
| `social_accounts` | id, business_id, platform, akun_id, token_terenkripsi, kedaluwarsa_pada |
| `scheduled_posts` | id, poster_id, caption_id, caption_en, jadwal, status, platform_post_id, error |
| `weekly_tasks` | id, business_id, minggu, jenis, deskripsi, status |
| `notifications` | id, user_id, kanal, jenis, status_kirim |
| `messages` | id, user_id, kanal, arah, isi, waktu |
| `moments` | id, nama, tanggal, jenis (hari raya/libur/musim) — P1 |
| `consents` | id, user_id, jenis, waktu, versi |
| `ai_runs` | id, komponen, model, token/biaya, latensi, hasil, error |

## 12. Integrasi Eksternal dan Batasan

### 12.1 WhatsApp Business Cloud API
- Bot harus punya **fungsi bisnis spesifik**. Sejak 15 Januari 2026 Meta melarang chatbot AI serba-bisa di WhatsApp Business API; bot terstruktur untuk dukungan, notifikasi, dan penjualan tetap diizinkan. Produk ini memakai bot marketing yang terbatas (FR-403).
- Pesan di luar jendela layanan 24 jam hanya boleh berupa **template** yang disetujui Meta (pengingat mingguan).
- **Biaya:** sejak 1 Oktober 2026 balasan layanan dalam jendela 24 jam dilaporkan mulai berbayar per pesan (sumber berbeda soal kuota gratis); **verifikasi di halaman harga resmi Meta**. Desain hemat pesan (FR-903).
- Persiapan: akun Meta Business, nomor khusus, verifikasi, persetujuan template. Waktu persetujuan bisa lama.
- **Rencana cadangan:** (a) nomor uji coba Cloud API untuk demo, (b) chat di web sebagai kanal utama untuk juri (FR-401), (c) bot Telegram sebagai pembuktian alur jika verifikasi tertunda.
- Hindari gateway WhatsApp tidak resmi (risiko pemblokiran nomor).

### 12.2 Instagram
- Hanya akun **Business/Creator** yang bisa diakses lewat API resmi; akun personal tidak didukung sejak Basic Display API dimatikan (4 Desember 2024). Onboarding wajib memandu konversi akun (gratis).
- Token berumur terbatas: perlu mekanisme perpanjangan dan peringatan (FR-806).
- Izin yang diminta harus minimal dan sesuai fungsi (baca media milik akun, publish, dan insights untuk fase lanjut).
- Catatan implementasi (verifikasi): media biasanya harus dapat diakses lewat URL publik HTTPS saat proses publish.
- Pembaruan kebijakan aplikasi (review akses) dapat memengaruhi pengguna selain akun uji; pastikan akun juri/pilot terdaftar sebagai penguji sesuai aturan Meta.

### 12.3 Model AI dan layanan lain
- Pastikan lisensi/ketentuan layanan model dipenuhi dan kuota API cukup selama penjurian.
- Semua pihak ketiga dicantumkan di disclosure.

### 12.4 TikTok (di luar Tahap 1)
- Aplikasi yang belum lolos audit TikTok hanya dapat memposting dengan visibilitas privat dan dibatasi jumlah pengguna, jadi auto-post TikTok tidak masuk MVP.
- Solusi Tahap 1: **paket siap-upload** (FR-807). Audit atau layanan pihak ketiga yang sudah teraudit dipertimbangkan nanti.
- Pedoman TikTok juga mewajibkan pengguna dapat melihat pratinjau dan memberi persetujuan sebelum upload, sejalan dengan FR-701.

## 13. Kebutuhan Non-Fungsional

- **Keandalan:** retry dengan backoff, idempotency untuk webhook dan publish, antrean tugas, log kegagalan yang dapat dilacak.
- **Kinerja:** respons percakapan cepat; generate poster berjalan asinkron dengan pesan status ("sedang dibuat…").
- **Keamanan:** token terenkripsi, isolasi data antar-pengguna, validasi input dan upload, rate limit, tidak ada secret di repo (gunakan environment variable + `.env.example`), HTTPS.
- **Privasi:** consent eksplisit, minimalisasi data, tidak menyimpan data pihak ketiga dari akun impor, hapus data atas permintaan, patuhi UU Pelindungan Data Pribadi. Jelaskan data apa yang dikirim ke model dan bagaimana dilindungi.
- **Biaya:** kuota per pengguna, batas revisi, caching hasil, pemantauan biaya per poster (`ai_runs`).
- **Aksesibilitas dan UX:** mobile-first, kontras dan ukuran teks memadai, bahasa sederhana, alur dengan sedikit langkah.
- **Observabilitas:** log terstruktur, metrik kegagalan AI/IG/WA.

## 14. Keamanan dan Penyalahgunaan

| Risiko | Mitigasi |
|---|---|
| Penyalahgunaan bot sebagai asisten umum | Pembatasan fungsi (FR-403), penolakan di luar konteks |
| Prompt injection dari konten impor/chat | Konten sebagai data; instruksi sistem terpisah; validasi output terstruktur |
| Biaya API membengkak | Kuota, batas revisi, pemantauan |
| Kebocoran token/secret | Enkripsi, environment variable, tanpa secret di repo |
| Posting tidak diinginkan | Persetujuan eksplisit, riwayat versi, kemampuan batalkan jadwal |
| Klaim produk menyesatkan | Guardrail klaim, kesetiaan produk, label sumber |

## 15. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Verifikasi WhatsApp Business lama atau ditolak | Kanal WA tidak siap | Chat web sebagai kanal utama; nomor uji; Telegram sebagai cadangan |
| Kualitas teks/produk pada gambar AI kurang | Poster tidak layak | Quality gate + retry; fallback ditandai; benchmark awal untuk memilih model |
| Poster terlalu mirip | Klaim keunikan runtuh | Rotasi sudut, cek embedding, ambang dituning |
| Auto-post Instagram gagal (token/izin) | Fungsi inti rusak saat demo | Monitor token, akun uji terdaftar, jalur manual, uji sebelum demo |
| Perajin berhenti memakai | Masalah inti tidak terselesaikan | Tugas kecil, pengingat hemat, pilot dan iterasi |
| Data perajin tidak tersedia untuk bukti | Skor dampak rendah | Mulai pilot dini dengan 3-5 perajin |
| Biaya pesan WhatsApp dan model | Tidak berkelanjutan | Desain hemat pesan, kuota, rencana model biaya di proposal |
| Terlalu banyak fitur | MVP tidak stabil | Disiplin cakupan P0, urutan pemotongan §6 |

## 16. Rencana Pengerjaan (Urutan, Tanpa Tanggal)

Jadwal resmi tiap tahap diumumkan panitia; susun tanggal setelah ada. Urutan yang disarankan:

1. **Fondasi:** repo baru, struktur proyek, akun/login, database, agent core, kanal chat web.
2. **Alur inti:** input produk → creative engine (brief, generate, gate, keunikan) → persetujuan.
3. **Auto-post Instagram (P0):** OAuth, publish, scheduler, status, retry. Uji end-to-end sedini mungkin.
4. **Onboarding dan memori:** profil, brand kit, wawancara, upload katalog, import Instagram.
5. **WhatsApp:** webhook, penautan, balasan, template pengingat, tugas mingguan.
6. **Dashboard:** jadwal, tugas, galeri, profil.
7. **Evaluasi dan pilot:** benchmark, uji 3-5 perajin, perbaikan.
8. **Dokumentasi dan submission:** README, `.env.example`, disclosure, proposal PDF, tag `v1.0-submission`, akun demo, uji clean-start.
9. **P1 sesuai sisa waktu** (urutan §6).

## 17. Kepatuhan dan Kelengkapan Submission

### 17.1 Pemetaan proposal (maks. 5 halaman isi)
Cover → 1 Problem & Background (§3) → 2 Target User (§4) → 3 Proposed Solution (§1, §7) → 4 AI Implementation (§9) → 5 MVP & Key Features (§6, §8) → 6 Technical Architecture (§10) → 7 Innovation & Differentiation (§1) → 8 Impact & Development Potential (§5, §6 P2) → 9 Technology Disclosure (§17.3) → 10 Submission Links.
Nama file: `AIWIC2026_[NamaTim]_[NamaProduk].pdf`.

### 17.2 Repository
README memuat: Project Name & Description, Problem & Target User, Key Features, Tech Stack, AI Implementation, Architecture/Data Flow, Run Instructions, Deployment URL, Demo Account (tanpa password sensitif), Known Limitations, Third-party Resources, Team Members. Sertakan `.env.example`, screenshot, riwayat commit nyata, tag `v1.0-submission` (dan `v2.0-final` bila lolos).

### 17.3 Disclosure: pre-existing vs baru *(wajib jujur)*

| Komponen | Status | Catatan |
|---|---|---|
| Pola agent content generation berbasis template (dari CMS sebelumnya) | **Pre-existing** | Sebutkan bagian yang dipakai ulang |
| Auto-post Instagram (versi awal) | **Pre-existing** | Tuliskan apa yang dikembangkan ulang |
| Creative engine (brief, sudut, quality gate, cek keunikan) | **Baru untuk lomba** | |
| Memori per usaha dan profil terstruktur | **Baru** | |
| Import sumber usaha + wawancara terpandu | **Baru** | |
| Kanal WhatsApp + web chat | **Baru** | |
| Tugas mingguan, pengingat, dashboard | **Baru** | |

Lengkapi tabel Lampiran C: framework, backend, database, hosting, model AI dan perannya, dataset, library, template, AI coding assistant yang digunakan, pre-existing components, dan aset pihak ketiga.

### 17.4 Skenario video demo (jika lolos final, maks. 5 menit, ≥ 50% demo produk)

| Waktu | Isi |
|---|---|
| 0:00-0:30 | Masalah perajin dan konteks Bali |
| 0:30-1:00 | Solusi dan nilai utama |
| 1:00-3:30 | Demo clean-start: daftar → sumber usaha → kirim foto → poster unik → persetujuan → jadwal → terbit di Instagram → tugas mingguan |
| 3:30-4:30 | AI dan arsitektur (brief, quality gate, keunikan, memori) |
| 4:30-5:00 | Dampak (hasil pilot), keterbatasan, pengembangan |

### 17.5 Persiapan technical verification
Siapkan jawaban dan demo untuk: letak kode pemanggilan AI; alasan pemilihan tiap model; menjalankan dengan input berbeda dari demo; penanganan error saat AI/API gagal; data apa yang dikirim ke model dan perlindungan privasinya; mana yang pre-existing dan mana yang baru; cara quality gate dan cek keunikan bekerja; cara mencegah klaim produk palsu dan prompt injection; cara kerja token Instagram dan idempotency webhook. Semua anggota tim harus memahami seluruh alur.

## 18. Keputusan dan Pertanyaan Terbuka

| # | Hal | Status |
|---|---|---|
| 1 | Nama produk | [ISI] |
| 2 | Kategori lomba dan jadwal tahap | [ISI setelah diumumkan] |
| 3 | Pilihan model (teks, gambar, embedding, STT) dan hasil benchmark awal | [ISI] |
| 4 | Stack, hosting, dan mekanisme scheduler | [ISI] |
| 5 | Status verifikasi WhatsApp Business dan nomor | [ISI] |
| 6 | Akun Instagram uji dan pendaftaran sebagai penguji pada aplikasi Meta | [ISI] |
| 7 | Daftar perajin pilot dan persetujuan penggunaan data | [ISI] |
| 8 | Format ukuran poster akhir (feed/story/lainnya) | Usulan: 4:5 dan 9:16 |
| 9 | Ambang keunikan dan parameter retry | Dituning lewat uji |
| 10 | Kebijakan pelabelan konten AI di platform | Verifikasi |

## 19. Glosarium

- **MVP:** versi awal produk yang fungsi utamanya dapat dipakai dan didemonstrasikan.
- **Brand kit:** identitas visual dan bahasa usaha (palet, mood, logo, gaya).
- **Creative brief:** instruksi terstruktur untuk satu poster (konsep, komposisi, copy, format).
- **Quality gate:** pemeriksaan otomatis hasil AI sebelum ditampilkan.
- **Jendela layanan 24 jam (WhatsApp):** periode setelah pengguna mengirim pesan, saat bisnis boleh membalas dengan pesan bebas.
- **Template (WhatsApp):** pesan yang disetujui Meta untuk dikirim di luar jendela 24 jam.
- **Idempotency:** jaminan bahwa pemrosesan berulang atas permintaan yang sama tidak menimbulkan efek ganda.
- **Prompt injection:** teks yang menyisipkan instruksi untuk memanipulasi AI.

## 20. Sumber Referensi Teknis (verifikasi ulang sebelum finalisasi)

- WhatsApp: kebijakan chatbot AI 2026 — https://respond.io/blog/whatsapp-general-purpose-chatbots-ban
- WhatsApp: harga dan jendela layanan — https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing dan https://respond.io/blog/whatsapp-pricing-change-2026
- Instagram API 2026 (akun profesional, Basic Display ditutup) — https://www.getphyllo.com/post/instagram-api-guide
- TikTok Content Sharing Guidelines — https://developers.tiktok.com/doc/content-sharing-guidelines
- Panduan Peserta AI Web Innovation Challenge, Bali DigiFest 2026 (dokumen dari panitia)
