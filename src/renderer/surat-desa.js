/* =========================================================
   BANUAKITA - Modul "Surat Desa" (gabungan UI & fungsi dari
   repo github.com/dewandaru11/BANUAKITA / folder "surat desa")
   Diadaptasi agar berjalan di dalam aplikasi Electron:
   - data penduduk & pengaturan desa diambil dari database (desaAPI)
   - cetak/PDF/Word memakai pipeline main process (bukan window.print)
   ========================================================= */

(function () {
  'use strict';

  const AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kepercayaan terhadap Tuhan YME', 'Lainnya'];
  const JK = ['Laki-laki', 'Perempuan'];
  const PEKERJAAN = ['Belum/Tidak Bekerja', 'Pelajar/Mahasiswa', 'Mengurus Rumah Tangga', 'Pensiunan', 'PNS', 'TNI', 'POLRI', 'Guru', 'Tenaga Kesehatan', 'Karyawan Swasta', 'Wiraswasta', 'Petani/Pekebun', 'Nelayan', 'Buruh Harian Lepas', 'Pedagang', 'Sopir', 'Perangkat Desa', 'Lainnya'];
  const STATUS_KAWIN = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];

  /* ---------- Definisi jenis surat bawaan modul Surat Desa ---------- */
  window.SURAT_DESA_TYPES = {
    domisili: {
      title: 'SURAT KETERANGAN DOMISILI', numberPrefix: '140/', numberSuffix: '/SKD/DSP-BB/',
      fields: [
        ['nama', 'Nama', 'text', true],
        ['nik', 'NIK', 'text', true],
        ['ttl', 'Tempat, tanggal lahir', 'text', true],
        ['jk', 'Jenis kelamin', 'select', true, JK],
        ['agama', 'Agama', 'select', true, AGAMA],
        ['alamat', 'Alamat lengkap', 'textarea', true],
        ['domisili', 'Alamat/tempat domisili', 'textarea', true],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false],
        ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `
        <p>Dengan ini menerangkan bahwa:</p>
        ${rows([['Nama', d.nama], ['NIK', d.nik], ['Tempat Tanggal Lahir', d.ttl],
          ['Jenis Kelamin', d.jk], ['Agama', d.agama], ['Alamat', d.alamat]])}
        <p>Memang benar nama tersebut di atas adalah warga Desa ${esc(k.desa)} yang berdomisili di
        <strong>${esc(d.domisili)}</strong>, Kecamatan ${esc(k.kecamatan)}, Kabupaten ${esc(k.kabupaten)}.</p>
        <p>Demikian surat keterangan domisili ini kami buat dengan sebenarnya untuk dipergunakan seperlunya.</p>`
    },
    kematian: {
      title: 'SURAT KETERANGAN KEMATIAN', numberPrefix: '140/', numberSuffix: '/SKK/DSP-BB/',
      fields: [
        ['nama', 'Nama almarhum/almarhumah', 'text', true],
        ['ttl', 'Tempat/tanggal lahir', 'text', true],
        ['jk', 'Jenis kelamin', 'select', true, JK],
        ['alamat', 'Alamat', 'textarea', true],
        ['tanggalMeninggal', 'Tanggal meninggal', 'date', true],
        ['hariMeninggal', 'Hari meninggal', 'text', true],
        ['pukulMeninggal', 'Pukul meninggal', 'text', true],
        ['tempatMeninggal', 'Tempat meninggal', 'text', true],
        ['pemakaman', 'Tempat pemakaman', 'text', true],
        ['tanggalMakam', 'Tanggal pemakaman', 'date', true],
        ['hariMakam', 'Hari pemakaman', 'text', true],
        ['pukulMakam', 'Pukul pemakaman', 'text', true],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false],
        ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `
        <p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)} Kecamatan ${esc(k.kecamatan)} Kabupaten ${esc(k.kabupaten)}, dengan ini menerangkan bahwa:</p>
        ${rows([['Nama', d.nama], ['Tempat/Tanggal Lahir', d.ttl], ['Jenis Kelamin', d.jk], ['Alamat', d.alamat]])}
        <p>Benar nama tersebut di atas telah meninggal dunia karena sakit pada:</p>
        ${rows([['Tanggal', fmtDate(d.tanggalMeninggal)], ['Hari', d.hariMeninggal], ['Pukul', d.pukulMeninggal], ['Bertempat di', d.tempatMeninggal]])}
        <p>Dan telah dimakamkan di:</p>
        ${rows([['Tempat', d.pemakaman], ['Tanggal', fmtDate(d.tanggalMakam)], ['Hari', d.hariMakam], ['Pukul', d.pukulMakam]])}
        <p>Demikianlah surat keterangan kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.</p>`
    },
    kehilangan_kk: {
      title: 'SURAT KETERANGAN KEHILANGAN', numberPrefix: '140/', numberSuffix: '/SKK/DSP-BB/',
      fields: [
        ['nama', 'Nama', 'text', true],
        ['nik', 'NIK', 'text', true],
        ['ttl', 'Tempat/tanggal lahir', 'text', true],
        ['agama', 'Agama', 'select', true, AGAMA],
        ['jk', 'Jenis kelamin', 'select', true, JK],
        ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN],
        ['alamat', 'Alamat', 'textarea', true],
        ['penduduk', 'Desa/kelurahan tempat terdaftar', 'text', true],
        ['namaPemilikKK', 'Nama pada Kartu Keluarga', 'text', true],
        ['noKK', 'Nomor Kartu Keluarga (KK)', 'text', true],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false],
        ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Desa Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `
        <p>Kepala Desa ${esc(k.desa)} Kecamatan ${esc(k.kecamatan)} Kabupaten ${esc(k.kabupaten)} dengan ini menerangkan bahwa:</p>
        ${rows([['Nama', d.nama], ['NIK', d.nik], ['Tempat/Tgl Lahir', d.ttl], ['Agama', d.agama],
          ['Jenis Kelamin', d.jk], ['Pekerjaan', d.pekerjaan], ['Alamat', d.alamat]])}
        <p>Benar yang tersebut namanya di atas adalah penduduk <strong>${esc(d.penduduk)}</strong>, Kecamatan ${esc(k.kecamatan)}, Kabupaten ${esc(k.kabupaten)} dan selanjutnya dapat kami terangkan bahwa yang bersangkutan telah kehilangan:</p>
        <p><strong>KARTU KELUARGA (KK)</strong></p>
        ${rows([['Atas Nama', d.namaPemilikKK], ['No. KK', d.noKK]])}
        <p>Demikianlah surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan seperlunya.</p>`
    },
    kehilangan_ktp: {
      title: 'SURAT KETERANGAN KEHILANGAN KTP', numberPrefix: '140/', numberSuffix: '/SKKTP/DSP-BB/',
      fields: [
        ['nama', 'Nama', 'text', true],
        ['nik', 'NIK', 'text', true],
        ['noKK', 'Nomor KK', 'text', false],
        ['ttl', 'Tempat/tanggal lahir', 'text', true],
        ['jk', 'Jenis kelamin', 'select', true, JK],
        ['agama', 'Agama', 'select', true, AGAMA],
        ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN],
        ['alamat', 'Alamat', 'textarea', true],
        ['penduduk', 'Desa/kelurahan tempat terdaftar', 'text', true],
        ['keperluan', 'Keperluan', 'text', true],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false],
        ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `
        <p>Kepala Desa ${esc(k.desa)} Kecamatan ${esc(k.kecamatan)} Kabupaten ${esc(k.kabupaten)}, dengan ini menerangkan dengan sebenarnya bahwa:</p>
        ${rows([['Nama', d.nama], ['No. KK', d.noKK], ['NIK', d.nik], ['Tempat, Tgl. Lahir', d.ttl], ['Jenis Kelamin', d.jk], ['Agama', d.agama], ['Alamat', d.alamat]])}
        <p>Benar nama tersebut di atas adalah penduduk ${esc(d.penduduk || k.desa)} dan selanjutnya dapat kami terangkan bahwa KARTU TANDA PENDUDUK (KTP) yang bersangkutan hilang.</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>`
    },
    kis: {
      title: 'SURAT KETERANGAN TIDAK MAMPU (KIS)', numberPrefix: '140/', numberSuffix: '/SKTM/DSP-BB/',
      fields: [
        ['nama', 'Nama', 'text', true],
        ['nik', 'NIK', 'text', true],
        ['noKK', 'Nomor KK', 'text', false],
        ['jk', 'Jenis kelamin', 'select', true, JK],
        ['ttl', 'Tempat/tanggal lahir', 'text', true],
        ['agama', 'Agama', 'select', true, AGAMA],
        ['alamat', 'Alamat', 'textarea', true],
        ['domisili', 'Keterangan tempat tinggal', 'textarea', true],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false],
        ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)} Kecamatan ${esc(k.kecamatan)} Kabupaten ${esc(k.kabupaten)} menerangkan bahwa:</p>
        ${rows([['Nama', d.nama], ['NIK', d.nik], ['No. KK', d.noKK], ['Jenis Kelamin', d.jk], ['Tempat/Tgl Lahir', d.ttl], ['Agama', d.agama], ['Alamat', d.alamat]])}
        <p>Benar yang bersangkutan adalah penduduk Desa ${esc(k.desa)} dan berdomisili ${esc(d.domisili)} serta menurut pengetahuan kami dalam keadaan tidak mampu dan belum pernah mendapatkan program kesehatan atau asuransi lainnya. Surat ini dibuat untuk mendapatkan Kartu Indonesia Sehat (KIS).</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan seperlunya.</p>`
    },
    kip: {
      title: 'SURAT KETERANGAN TIDAK MAMPU PELAJAR (KIP)', numberPrefix: '140/', numberSuffix: '/SKTM/DSP-BB/',
      fields: [
        ['nama', 'Nama lengkap orang tua/wali', 'text', true],
        ['nik', 'NIK orang tua/wali', 'text', true],
        ['ttl', 'Tempat/tanggal lahir orang tua/wali', 'text', true],
        ['agama', 'Agama', 'select', true, AGAMA],
        ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN],
        ['alamat', 'Alamat tempat tinggal', 'textarea', true],
        ['namaAnak', 'Nama anak/pelajar', 'text', true],
        ['nikAnak', 'NIK anak/pelajar', 'text', false],
        ['ttlAnak', 'Tempat/tanggal lahir anak', 'text', false],
        ['agamaAnak', 'Agama anak', 'text', false],
        ['pekerjaanAnak', 'Pekerjaan/status anak', 'select', false, PEKERJAAN],
        ['alamatAnak', 'Alamat anak', 'textarea', false],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false],
        ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini, Kepala Desa ${esc(k.desa)} Kecamatan ${esc(k.kecamatan)} Kabupaten ${esc(k.kabupaten)}, menerangkan dengan sesungguhnya bahwa:</p>
        ${rows([['Nama Lengkap', d.nama], ['NIK', d.nik], ['Tempat/Tanggal Lahir', d.ttl], ['Agama', d.agama], ['Pekerjaan', d.pekerjaan], ['Alamat Tempat Tinggal', d.alamat]])}
        <p>Orang tua dari:</p>${rows([['Nama Lengkap', d.namaAnak], ['NIK', d.nikAnak], ['Tempat/Tanggal Lahir', d.ttlAnak], ['Agama', d.agamaAnak], ['Status/Pekerjaan', d.pekerjaanAnak], ['Alamat', d.alamatAnak]])}
        <p>Yang bersangkutan benar penduduk dan berdomisili di Desa ${esc(k.desa)}, tergolong keluarga tidak mampu dan belum memiliki Kartu Indonesia Pintar (KIP). Surat ini dipergunakan untuk keperluan sekolah.</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan seperlunya.</p>`
    },
    sktm: {
      title: 'SURAT KETERANGAN TIDAK MAMPU (SKTM)', numberPrefix: '140/', numberSuffix: '/SKTM/DSP-BB/',
      fields: [
        ['nama', 'Nama lengkap', 'text', true],
        ['nik', 'NIK', 'text', true],
        ['jk', 'Jenis kelamin', 'select', true, JK],
        ['ttl', 'Tempat/tanggal lahir', 'text', true],
        ['kewarganegaraan', 'Kewarganegaraan', 'text', true, 'Indonesia'],
        ['agama', 'Agama', 'select', true, AGAMA],
        ['statusKawin', 'Status perkawinan', 'select', true, STATUS_KAWIN],
        ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN],
        ['alamat', 'Alamat', 'textarea', true],
        ['keterangan', 'Keterangan tambahan', 'textarea', false],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false],
        ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)} Kecamatan ${esc(k.kecamatan)} Kabupaten ${esc(k.kabupaten)} menerangkan bahwa:</p>
        ${rows([['Nama', d.nama], ['NIK', d.nik], ['Jenis Kelamin', d.jk], ['Tempat/Tanggal Lahir', d.ttl], ['Kewarganegaraan', d.kewarganegaraan], ['Agama', d.agama], ['Status Perkawinan', d.statusKawin], ['Pekerjaan', d.pekerjaan], ['Alamat', d.alamat]])}
        <p>Benar nama tersebut di atas adalah penduduk Desa ${esc(k.desa)} dan menurut sepengetahuan kami tergolong kurang/tidak mampu. ${esc(d.keterangan)}</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.</p>`
    },
    usaha: {
      title: 'SURAT KETERANGAN USAHA', numberPrefix: '140/', numberSuffix: '/SKU/DSP-BB/',
      fields: [
        ['nama', 'Nama', 'text', true], ['nik', 'NIK', 'text', true], ['ttl', 'Tempat/tanggal lahir', 'text', true],
        ['jk', 'Jenis kelamin', 'select', true, JK], ['agama', 'Agama', 'select', true, AGAMA],
        ['alamat', 'Alamat KTP/tempat tinggal', 'textarea', true], ['tempatUsaha', 'Tempat usaha', 'text', true],
        ['alamatUsaha', 'Alamat usaha', 'textarea', true], ['jenisUsaha', 'Jenis usaha', 'text', true],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `<p>Kepala Desa ${esc(k.desa)} dengan ini menerangkan bahwa:</p>
        ${rows([['Nama', d.nama], ['NIK', d.nik], ['Tempat Tanggal Lahir', d.ttl], ['Jenis Kelamin', d.jk], ['Agama', d.agama], ['Alamat KTP', d.alamat]])}
        <p>Memang benar nama yang tersebut di atas mempunyai usaha <strong>${esc(d.jenisUsaha)}</strong> yang bertempat di ${esc(d.tempatUsaha)}, beralamat ${esc(d.alamatUsaha)}.</p>
        <p>Demikian Surat Keterangan Usaha ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>`
    },
    pindah: {
      title: 'SURAT KETERANGAN PINDAH PENDUDUK', numberPrefix: '140/', numberSuffix: '/SKPP/DSP-BB/',
      fields: [
        ['nama', 'Nama lengkap', 'text', true], ['jk', 'Jenis kelamin', 'select', true, JK],
        ['ttl', 'Tempat/tanggal lahir', 'text', true], ['kewarganegaraan', 'Kewarganegaraan', 'text', true, 'Indonesia'],
        ['agama', 'Agama', 'select', true, AGAMA], ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN],
        ['pendidikan', 'Pendidikan', 'text', true],
        ['alamat', 'Alamat asal', 'textarea', true], ['noKK', 'Nomor KK', 'text', true], ['nik', 'Nomor KTP/NIK', 'text', true],
        ['alamatPindah', 'Alamat pindah', 'textarea', true], ['rtRw', 'RT/RW tujuan', 'text', false], ['kecamatanTujuan', 'Kecamatan tujuan', 'text', true],
        ['kabupatenTujuan', 'Kabupaten/kota tujuan', 'text', true], ['provinsiTujuan', 'Provinsi tujuan', 'text', true],
        ['tanggalPindah', 'Tanggal pindah', 'date', true], ['alasanPindah', 'Alasan pindah', 'text', true],
        ['pengikut', 'Nama pengikut/anggota keluarga', 'textarea', false],
        ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false],
        ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'],
        ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: d => `<p>Yang mengajukan pindah dengan data sebagai berikut:</p>
        ${rows([['Nama Lengkap', d.nama], ['Jenis Kelamin', d.jk], ['Tempat/Tgl Lahir', d.ttl], ['Kewarganegaraan', d.kewarganegaraan], ['Agama', d.agama], ['Pekerjaan', d.pekerjaan], ['Pendidikan', d.pendidikan], ['Alamat Asal', d.alamat], ['No. KK', d.noKK], ['No. KTP/NIK', d.nik], ['Alamat Pindah', d.alamatPindah], ['RT/RW', d.rtRw], ['Kecamatan', d.kecamatanTujuan], ['Kabupaten', d.kabupatenTujuan], ['Provinsi', d.provinsiTujuan], ['Tanggal Pindah', fmtDate(d.tanggalPindah)], ['Alasan Pindah', d.alasanPindah], ['Pengikut', d.pengikut]])}
        <p>Demikian surat keterangan pindah ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    imunisasi_catin: {
      title: 'SURAT PENGANTAR IMUNISASI CATIN', numberPrefix: 'B-', numberSuffix: '/HLN/400.7.7.2/',
      fields: [
        ['nama', 'Nama calon pengantin wanita', 'text', true], ['nik', 'NIK', 'text', true], ['ttl', 'Tempat/tanggal lahir', 'text', true],
        ['umur', 'Umur (tahun)', 'number', true], ['agama', 'Agama', 'select', true, AGAMA], ['jk', 'Jenis kelamin', 'select', true, ['Perempuan']],
        ['pendidikan', 'Pendidikan', 'text', true], ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN], ['status', 'Status', 'select', true, STATUS_KAWIN],
        ['alamat', 'Alamat/tempat tinggal', 'textarea', true], ['keperluan', 'Keperluan', 'text', true, 'Untuk menikah'],
        ['berlaku', 'Masa berlaku surat', 'text', true], ['golonganDarah', 'Golongan darah', 'text', false],
        ['namaCalonSuami', 'Nama calon suami', 'text', true], ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false],
        ['bulanNomor', 'Bulan pada nomor surat', 'text', false], ['tahunNomor', 'Tahun pada nomor surat', 'number', false, '2026'],
        ['tempatTerbit', 'Dibuat di', 'text', true, 'Halangan'], ['tanggalTerbit', 'Tanggal surat', 'date', true]
      ],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)}, dengan ini memohon bantuan tenaga kesehatan agar dapat memberikan Imunisasi T2 (Tetanus Toxoid) kepada calon pengantin wanita dengan biodata sebagai berikut:</p>
        ${rows([['Nama', d.nama], ['NIK', d.nik], ['Tempat/Tanggal Lahir', d.ttl], ['Umur', d.umur + ' tahun'], ['Agama', d.agama], ['Jenis Kelamin', d.jk], ['Pendidikan', d.pendidikan], ['Pekerjaan', d.pekerjaan], ['Status', d.status], ['Alamat/Tempat Tinggal', d.alamat], ['Keperluan', d.keperluan], ['Berlaku', d.berlaku], ['Golongan Darah', d.golonganDarah], ['Nama Calon Suami', d.namaCalonSuami]])}
        <p>Demikian surat pengantar ini dibuat. Atas perhatian dan bantuannya diucapkan terima kasih.</p>`
    },
    kelahiran: {
      title: 'SURAT KETERANGAN KELAHIRAN', numberPrefix: '140/', numberSuffix: '/SKL/DSP-BB/',
      fields: [['namaAnak', 'Nama anak yang lahir', 'text', true], ['jkAnak', 'Jenis kelamin anak', 'select', true, JK], ['tanggalLahir', 'Tanggal lahir', 'date', true], ['pukulLahir', 'Pukul lahir', 'text', true], ['tempatLahir', 'Tempat lahir', 'text', true], ['namaAyah', 'Nama ayah', 'text', true], ['nikAyah', 'NIK ayah', 'text', false], ['namaIbu', 'Nama ibu', 'text', true], ['nikIbu', 'NIK ibu', 'text', false], ['alamat', 'Alamat orang tua', 'textarea', true], ['namaPelapor', 'Nama pelapor', 'text', true], ['hubunganPelapor', 'Hubungan dengan anak', 'text', true], ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false], ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'], ['tanggalTerbit', 'Tanggal surat', 'date', true]],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)}, Kecamatan ${esc(k.kecamatan)}, Kabupaten ${esc(k.kabupaten)}, menerangkan bahwa berdasarkan keterangan yang disampaikan kepada kami telah lahir seorang anak:</p>${rows([['Nama anak', d.namaAnak], ['Jenis kelamin', d.jkAnak], ['Hari/tanggal lahir', fmtDate(d.tanggalLahir)], ['Pukul', d.pukulLahir], ['Tempat lahir', d.tempatLahir], ['Nama ayah', d.namaAyah], ['NIK ayah', d.nikAyah], ['Nama ibu', d.namaIbu], ['NIK ibu', d.nikIbu], ['Alamat orang tua', d.alamat], ['Nama pelapor', d.namaPelapor], ['Hubungan dengan anak', d.hubunganPelapor]])}<p>Surat keterangan ini dibuat berdasarkan keterangan pemohon dan perlu disesuaikan dengan dokumen pendukung serta ketentuan yang berlaku.</p><p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    tugas_puskesmas: {
      title: 'SURAT TUGAS KE PUSKESMAS', numberPrefix: '140/', numberSuffix: '/ST/DSP-BB/',
      fields: [['nama', 'Nama petugas/yang ditugaskan', 'text', true], ['nik', 'NIK', 'text', false], ['jabatan', 'Jabatan', 'text', true], ['instansi', 'Instansi/asal', 'text', true], ['tujuan', 'Tujuan Puskesmas', 'text', true], ['keperluan', 'Keperluan/tugas', 'textarea', true], ['tanggalMulai', 'Tanggal mulai', 'date', true], ['tanggalSelesai', 'Tanggal selesai', 'date', true], ['catatan', 'Catatan tambahan', 'textarea', false], ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false], ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'], ['tanggalTerbit', 'Tanggal surat', 'date', true]],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)}, Kecamatan ${esc(k.kecamatan)}, Kabupaten ${esc(k.kabupaten)}, menugaskan kepada:</p>${rows([['Nama', d.nama], ['NIK', d.nik], ['Jabatan', d.jabatan], ['Instansi/asal', d.instansi]])}<p>Untuk melaksanakan tugas/keperluan <strong>${esc(d.keperluan)}</strong> di ${esc(d.tujuan)}, pada tanggal ${fmtDate(d.tanggalMulai)} sampai dengan ${fmtDate(d.tanggalSelesai)}.</p>${d.catatan ? `<p>Catatan: ${esc(d.catatan)}</p>` : ''}<p>Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan dipergunakan sebagaimana mestinya.</p>`
    },
    nikah_laki: {
      title: 'SURAT PENGANTAR NIKAH (LAKI-LAKI)', numberPrefix: '140/', numberSuffix: '/SPN/DSP-BB/',
      fields: [['nama', 'Nama lengkap calon pengantin', 'text', true], ['nik', 'NIK', 'text', true], ['noKK', 'Nomor KK', 'text', false], ['ttl', 'Tempat/tanggal lahir', 'text', true], ['jk', 'Jenis kelamin', 'select', true, ['Laki-laki']], ['kewarganegaraan', 'Kewarganegaraan', 'text', true, 'Indonesia'], ['agama', 'Agama', 'select', true, AGAMA], ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN], ['statusKawin', 'Status perkawinan', 'select', true, STATUS_KAWIN], ['alamat', 'Alamat', 'textarea', true], ['namaPasangan', 'Nama calon istri', 'text', true], ['alamatPasangan', 'Alamat calon istri', 'textarea', false], ['keperluan', 'Keperluan', 'text', true, 'Pengantar pencatatan nikah'], ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false], ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'], ['tanggalTerbit', 'Tanggal surat', 'date', true]],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)}, Kecamatan ${esc(k.kecamatan)}, Kabupaten ${esc(k.kabupaten)}, menerangkan data calon pengantin laki-laki sebagai berikut:</p>${rows([['Nama', d.nama], ['NIK', d.nik], ['Nomor KK', d.noKK], ['Tempat/tanggal lahir', d.ttl], ['Jenis kelamin', d.jk], ['Kewarganegaraan', d.kewarganegaraan], ['Agama', d.agama], ['Pekerjaan', d.pekerjaan], ['Status perkawinan', d.statusKawin], ['Alamat', d.alamat], ['Nama calon istri', d.namaPasangan], ['Alamat calon istri', d.alamatPasangan]])}<p>Surat pengantar ini dibuat untuk keperluan ${esc(d.keperluan)}. Data dan persyaratan tetap harus diverifikasi oleh instansi yang berwenang.</p><p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    nikah_perempuan: {
      title: 'SURAT PENGANTAR NIKAH (PEREMPUAN)', numberPrefix: '140/', numberSuffix: '/SPN/DSP-BB/',
      fields: [['nama', 'Nama lengkap calon pengantin', 'text', true], ['nik', 'NIK', 'text', true], ['noKK', 'Nomor KK', 'text', false], ['ttl', 'Tempat/tanggal lahir', 'text', true], ['jk', 'Jenis kelamin', 'select', true, ['Perempuan']], ['kewarganegaraan', 'Kewarganegaraan', 'text', true, 'Indonesia'], ['agama', 'Agama', 'select', true, AGAMA], ['pekerjaan', 'Pekerjaan', 'select', true, PEKERJAAN], ['statusKawin', 'Status perkawinan', 'select', true, STATUS_KAWIN], ['alamat', 'Alamat', 'textarea', true], ['namaPasangan', 'Nama calon suami', 'text', true], ['alamatPasangan', 'Alamat calon suami', 'textarea', false], ['keperluan', 'Keperluan', 'text', true, 'Pengantar pencatatan nikah'], ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false], ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'], ['tanggalTerbit', 'Tanggal surat', 'date', true]],
      body: (d, k) => `<p>Yang bertanda tangan di bawah ini Kepala Desa ${esc(k.desa)}, Kecamatan ${esc(k.kecamatan)}, Kabupaten ${esc(k.kabupaten)}, menerangkan data calon pengantin perempuan sebagai berikut:</p>${rows([['Nama', d.nama], ['NIK', d.nik], ['Nomor KK', d.noKK], ['Tempat/tanggal lahir', d.ttl], ['Jenis kelamin', d.jk], ['Kewarganegaraan', d.kewarganegaraan], ['Agama', d.agama], ['Pekerjaan', d.pekerjaan], ['Status perkawinan', d.statusKawin], ['Alamat', d.alamat], ['Nama calon suami', d.namaPasangan], ['Alamat calon suami', d.alamatPasangan]])}<p>Surat pengantar ini dibuat untuk keperluan ${esc(d.keperluan)}. Data dan persyaratan tetap harus diverifikasi oleh instansi yang berwenang.</p><p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    undangan_beasiswa: {
      title: 'UNDANGAN PENYERAHAN BEASISWA BERPRESTASI', numberPrefix: '005/', numberSuffix: '/UND/DSP-BB/',
      fields: [['namaPenerima', 'Nama penerima/undangan', 'text', true], ['alamat', 'Alamat penerima', 'textarea', false], ['namaKegiatan', 'Nama kegiatan', 'text', true, 'Penyerahan Beasiswa Berprestasi'], ['hariTanggal', 'Hari/tanggal kegiatan', 'text', true], ['waktu', 'Waktu', 'text', true], ['tempat', 'Tempat kegiatan', 'text', true], ['catatan', 'Catatan/persyaratan', 'textarea', false], ['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false], ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', true, 'Pusar'], ['tanggalTerbit', 'Tanggal surat', 'date', true]],
      body: d => `<p>Kepada Yth. ${esc(d.namaPenerima)}${d.alamat ? `<br>${esc(d.alamat)}` : ''}</p><p>Dengan hormat, sehubungan dengan kegiatan <strong>${esc(d.namaKegiatan)}</strong>, kami mengundang Saudara/i untuk hadir pada:</p>${rows([['Hari/tanggal', d.hariTanggal], ['Waktu', d.waktu], ['Tempat', d.tempat]])}${d.catatan ? `<p>Catatan: ${esc(d.catatan)}</p>` : ''}<p>Demikian undangan ini disampaikan. Atas kehadiran dan perhatiannya kami ucapkan terima kasih.</p>`
    }
  };

  /* ---------- Util umum ---------- */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }
  function rows(items) {
    return `<table>${items.map(([label, value]) =>
      `<tr><td>${esc(label)}</td><td>: ${esc(value || '................................')}</td></tr>`
    ).join('')}</table>`;
  }
  function fmtDate(value) {
    if (!value) return '';
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  window.esc = window.esc || esc;
  window.suratDesaRows = rows;
  window.suratDesaFmtDate = fmtDate;

  /* ---------- Kop surat: default mengikuti file "surat desa", ---------- */
  /* ---------- disinkron dengan Pengaturan Desa (database) ------------- */
  const SURAT_DESA_DEFAULT_KOP = {
    kabupaten: 'PEMERINTAH KABUPATEN OGAN KOMERING ULU',
    kecamatan: 'KECAMATAN BATURAJA BARAT',
    desa: 'DESA PUSAR',
    alamat: 'Jalan Puyang Padang No 001 Baturaja Kab. Ogan Komering Ulu, Provinsi Sumatera Selatan',
    kontak: 'Email: desapusar@okukab.go.id | Website: https://pusar.okukab.go.id',
    kepala: 'ZAINUDDIN'
  };

  let kop = Object.assign({}, SURAT_DESA_DEFAULT_KOP);
  let settingsSynced = false;

  async function syncKopFromSettings(force) {
    if (settingsSynced && !force) return;
    try {
      if (window.desaAPI && window.desaAPI.settings) {
        const s = await window.desaAPI.settings.get() || {};
        const up = v => String(v || '').trim().toUpperCase();
        if (s.kabupaten) kop.kabupaten = 'PEMERINTAH KABUPATEN ' + up(s.kabupaten);
        if (s.kecamatan) kop.kecamatan = 'KECAMATAN ' + up(s.kecamatan);
        if (s.nama_desa) kop.desa = 'DESA ' + up(s.nama_desa);
        const alamat = s.alamat || SURAT_DESA_DEFAULT_KOP.alamat;
        kop.alamat = alamat + (s.kode_pos ? ', Kode Pos ' + s.kode_pos : '');
        if (s.kepala_desa) kop.kepala = s.kepala_desa;
        settingsSynced = true;
      }
    } catch (e) { /* jalankan dengan kop default */ }
  }

  window.banuakitaUpdateKop = function (patch) {
    Object.assign(kop, patch || {});
    settingsSynced = true;
  };
  window.banuakitaGetKop = function () { return Object.assign({}, kop); };

  /* ---------- Template impor (.docx via Word Import) ---------- */
  let customTemplates = [];
  try { customTemplates = JSON.parse(localStorage.getItem('banuakita_templates_v1') || '[]'); } catch (e) { customTemplates = []; }

  /* ---------- OCR KTP ---------- */
  function loadScriptOnce(src, globalName) {
    return new Promise((resolve, reject) => {
      if (window[globalName]) return resolve(window[globalName]);
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(window[globalName]), { once: true });
        existing.addEventListener('error', () => reject(new Error('Pustaka gagal dimuat.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => window[globalName] ? resolve(window[globalName]) : reject(new Error('Pustaka OCR tidak tersedia.'));
      script.onerror = () => reject(new Error('Tidak dapat memuat pustaka OCR. Periksa koneksi internet.'));
      document.head.appendChild(script);
    });
  }

  function parseKtpText(raw) {
    const text = raw.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ');
    const lines = text.split('\n').map(x => x.trim()).filter(Boolean);
    const findValue = (label) => {
      const re = new RegExp('^' + label + '\\s*[:.]?\\s*(.*)$', 'i');
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(re);
        if (m) {
          let val = m[1].trim();
          if (!val && lines[i + 1]) val = lines[i + 1].trim();
          if (val) return val.replace(/^[:\s.-]+/, '').trim();
        }
      }
      const inline = text.match(new RegExp(label + '\\s*[:.]?\\s*([^\\n]+)', 'i'));
      return inline ? inline[1].trim() : '';
    };
    const digits = text.replace(/[^\d]/g, ' ').match(/(?:\d[\s-]*){16}/);
    const nik = digits ? digits[0].replace(/\D/g, '').slice(0, 16) : findValue('NIK').replace(/\D/g, '').slice(0, 16);
    let nama = findValue('Nama');
    if (nama) nama = nama.replace(/\s+(NIK|Tempat|Jenis Kelamin|Alamat|Agama|Status Perkawinan|Pekerjaan|Kewarganegaraan).*$/i, '').trim();
    const ttl = findValue('Tempat\\s*[/,]?\\s*Tgl\\s*Lahir') || findValue('Tempat\\s*Tanggal\\s*Lahir');
    const jkRaw = findValue('Jenis\\s*Kelamin');
    const jk = /perempuan|wanita/i.test(jkRaw) ? 'Perempuan' : (/laki/i.test(jkRaw) ? 'Laki-laki' : '');
    const agama = findValue('Agama');
    let alamat = findValue('Alamat');
    const rt = findValue('RT\\s*[/]?\\s*RW');
    const kel = findValue('Kel[/ ]?Desa');
    const kec = findValue('Kecamatan');
    const alamatParts = [alamat, rt ? 'RT/RW ' + rt : '', kel ? 'Kel/Desa ' + kel : '', kec ? 'Kecamatan ' + kec : ''].filter(Boolean);
    if (alamatParts.length) alamat = alamatParts.join(', ');
    return { nama, nik, ttl, jk, agama, alamat };
  }

  window.suratDesaParseKtp = parseKtpText;
  window.suratDesaLoadOcrLibrary = function () {
    return loadScriptOnce('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', 'Tesseract');
  };

  /* ================= HALAMAN: BUAT SURAT (modul Surat Desa) ================= */
  window.sdBuatSuratPage = async function sdBuatSuratPage() {
    await syncKopFromSettings();

    const content = document.getElementById('content');
    if (!content) return;

    let pendudukList = [];
    try { pendudukList = await window.desaAPI.penduduk.list('') || []; } catch (e) { pendudukList = []; }

    const typeOptions = Object.entries(window.SURAT_DESA_TYPES)
      .map(([k, t]) => `<option value="${k}">${esc(t.title)}</option>`).join('');
    const customOptions = customTemplates
      .map(t => `<option value="${esc(t.id)}" data-custom="1">${esc(t.title)} (Template Impor)</option>`).join('');

    content.innerHTML = `
      <div class="sd-wrap">
        <section class="panel sd-hero no-print">
          <div class="sd-kicker">✦ Pelayanan Administrasi Desa</div>
          <h1>Form Isian Surat Desa</h1>
          <p>Buat surat keterangan dengan lebih praktis. Isi data penduduk, baca data dari foto KTP, lalu periksa pratinjau sebelum mencetak atau mengunduh dokumen.</p>
          <p class="hint">🔒 Data formulir diproses lokal di aplikasi ini dan tidak dikirim ke server. Pastikan seluruh data dan format surat benar sebelum digunakan.</p>
        </section>

        <div class="grid two-col">
          <section class="panel no-print">
            <h2>🪪 Baca Data KTP (OCR)</h2>
            <p class="hint">Pilih foto atau hasil scan KTP yang jelas. Sistem akan mencoba membaca teks, lalu periksa dan masukkan data ke formulir. Hasil OCR bisa keliru — selalu cocokkan dengan KTP asli.</p>
            <label>Foto KTP (JPG, PNG)<input type="file" id="sd-ktp-file" accept="image/*"></label>
            <div class="actions">
              <button class="primary" type="button" id="sd-read-ktp">Baca KTP</button>
              <button type="button" id="sd-apply-ktp">Masukkan data ke formulir</button>
            </div>
            <p id="sd-ocr-status" class="hint" aria-live="polite"></p>
            <label>Hasil teks OCR (silakan periksa/koreksi)
              <textarea id="sd-ocr-text" rows="6" placeholder="Teks hasil pembacaan KTP akan tampil di sini..."></textarea>
            </label>
          </section>

          <section class="panel">
            <h2>Pratinjau Surat</h2>
            <div id="sd-preview" class="preview"></div>
            <div class="actions preview-actions no-print">
              <button class="primary" type="button" id="sd-print">Cetak / Simpan PDF</button>
              <button type="button" id="sd-word">Unduh Word (.docx)</button>
              <button type="button" id="sd-download">Unduh HTML Surat</button>
              <button type="button" id="sd-save-arsip">Simpan ke Arsip</button>
            </div>
          </section>
        </div>

        <section class="panel no-print" style="margin-top:18px">
          <h2>Data Surat</h2>
          <div class="grid">
            <div>
              <label>Jenis surat</label>
              <select id="sd-type">${typeOptions}${customOptions}</select>
            </div>
            <div>
              <label>Sumber data</label>
              <select id="sd-entry-mode">
                <option value="manual">Input manual</option>
                <option value="resident">Isi otomatis dari Data Penduduk</option>
              </select>
            </div>
          </div>
          <div id="sd-resident-picker" hidden>
            <label>Pilih penduduk tersimpan</label>
            <select id="sd-resident-select">
              <option value="">-- Pilih nama / NIK --</option>
              ${pendudukList.map(r => `<option value="${r.id}">${esc(r.nama)} — ${esc(r.nik)}</option>`).join('')}
            </select>
            <div class="actions"><button type="button" id="sd-fill-resident">Ambil Data Penduduk</button></div>
            <p id="sd-resident-fill-status" class="hint" aria-live="polite"></p>
          </div>
          <div class="grid" id="sd-fields"></div>
          <div class="actions">
            <button class="primary" type="button" id="sd-update">Perbarui Pratinjau</button>
          </div>
          <p class="hint">Kop surat mengikuti menu Pengaturan Desa. Pratinjau dibuat sesuai format surat Desa; pastikan nomor/tanggal dan identitas benar sebelum ditandatangani.</p>
        </section>
      </div>
    `;

    const typeSelect = document.getElementById('sd-type');
    const fieldsBox = document.getElementById('sd-fields');
    const preview = document.getElementById('sd-preview');
    const ocrStatus = document.getElementById('sd-ocr-status');
    const ocrTextArea = document.getElementById('sd-ocr-text');
    const ktpFileInput = document.getElementById('sd-ktp-file');

    function fieldMarkup(field) {
      const [key, label, type, required, optionsOrDefault] = field;
      const defaultValue = typeof optionsOrDefault === 'string' ? optionsOrDefault : '';
      const requiredAttr = required ? 'required' : '';
      let control;
      if (type === 'textarea') {
        control = `<textarea id="sd-${key}" name="${key}" ${requiredAttr}>${esc(defaultValue)}</textarea>`;
      } else if (type === 'select') {
        control = `<select id="sd-${key}" name="${key}" ${requiredAttr}>
          <option value="">-- Pilih --</option>${optionsOrDefault.map(x => `<option>${esc(x)}</option>`).join('')}
        </select>`;
      } else {
        const val = type === 'date' ? '' : defaultValue;
        control = `<input id="sd-${key}" name="${key}" type="${type}" value="${esc(val)}" ${requiredAttr}>`;
      }
      return `<div><label>${esc(label)}</label>${control}</div>`;
    }

    function currentCustom() {
      return customTemplates.find(t => t.id === typeSelect.value) || null;
    }

    function renderFields() {
      const custom = currentCustom();
      if (custom) {
        const keys = [...new Set([...custom.content.matchAll(/{{\s*([\w-]+)\s*}}/g)].map(m => m[1]))];
        const base = [['nomorSurat', 'Nomor surat (bagian kosong)', 'text', false], ['bulanNomor', 'Bulan pada nomor surat', 'text', false], ['tahunNomor', 'Tahun pada nomor surat', 'number', false], ['tempatTerbit', 'Dikeluarkan di', 'text', false, kop.desa], ['tanggalTerbit', 'Tanggal surat', 'date', false]];
        fieldsBox.innerHTML = [...keys.map(k => [k, k.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), 'text', false]), ...base].map(fieldMarkup).join('');
      } else {
        fieldsBox.innerHTML = window.SURAT_DESA_TYPES[typeSelect.value].fields.map(fieldMarkup).join('');
      }
      fieldsBox.querySelectorAll('input,select,textarea').forEach(el => {
        el.addEventListener('input', renderPreview);
        el.addEventListener('change', renderPreview);
      });
      renderPreview();
    }

    function getData() {
      const data = {};
      const custom = currentCustom();
      const fieldKeys = custom
        ? [...new Set([...custom.content.matchAll(/{{\s*([\w-]+)\s*}}/g)].map(m => m[1]).concat(['nomorSurat', 'bulanNomor', 'tahunNomor', 'tempatTerbit', 'tanggalTerbit']))]
        : window.SURAT_DESA_TYPES[typeSelect.value].fields.map(f => f[0]);
      fieldKeys.forEach(key => { const el = document.getElementById('sd-' + key); data[key] = el ? el.value.trim() : ''; });
      return data;
    }

    function buildLetterInner() {
      const custom = currentCustom();
      const type = custom ? { title: custom.title, numberPrefix: '140/', numberSuffix: '/DSP-BB/' } : window.SURAT_DESA_TYPES[typeSelect.value];
      const d = getData();
      const nomor = `${type.numberPrefix}${d.nomorSurat || ' '}${type.numberSuffix}${d.bulanNomor || ' '}/${d.tahunNomor || new Date().getFullYear()}`;
      const bodyHtml = custom
        ? `<div class="letter-body" style="white-space:pre-wrap;text-align:justify">${esc(custom.content).replace(/{{\s*([\w-]+)\s*}}/g, (_, k2) => esc(d[k2] || '........................'))}</div>`
        : `<div class="letter-body">${type.body(d, kop)}</div>`;
      return {
        d, nomor, type,
        inner: `
          <div class="kop">
            <div class="kop-text">
              <div class="l1">${esc(kop.kabupaten)}</div>
              <div class="l2">${esc(kop.kecamatan)}</div>
              <div class="l2">${esc(kop.desa)}</div>
              <div class="l3">${esc(kop.alamat)}<br>${esc(kop.kontak)}</div>
            </div>
          </div>
          <h3 class="letter-title">${esc(type.title)}</h3>
          <p class="letter-number">Nomor: ${esc(nomor)}</p>
          ${bodyHtml}
          <div class="signature">
            Dikeluarkan di: ${esc(d.tempatTerbit || '........................')}<br>
            Pada tanggal: ${esc(fmtDate(d.tanggalTerbit) || '........................')}
            <br><br><strong>KEPALA DESA</strong><br><br><br><br>
            <strong><u>${esc(kop.kepala || '........................')}</u></strong>
          </div>`
      };
    }

    function renderPreview() {
      const built = buildLetterInner();
      lastPreview = built.inner;
      preview.innerHTML = built.inner;
    }

    /* ---- OCR ---- */
    document.getElementById('sd-read-ktp').addEventListener('click', async () => {
      const file = ktpFileInput.files && ktpFileInput.files[0];
      if (!file) { ocrStatus.textContent = 'Pilih foto KTP terlebih dahulu.'; return; }
      if (!file.type.startsWith('image/')) { ocrStatus.textContent = 'File harus berupa gambar (JPG atau PNG).'; return; }
      const button = document.getElementById('sd-read-ktp');
      button.disabled = true;
      ocrStatus.textContent = 'Sedang membaca gambar KTP. Proses dapat memerlukan waktu...';
      try {
        const Tesseract = await loadScriptOnce('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', 'Tesseract');
        const result = await Tesseract.recognize(file, 'ind+eng', {
          logger: m => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              ocrStatus.textContent = `Sedang membaca teks: ${Math.round(m.progress * 100)}%`;
            }
          }
        });
        ocrTextArea.value = result.data.text || '';
        ocrStatus.textContent = 'Pembacaan selesai. Periksa teks hasil OCR, lalu klik "Masukkan data ke formulir".';
      } catch (err) {
        ocrStatus.textContent = 'Gagal membaca KTP: ' + (err.message || 'Terjadi kesalahan.') + ' Pastikan internet aktif dan coba gambar yang lebih jelas.';
      } finally {
        button.disabled = false;
      }
    });

    document.getElementById('sd-apply-ktp').addEventListener('click', () => {
      const data = parseKtpText(ocrTextArea.value);
      const mapping = { nama: data.nama, nik: data.nik, ttl: data.ttl, jk: data.jk, agama: data.agama, alamat: data.alamat };
      let applied = 0;
      for (const [key, value] of Object.entries(mapping)) {
        const el = document.getElementById('sd-' + key);
        if (el && value) {
          if (el.tagName === 'SELECT') {
            const option = Array.from(el.options).find(o => o.value.toLowerCase() === value.toLowerCase());
            if (option) el.value = option.value;
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          applied++;
        }
      }
      ocrStatus.textContent = applied
        ? `${applied} data dimasukkan ke formulir. Mohon periksa kembali semua kolom.`
        : 'Belum ada data yang cocok ditemukan. Periksa teks OCR atau isi formulir secara manual.';
      renderPreview();
    });

    /* ---- Ambil dari Data Penduduk (database) ---- */
    document.getElementById('sd-entry-mode').addEventListener('change', e => {
      document.getElementById('sd-resident-picker').hidden = e.target.value !== 'resident';
    });
    document.getElementById('sd-fill-resident').addEventListener('click', () => {
      const id = document.getElementById('sd-resident-select').value;
      const r = pendudukList.find(x => String(x.id) === id);
      const note = document.getElementById('sd-resident-fill-status');
      if (!r) { if (note) note.textContent = 'Pilih data penduduk terlebih dahulu.'; return; }
      const map = {
        nama: 'nama', nik: 'nik', noKK: 'no_kk', ttl: ((r.tempat_lahir || '') + (r.tanggal_lahir ? ', ' + fmtDate(r.tanggal_lahir) : '')).replace(/^,\s*/, ''),
        jk: 'jenis_kelamin', agama: 'agama', pekerjaan: 'pekerjaan', statusKawin: 'status_perkawinan', status: 'status_perkawinan',
        pendidikan: 'pendidikan', alamat: 'alamat', penduduk: 'desa', kewarganegaraan: () => 'Indonesia'
      };
      let count = 0;
      Object.entries(map).forEach(([fieldKey, src]) => {
        const el = document.getElementById('sd-' + fieldKey);
        if (!el || el.value) return;
        const value = typeof src === 'function' ? src() : r[src];
        if (value) { el.value = value; count++; }
      });
      renderPreview();
      if (note) note.textContent = count ? `Data penduduk dimasukkan ke ${count} kolom yang cocok. Lengkapi kolom khusus surat lainnya.` : 'Tidak ada kolom kosong yang cocok.';
    });

    /* ---- Aksi cetak / unduh via desktop pipeline ---- */
    document.getElementById('sd-update').addEventListener('click', renderPreview);
    typeSelect.addEventListener('change', renderFields);

    function payload() {
      const built = buildLetterInner();
      return { html: built.inner, fileName: built.type.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), jenis: null };
    }

    document.getElementById('sd-print').addEventListener('click', async () => {
      renderPreview();
      try { await window.desaAPI.print(payload()); }
      catch (e) { alert('Gagal mencetak: ' + (e?.message || e)); }
    });

    document.getElementById('sd-word').addEventListener('click', async () => {
      renderPreview();
      try { await window.desaAPI.word(payload()); }
      catch (e) { alert('Gagal membuat Word: ' + (e?.message || e)); }
    });

    document.getElementById('sd-download').addEventListener('click', () => {
      renderPreview();
      const p = payload();
      const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Surat Desa</title>
        <style>body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.45;margin:2cm;color:#000}
        .kop{text-align:center;border-bottom:3px double #000;padding-bottom:8px;margin-bottom:18px}
        .kop .l1,.kop .l2{display:block;font-weight:bold}.kop .l1{font-size:14pt}.kop .l2{font-size:13pt}.kop .l3{font-size:9pt}
        .letter-title{text-align:center;font-weight:bold;text-decoration:underline;margin-top:16px}
        .letter-number{text-align:center;margin-bottom:20px}p{text-align:justify}table{border-collapse:collapse;width:100%}
        td{vertical-align:top;padding:1px 4px}td:first-child{width:34%}.signature{width:42%;margin:25px 0 0 auto;text-align:center}</style>
        </head><body>${p.html}</body></html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = (p.fileName || 'surat') + '.html';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });

    document.getElementById('sd-save-arsip').addEventListener('click', async () => {
      renderPreview();
      const d = getData();
      const custom = currentCustom();
      const type = custom ? { title: custom.title } : window.SURAT_DESA_TYPES[typeSelect.value];
      try {
        // simpan penduduk manual bila NIK+nama lengkap belum ada di database
        let pendudukId = 0;
        const nik = String(d.nik || '').replace(/\D/g, '');
        if (nik.length === 16 && d.nama) {
          try {
            const saved = await window.desaAPI.penduduk.save({ nik, nama: d.nama, alamat: d.alamat || '', jenis_kelamin: d.jk || '', agama: d.agama || '', pekerjaan: d.pekerjaan || '' });
            pendudukId = saved && saved.id ? saved.id : 0;
          } catch (e) { /* NIK sudah ada / tidak valid: lanjut tanpa link */ }
        }
        const kodeType = 'SD-' + typeSelect.value.toUpperCase();
        const nomor = `${type.numberPrefix || ''}${d.nomorSurat || ''}${type.numberSuffix || ''}${d.bulanNomor || ''}/${d.tahunNomor || new Date().getFullYear()}`.trim();
        const row = await window.desaAPI.surat.save({
          nomor: nomor || ('' + Date.now()),
          jenis: kodeType,
          penduduk: pendudukId,
          tanggal: d.tanggalTerbit || new Date().toISOString().slice(0, 10),
          keperluan: d.keperluan || '',
          form: d
        });
        arsipEntries.unshift({
          id: row.id, nomor_surat: row.nomor_surat, jenis_surat: type.title,
          nik: d.nik || '', nama_penduduk: d.nama || '', tanggal_surat: row.tanggal_surat,
          html: lastPreview, source: 'app'
        });
        saveArsipLocal();
        alert('Surat tersimpan ke Arsip Surat.');
      } catch (e) {
        // mode offline / gagal: simpan ke arsip lokal browser
        arsipEntries.unshift({
          id: 'local-' + Date.now(), nomor_surat: d.nomorSurat || '', jenis_surat: type.title,
          nik: d.nik || '', nama_penduduk: d.nama || '', tanggal_surat: d.tanggalTerbit || new Date().toISOString().slice(0, 10),
          html: lastPreview, source: 'local'
        });
        saveArsipLocal();
        alert('Surat tersimpan di arsip lokal browser (database tidak terjangkau).');
      }
    });

    renderFields();
  };

  /* ================= HALAMAN: TEMPLATE SURAT (Import Word) ================= */
  window.sdTemplatePage = async function sdTemplatePage() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = `
      <div class="sd-wrap">
        <section class="panel">
          <h2>Import Template Surat dari Word</h2>
          <p class="hint">Unggah file .docx. Teks akan diekstrak untuk disimpan sebagai pilihan surat baru di menu Buat Surat. Format tata letak Word yang kompleks mungkin tidak ikut terbawa; periksa pratinjau sebelum dipakai.</p>
          <label>Nama jenis surat<input id="tpl-title" placeholder="Contoh: Surat Keterangan Kelahiran"></label>
          <label>File Word (.docx)<input id="tpl-file" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label>
          <label>Isi template (gunakan {{nama}}, {{nik}}, {{alamat}} untuk kolom yang akan diisi)
            <textarea id="tpl-content" rows="12" placeholder="Teks hasil import Word akan muncul di sini. Anda juga dapat mengeditnya..."></textarea>
          </label>
          <div class="actions">
            <button class="primary" type="button" id="tpl-import">Import Word</button>
            <button type="button" id="tpl-save">Simpan sebagai Pilihan Surat</button>
          </div>
          <p id="tpl-message" class="hint" aria-live="polite"></p>
        </section>
        <section class="panel" style="margin-top:18px">
          <h2>Template Tersimpan</h2>
          <div id="tpl-list"></div>
        </section>
      </div>
    `;

    const title = document.getElementById('tpl-title');
    const file = document.getElementById('tpl-file');
    const contentBox = document.getElementById('tpl-content');
    const msg = document.getElementById('tpl-message');

    function list() {
      const box = document.getElementById('tpl-list');
      box.innerHTML = customTemplates.length
        ? `<table class="table"><thead><tr><th>Nama</th><th>Placeholder</th><th>Aksi</th></tr></thead><tbody>` +
          customTemplates.map(t => `<tr><td>📄 <b>${esc(t.title)}</b></td><td>${esc([...new Set([...t.content.matchAll(/{{\s*([\w-]+)\s*}}/g)].map(m => m[1]))].join(', ') || '-')}</td>
          <td><button type="button" data-remove-tpl="${esc(t.id)}">Hapus</button></td></tr>`).join('') +
          `</tbody></table>`
        : "<p class='hint'>Belum ada template impor.</p>";
      box.querySelectorAll('[data-remove-tpl]').forEach(b => b.onclick = () => {
        if (confirm('Hapus template ini?')) {
          const i = customTemplates.findIndex(t => t.id === b.dataset.removeTpl);
          if (i >= 0) customTemplates.splice(i, 1);
          localStorage.setItem('banuakita_templates_v1', JSON.stringify(customTemplates));
          list();
        }
      });
    }

    document.getElementById('tpl-import').onclick = async () => {
      const f = file.files && file.files[0];
      if (!f) { msg.textContent = 'Pilih file Word .docx terlebih dahulu.'; return; }
      msg.textContent = 'Membaca dokumen Word...';
      try {
        if (!window.mammoth) {
          await new Promise((ok, no) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js';
            s.onload = ok; s.onerror = () => no(new Error('Pustaka mammoth gagal dimuat'));
            document.head.appendChild(s);
          });
        }
        const ab = await f.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer: ab });
        contentBox.value = result.value || '';
        if (!title.value) title.value = f.name.replace(/\.docx$/i, '').replace(/[_-]+/g, ' ');
        msg.textContent = 'Teks berhasil diimpor. Tambahkan placeholder seperti {{nama}} lalu simpan.';
      } catch (e) {
        msg.textContent = 'Tidak dapat membaca Word. Pastikan file .docx dan koneksi internet aktif.';
      }
    };

    document.getElementById('tpl-save').onclick = () => {
      const t = title.value.trim(), c = contentBox.value.trim();
      if (!t || !c) { msg.textContent = 'Nama dan isi template harus diisi.'; return; }
      const item = { id: 'tpl_' + Date.now(), title: t, content: c };
      customTemplates.push(item);
      try {
        localStorage.setItem('banuakita_templates_v1', JSON.stringify(customTemplates));
        list();
        msg.textContent = 'Template tersimpan sebagai pilihan surat. Buka menu Buat Surat untuk menggunakannya.';
        title.value = ''; contentBox.value = ''; file.value = '';
      } catch (e) {
        customTemplates.pop();
        msg.textContent = 'Template terlalu besar untuk penyimpanan browser.';
      }
    };

    list();
  };

  /* ================= HALAMAN: JENIS SURAT (daftar modul Surat Desa) ========= */
  window.sdJenisSuratPage = async function sdJenisSuratPage() {
    const content = document.getElementById('content');
    if (!content) return;
    const items = Object.values(window.SURAT_DESA_TYPES);
    content.innerHTML = `
      <div class="sd-wrap">
        <section class="panel">
          <h2>Jenis Surat Modul Surat Desa (${items.length})</h2>
          <p class="hint">Daftar jenis surat bawaan yang tersedia pada menu Buat Surat.</p>
          <table class="table"><thead><tr><th>#</th><th>Nama Surat</th><th>Prefix Nomor</th><th>Jumlah Field</th></tr></thead>
          <tbody>${items.map((t, i) => `<tr><td>${i + 1}</td><td>${esc(t.title)}</td><td>${esc(t.numberPrefix)}…${esc(t.numberSuffix)}</td><td>${t.fields.length}</td></tr>`).join('')}</tbody></table>
          ${customTemplates.length ? `<h3>Template Impor</h3><p class="hint">${customTemplates.map(t => '• ' + esc(t.title)).join('<br>')}</p>` : ''}
          <div class="actions" style="margin-top:14px"><button class="primary" onclick="page('buat')">＋ Buat Surat</button></div>
        </section>
      </div>
    `;
  };

  /* ================= ARSIP LOKAL (fallback browser) ================= */
  let arsipEntries = [];
  try { arsipEntries = JSON.parse(localStorage.getItem('banuakita_arsip_v1') || '[]'); } catch (e) { arsipEntries = []; }
  function saveArsipLocal() {
    try { localStorage.setItem('banuakita_arsip_v1', JSON.stringify(arsipEntries.slice(0, 200))); } catch (e) { /* penyimpanan penuh */ }
  }
  window.sdGetLocalArsip = function () { return arsipEntries.slice(); };

})();
