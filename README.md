# Template Surat BanuaKita – Format Desa Pusar

Template di bawah ini dibuat berdasarkan dokumen Word resmi
**Desa Pusar, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu**.

## Cara memasang

1. Salin file `templates-seed.js` ke folder:
   ```
   BANUAKITA/database/templates-seed.js
   ```

2. Pastikan `main.js` memanggil seed (sudah ditambahkan):
   ```js
   require(path.join(__dirname, '..', 'database', 'templates-seed.js'))(db);
   ```

3. Restart aplikasi BanuaKita.
   Template akan otomatis masuk ke menu **Template Surat**.

4. Isi **Pengaturan Desa** agar kop surat benar:
   - Nama Desa: Pusar
   - Kecamatan: Baturaja Barat
   - Kabupaten: Ogan Komering Ulu
   - Provinsi: Sumatera Selatan
   - Kepala Desa: ZAINUDDIN
   - Alamat: Jalan Puyang Padang No 001 ...

## Daftar template yang diimpor

| Kode     | Nama Surat                                      |
|----------|-------------------------------------------------|
| 01       | Surat Keterangan Domisili                       |
| 04       | Surat Keterangan Pindah                         |
| 07       | Surat Keterangan Kelahiran                      |
| 08       | Surat Keterangan Kematian                       |
| 13       | Surat Keterangan Usaha (SKU)                    |
| 19       | Surat Keterangan Tidak Mampu (SKTM)             |
| 19-KIS   | Surat Keterangan Tidak Mampu (KIS)              |
| 19-KIP   | Surat Keterangan Tidak Mampu Pelajar (KIP)      |
| 48       | Surat Keterangan Kehilangan                     |

## Placeholder yang dipakai

`{{nama}}` `{{nik}}` `{{no_kk}}` `{{tempat_lahir}}` `{{tanggal_lahir}}`
`{{jenis_kelamin}}` `{{agama}}` `{{pekerjaan}}` `{{status_perkawinan}}`
`{{alamat}}` `{{rt}}` `{{rw}}` `{{desa}}` `{{kecamatan}}` `{{kabupaten}}`
`{{provinsi}}` `{{nomor_surat}}` `{{tanggal_surat}}`

Plus field khusus per jenis surat (mis. `{{nama_usaha}}`, `{{alamat_pindah}}`, dll).
Field khusus muncul di Form Dinamis saat membuat surat.
