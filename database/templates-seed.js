/**
 * Seed SEMUA template surat (01-80) — format resmi
 * Letakkan di: database/templates-seed.js
 */
module.exports = function seedTemplates(db) {
  if (!db) return;
  const templates = [
  {
    "kode": "01",
    "nama": "Surat Keterangan Domisili",
    "judul": "SURAT KETERANGAN DOMISILI",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "02",
    "nama": "Surat Keterangan Tempat Tinggal",
    "judul": "SURAT KETERANGAN TEMPAT TINGGAL",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "03",
    "nama": "Surat Keterangan Penduduk",
    "judul": "SURAT KETERANGAN PENDUDUK",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "04",
    "nama": "Surat Keterangan Pindah",
    "judul": "SURAT KETERANGAN PINDAH",
    "isi": "Menerangkan bahwa :\n\n1. Nama Lengkap              : {{nama}}\n2. Jenis Kelamin             : {{jenis_kelamin}}\n3. Tempat/Tgl. Lahir         : {{tempat_lahir}}, {{tanggal_lahir}}\n4. Kewarganegaraan           : Indonesia\n5. Agama                     : {{agama}}\n6. Pekerjaan                 : {{pekerjaan}}\n7. Alamat Asal               : {{alamat}}\n8. No. KK                    : {{no_kk}}\n9. No. KTP / NIK             : {{nik}}\n10. Alamat Pindah            : {{alamat_pindah}}\n11. Tanggal Pindah           : {{tanggal_pindah}}\n12. Alasan Pindah            : {{alasan_pindah}}\n13. Pengikut                 : {{pengikut}}\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "alamat_pindah",
        "Alamat Pindah",
        "TEXT"
      ],
      [
        "rt_pindah",
        "RT Tujuan",
        "TEXT"
      ],
      [
        "rw_pindah",
        "RW Tujuan",
        "TEXT"
      ],
      [
        "kecamatan_pindah",
        "Kecamatan Tujuan",
        "TEXT"
      ],
      [
        "kabupaten_pindah",
        "Kabupaten Tujuan",
        "TEXT"
      ],
      [
        "provinsi_pindah",
        "Provinsi Tujuan",
        "TEXT"
      ],
      [
        "tanggal_pindah",
        "Tanggal Pindah",
        "DATE"
      ],
      [
        "alasan_pindah",
        "Alasan Pindah",
        "TEXT"
      ],
      [
        "pengikut",
        "Pengikut",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "05",
    "nama": "Surat Pengantar Pindah",
    "judul": "SURAT PENGANTAR PINDAH",
    "isi": "Menerangkan bahwa :\n\n1. Nama Lengkap              : {{nama}}\n2. Jenis Kelamin             : {{jenis_kelamin}}\n3. Tempat/Tgl. Lahir         : {{tempat_lahir}}, {{tanggal_lahir}}\n4. Kewarganegaraan           : Indonesia\n5. Agama                     : {{agama}}\n6. Pekerjaan                 : {{pekerjaan}}\n7. Alamat Asal               : {{alamat}}\n8. No. KK                    : {{no_kk}}\n9. No. KTP / NIK             : {{nik}}\n10. Alamat Pindah            : {{alamat_pindah}}\n11. Tanggal Pindah           : {{tanggal_pindah}}\n12. Alasan Pindah            : {{alasan_pindah}}\n13. Pengikut                 : {{pengikut}}\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "alamat_pindah",
        "Alamat Pindah",
        "TEXT"
      ],
      [
        "rt_pindah",
        "RT Tujuan",
        "TEXT"
      ],
      [
        "rw_pindah",
        "RW Tujuan",
        "TEXT"
      ],
      [
        "kecamatan_pindah",
        "Kecamatan Tujuan",
        "TEXT"
      ],
      [
        "kabupaten_pindah",
        "Kabupaten Tujuan",
        "TEXT"
      ],
      [
        "provinsi_pindah",
        "Provinsi Tujuan",
        "TEXT"
      ],
      [
        "tanggal_pindah",
        "Tanggal Pindah",
        "DATE"
      ],
      [
        "alasan_pindah",
        "Alasan Pindah",
        "TEXT"
      ],
      [
        "pengikut",
        "Pengikut",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "06",
    "nama": "Surat Keterangan Datang",
    "judul": "SURAT KETERANGAN DATANG",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "alamat_asal",
        "Alamat Asal",
        "TEXT"
      ],
      [
        "tanggal_datang",
        "Tanggal Datang",
        "DATE"
      ],
      [
        "alasan_datang",
        "Alasan Datang",
        "TEXT"
      ],
      [
        "pengikut",
        "Pengikut",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "07",
    "nama": "Surat Keterangan Kelahiran",
    "judul": "SURAT KETERANGAN KELAHIRAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_ayah",
        "Nama Ayah",
        "TEXT"
      ],
      [
        "nama_ibu",
        "Nama Ibu",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "08",
    "nama": "Surat Keterangan Kematian",
    "judul": "SURAT KETERANGAN KEMATIAN",
    "isi": "Yang bertanda tangan dibawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nTempat/Tanggal Lahir        : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAlamat                      : {{alamat}}\n\nBenar nama tersebut diatas telah meninggal dunia karena {{sebab_kematian}} pada :\n\nTanggal                     : {{tanggal_meninggal}}\nHari                        : {{hari_meninggal}}\nPukul                       : {{pukul_meninggal}}\nBertempat di                : {{tempat_meninggal}}\n\nDan telah dimakamkan di :\n\nTempat                      : {{tempat_makam}}\nTanggal                     : {{tanggal_makam}}\n\nDemikianlah Surat Keterangan kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "sebab_kematian",
        "Sebab Kematian",
        "TEXT"
      ],
      [
        "tanggal_meninggal",
        "Tanggal Meninggal",
        "DATE"
      ],
      [
        "hari_meninggal",
        "Hari Meninggal",
        "TEXT"
      ],
      [
        "pukul_meninggal",
        "Pukul Meninggal",
        "TEXT"
      ],
      [
        "tempat_meninggal",
        "Tempat Meninggal",
        "TEXT"
      ],
      [
        "tempat_makam",
        "Tempat Makam",
        "TEXT"
      ],
      [
        "tanggal_makam",
        "Tanggal Makam",
        "DATE"
      ],
      [
        "hari_makam",
        "Hari Makam",
        "TEXT"
      ],
      [
        "pukul_makam",
        "Pukul Makam",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "09",
    "nama": "Surat Keterangan Belum Menikah",
    "judul": "SURAT KETERANGAN BELUM MENIKAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "10",
    "nama": "Surat Keterangan Status Perkawinan",
    "judul": "SURAT KETERANGAN STATUS PERKAWINAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "11",
    "nama": "Surat Keterangan Janda/Duda",
    "judul": "SURAT KETERANGAN JANDA/DUDA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "12",
    "nama": "Surat Keterangan Susunan Keluarga",
    "judul": "SURAT KETERANGAN SUSUNAN KELUARGA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "13",
    "nama": "Surat Keterangan Usaha (SKU)",
    "judul": "SURAT KETERANGAN USAHA (SKU)",
    "isi": "Kepala Desa {{desa}} dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nTempat Tanggal Lahir        : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nAlamat KTP                  : {{alamat}}\n\nMemang benar nama yang tersebut diatas mempunyai usaha yang bertempat di {{alamat_usaha}} dengan jenis usaha : {{nama_usaha}}.\n\nDemikian Surat Keterangan Usaha ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_usaha",
        "Nama / Jenis Usaha",
        "TEXT"
      ],
      [
        "alamat_usaha",
        "Alamat Usaha",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "14",
    "nama": "Surat Keterangan Penghasilan",
    "judul": "SURAT KETERANGAN PENGHASILAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\n\nMemang benar nama tersebut di atas mempunyai penghasilan sebagai berikut :\n\nPenghasilan Bulanan         : {{penghasilan_bulanan}}\nSumber Penghasilan          : {{sumber_penghasilan}}\n\nSurat keterangan ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "pekerjaan",
        "Pekerjaan",
        "TEXT"
      ],
      [
        "penghasilan_bulanan",
        "Penghasilan Bulanan",
        "TEXT"
      ],
      [
        "sumber_penghasilan",
        "Sumber Penghasilan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "15",
    "nama": "Surat Keterangan Tidak Mempunyai Penghasilan Tetap",
    "judul": "SURAT KETERANGAN TIDAK MEMPUNYAI PENGHASILAN TETAP",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "pekerjaan",
        "Pekerjaan",
        "TEXT"
      ],
      [
        "penghasilan_bulanan",
        "Penghasilan Bulanan",
        "TEXT"
      ],
      [
        "sumber_penghasilan",
        "Sumber Penghasilan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "16",
    "nama": "Surat Keterangan UMKM",
    "judul": "SURAT KETERANGAN UMKM",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_usaha",
        "Nama / Jenis Usaha",
        "TEXT"
      ],
      [
        "alamat_usaha",
        "Alamat Usaha",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "17",
    "nama": "Surat Rekomendasi Usaha",
    "judul": "SURAT REKOMENDASI USAHA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_usaha",
        "Nama / Jenis Usaha",
        "TEXT"
      ],
      [
        "alamat_usaha",
        "Alamat Usaha",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "18",
    "nama": "Surat Keterangan Pengajuan Kredit",
    "judul": "SURAT KETERANGAN PENGAJUAN KREDIT",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "pekerjaan",
        "Pekerjaan",
        "TEXT"
      ],
      [
        "penghasilan_bulanan",
        "Penghasilan Bulanan",
        "TEXT"
      ],
      [
        "sumber_penghasilan",
        "Sumber Penghasilan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "19",
    "nama": "Surat Keterangan Tidak Mampu (SKTM)",
    "judul": "SURAT KETERANGAN TIDAK MAMPU (SKTM)",
    "isi": "Yang bertanda tangan dibawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nJenis Kelamin               : {{jenis_kelamin}}\nTempat Tanggal Lahir        : {{tempat_lahir}}, {{tanggal_lahir}}\nAgama                       : {{agama}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\n\nMemang benar nama tersebut diatas adalah penduduk Desa {{desa}} dan menurut sepengetahuan kami tergolong Kurang/Tidak Mampu.\n\nKeperluan                   : {{keperluan}}\n\nDemikian Surat Keterangan ini kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "19-KIP",
    "nama": "Surat Keterangan Tidak Mampu Pelajar (KIP)",
    "judul": "SURAT KETERANGAN TIDAK MAMPU PELAJAR (KIP)",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_orang_tua",
        "Nama Orang Tua",
        "TEXT"
      ],
      [
        "nik_orang_tua",
        "NIK Orang Tua",
        "TEXT"
      ],
      [
        "ttl_orang_tua",
        "TTL Orang Tua",
        "TEXT"
      ],
      [
        "agama_orang_tua",
        "Agama Orang Tua",
        "TEXT"
      ],
      [
        "pekerjaan_orang_tua",
        "Pekerjaan Orang Tua",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "19-KIS",
    "nama": "Surat Keterangan Tidak Mampu (KIS)",
    "judul": "SURAT KETERANGAN TIDAK MAMPU (KIS)",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "20",
    "nama": "Surat Keterangan untuk Beasiswa",
    "judul": "SURAT KETERANGAN UNTUK BEASISWA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "21",
    "nama": "Surat Keterangan untuk Bantuan Sosial",
    "judul": "SURAT KETERANGAN UNTUK BANTUAN SOSIAL",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "22",
    "nama": "Surat Keterangan untuk BPJS",
    "judul": "SURAT KETERANGAN UNTUK BPJS",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "23",
    "nama": "Surat Keterangan Kondisi Ekonomi",
    "judul": "SURAT KETERANGAN KONDISI EKONOMI",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "24",
    "nama": "Surat Rekomendasi Bantuan",
    "judul": "SURAT REKOMENDASI BANTUAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "25",
    "nama": "Surat Keterangan sebagai Siswa",
    "judul": "SURAT KETERANGAN SEBAGAI SISWA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_sekolah",
        "Nama Sekolah / Kampus",
        "TEXT"
      ],
      [
        "jurusan",
        "Jurusan / Kelas",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "26",
    "nama": "Surat Keterangan sebagai Mahasiswa",
    "judul": "SURAT KETERANGAN SEBAGAI MAHASISWA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_sekolah",
        "Nama Sekolah / Kampus",
        "TEXT"
      ],
      [
        "jurusan",
        "Jurusan / Kelas",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "27",
    "nama": "Surat Keterangan Orang Tua",
    "judul": "SURAT KETERANGAN ORANG TUA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_anak",
        "Nama Anak",
        "TEXT"
      ],
      [
        "nik_anak",
        "NIK Anak",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "28",
    "nama": "Surat Rekomendasi Pendidikan",
    "judul": "SURAT REKOMENDASI PENDIDIKAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_sekolah",
        "Nama Sekolah / Kampus",
        "TEXT"
      ],
      [
        "jurusan",
        "Jurusan / Kelas",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "29",
    "nama": "Surat Pengantar Beasiswa",
    "judul": "SURAT PENGANTAR BEASISWA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_sekolah",
        "Nama Sekolah / Kampus",
        "TEXT"
      ],
      [
        "jurusan",
        "Jurusan / Kelas",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "30",
    "nama": "Surat Pengantar Nikah",
    "judul": "SURAT PENGANTAR NIKAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_pasangan",
        "Nama Pasangan",
        "TEXT"
      ],
      [
        "status_perkawinan",
        "Status Perkawinan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "31",
    "nama": "Surat Keterangan Wali Nikah",
    "judul": "SURAT KETERANGAN WALI NIKAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_pasangan",
        "Nama Pasangan",
        "TEXT"
      ],
      [
        "status_perkawinan",
        "Status Perkawinan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "32",
    "nama": "Surat Keterangan Status Perkawinan",
    "judul": "SURAT KETERANGAN STATUS PERKAWINAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_pasangan",
        "Nama Pasangan",
        "TEXT"
      ],
      [
        "status_perkawinan",
        "Status Perkawinan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "33",
    "nama": "Surat Keterangan Cerai",
    "judul": "SURAT KETERANGAN CERAI",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_pasangan",
        "Nama Pasangan",
        "TEXT"
      ],
      [
        "status_perkawinan",
        "Status Perkawinan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "34",
    "nama": "Surat Keterangan Ahli Waris",
    "judul": "SURAT KETERANGAN AHLI WARIS",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_almarhum",
        "Nama Almarhum/Almarhumah",
        "TEXT"
      ],
      [
        "hubungan_keluarga",
        "Hubungan Keluarga",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "35",
    "nama": "Surat Pernyataan Ahli Waris",
    "judul": "SURAT PERNYATAAN AHLI WARIS",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_almarhum",
        "Nama Almarhum/Almarhumah",
        "TEXT"
      ],
      [
        "hubungan_keluarga",
        "Hubungan Keluarga",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "36",
    "nama": "Surat Keterangan Hubungan Keluarga",
    "judul": "SURAT KETERANGAN HUBUNGAN KELUARGA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_almarhum",
        "Nama Almarhum/Almarhumah",
        "TEXT"
      ],
      [
        "hubungan_keluarga",
        "Hubungan Keluarga",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "37",
    "nama": "Surat Keterangan Penguburan",
    "judul": "SURAT KETERANGAN PENGUBURAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "sebab_kematian",
        "Sebab Kematian",
        "TEXT"
      ],
      [
        "tanggal_meninggal",
        "Tanggal Meninggal",
        "DATE"
      ],
      [
        "hari_meninggal",
        "Hari Meninggal",
        "TEXT"
      ],
      [
        "pukul_meninggal",
        "Pukul Meninggal",
        "TEXT"
      ],
      [
        "tempat_meninggal",
        "Tempat Meninggal",
        "TEXT"
      ],
      [
        "tempat_makam",
        "Tempat Makam",
        "TEXT"
      ],
      [
        "tanggal_makam",
        "Tanggal Makam",
        "DATE"
      ],
      [
        "hari_makam",
        "Hari Makam",
        "TEXT"
      ],
      [
        "pukul_makam",
        "Pukul Makam",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "38",
    "nama": "Surat Keterangan Tanah",
    "judul": "SURAT KETERANGAN TANAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "39",
    "nama": "Surat Keterangan Riwayat Tanah",
    "judul": "SURAT KETERANGAN RIWAYAT TANAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "40",
    "nama": "Surat Keterangan Tidak Sengketa",
    "judul": "SURAT KETERANGAN TIDAK SENGKETA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "41",
    "nama": "Surat Pernyataan Penguasaan Tanah",
    "judul": "SURAT PERNYATAAN PENGUASAAN TANAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "42",
    "nama": "Surat Pernyataan Batas Tanah",
    "judul": "SURAT PERNYATAAN BATAS TANAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "43",
    "nama": "Surat Keterangan Jual Beli Tanah",
    "judul": "SURAT KETERANGAN JUAL BELI TANAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "44",
    "nama": "Surat Keterangan Hibah Tanah",
    "judul": "SURAT KETERANGAN HIBAH TANAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "45",
    "nama": "Surat Keterangan Kepemilikan Tanah",
    "judul": "SURAT KETERANGAN KEPEMILIKAN TANAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "lokasi_tanah",
        "Lokasi Tanah",
        "TEXT"
      ],
      [
        "luas_tanah",
        "Luas Tanah",
        "TEXT"
      ],
      [
        "batas_utara",
        "Batas Utara",
        "TEXT"
      ],
      [
        "batas_selatan",
        "Batas Selatan",
        "TEXT"
      ],
      [
        "batas_timur",
        "Batas Timur",
        "TEXT"
      ],
      [
        "batas_barat",
        "Batas Barat",
        "TEXT"
      ],
      [
        "status_tanah",
        "Status Tanah",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "46",
    "nama": "Surat Pengantar SKCK",
    "judul": "SURAT PENGANTAR SKCK",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "47",
    "nama": "Surat Keterangan Kelakuan Baik",
    "judul": "SURAT KETERANGAN KELAKUAN BAIK",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "48",
    "nama": "Surat Keterangan Kehilangan",
    "judul": "SURAT KETERANGAN KEHILANGAN",
    "isi": "Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nTempat/Tgl Lahir            : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\n\nBenar yang tersebut namanya di atas adalah penduduk Desa {{desa}} dan telah kehilangan :\n\n{{barang_hilang}}\n\nNO. Dokumen                 : {{no_dokumen}}\n\nDemikianlah Surat Keterangan ini kami buat dengan sebenarnya. NB : Surat ini berlaku 14 hari setelah diterbitkan.",
    "fields": [
      [
        "barang_hilang",
        "Barang yang Hilang",
        "TEXT"
      ],
      [
        "no_dokumen",
        "No. Dokumen",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "49",
    "nama": "Surat Keterangan untuk Keperluan Tertentu",
    "judul": "SURAT KETERANGAN UNTUK KEPERLUAN TERTENTU",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "50",
    "nama": "Surat Pengantar",
    "judul": "SURAT PENGANTAR",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "51",
    "nama": "Surat Pernyataan",
    "judul": "SURAT PERNYATAAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "52",
    "nama": "Surat Kuasa",
    "judul": "SURAT KUASA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_penerima_kuasa",
        "Nama Penerima Kuasa",
        "TEXT"
      ],
      [
        "nik_penerima_kuasa",
        "NIK Penerima Kuasa",
        "TEXT"
      ],
      [
        "keperluan_kuasa",
        "Keperluan Kuasa",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "53",
    "nama": "Surat Rekomendasi",
    "judul": "SURAT REKOMENDASI",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "54",
    "nama": "Surat Undangan",
    "judul": "SURAT UNDANGAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "perihal",
        "Perihal",
        "TEXT"
      ],
      [
        "hari_acara",
        "Hari",
        "TEXT"
      ],
      [
        "tanggal_acara",
        "Tanggal",
        "DATE"
      ],
      [
        "waktu_acara",
        "Waktu",
        "TEXT"
      ],
      [
        "tempat_acara",
        "Tempat",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "55",
    "nama": "Surat Pemberitahuan",
    "judul": "SURAT PEMBERITAHUAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "perihal",
        "Perihal",
        "TEXT"
      ],
      [
        "hari_acara",
        "Hari",
        "TEXT"
      ],
      [
        "tanggal_acara",
        "Tanggal",
        "DATE"
      ],
      [
        "waktu_acara",
        "Waktu",
        "TEXT"
      ],
      [
        "tempat_acara",
        "Tempat",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "56",
    "nama": "Surat Edaran",
    "judul": "SURAT EDARAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "perihal",
        "Perihal",
        "TEXT"
      ],
      [
        "hari_acara",
        "Hari",
        "TEXT"
      ],
      [
        "tanggal_acara",
        "Tanggal",
        "DATE"
      ],
      [
        "waktu_acara",
        "Waktu",
        "TEXT"
      ],
      [
        "tempat_acara",
        "Tempat",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "57",
    "nama": "Surat Tugas",
    "judul": "SURAT TUGAS",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_petugas",
        "Nama yang Ditugaskan",
        "TEXT"
      ],
      [
        "jabatan_petugas",
        "Jabatan",
        "TEXT"
      ],
      [
        "tugas",
        "Uraian Tugas",
        "TEXT"
      ],
      [
        "lama_tugas",
        "Lama Tugas",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "58",
    "nama": "Surat Perintah",
    "judul": "SURAT PERINTAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_petugas",
        "Nama yang Ditugaskan",
        "TEXT"
      ],
      [
        "jabatan_petugas",
        "Jabatan",
        "TEXT"
      ],
      [
        "tugas",
        "Uraian Tugas",
        "TEXT"
      ],
      [
        "lama_tugas",
        "Lama Tugas",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "59",
    "nama": "Surat Keterangan Melaksanakan Tugas",
    "judul": "SURAT KETERANGAN MELAKSANAKAN TUGAS",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "nama_petugas",
        "Nama yang Ditugaskan",
        "TEXT"
      ],
      [
        "jabatan_petugas",
        "Jabatan",
        "TEXT"
      ],
      [
        "tugas",
        "Uraian Tugas",
        "TEXT"
      ],
      [
        "lama_tugas",
        "Lama Tugas",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "60",
    "nama": "Surat Rekomendasi Perangkat Desa",
    "judul": "SURAT REKOMENDASI PERANGKAT DESA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "61",
    "nama": "Surat Pengantar Dinas",
    "judul": "SURAT PENGANTAR DINAS",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "62",
    "nama": "Surat Undangan Rapat Desa",
    "judul": "SURAT UNDANGAN RAPAT DESA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "perihal",
        "Perihal",
        "TEXT"
      ],
      [
        "hari_acara",
        "Hari",
        "TEXT"
      ],
      [
        "tanggal_acara",
        "Tanggal",
        "DATE"
      ],
      [
        "waktu_acara",
        "Waktu",
        "TEXT"
      ],
      [
        "tempat_acara",
        "Tempat",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "63",
    "nama": "Surat Undangan Musyawarah Desa",
    "judul": "SURAT UNDANGAN MUSYAWARAH DESA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "perihal",
        "Perihal",
        "TEXT"
      ],
      [
        "hari_acara",
        "Hari",
        "TEXT"
      ],
      [
        "tanggal_acara",
        "Tanggal",
        "DATE"
      ],
      [
        "waktu_acara",
        "Waktu",
        "TEXT"
      ],
      [
        "tempat_acara",
        "Tempat",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "64",
    "nama": "Surat Panggilan",
    "judul": "SURAT PANGGILAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "perihal",
        "Perihal",
        "TEXT"
      ],
      [
        "hari_acara",
        "Hari",
        "TEXT"
      ],
      [
        "tanggal_acara",
        "Tanggal",
        "DATE"
      ],
      [
        "waktu_acara",
        "Waktu",
        "TEXT"
      ],
      [
        "tempat_acara",
        "Tempat",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "65",
    "nama": "Surat Keterangan Anggota BPD",
    "judul": "SURAT KETERANGAN ANGGOTA BPD",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "66",
    "nama": "Surat Keterangan Ketua RT/RW",
    "judul": "SURAT KETERANGAN KETUA RT/RW",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "67",
    "nama": "Surat Keterangan Pengurus Lembaga Desa",
    "judul": "SURAT KETERANGAN PENGURUS LEMBAGA DESA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "68",
    "nama": "Surat Rekomendasi Lembaga Desa",
    "judul": "SURAT REKOMENDASI LEMBAGA DESA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "69",
    "nama": "Surat Permohonan Bantuan",
    "judul": "SURAT PERMOHONAN BANTUAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "jenis_bantuan",
        "Jenis Bantuan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "70",
    "nama": "Surat Keterangan Penerima Bantuan",
    "judul": "SURAT KETERANGAN PENERIMA BANTUAN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "jenis_bantuan",
        "Jenis Bantuan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "71",
    "nama": "Surat Rekomendasi Bantuan Rumah",
    "judul": "SURAT REKOMENDASI BANTUAN RUMAH",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "jenis_bantuan",
        "Jenis Bantuan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "72",
    "nama": "Surat Keterangan Penerima BLT",
    "judul": "SURAT KETERANGAN PENERIMA BLT",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "jenis_bantuan",
        "Jenis Bantuan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "73",
    "nama": "Surat Keterangan Penerima Bantuan Desa",
    "judul": "SURAT KETERANGAN PENERIMA BANTUAN DESA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "jenis_bantuan",
        "Jenis Bantuan",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "74",
    "nama": "Surat Keterangan Bekerja",
    "judul": "SURAT KETERANGAN BEKERJA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "pekerjaan",
        "Pekerjaan",
        "TEXT"
      ],
      [
        "nama_instansi",
        "Nama Instansi",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "75",
    "nama": "Surat Keterangan Tidak Bekerja",
    "judul": "SURAT KETERANGAN TIDAK BEKERJA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "pekerjaan",
        "Pekerjaan",
        "TEXT"
      ],
      [
        "nama_instansi",
        "Nama Instansi",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "76",
    "nama": "Surat Keterangan Pensiun",
    "judul": "SURAT KETERANGAN PENSIUN",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "pekerjaan",
        "Pekerjaan",
        "TEXT"
      ],
      [
        "nama_instansi",
        "Nama Instansi",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "77",
    "nama": "Surat Keterangan Beda Nama",
    "judul": "SURAT KETERANGAN BEDA NAMA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "data_benar",
        "Data yang Benar",
        "TEXT"
      ],
      [
        "data_salah",
        "Data yang Salah / Tertulis",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "78",
    "nama": "Surat Keterangan Beda Tanggal Lahir",
    "judul": "SURAT KETERANGAN BEDA TANGGAL LAHIR",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "data_benar",
        "Data yang Benar",
        "TEXT"
      ],
      [
        "data_salah",
        "Data yang Salah / Tertulis",
        "TEXT"
      ],
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "79",
    "nama": "Surat Keterangan Identitas",
    "judul": "SURAT KETERANGAN IDENTITAS",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  },
  {
    "kode": "80",
    "nama": "Surat Keterangan Lainnya",
    "judul": "SURAT KETERANGAN LAINNYA",
    "isi": "Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa :\n\nNama                        : {{nama}}\nNIK                         : {{nik}}\nNo. KK                      : {{no_kk}}\nTempat / Tanggal Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}\nJenis Kelamin               : {{jenis_kelamin}}\nAgama                       : {{agama}}\nStatus Perkawinan           : {{status_perkawinan}}\nPekerjaan                   : {{pekerjaan}}\nAlamat                      : {{alamat}}\nRT / RW                     : {{rt}} / {{rw}}\n\nMemang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.\n\nSurat ini dibuat untuk keperluan : {{keperluan}}.\n\nDemikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    "fields": [
      [
        "keperluan",
        "Keperluan",
        "TEXT"
      ]
    ]
  }
];

  const findTpl = db.prepare('SELECT id FROM template_surat WHERE kode=?');
  const insertTpl = db.prepare(`INSERT INTO template_surat(kode,nama,judul,isi,ukuran_kertas,margin_atas,margin_bawah,margin_kiri,margin_kanan,aktif)
    VALUES(@kode,@nama,@judul,@isi,'A4',2,2,3,3,1)`);
  const updateTpl = db.prepare(`UPDATE template_surat SET nama=@nama,judul=@judul,isi=@isi,aktif=1 WHERE kode=@kode`);
  const findJenis = db.prepare('SELECT id FROM jenis_surat WHERE kode=?');
  const insertJenis = db.prepare(`INSERT INTO jenis_surat(kode,nama,kategori,aktif,field_json) VALUES(?,?, 'Administrasi Desa',1,?)`);
  const updateJenis = db.prepare(`UPDATE jenis_surat SET nama=?,aktif=1,field_json=? WHERE kode=?`);

  let added=0, updated=0;
  for (const t of templates) {
    const row = { kode: t.kode, nama: t.nama, judul: t.judul, isi: t.isi };
    if (findTpl.get(t.kode)) { updateTpl.run(row); updated++; }
    else { insertTpl.run(row); added++; }
    const fj = JSON.stringify((t.fields||[]).map(f => ({ field: f[0], label: f[1], tipe: f[2] })));
    if (findJenis.get(t.kode)) updateJenis.run(t.nama, fj, t.kode);
    else insertJenis.run(t.kode, t.nama, fj);
  }
  console.log('Template lengkap: '+added+' baru, '+updated+' diupdate.');
  return { added, updated };
};
