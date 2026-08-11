# Test Chatbot SASS

Proyek ini adalah otomasi pengujian untuk chatbot menggunakan [Botium](https://botium.atlassian.net/wiki/spaces/BOTIUM/overview).

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)
- NPM (terinstal otomatis bersama Node.js)

## Instalasi

1. Clone repositori ini atau buka folder proyek di terminal Anda.
2. Jalankan perintah berikut untuk menginstal semua dependensi yang dibutuhkan:

```bash
npm install
```

## Konfigurasi Botium

Pengaturan koneksi chatbot menggunakan *environment variables* yang didefinisikan di dalam file `.env`. Anda perlu membuat file `.env` di root direktori proyek ini (sejajar dengan `package.json`) dan mengisi nilai-nilai berikut:

```env
API_URL=http://localhost:3000/chat/completions/<YOUR_ENDPOINT_ID>
SESSION_ID=whatsapp-<PHONE_NUMBER>-<SESSION_ID>
PHONE_NUMBER=628xxxxxx
PROJECT_NAME=Nama Proyek Anda
```

Keterangan:
- `API_URL`: URL endpoint chatbot yang akan diuji.
- `SESSION_ID`: ID Sesi obrolan unik yang diperlukan oleh backend chatbot Anda.
- `PHONE_NUMBER`: Nomor telepon akun dummy yang digunakan untuk *testing*.
- `PROJECT_NAME`: Nama proyek Botium Anda.

*(Catatan: Konfigurasi tingkat lanjut tentang struktur request payload HTTP POST masih dapat dimodifikasi di `botium.json` jika diperlukan.)*

## Cara Membuat Test Case

Test case ditulis menggunakan format **BotiumScript** (`.convo.txt`). Semua test case harus ditempatkan di dalam folder `spec/convo/`.

### Langkah-langkah:
1. Buat file baru di folder `spec/convo/` dengan ekstensi `.convo.txt`, contohnya: `login-flow.convo.txt`.
2. Tulis skenario percakapan dengan format berikut:
   - Baris pertama adalah nama test case.
   - Gunakan `me:` untuk pesan yang dikirimkan oleh User (tester).
   - Gunakan `bot:` untuk ekspektasi balasan dari Chatbot.

### Contoh Test Case (`checkout-flow-variant.convo.txt`)

```text
# VariantCheckout_HappyPath

me:
Halo Official Elektronik2R, saya ingin memesan:

Daftar Pesanan:
- Pulpen Premium (1x Biru): Rp 1.200

Subtotal: Rp 1.200
Ongkos Kirim: Rp 7.100
Total Pembayaran: Rp 8.300

Data Pengiriman:
Nama: Nama Tester
No. HP: 08xxxxxxx

bot: Pesanan Berhasil Diterima!
bot: Invoice Order
bot: Silakan SCAN QRIS untuk melakukan pembayaran!
bot: Pesanan kamu sudah berhasil dibuat!
```
*Catatan: Botium akan mengecek apakah chatbot membalas sesuai dengan teks yang ada di bagian `bot:`.*

## Cara Menjalankan Test Case

Setelah test case dibuat di dalam folder `spec/convo/`, Anda dapat menjalankan pengujian dengan perintah:

```bash
npm run mocha
```

Perintah ini akan mengeksekusi framework Mocha (`mocha spec`) yang akan membaca seluruh file `.convo.txt` dan mengujinya ke endpoint chatbot. Hasil dari pengujian (Pass/Fail) akan ditampilkan di terminal.
