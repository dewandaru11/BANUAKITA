# BanuaKita - Panduan Build & Deploy Windows EXE

## Persyaratan Sistem

- **Node.js** v16+ (download dari https://nodejs.org/)
- **Windows** 7 atau lebih baru (untuk build .exe)
- **Git** (opsional, untuk clone repository)

## Langkah-Langkah Build

### 1. Persiapan Awal

```bash
# Clone atau download repository
git clone https://github.com/dewandaru11/BANUAKITA.git
cd BANUAKITA

# Bersihkan node_modules lama (jika ada)
rmdir /s /q node_modules
del package-lock.json
```

### 2. Install Dependencies

```bash
# Install semua dependencies
npm install

# Rebuild better-sqlite3 untuk Windows
npm run rebuild
```

Jika ada error saat rebuild, pastikan:
- Visual Studio Build Tools sudah terinstall
- Python 3.x sudah terinstall dan di PATH
- Jalankan Command Prompt sebagai Administrator

### 3. Test Aplikasi (Opsional)

```bash
# Test menjalankan aplikasi di mode development
npm start
```

Jika aplikasi berjalan normal, lanjut ke tahap build.

### 4. Build Windows EXE

**Option A: Build NSIS Installer (.exe dengan installer)**

```bash
npm run build
```

File hasil akan disimpan di folder `dist/`:
- `BanuaKita-1.0.0-x64.exe` (Installer 64-bit)
- `BanuaKita-1.0.0-ia32.exe` (Installer 32-bit)

**Option B: Build Portable Executable (Standalone .exe)**

```bash
npm run build-portable
```

File hasil:
- `BanuaKita-1.0.0-portable-x64.exe` (Portable 64-bit)
- `BanuaKita-1.0.0-portable-ia32.exe` (Portable 32-bit)

**Option C: Build Keduanya (Installer + Portable)**

```bash
npm run build-all
```

### 5. Verifikasi Hasil Build

Cek folder `dist/` apakah sudah ada file `.exe`:

```bash
dir dist
```

Harusnya ada file seperti:
```
BanuaKita-1.0.0-x64.exe
BanuaKita-1.0.0-ia32.exe
BanuaKita-1.0.0-portable-x64.exe
BanuaKita-1.0.0-portable-ia32.exe
```

### 6. Test File EXE

Dobel-klik file `.exe` di folder `dist/` untuk test aplikasi.

## Troubleshooting

### Error: "better-sqlite3 binary not found"

```bash
npm install --save-dev @electron/rebuild
npm run rebuild
```

### Error: "electron-builder tidak ditemukan"

```bash
npm install --save-dev electron-builder
```

### Build gagal dengan "ENOENT node-pre-gyp"

```bash
# Hapus node_modules dan install ulang
rmdir /s /q node_modules
npm cache clean --force
npm install
npm run rebuild
npm run build
```

### Aplikasi tidak bisa membuka database

Pastikan folder `database/` sudah ada dan file `schema.sql` ada di dalamnya.

## Optimasi Build Size

Untuk mengurangi ukuran file:

1. Gunakan `electron-builder` dengan compression
2. Hapus test files dari `files` di package.json
3. Minify JavaScript jika diperlukan

## Deploy ke Pengguna

### Untuk Installer (.exe NSIS):

1. Distribusikan file `BanuaKita-1.0.0-x64.exe`
2. Pengguna jalankan installer
3. Aplikasi akan terinstall di `C:\Program Files\BanuaKita\` atau path lain sesuai pilihan

### Untuk Portable (.exe):

1. Distribusikan file `BanuaKita-1.0.0-portable-x64.exe`
2. Pengguna bisa langsung jalankan tanpa install
3. Data aplikasi akan disimpan di `%APPDATA%\BanuaKita\`

## File Struktur Build

Setelah build sukses, folder `dist/` akan berisi:

```
dist/
├── BanuaKita-1.0.0-x64.exe          (Installer 64-bit)
├── BanuaKita-1.0.0-ia32.exe         (Installer 32-bit)
├── BanuaKita-1.0.0-portable-x64.exe (Portable 64-bit)
├── BanuaKita-1.0.0-portable-ia32.exe (Portable 32-bit)
└── builder-effective-config.yaml    (Build configuration)
```

## Backup Database

Sebelum deploy:
1. Buat backup folder `database/` 
2. Simpan copy di lokasi aman
3. Saat first run, aplikasi akan membuat database baru di user folder

## Update Versi

Untuk update versi aplikasi:

1. Edit `version` di `package.json`
2. Edit `version` di `src/main.js` (jika ada)
3. Jalankan `npm run build` lagi

## Support & Bug Report

Jika ada masalah:
1. Cek file log di folder aplikasi
2. Jalankan dengan flag debug: `npm run dev`
3. Report issue di GitHub repository

---

**Good luck! 🚀**
