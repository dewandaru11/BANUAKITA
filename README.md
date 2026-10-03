# APLIKASI DESA

Fondasi aplikasi EXE administrasi desa sesuai alur UI yang diberikan.

## Modul
1. Login: username/password + role Admin/Operator/Kepala Desa
2. Dashboard: surat hari ini/bulan ini, surat masuk, penduduk, draft, arsip
3. Penduduk: cari NIK/nama/KK, tambah/edit/nonaktifkan, import/export (fondasi)
4. Buat Surat: penduduk -> jenis -> form dinamis -> nomor -> simpan
5. Preview: kop, nomor, judul, isi, tanda tangan, stempel; cetak/PDF/Word
6. Arsip: filter dan preview/cetak ulang
7. Template: CRUD template, placeholder, A4/margin
8. Pengaturan: identitas desa, kepala desa, logo, stempel, tanda tangan, format nomor
9. Pengguna: akun dan role
10. Backup/Restore database

## Menjalankan
Install Node.js LTS, buka folder di VS Code, lalu:

```bash
npm install
npm start
```

## Membuat EXE
```bash
npm run build
```

Login awal: `admin` / `admin123`

Data 80 jenis surat dan field disimpan di `database/80_jenis_surat_dan_field.json`.
