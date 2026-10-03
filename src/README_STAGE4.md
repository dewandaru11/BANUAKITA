# Stage 4 - Template Surat Terhubung

Perubahan utama:

1. `template_surat.kode` dihubungkan ke `jenis_surat.kode`.
2. Halaman **Buat Surat** otomatis mencari template berdasarkan kode jenis surat.
3. Placeholder template diganti dengan data penduduk, pengaturan desa, dan field form.
4. Jika template belum tersedia, aplikasi tetap menampilkan format surat dasar.
5. Halaman Template sekarang memilih jenis surat dari daftar 80 jenis surat.
6. Template dapat diedit kembali.
7. Preview, Cetak, PDF, dan Word menggunakan hasil template.

## Cara memasang

Ganti file berikut di project:

- `src/main.js`
- `src/preload.js`
- `src/renderer/app.js`
- `src/renderer/style.css`

`index.html` tidak perlu diubah.

## Contoh template

```text
Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama            : {{nama}}
NIK             : {{nik}}
No. KK          : {{no_kk}}
Tempat/Tgl Lahir: {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin   : {{jenis_kelamin}}
Agama           : {{agama}}
Pekerjaan       : {{pekerjaan}}
Alamat          : {{alamat}}, RT {{rt}} / RW {{rw}}

{{keperluan}}

Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.
```

Kode template harus sama dengan kode pada `jenis_surat`.

Contoh:

```text
Jenis Surat:
kode = 001

Template:
kode = 001
```

Setelah mengganti file, jalankan:

```bash
npm start
```

Lalu:

1. Login.
2. Buka **Template Surat**.
3. Buat template untuk salah satu jenis surat.
4. Isi placeholder.
5. Buka **Buat Surat**.
6. Pilih jenis surat yang sama.
7. Isi form.
8. Klik **Preview**.

Catatan: isi surat resmi/legal tetap perlu disesuaikan dengan format yang digunakan oleh desa/instansi Anda. Kode ini menyediakan mesin template dan placeholder, bukan menentukan substansi hukum surat.
