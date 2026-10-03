BANUAKITA - PAKET BUILD EXE OFFLINE

Tujuan:
Membuat BanuaKita menjadi aplikasi Windows EXE. Saat EXE sudah selesai dibuat,
fitur Excel, Word, dan OCR bekerja dengan library lokal; tidak perlu koneksi
internet saat aplikasi digunakan.

PENTING:
Lingkungan build harus mempunyai internet SATU KALI untuk mengambil dependency,
Electron, dan model OCR. Setelah EXE selesai dibuat, aplikasi runtime dapat
bekerja offline.

LANGKAH DI WINDOWS:
1. Install Node.js LTS (disarankan Node 20+).
2. Buka Command Prompt / PowerShell di folder proyek ini.
3. Jalankan:
   npm install
   npm run prepare-vendor
4. Unduh model OCR Tesseract dan letakkan:
   vendor\\tesseract\\lang-data\\ind.traineddata.gz
   vendor\\tesseract\\lang-data\\eng.traineddata.gz
   Model dapat diperoleh dari tessdata Tesseract.js sesuai lisensinya.
5. Jalankan:
   npm run dist
6. Hasil Windows EXE/installer berada di folder dist\\.

SETELAH JADI EXE:
- Bisa dipakai tanpa internet untuk Data Penduduk, Import Excel, surat,
  cetak/simpan PDF melalui dialog cetak Windows, Word, template Word,
  dan OCR KTP selama semua aset vendor sudah ikut dipaketkan.
- Data aplikasi tetap menggunakan penyimpanan lokal komputer.

CATATAN:
File template Word desa bisa ditambahkan ke folder templates/ bila nanti ingin
ikut dibundel sebagai paket awal.
