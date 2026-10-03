/*
 * Form Isian Surat Desa - app.js
 * Cara pakai:
 * 1. Buat file index.html di folder yang sama dengan isi:
 *    <!doctype html><html lang="id"><head><meta charset="utf-8">
 *    <meta name="viewport" content="width=device-width, initial-scale=1">
 *    <title>Form Surat Desa</title></head><body><div id="form-surat-desa"></div>
 *    <script src="form_surat_desa.js"></script></body></html>
 * 2. Buka index.html di browser.
 * Catatan: aplikasi ini membuat pratinjau dan versi cetak HTML, bukan mengedit
 * file Word asli secara langsung. Periksa kembali nomor/tanggal dan identitas
 * sebelum surat ditandatangani.
 */
(() => {
  "use strict";

  const ROOT_ID = "form-surat-desa";
  const root = document.getElementById(ROOT_ID);
  if (!root) {
    console.error(`Elemen #${ROOT_ID} tidak ditemukan. Tambahkan <div id="${ROOT_ID}"></div> pada HTML.`);
    return;
  }

  const suratTypes = {
    domisili: {
      title: "SURAT KETERANGAN DOMISILI",
      numberPrefix: "140/",
      numberSuffix: "/SKD/DSP-BB/",
      fields: [
        ["nama", "Nama", "text", true],
        ["nik", "NIK", "text", true],
        ["ttl", "Tempat, tanggal lahir", "text", true],
        ["jk", "Jenis kelamin", "select", true, ["Laki-laki", "Perempuan"]],
        ["agama", "Agama", "text", true],
        ["alamat", "Alamat lengkap", "textarea", true],
        ["domisili", "Alamat/tempat domisili", "textarea", true],
        ["nomorSurat", "Nomor surat (bagian kosong)", "text", false],
        ["bulanNomor", "Bulan pada nomor surat", "text", false],
        ["tahunNomor", "Tahun pada nomor surat", "number", false],
        ["tempatTerbit", "Dikeluarkan di", "text", true, "Pusar"],
        ["tanggalTerbit", "Tanggal surat", "date", true]
      ],
      body: d => `
        <p>Dengan ini menerangkan bahwa:</p>
        ${rows([["Nama", d.nama], ["NIK", d.nik], ["Tempat Tanggal Lahir", d.ttl],
          ["Jenis Kelamin", d.jk], ["Agama", d.agama], ["Alamat", d.alamat]])}
        <p>Memang benar nama tersebut di atas adalah warga Desa Pusar yang berdomisili di
        <strong>${esc(d.domisili)}</strong>, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu.</p>
        <p>Demikian surat keterangan domisili ini kami buat dengan sebenarnya untuk dipergunakan seperlunya.</p>`
    },
    kematian: {
      title: "SURAT KETERANGAN KEMATIAN",
      numberPrefix: "140/",
      numberSuffix: "/SKK/DSP-BB/",
      fields: [
        ["nama", "Nama almarhum/almarhumah", "text", true],
        ["ttl", "Tempat/tanggal lahir", "text", true],
        ["jk", "Jenis kelamin", "select", true, ["Laki-laki", "Perempuan"]],
        ["alamat", "Alamat", "textarea", true],
        ["tanggalMeninggal", "Tanggal meninggal", "date", true],
        ["hariMeninggal", "Hari meninggal", "text", true],
        ["pukulMeninggal", "Pukul meninggal", "text", true],
        ["tempatMeninggal", "Tempat meninggal", "text", true],
        ["pemakaman", "Tempat pemakaman", "text", true],
        ["tanggalMakam", "Tanggal pemakaman", "date", true],
        ["hariMakam", "Hari pemakaman", "text", true],
        ["pukulMakam", "Pukul pemakaman", "text", true],
        ["nomorSurat", "Nomor surat (bagian kosong)", "text", false],
        ["bulanNomor", "Bulan pada nomor surat", "text", false],
        ["tahunNomor", "Tahun pada nomor surat", "number", false],
        ["tempatTerbit", "Dikeluarkan di", "text", true, "Pusar"],
        ["tanggalTerbit", "Tanggal surat", "date", true]
      ],
      body: d => `
        <p>Yang bertanda tangan di bawah ini Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu, dengan ini menerangkan bahwa:</p>
        ${rows([["Nama", d.nama], ["Tempat/Tanggal Lahir", d.ttl], ["Jenis Kelamin", d.jk], ["Alamat", d.alamat]])}
        <p>Benar nama tersebut di atas telah meninggal dunia karena sakit pada:</p>
        ${rows([["Tanggal", fmtDate(d.tanggalMeninggal)], ["Hari", d.hariMeninggal], ["Pukul", d.pukulMeninggal], ["Bertempat di", d.tempatMeninggal]])}
        <p>Dan telah dimakamkan di:</p>
        ${rows([["Tempat", d.pemakaman], ["Tanggal", fmtDate(d.tanggalMakam)], ["Hari", d.hariMakam], ["Pukul", d.pukulMakam]])}
        <p>Demikianlah surat keterangan kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.</p>`
    },
    kehilangan_kk: {
      title: "SURAT KETERANGAN KEHILANGAN",
      numberPrefix: "140/",
      numberSuffix: "/SKK/DSP-BB/",
      fields: [
        ["nama", "Nama", "text", true],
        ["nik", "NIK", "text", true],
        ["ttl", "Tempat/tanggal lahir", "text", true],
        ["agama", "Agama", "text", true],
        ["jk", "Jenis kelamin", "select", true, ["Laki-laki", "Perempuan"]],
        ["pekerjaan", "Pekerjaan", "select", true, ["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],
        ["alamat", "Alamat", "textarea", true],
        ["penduduk", "Desa/kelurahan tempat terdaftar", "text", true],
        ["namaPemilikKK", "Nama pada Kartu Keluarga", "text", true],
        ["noKK", "Nomor Kartu Keluarga (KK)", "text", true],
        ["nomorSurat", "Nomor surat (bagian kosong)", "text", false],
        ["bulanNomor", "Bulan pada nomor surat", "text", false],
        ["tahunNomor", "Tahun pada nomor surat", "number", false],
        ["tempatTerbit", "Dikeluarkan di", "text", true, "Desa Pusar"],
        ["tanggalTerbit", "Tanggal surat", "date", true]
      ],
      body: d => `
        <p>Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu dengan ini menerangkan bahwa:</p>
        ${rows([["Nama", d.nama], ["NIK", d.nik], ["Tempat/Tgl Lahir", d.ttl], ["Agama", d.agama],
          ["Jenis Kelamin", d.jk], ["Pekerjaan", d.pekerjaan], ["Alamat", d.alamat]])}
        <p>Benar yang tersebut namanya di atas adalah penduduk <strong>${esc(d.penduduk)}</strong>, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu dan selanjutnya dapat kami terangkan bahwa yang bersangkutan telah kehilangan:</p>
        <p><strong>KARTU KELUARGA (KK)</strong></p>
        ${rows([["Atas Nama", d.namaPemilikKK], ["No. KK", d.noKK]])}
        <p>Demikianlah surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan seperlunya.</p>
        <p><em>Catatan pada template: surat ini berlaku 14 hari setelah diterbitkan.</em></p>`
    },
    kehilangan_ktp: {
      title: "SURAT KETERANGAN KEHILANGAN",
      numberPrefix: "140/",
      numberSuffix: "/SKK/DSP-BB/",
      fields: [
        ["nama", "Nama", "text", true],
        ["noKK", "Nomor Kartu Keluarga (KK)", "text", true],
        ["nik", "NIK", "text", true],
        ["ttl", "Tempat, tanggal lahir", "text", true],
        ["jk", "Jenis kelamin", "select", true, ["Laki-laki", "Perempuan"]],
        ["agama", "Agama", "text", true],
        ["alamat", "Alamat", "textarea", true],
        ["penduduk", "Desa/kelurahan tempat terdaftar", "text", true],
        ["nomorSurat", "Nomor surat (bagian kosong)", "text", false],
        ["bulanNomor", "Bulan pada nomor surat", "text", false],
        ["tahunNomor", "Tahun pada nomor surat", "number", false],
        ["tempatTerbit", "Dikeluarkan di", "text", true, "Pusar"],
        ["tanggalTerbit", "Tanggal surat", "date", true]
      ],
      body: d => `
        <p>Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu, dengan ini menerangkan dengan sebenarnya bahwa:</p>
        ${rows([["Nama", d.nama], ["No. KK", d.noKK], ["NIK", d.nik], ["Tempat, Tgl. Lahir", d.ttl],
          ["Jenis Kelamin", d.jk], ["Agama", d.agama], ["Alamat", d.alamat]])}
        <p>Benar nama tersebut di atas adalah penduduk <strong>${esc(d.penduduk)}</strong> dan selanjutnya dapat kami terangkan bahwa KARTU TANDA PENDUDUK (KTP) yang bersangkutan hilang.</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>`
    },

    kis: {
      title: "SURAT KETERANGAN KIS",
      numberPrefix: "140/", numberSuffix: "/S-KET/DSP-BB/",
      fields: [
        ["nama","Nama","text",true],["nik","NIK","text",true],["noKK","Nomor KK","text",true],
        ["jk","Jenis kelamin","select",true,["Laki-laki","Perempuan"]],["ttl","Tempat/tanggal lahir","text",true],
        ["agama","Agama","text",true],["alamat","Alamat","textarea",true],
        ["domisili","Keterangan tempat tinggal","textarea",true],["nomorSurat","Nomor surat (bagian kosong)","text",false],
        ["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false],
        ["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]
      ],
      body: d => `<p>Yang bertanda tangan di bawah ini Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu menerangkan bahwa:</p>
        ${rows([["Nama",d.nama],["NIK",d.nik],["No. KK",d.noKK],["Jenis Kelamin",d.jk],["Tempat/Tgl Lahir",d.ttl],["Agama",d.agama],["Alamat",d.alamat]])}
        <p>Benar yang bersangkutan adalah penduduk Desa Pusar dan berdomisili ${esc(d.domisili)} serta menurut pengetahuan kami dalam keadaan tidak mampu dan belum pernah mendapatkan program kesehatan atau asuransi lainnya. Surat ini dibuat untuk mendapatkan Kartu Indonesia Sehat (KIS).</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan seperlunya.</p>`
    },
    kip: {
      title: "SURAT KETERANGAN TIDAK MAMPU PELAJAR (KIP)",
      numberPrefix: "140/", numberSuffix: "/SKTM/DSP-BB/",
      fields: [
        ["nama","Nama lengkap orang tua/wali","text",true],["nik","NIK orang tua/wali","text",true],
        ["ttl","Tempat/tanggal lahir orang tua/wali","text",true],["agama","Agama","text",true],
        ["pekerjaan","Pekerjaan","select",true,["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],["alamat","Alamat tempat tinggal","textarea",true],
        ["namaAnak","Nama anak/pelajar","text",true],["nikAnak","NIK anak/pelajar","text",false],
        ["ttlAnak","Tempat/tanggal lahir anak","text",false],["agamaAnak","Agama anak","text",false],
        ["pekerjaanAnak","Pekerjaan/status anak","select",false,["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],["alamatAnak","Alamat anak","textarea",false],
        ["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],
        ["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]
      ],
      body: d => `<p>Yang bertanda tangan di bawah ini, Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu, menerangkan dengan sesungguhnya bahwa:</p>
        ${rows([["Nama Lengkap",d.nama],["NIK",d.nik],["Tempat/Tanggal Lahir",d.ttl],["Agama",d.agama],["Pekerjaan",d.pekerjaan],["Alamat Tempat Tinggal",d.alamat]])}
        <p>Orang tua dari:</p>${rows([["Nama Lengkap",d.namaAnak],["NIK",d.nikAnak],["Tempat/Tanggal Lahir",d.ttlAnak],["Agama",d.agamaAnak],["Status/Pekerjaan",d.pekerjaanAnak],["Alamat",d.alamatAnak]])}
        <p>Yang bersangkutan benar penduduk dan berdomisili di Desa Pusar, tergolong keluarga tidak mampu dan belum memiliki Kartu Indonesia Pintar (KIP). Surat ini dipergunakan untuk keperluan sekolah.</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan seperlunya.</p>`
    },
    sktm: {
      title: "SURAT KETERANGAN TIDAK MAMPU (SKTM)",
      numberPrefix: "140/", numberSuffix: "/SKTM/DSP-BB/",
      fields: [
        ["nama","Nama lengkap","text",true],["nik","NIK","text",true],["jk","Jenis kelamin","select",true,["Laki-laki","Perempuan"]],
        ["ttl","Tempat/tanggal lahir","text",true],["kewarganegaraan","Kewarganegaraan","text",true,"Indonesia"],
        ["agama","Agama","text",true],["statusKawin","Status perkawinan","select",true,["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"]],["pekerjaan","Pekerjaan","select",true,["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],
        ["alamat","Alamat","textarea",true],["keterangan","Keterangan tambahan","textarea",false],
        ["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],
        ["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]
      ],
      body: d => `<p>Yang bertanda tangan di bawah ini Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu menerangkan bahwa:</p>
        ${rows([["Nama",d.nama],["NIK",d.nik],["Jenis Kelamin",d.jk],["Tempat/Tanggal Lahir",d.ttl],["Kewarganegaraan",d.kewarganegaraan],["Agama",d.agama],["Status Perkawinan",d.statusKawin],["Pekerjaan",d.pekerjaan],["Alamat",d.alamat]])}
        <p>Benar nama tersebut di atas adalah penduduk Desa Pusar dan menurut sepengetahuan kami tergolong kurang/tidak mampu. ${esc(d.keterangan)}</p>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.</p>`
    },
    usaha: {
      title: "SURAT KETERANGAN USAHA",
      numberPrefix: "140/", numberSuffix: "/SKU/DSP-BB/",
      fields: [
        ["nama","Nama","text",true],["nik","NIK","text",true],["ttl","Tempat/tanggal lahir","text",true],
        ["jk","Jenis kelamin","select",true,["Laki-laki","Perempuan"]],["agama","Agama","text",true],
        ["alamat","Alamat KTP/tempat tinggal","textarea",true],["tempatUsaha","Tempat usaha","text",true],
        ["alamatUsaha","Alamat usaha","textarea",true],["jenisUsaha","Jenis usaha","text",true],
        ["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],
        ["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]
      ],
      body: d => `<p>Kepala Desa Pusar dengan ini menerangkan bahwa:</p>
        ${rows([["Nama",d.nama],["NIK",d.nik],["Tempat Tanggal Lahir",d.ttl],["Jenis Kelamin",d.jk],["Agama",d.agama],["Alamat KTP",d.alamat]])}
        <p>Memang benar nama yang tersebut di atas mempunyai usaha <strong>${esc(d.jenisUsaha)}</strong> yang bertempat di ${esc(d.tempatUsaha)}, beralamat ${esc(d.alamatUsaha)}.</p>
        <p>Demikian Surat Keterangan Usaha ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>`
    },
    pindah: {
      title: "SURAT KETERANGAN PINDAH PENDUDUK",
      numberPrefix: "140/", numberSuffix: "/SKPP/DSP-BB/",
      fields: [
        ["nama","Nama lengkap","text",true],["jk","Jenis kelamin","select",true,["Laki-laki","Perempuan"]],
        ["ttl","Tempat/tanggal lahir","text",true],["kewarganegaraan","Kewarganegaraan","text",true,"Indonesia"],
        ["agama","Agama","text",true],["pekerjaan","Pekerjaan","select",true,["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],["pendidikan","Pendidikan","text",true],
        ["alamat","Alamat asal","textarea",true],["noKK","Nomor KK","text",true],["nik","Nomor KTP/NIK","text",true],
        ["alamatPindah","Alamat pindah","textarea",true],["rtRw","RT/RW tujuan","text",false],["kecamatanTujuan","Kecamatan tujuan","text",true],
        ["kabupatenTujuan","Kabupaten/kota tujuan","text",true],["provinsiTujuan","Provinsi tujuan","text",true],
        ["tanggalPindah","Tanggal pindah","date",true],["alasanPindah","Alasan pindah","text",true],
        ["pengikut","Nama pengikut/anggota keluarga","textarea",false],
        ["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],
        ["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]
      ],
      body: d => `<p>Yang mengajukan pindah dengan data sebagai berikut:</p>
        ${rows([["Nama Lengkap",d.nama],["Jenis Kelamin",d.jk],["Tempat/Tgl Lahir",d.ttl],["Kewarganegaraan",d.kewarganegaraan],["Agama",d.agama],["Pekerjaan",d.pekerjaan],["Pendidikan",d.pendidikan],["Alamat Asal",d.alamat],["No. KK",d.noKK],["No. KTP/NIK",d.nik],["Alamat Pindah",d.alamatPindah],["RT/RW",d.rtRw],["Kecamatan",d.kecamatanTujuan],["Kabupaten",d.kabupatenTujuan],["Provinsi",d.provinsiTujuan],["Tanggal Pindah",fmtDate(d.tanggalPindah)],["Alasan Pindah",d.alasanPindah],["Pengikut",d.pengikut]])}
        <p>Demikian surat keterangan pindah ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    imunisasi_catin: {
      title: "SURAT PENGANTAR IMUNISASI CATIN",
      numberPrefix: "B-", numberSuffix: "/HLN/400.7.7.2/",
      fields: [
        ["nama","Nama calon pengantin wanita","text",true],["nik","NIK","text",true],["ttl","Tempat/tanggal lahir","text",true],
        ["umur","Umur (tahun)","number",true],["agama","Agama","text",true,"Islam"],["jk","Jenis kelamin","select",true,["Perempuan"]],
        ["pendidikan","Pendidikan","text",true],["pekerjaan","Pekerjaan","select",true,["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],["status","Status","select",true,["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"]],
        ["alamat","Alamat/tempat tinggal","textarea",true],["keperluan","Keperluan","text",true,"Untuk menikah"],
        ["berlaku","Masa berlaku surat","text",true],["golonganDarah","Golongan darah","text",false],
        ["namaCalonSuami","Nama calon suami","text",true],["nomorSurat","Nomor surat (bagian kosong)","text",false],
        ["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false,"2026"],
        ["tempatTerbit","Dibuat di","text",true,"Halangan"],["tanggalTerbit","Tanggal surat","date",true]
      ],
      body: d => `<p>Yang bertanda tangan di bawah ini Kepala Desa Halangan, dengan ini memohon bantuan tenaga kesehatan agar dapat memberikan Imunisasi T2 (Tetanus Toxoid) kepada calon pengantin wanita dengan biodata sebagai berikut:</p>
        ${rows([["Nama",d.nama],["NIK",d.nik],["Tempat/Tanggal Lahir",d.ttl],["Umur",d.umur+" tahun"],["Agama",d.agama],["Jenis Kelamin",d.jk],["Pendidikan",d.pendidikan],["Pekerjaan",d.pekerjaan],["Status",d.status],["Alamat/Tempat Tinggal",d.alamat],["Keperluan",d.keperluan],["Berlaku",d.berlaku],["Golongan Darah",d.golonganDarah],["Nama Calon Suami",d.namaCalonSuami]])}
        <p>Demikian surat pengantar ini dibuat. Atas perhatian dan bantuannya diucapkan terima kasih.</p>`
    },
    kelahiran: {
      title: "SURAT KETERANGAN KELAHIRAN", numberPrefix: "140/", numberSuffix: "/SKL/DSP-BB/",
      fields: [["namaAnak","Nama anak yang lahir","text",true],["jkAnak","Jenis kelamin anak","select",true,["Laki-laki","Perempuan"]],["tanggalLahir","Tanggal lahir","date",true],["pukulLahir","Pukul lahir","text",true],["tempatLahir","Tempat lahir","text",true],["namaAyah","Nama ayah","text",true],["nikAyah","NIK ayah","text",false],["namaIbu","Nama ibu","text",true],["nikIbu","NIK ibu","text",false],["alamat","Alamat orang tua","textarea",true],["namaPelapor","Nama pelapor","text",true],["hubunganPelapor","Hubungan dengan anak","text",true],["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]],
      body: d => `<p>Yang bertanda tangan di bawah ini Kepala Desa Pusar, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu, menerangkan bahwa berdasarkan keterangan yang disampaikan kepada kami telah lahir seorang anak:</p>${rows([["Nama anak",d.namaAnak],["Jenis kelamin",d.jkAnak],["Hari/tanggal lahir",fmtDate(d.tanggalLahir)],["Pukul",d.pukulLahir],["Tempat lahir",d.tempatLahir],["Nama ayah",d.namaAyah],["NIK ayah",d.nikAyah],["Nama ibu",d.namaIbu],["NIK ibu",d.nikIbu],["Alamat orang tua",d.alamat],["Nama pelapor",d.namaPelapor],["Hubungan dengan anak",d.hubunganPelapor]])}<p>Surat keterangan ini dibuat berdasarkan keterangan pemohon dan perlu disesuaikan dengan dokumen pendukung serta ketentuan yang berlaku.</p><p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    tugas_puskesmas: {
      title: "SURAT TUGAS KE PUSKESMAS", numberPrefix: "140/", numberSuffix: "/ST/DSP-BB/",
      fields: [["nama","Nama petugas/yang ditugaskan","text",true],["nik","NIK","text",false],["jabatan","Jabatan","text",true],["instansi","Instansi/asal","text",true],["tujuan","Tujuan Puskesmas","text",true],["keperluan","Keperluan/tugas","textarea",true],["tanggalMulai","Tanggal mulai","date",true],["tanggalSelesai","Tanggal selesai","date",true],["catatan","Catatan tambahan","textarea",false],["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]],
      body: d => `<p>Yang bertanda tangan di bawah ini Kepala Desa Pusar, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu, menugaskan kepada:</p>${rows([["Nama",d.nama],["NIK",d.nik],["Jabatan",d.jabatan],["Instansi/asal",d.instansi]])}<p>Untuk melaksanakan tugas/keperluan <strong>${esc(d.keperluan)}</strong> di ${esc(d.tujuan)}, pada tanggal ${fmtDate(d.tanggalMulai)} sampai dengan ${fmtDate(d.tanggalSelesai)}.</p>${d.catatan?`<p>Catatan: ${esc(d.catatan)}</p>`:""}<p>Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan dipergunakan sebagaimana mestinya.</p>`
    },
    nikah_laki: {
      title: "SURAT PENGANTAR NIKAH (LAKI-LAKI)", numberPrefix: "140/", numberSuffix: "/SPN/DSP-BB/",
      fields: [["nama","Nama lengkap calon pengantin","text",true],["nik","NIK","text",true],["noKK","Nomor KK","text",false],["ttl","Tempat/tanggal lahir","text",true],["jk","Jenis kelamin","select",true,["Laki-laki"]],["kewarganegaraan","Kewarganegaraan","text",true,"Indonesia"],["agama","Agama","text",true],["pekerjaan","Pekerjaan","select",true,["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],["statusKawin","Status perkawinan","select",true,["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"]],["alamat","Alamat","textarea",true],["namaPasangan","Nama calon istri","text",true],["alamatPasangan","Alamat calon istri","textarea",false],["keperluan","Keperluan","text",true,"Pengantar pencatatan nikah"],["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]],
      body: d => `<p>Yang bertanda tangan di bawah ini Kepala Desa Pusar, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu, menerangkan data calon pengantin laki-laki sebagai berikut:</p>${rows([["Nama",d.nama],["NIK",d.nik],["Nomor KK",d.noKK],["Tempat/tanggal lahir",d.ttl],["Jenis kelamin",d.jk],["Kewarganegaraan",d.kewarganegaraan],["Agama",d.agama],["Pekerjaan",d.pekerjaan],["Status perkawinan",d.statusKawin],["Alamat",d.alamat],["Nama calon istri",d.namaPasangan],["Alamat calon istri",d.alamatPasangan]])}<p>Surat pengantar ini dibuat untuk keperluan ${esc(d.keperluan)}. Data dan persyaratan tetap harus diverifikasi oleh instansi yang berwenang.</p><p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    nikah_perempuan: {
      title: "SURAT PENGANTAR NIKAH (PEREMPUAN)", numberPrefix: "140/", numberSuffix: "/SPN/DSP-BB/",
      fields: [["nama","Nama lengkap calon pengantin","text",true],["nik","NIK","text",true],["noKK","Nomor KK","text",false],["ttl","Tempat/tanggal lahir","text",true],["jk","Jenis kelamin","select",true,["Perempuan"]],["kewarganegaraan","Kewarganegaraan","text",true,"Indonesia"],["agama","Agama","text",true],["pekerjaan","Pekerjaan","select",true,["Belum/Tidak Bekerja", "Pelajar/Mahasiswa", "Mengurus Rumah Tangga", "Pensiunan", "PNS", "TNI", "POLRI", "Guru", "Tenaga Kesehatan", "Karyawan Swasta", "Wiraswasta", "Petani/Pekebun", "Nelayan", "Buruh Harian Lepas", "Pedagang", "Sopir", "Perangkat Desa", "Lainnya"]],["statusKawin","Status perkawinan","select",true,["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"]],["alamat","Alamat","textarea",true],["namaPasangan","Nama calon suami","text",true],["alamatPasangan","Alamat calon suami","textarea",false],["keperluan","Keperluan","text",true,"Pengantar pencatatan nikah"],["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]],
      body: d => `<p>Yang bertanda tangan di bawah ini Kepala Desa Pusar, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu, menerangkan data calon pengantin perempuan sebagai berikut:</p>${rows([["Nama",d.nama],["NIK",d.nik],["Nomor KK",d.noKK],["Tempat/tanggal lahir",d.ttl],["Jenis kelamin",d.jk],["Kewarganegaraan",d.kewarganegaraan],["Agama",d.agama],["Pekerjaan",d.pekerjaan],["Status perkawinan",d.statusKawin],["Alamat",d.alamat],["Nama calon suami",d.namaPasangan],["Alamat calon suami",d.alamatPasangan]])}<p>Surat pengantar ini dibuat untuk keperluan ${esc(d.keperluan)}. Data dan persyaratan tetap harus diverifikasi oleh instansi yang berwenang.</p><p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>`
    },
    undangan_beasiswa: {
      title: "UNDANGAN PENYERAHAN BEASISWA BERPRESTASI", numberPrefix: "005/", numberSuffix: "/UND/DSP-BB/",
      fields: [["namaPenerima","Nama penerima/undangan","text",true],["alamat","Alamat penerima","textarea",false],["namaKegiatan","Nama kegiatan","text",true,"Penyerahan Beasiswa Berprestasi"],["hariTanggal","Hari/tanggal kegiatan","text",true],["waktu","Waktu","text",true],["tempat","Tempat kegiatan","text",true],["catatan","Catatan/persyaratan","textarea",false],["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",true,"Pusar"],["tanggalTerbit","Tanggal surat","date",true]],
      body: d => `<p>Kepada Yth. ${esc(d.namaPenerima)}${d.alamat?`<br>${esc(d.alamat)}`:""}</p><p>Dengan hormat, sehubungan dengan kegiatan <strong>${esc(d.namaKegiatan)}</strong>, kami mengundang Saudara/i untuk hadir pada:</p>${rows([["Hari/tanggal",d.hariTanggal],["Waktu",d.waktu],["Tempat",d.tempat]])}${d.catatan?`<p>Catatan: ${esc(d.catatan)}</p>`:""}<p>Demikian undangan ini disampaikan. Atas kehadiran dan perhatiannya kami ucapkan terima kasih.</p>`
    },
  };

  const kop = {
    kabupaten: "PEMERINTAH KABUPATEN OGAN KOMERING ULU",
    kecamatan: "KECAMATAN BATURAJA BARAT",
    desa: "DESA PUSAR",
    alamat: "Jalan Puyang Padang No 001 Baturaja Kab. Ogan Komering Ulu, Provinsi Sumatera Selatan",
    kontak: "Email: desapusar@okukab.go.id | Website: https://pusar.okukab.go.id"
  };

  const DEFAULT_KOP = {...kop, kepala:"ZAINUDDIN"};
  const safeLoad = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; } };
  const customTemplates = safeLoad("banuakita_templates_v1", []);
  let residents = safeLoad("banuakita_residents_v1", []);
  Object.assign(kop, safeLoad("banuakita_settings_v1", {}));
  let currentResidentId = null;

  root.innerHTML = `
    <style>
      #form-surat-desa{max-width:none!important;margin:0!important;padding:0!important;border-radius:0!important;background:#f1f5f3!important;min-height:100vh!important;color:#162b25}
      #form-surat-desa .fsd-admin{display:grid;grid-template-columns:238px minmax(0,1fr);min-height:100vh}
      #form-surat-desa .fsd-sidebar{background:linear-gradient(180deg,#173f32,#0f3328);color:#e8f6ef;padding:18px 12px;display:flex;flex-direction:column;gap:18px}
      #form-surat-desa .fsd-brand{display:flex;align-items:center;gap:10px;padding:0 7px 5px}
      #form-surat-desa .fsd-brand-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#ffffff20;font-size:24px}
      #form-surat-desa .fsd-brand strong{display:block;font-size:17px;color:#fff;letter-spacing:-.3px}
      #form-surat-desa .fsd-brand small{display:block;color:#b7d4c8;font-size:11px;margin-top:2px}
      #form-surat-desa .fsd-user{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #ffffff20;background:#ffffff0d;border-radius:13px;font-size:12px;font-weight:700}
      #form-surat-desa .fsd-avatar{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:#38a578;color:#fff}
      #form-surat-desa .fsd-menu-label{font-size:10px;font-weight:800;letter-spacing:1.3px;color:#8db7a7;padding:0 10px;margin:8px 0 6px}
      #form-surat-desa .fsd-nav{display:grid;gap:5px}
      #form-surat-desa .fsd-nav button{display:flex;align-items:center;gap:11px;width:100%;border:0;border-radius:10px;padding:12px 11px;background:transparent;color:#e4f4ed;text-align:left;font:600 13px inherit;cursor:pointer;transition:background .15s}
      #form-surat-desa .fsd-nav button:hover{background:#ffffff12}
      #form-surat-desa .fsd-nav button.active{background:#379d70;color:#fff;box-shadow:0 5px 15px #0b221a30}
      #form-surat-desa .fsd-nav .fsd-nav-icon{width:20px;text-align:center;font-size:16px}
      #form-surat-desa .fsd-main{min-width:0}
      #form-surat-desa .fsd-topbar{height:76px;background:#fff;border-bottom:1px solid #e3ebe6;padding:15px 30px;display:flex;align-items:center;justify-content:space-between}
      #form-surat-desa .fsd-topbar h1{margin:0;font-size:22px;color:#1d3029;letter-spacing:-.5px}
      #form-surat-desa .fsd-crumb{font-size:12px;color:#819087;margin-top:4px}
      #form-surat-desa .fsd-crumb b{color:#27926a}
      #form-surat-desa .fsd-main-content{padding:26px 30px;max-width:1600px;margin:auto}
      #form-surat-desa .fsd-admin-card{background:#fff;border:1px solid #e1e9e4;border-radius:16px;padding:22px;box-shadow:0 8px 22px #173b510b;margin-bottom:18px}
      #form-surat-desa .fsd-admin-card h2{font-size:17px;color:#20372d;margin:0 0 10px}
      #form-surat-desa .fsd-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin-bottom:18px}
      #form-surat-desa .fsd-stat{background:#fff;border:1px solid #e1e9e4;border-radius:15px;padding:18px}
      #form-surat-desa .fsd-stat small{display:block;color:#73847a;font-size:12px}
      #form-surat-desa .fsd-stat strong{display:block;font-size:27px;color:#246c4c;margin-top:8px}
      #form-surat-desa .fsd-view[hidden]{display:none!important}
      #form-surat-desa .fsd-main-content .fsd-hero{margin-bottom:18px}
      @media(max-width:850px){#form-surat-desa .fsd-admin{grid-template-columns:1fr}#form-surat-desa .fsd-sidebar{padding:12px;gap:10px}#form-surat-desa .fsd-nav{grid-template-columns:repeat(2,minmax(0,1fr))}#form-surat-desa .fsd-menu-label{margin-top:5px}#form-surat-desa .fsd-topbar{height:auto;padding:16px}#form-surat-desa .fsd-main-content{padding:14px}#form-surat-desa .fsd-stat-grid{grid-template-columns:1fr} }

      #form-surat-desa{font-family:Inter,"Segoe UI",Arial,sans-serif;color:#172b3a;max-width:1240px;margin:24px auto;padding:clamp(12px,2.5vw,28px);background:#f3f7fb;border-radius:24px}
      #form-surat-desa *{box-sizing:border-box}
      #form-surat-desa .fsd-hero{position:relative;overflow:hidden;padding:30px 32px;margin-bottom:20px;border-radius:20px;background:linear-gradient(125deg,#123c56 0%,#176b68 62%,#43a58b 100%);color:#fff;box-shadow:0 14px 34px #123c5624}
      #form-surat-desa .fsd-hero:after{content:"";position:absolute;width:220px;height:220px;right:-60px;top:-95px;border:28px solid #ffffff16;border-radius:50%;pointer-events:none}
      #form-surat-desa .fsd-kicker{display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border:1px solid #ffffff45;border-radius:999px;background:#ffffff12;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}
      #form-surat-desa .fsd-hero h1{position:relative;z-index:1;margin:14px 0 8px;font-size:clamp(25px,4vw,36px);line-height:1.15;letter-spacing:-.7px;color:#fff}
      #form-surat-desa .fsd-hero p{position:relative;z-index:1;max-width:700px;margin:0;color:#e3f2f1;font-size:14px;line-height:1.7}
      .fsd-layout{display:grid;grid-template-columns:minmax(300px,.95fr) minmax(340px,1.05fr);gap:20px;align-items:start}
      .fsd-panel{min-width:0;border:1px solid #e0e8ef;border-radius:17px;padding:22px;background:#fff;box-shadow:0 6px 22px #173b5110}
      .fsd-panel h2{display:flex;align-items:center;gap:9px;margin:0 0 17px;font-size:19px;font-weight:750;letter-spacing:-.25px;color:#163c50}
      .fsd-panel h2:before{content:"";width:5px;height:23px;border-radius:5px;background:#2c9a83;display:inline-block;flex:0 0 5px}
      .fsd-field{display:block;margin:0 0 15px;font-size:13px;font-weight:700;color:#29485a}
      .fsd-field input,.fsd-field select,.fsd-field textarea{display:block;width:100%;margin-top:7px;padding:11px 12px;border:1px solid #d2dee7;border-radius:9px;background:#fbfdff;color:#182f3d;font:inherit;font-size:14px;font-weight:400;outline:none;transition:border-color .18s,box-shadow .18s,background .18s}
      .fsd-field input:focus,.fsd-field select:focus,.fsd-field textarea:focus{border-color:#26967f;background:#fff;box-shadow:0 0 0 3px #26967f20}
      .fsd-field textarea{min-height:88px;resize:vertical;line-height:1.5}
      .fsd-field input[type=file]{padding:10px;background:#f6fafb}
      .fsd-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px}
      .fsd-actions button{padding:11px 15px;border:1px solid #176d67;border-radius:9px;background:linear-gradient(135deg,#176d67,#208a78);color:#fff;font:inherit;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 3px 8px #176d671c;transition:transform .15s,box-shadow .15s,filter .15s}
      .fsd-actions button:hover{transform:translateY(-1px);box-shadow:0 6px 14px #176d6730;filter:brightness(1.04)}
      .fsd-actions button:focus-visible{outline:3px solid #75cbb8;outline-offset:2px}
      .fsd-actions button.secondary{background:#eef4f7;color:#29495b;border-color:#dce6ec;box-shadow:none}
      .fsd-note{font-size:12px;color:#627785;line-height:1.65}
      #form-surat-desa> .fsd-note{margin:0 2px 20px}
      #form-surat-desa section[style]{margin:0 0 20px!important}
      #fsd-ocr-status{padding:0 2px;font-weight:600}
      .fsd-paper{overflow:auto;background:#fff;color:#000;padding:30px;border:1px solid #e0e7ec;border-radius:10px;min-height:600px;font-family:"Times New Roman",serif;font-size:14px;line-height:1.5;box-shadow:inset 0 0 0 5px #f8fafb}
      .fsd-kop{text-align:center;border-bottom:3px double #000;padding-bottom:8px;margin-bottom:18px}
      .fsd-kop strong{display:block;font-size:16px}
      .fsd-kop .fsd-desa{font-size:18px}
      .fsd-kop small{font-size:11px}
      .fsd-surat-title{text-align:center;font-weight:bold;text-decoration:underline;margin:16px 0 0}
      .fsd-nomor{text-align:center;margin:0 0 20px}
      .fsd-paper p{margin:10px 0;text-align:justify}
      .fsd-paper table{border-collapse:collapse;width:100%;margin:8px 0}
      .fsd-paper td{vertical-align:top;padding:1px 4px}
      .fsd-paper td:first-child{width:34%}
      .fsd-sign{width:42%;margin:25px 0 0 auto;text-align:center;min-height:115px}
      @media(max-width:850px){#form-surat-desa{margin:0 auto;padding:12px;border-radius:0}.fsd-layout{grid-template-columns:1fr}.fsd-panel{padding:18px}.fsd-hero{padding:24px!important}.fsd-paper{padding:18px;min-height:420px}}
      @media(max-width:480px){.fsd-actions{display:grid;grid-template-columns:1fr}.fsd-actions button{width:100%}.fsd-hero h1{font-size:26px}}
      @media print{#form-surat-desa{background:#fff;margin:0;padding:0;max-width:none}body *{visibility:hidden!important}#fsd-preview,#fsd-preview *{visibility:visible!important}#fsd-preview{position:absolute;left:0;top:0;width:100%;border:0;border-radius:0;padding:12mm;min-height:auto;box-shadow:none;overflow:visible}.fsd-paper{border:0;padding:0;box-shadow:none}.no-print{display:none!important}}
      #form-surat-desa{max-width:none!important;margin:0!important;padding:0!important;border-radius:0!important;background:#f1f5f3!important;min-height:100vh!important}
      #form-surat-desa .fsd-nav button{font-family:inherit;font-size:13px;font-weight:600}
      #form-surat-desa .fsd-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      #form-surat-desa .fsd-form-grid input,#form-surat-desa .fsd-form-grid select,#form-surat-desa .fsd-form-grid textarea,#form-surat-desa #res-search{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d5e1da;border-radius:8px;font:inherit;background:#fff}
      #form-surat-desa #res-list table{border-collapse:collapse;width:100%;margin-top:12px}#form-surat-desa #res-list th,#form-surat-desa #res-list td{padding:8px;border-bottom:1px solid #e4ece7;text-align:left;font-size:12px}
      @media(max-width:700px){#form-surat-desa .fsd-form-grid{grid-template-columns:1fr}}
    </style>
    <div class="fsd-admin">
      <aside class="fsd-sidebar no-print">
        <div class="fsd-brand"><div class="fsd-brand-icon">🏡</div><div><strong>BanuaKita</strong><small>Administrasi Desa</small></div></div>
        <div class="fsd-user"><span class="fsd-avatar">AD</span><span>Administrasi Desa<br><small style="font-weight:400;color:#b7d4c8">Sistem Desa Digital</small></span></div>
        <div><div class="fsd-menu-label">MENU UTAMA</div><nav class="fsd-nav">
          <button type="button" data-view="dashboard" class="active"><span class="fsd-nav-icon">🏠</span>Dashboard</button>
          <button type="button" data-view="penduduk"><span class="fsd-nav-icon">👥</span>Data Penduduk</button>
          <button type="button" data-view="buat"><span class="fsd-nav-icon">✉️</span>Buat Surat</button>
          <button type="button" data-view="arsip"><span class="fsd-nav-icon">🗄️</span>Arsip Surat</button>
        </nav></div>
        <div><div class="fsd-menu-label">KONFIGURASI</div><nav class="fsd-nav">
          <button type="button" data-view="jenis"><span class="fsd-nav-icon">📄</span>Jenis Surat</button>
          <button type="button" data-view="template"><span class="fsd-nav-icon">📝</span>Template Surat</button>
          <button type="button" data-view="pengaturan"><span class="fsd-nav-icon">⚙️</span>Pengaturan Desa</button>
          <button type="button" data-view="pengguna"><span class="fsd-nav-icon">👤</span>Pengguna</button>
          <button type="button" data-view="backup"><span class="fsd-nav-icon">💾</span>Backup / Restore</button>
        </nav></div>
      </aside>
      <main class="fsd-main">
        <div class="fsd-topbar"><div><h1 id="fsd-page-title">Dashboard</h1><div class="fsd-crumb">BanuaKita / <b id="fsd-breadcrumb">Dashboard</b></div></div><span style="width:28px;height:28px;border-radius:50%;background:#e7f5ee;display:block" title="Administrasi Desa"></span></div>
        <div class="fsd-main-content">
          <section class="fsd-view" data-panel="dashboard">
            <div class="fsd-admin-card"><h2>Selamat Datang di BANUAKITA</h2><p>Sistem Administrasi Desa.</p><p>Kelola pembuatan surat dan administrasi desa dari menu di sebelah kiri.</p><button type="button" class="fsd-dash-create" style="border:0;border-radius:9px;background:#329b70;color:#fff;padding:11px 16px;font-weight:700;cursor:pointer">＋ Buat Surat Baru</button></div>
            <div class="fsd-stat-grid"><div class="fsd-stat"><small>Jenis Surat Tersedia</small><strong>15</strong></div><div class="fsd-stat"><small>Surat Dibuat Sesi Ini</small><strong id="fsd-session-count">0</strong></div><div class="fsd-stat"><small>Status Aplikasi</small><strong style="font-size:19px">Siap Digunakan</strong></div></div>
            <div class="fsd-admin-card"><h2>Akses Cepat</h2><p class="fsd-note">Pilih Buat Surat untuk mengisi formulir, melihat pratinjau, mencetak PDF, atau mengunduh dokumen Word.</p></div>
          </section>
          <section class="fsd-view" data-panel="penduduk" hidden>
            <div class="fsd-admin-card"><h2>Data Penduduk</h2><p class="fsd-note">Isi biodata secara manual atau baca dari foto KTP. Data disimpan di browser perangkat ini.</p>
              <div class="fsd-actions"><label class="fsd-field">Foto KTP<input id="res-ktp-file" type="file" accept="image/*"></label><button id="res-read-ktp" type="button">🪪 Baca KTP (OCR)</button></div><p id="res-ocr-status" class="fsd-note" aria-live="polite"></p>
              <div class="fsd-form-grid" id="res-form">
                <label class="fsd-field">NIK<input id="res-nik" maxlength="16" inputmode="numeric"></label><label class="fsd-field">Nomor KK<input id="res-kk"></label>
                <label class="fsd-field">Nama lengkap<input id="res-nama" required></label><label class="fsd-field">Tempat, tanggal lahir<input id="res-ttl"></label>
                <label class="fsd-field">Jenis kelamin<select id="res-jk"><option value="">-- Pilih --</option><option>Laki-laki</option><option>Perempuan</option></select></label><label class="fsd-field">Agama<input id="res-agama"></label>
                <label class="fsd-field">Pekerjaan<select id="res-pekerjaan"><option value="">-- Pilih pekerjaan --</option><option>Belum/Tidak Bekerja</option><option>Pelajar/Mahasiswa</option><option>Mengurus Rumah Tangga</option><option>Pensiunan</option><option>PNS</option><option>TNI</option><option>POLRI</option><option>Guru</option><option>Tenaga Kesehatan</option><option>Karyawan Swasta</option><option>Wiraswasta</option><option>Petani/Pekebun</option><option>Nelayan</option><option>Buruh Harian Lepas</option><option>Pedagang</option><option>Sopir</option><option>Perangkat Desa</option><option>Lainnya</option></select></label><label class="fsd-field">Status perkawinan<select id="res-status"><option value="">-- Pilih status --</option><option>Belum Kawin</option><option>Kawin</option><option>Cerai Hidup</option><option>Cerai Mati</option></select></label><label class="fsd-field" style="grid-column:1/-1">Alamat<textarea id="res-alamat" rows="2"></textarea></label>
              </div><div class="fsd-actions"><button type="button" id="res-save">Simpan Penduduk</button><button type="button" class="secondary" id="res-clear">Form Baru</button></div><p id="res-message" class="fsd-note" aria-live="polite"></p>
            </div><div class="fsd-admin-card"><h2>Daftar Penduduk Tersimpan</h2><input id="res-search" placeholder="Cari nama atau NIK..."><div id="res-list"></div></div>
          </section>
          <section class="fsd-view" data-panel="arsip" hidden><div class="fsd-admin-card"><h2>Arsip Surat</h2><p>Modul arsip permanen belum diaktifkan. Simpan dokumen yang diunduh ke folder arsip desa sesuai prosedur kantor.</p><p class="fsd-note">Surat yang dibuat tidak otomatis tersimpan dalam arsip aplikasi.</p></div></section>
          <section class="fsd-view" data-panel="jenis" hidden><div class="fsd-admin-card"><h2>Jenis Surat</h2><p>Daftar jenis surat yang tersedia di aplikasi:</p><div id="fsd-type-list" class="fsd-note"></div><button type="button" class="fsd-dash-create" data-go="buat" style="border:0;border-radius:9px;background:#329b70;color:#fff;padding:11px 16px;font-weight:700;cursor:pointer">Buat Surat</button></div></section>
          <section class="fsd-view" data-panel="template" hidden><div class="fsd-admin-card"><h2>Import Template Surat dari Word</h2><p class="fsd-note">Unggah file .docx. Teks akan diekstrak untuk disimpan sebagai pilihan surat di aplikasi. Format tata letak Word yang kompleks mungkin tidak ikut terbawa; periksa pratinjau sebelum dipakai.</p>
            <label class="fsd-field">Nama jenis surat<input id="tpl-title" placeholder="Contoh: Surat Keterangan Kelahiran"></label><label class="fsd-field">File Word (.docx)<input id="tpl-file" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label>
            <label class="fsd-field">Isi template (gunakan {{nama}}, {{nik}}, {{alamat}} untuk kolom yang akan diisi)<textarea id="tpl-content" rows="12" placeholder="Teks hasil import Word akan muncul di sini. Anda juga dapat mengeditnya..."></textarea></label>
            <div class="fsd-actions"><button type="button" id="tpl-import">Import Word</button><button type="button" id="tpl-save">Simpan sebagai Pilihan Surat</button></div><p id="tpl-message" class="fsd-note" aria-live="polite"></p></div><div class="fsd-admin-card"><h2>Template Tersimpan</h2><div id="tpl-list"></div></div></section>
          <section class="fsd-view" data-panel="pengaturan" hidden><div class="fsd-admin-card"><h2>Pengaturan Desa & Kop Surat</h2><p class="fsd-note">Perubahan disimpan di browser ini dan digunakan pada pratinjau surat.</p><div class="fsd-form-grid">
            <label class="fsd-field">Nama kabupaten/kota<input id="set-kabupaten"></label><label class="fsd-field">Nama kecamatan<input id="set-kecamatan"></label><label class="fsd-field">Nama desa/kelurahan<input id="set-desa"></label><label class="fsd-field">Nama kepala desa<input id="set-kepala"></label><label class="fsd-field" style="grid-column:1/-1">Alamat kantor<input id="set-alamat"></label><label class="fsd-field" style="grid-column:1/-1">Email, telepon, website<input id="set-kontak"></label></div><div class="fsd-actions"><button id="set-save" type="button">Simpan Pengaturan Desa</button><button id="set-reset" type="button" class="secondary">Kembalikan Default</button></div><p id="set-message" class="fsd-note" aria-live="polite"></p></div></section>
          <section class="fsd-view" data-panel="pengguna" hidden><div class="fsd-admin-card"><h2>Pengguna</h2><p>Menu ini merupakan tampilan awal. Pengelolaan akun, kata sandi, dan hak akses belum terhubung ke sistem autentikasi.</p></div></section>
          <section class="fsd-view" data-panel="backup" hidden><div class="fsd-admin-card"><h2>Backup / Restore</h2><p>Fitur pencadangan database belum tersedia karena aplikasi saat ini berjalan secara lokal di browser dan belum memakai basis data.</p><p class="fsd-note">Untuk pencadangan, simpan file aplikasi dan dokumen surat hasil unduhan pada media penyimpanan kantor.</p></div></section>
          <section class="fsd-view" data-panel="buat" hidden>
    <header class="fsd-hero">
      <div class="fsd-kicker">✦ Pelayanan Administrasi Desa</div>
      <h1>Form Isian Surat Desa</h1>
      <p>Buat surat keterangan dengan lebih praktis. Isi data penduduk, baca data dari foto KTP, lalu periksa pratinjau sebelum mencetak atau mengunduh dokumen.</p>
    </header>
    <p class="fsd-note">🔒 Data formulir diproses di browser pada halaman ini dan tidak dikirim ke server oleh aplikasi. Pastikan seluruh data dan format surat benar sebelum digunakan.</p>
    <section class="fsd-panel no-print" style="margin:14px 0">
      <h2><span aria-hidden="true">🪪</span> Baca Data KTP (OCR)</h2>
      <p class="fsd-note">Pilih foto atau hasil scan KTP yang jelas. Sistem akan mencoba membaca teks, lalu Bapak dapat memeriksa dan memasukkan data ke formulir. Hasil OCR bisa keliru—selalu cocokkan dengan KTP asli. Pemrosesan dilakukan di browser; pustaka OCR dimuat dari internet.</p>
      <label class="fsd-field">Foto KTP (JPG, PNG)
        <input type="file" id="fsd-ktp-file" accept="image/*">
      </label>
      <div class="fsd-actions">
        <button type="button" id="fsd-read-ktp">Baca KTP</button>
        <button type="button" class="secondary" id="fsd-apply-ktp">Masukkan data ke formulir</button>
      </div>
      <p id="fsd-ocr-status" class="fsd-note" aria-live="polite"></p>
      <label class="fsd-field">Hasil teks OCR (silakan periksa/koreksi)
        <textarea id="fsd-ocr-text" rows="7" placeholder="Teks hasil pembacaan KTP akan tampil di sini..."></textarea>
      </label>
    </section>
    <div class="fsd-layout">
      <section class="fsd-panel no-print">
        <h2>Data Surat</h2>
        <label class="fsd-field">Jenis surat
          <select id="fsd-type">
            <option value="domisili">Surat Keterangan Domisili</option>
            <option value="kematian">Surat Keterangan Kematian</option>
            <option value="kehilangan_kk">Surat Keterangan Kehilangan KK</option>
            <option value="kehilangan_ktp">Surat Keterangan Kehilangan KTP</option>
            <option value="kis">Surat Keterangan KIS</option>
            <option value="kip">Surat Keterangan Tidak Mampu Pelajar (KIP)</option>
            <option value="sktm">Surat Keterangan Tidak Mampu (SKTM)</option>
            <option value="usaha">Surat Keterangan Usaha</option>
            <option value="pindah">Surat Keterangan Pindah Penduduk</option>
            <option value="imunisasi_catin">Surat Pengantar Imunisasi Catin</option>
            <option value="kelahiran">Surat Keterangan Kelahiran (Draf)</option>
            <option value="tugas_puskesmas">Surat Tugas ke Puskesmas (Draf)</option>
            <option value="nikah_laki">Surat Pengantar Nikah (Laki-laki) (Draf)</option>
            <option value="nikah_perempuan">Surat Pengantar Nikah (Perempuan) (Draf)</option>
            <option value="undangan_beasiswa">Undangan Penyerahan Beasiswa Berprestasi (Draf)</option>
          </select>
        </label>
        <div class="fsd-mode-box" style="margin:14px 0;padding:14px;border:1px solid #d8e7df;border-radius:12px;background:#f7fbf8">
          <h3 style="margin:0 0 10px">Sumber Data Surat</h3>
          <label class="fsd-field">Cara mengisi data
            <select id="fsd-entry-mode"><option value="manual">Input manual</option><option value="resident">Isi otomatis dari Data Penduduk</option></select>
          </label>
          <div id="fsd-resident-picker" hidden style="margin-top:10px">
            <label class="fsd-field">Pilih penduduk tersimpan
              <select id="fsd-resident-select"><option value="">-- Pilih nama / NIK --</option></select>
            </label>
            <div class="fsd-actions"><button type="button" id="fsd-fill-resident">Ambil Data Penduduk</button></div>
            <p class="fsd-note">Data yang cocok akan dimasukkan ke kolom surat. Periksa kembali dan lengkapi kolom khusus surat sebelum dicetak.</p>
          </div>
        </div>
        <div id="fsd-fields"></div>
        <div class="fsd-actions">
          <button type="button" id="fsd-update">Perbarui Pratinjau</button>
          <button type="button" class="secondary" id="fsd-print">Cetak / Simpan PDF</button>
          <button type="button" class="secondary" id="fsd-download">Unduh HTML Surat</button>
          <button type="button" id="fsd-word">Unduh Word (.docx)</button>
        </div>
        <p class="fsd-note">Template yang diunggah menggunakan kop Desa Pusar untuk surat-surat contoh, sedangkan file kop terpisah adalah Desa Halangan. Pratinjau ini mengikuti isi surat contoh Desa Pusar. Pastikan kop, pejabat, nomor, dan format resmi disesuaikan sebelum digunakan.</p>
      </section>
      <section class="fsd-panel">
        <h2 class="no-print">Pratinjau Surat</h2>
        <div id="fsd-preview" class="fsd-paper"></div>
      </section>
    </div>
          </section>
        </div>
      </main>
    </div>`;

  const ktpFileInput = document.getElementById("fsd-ktp-file");
  const ocrTextArea = document.getElementById("fsd-ocr-text");
  const ocrStatus = document.getElementById("fsd-ocr-status");

  function loadScriptOnce(src, globalName) {
    return new Promise((resolve, reject) => {
      if (window[globalName]) return resolve(window[globalName]);
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window[globalName]), { once: true });
        existing.addEventListener("error", () => reject(new Error("Pustaka gagal dimuat.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => window[globalName] ? resolve(window[globalName]) : reject(new Error("Pustaka OCR tidak tersedia."));
      script.onerror = () => reject(new Error("Tidak dapat memuat pustaka OCR. Periksa koneksi internet."));
      document.head.appendChild(script);
    });
  }

  function parseKtpText(raw) {
    const text = raw.replace(/\r/g, "\n").replace(/[ \t]+/g, " ");
    const lines = text.split("\n").map(x => x.trim()).filter(Boolean);
    const findValue = (label) => {
      const re = new RegExp("^" + label + "\\s*[:.]?\\s*(.*)$", "i");
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(re);
        if (m) {
          let val = m[1].trim();
          if (!val && lines[i + 1]) val = lines[i + 1].trim();
          if (val) return val.replace(/^[:\s.-]+/, "").trim();
        }
      }
      const inline = text.match(new RegExp(label + "\\s*[:.]?\\s*([^\\n]+)", "i"));
      return inline ? inline[1].trim() : "";
    };
    const digits = text.replace(/[^\d]/g, " ").match(/(?:\d[\s-]*){16}/);
    const nik = digits ? digits[0].replace(/\D/g, "").slice(0,16) : findValue("NIK").replace(/\D/g,"").slice(0,16);
    let nama = findValue("Nama");
    if (nama) nama = nama.replace(/\s+(NIK|Tempat|Jenis Kelamin|Alamat|Agama|Status Perkawinan|Pekerjaan|Kewarganegaraan).*$/i, "").trim();
    const ttl = findValue("Tempat\\s*[/,]?\\s*Tgl\\s*Lahir") || findValue("Tempat\\s*Tanggal\\s*Lahir");
    const jkRaw = findValue("Jenis\\s*Kelamin");
    const jk = /perempuan|wanita/i.test(jkRaw) ? "Perempuan" : (/laki/i.test(jkRaw) ? "Laki-laki" : "");
    const agama = findValue("Agama");
    let alamat = findValue("Alamat");
    const rt = findValue("RT\\s*[/]?\\s*RW");
    const kel = findValue("Kel[/ ]?Desa");
    const kec = findValue("Kecamatan");
    const alamatParts = [alamat, rt ? "RT/RW " + rt : "", kel ? "Kel/Desa " + kel : "", kec ? "Kecamatan " + kec : ""].filter(Boolean);
    if (alamatParts.length) alamat = alamatParts.join(", ");
    return { nama, nik, ttl, jk, agama, alamat };
  }

  async function readKtp() {
    const file = ktpFileInput.files && ktpFileInput.files[0];
    if (!file) {
      ocrStatus.textContent = "Pilih foto KTP terlebih dahulu.";
      return;
    }
    if (!file.type.startsWith("image/")) {
      ocrStatus.textContent = "File harus berupa gambar (JPG atau PNG).";
      return;
    }
    const button = document.getElementById("fsd-read-ktp");
    button.disabled = true;
    ocrStatus.textContent = "Sedang membaca gambar KTP. Proses dapat memerlukan waktu...";
    try {
      const Tesseract = await loadScriptOnce("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js", "Tesseract");
      const result = await Tesseract.recognize(file, "ind+eng", {
        logger: m => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            ocrStatus.textContent = `Sedang membaca teks: ${Math.round(m.progress * 100)}%`;
          }
        }
      });
      ocrTextArea.value = result.data.text || "";
      ocrStatus.textContent = "Pembacaan selesai. Periksa teks hasil OCR, lalu klik “Masukkan data ke formulir”.";
    } catch (err) {
      ocrStatus.textContent = "Gagal membaca KTP: " + (err.message || "Terjadi kesalahan.") + " Pastikan internet aktif dan coba gambar yang lebih jelas.";
    } finally {
      button.disabled = false;
    }
  }

  function applyKtpData() {
    const data = parseKtpText(ocrTextArea.value);
    const mapping = { nama: data.nama, nik: data.nik, ttl: data.ttl, jk: data.jk, agama: data.agama, alamat: data.alamat };
    let applied = 0;
    for (const [key, value] of Object.entries(mapping)) {
      const el = document.getElementById(`fsd-${key}`);
      if (el && value) {
        if (el.tagName === "SELECT") {
          const option = Array.from(el.options).find(o => o.value.toLowerCase() === value.toLowerCase());
          if (option) el.value = option.value;
        } else {
          el.value = value;
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        applied++;
      }
    }
    if (applied) {
      ocrStatus.textContent = `${applied} data dimasukkan ke formulir yang sedang dipilih. Mohon periksa kembali semua kolom.`;
      renderPreview();
    } else {
      ocrStatus.textContent = "Belum ada data yang cocok ditemukan. Periksa teks OCR atau isi formulir secara manual.";
    }
  }

  const typeSelect = document.getElementById("fsd-type");
  const fieldsBox = document.getElementById("fsd-fields");
  const preview = document.getElementById("fsd-preview");

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
  function rows(items) {
    return `<table>${items.map(([label, value]) =>
      `<tr><td>${esc(label)}</td><td>: ${esc(value || "................................")}</td></tr>`
    ).join("")}</table>`;
  }
  function fmtDate(value) {
    if (!value) return "";
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  }
  function fieldMarkup(field) {
    const [key, label, type, required, optionsOrDefault] = field;
    const defaultValue = typeof optionsOrDefault === "string" ? optionsOrDefault : "";
    const requiredAttr = required ? "required" : "";
    let control;
    if (type === "textarea") {
      control = `<textarea id="fsd-${key}" name="${key}" ${requiredAttr}>${esc(defaultValue)}</textarea>`;
    } else if (type === "select") {
      control = `<select id="fsd-${key}" name="${key}" ${requiredAttr}>
        <option value="">-- Pilih --</option>${optionsOrDefault.map(x => `<option>${esc(x)}</option>`).join("")}
      </select>`;
    } else {
      const val = type === "date" ? "" : defaultValue;
      control = `<input id="fsd-${key}" name="${key}" type="${type}" value="${esc(val)}" ${requiredAttr}>`;
    }
    return `<label class="fsd-field">${esc(label)}${control}</label>`;
  }
  function refreshResidentPicker() {
    const select = document.getElementById("fsd-resident-select");
    if (!select) return;
    const previous = select.value;
    select.innerHTML = '<option value="">-- Pilih nama / NIK --</option>' + residents.map(r => `<option value="${esc(r.id)}">${esc(r.nama || "Tanpa nama")} — ${esc(r.nik || "Tanpa NIK")}</option>`).join("");
    if (residents.some(r => r.id === previous)) select.value = previous;
  }
  function fillFromResident() {
    const id = document.getElementById("fsd-resident-select").value;
    const r = residents.find(item => item.id === id);
    if (!r) { alert("Pilih data penduduk terlebih dahulu."); return; }
    const aliases = {
      nama: ["nama","namaLengkap","namaPemohon","namaPenduduk","namaAnak","namaPelapor","namaAyah","namaIbu","namaCalonPengantin","namaCalonSuami","namaCalonIstri","namaPenerima","namaPetugas"],
      nik: ["nik","NIK","noKtp","nomorKtp"], kk: ["kk","noKK","nomorKK"], ttl: ["ttl","tempatTanggalLahir","tempatTglLahir","tempatLahir"],
      jk: ["jk","jenisKelamin","jenis_kelamin"], agama: ["agama"], pekerjaan: ["pekerjaan"], status: ["status","statusPerkawinan"], alamat: ["alamat","alamatKTP","alamatTempatTinggal","alamatAsal"]
    };
    const data = {};
    Object.entries(aliases).forEach(([source, keys]) => keys.forEach(k => { if (r[source] && !data[k]) data[k] = r[source]; }));
    let count = 0;
    Object.entries(data).forEach(([key, value]) => {
      const el = document.getElementById("fsd-" + key);
      if (el && value && !el.value) { el.value = value; count++; }
    });
    // Also fill matching field names directly, including custom Word template placeholders.
    Object.entries(r).forEach(([key, value]) => {
      if (["id"].includes(key) || !value) return;
      const el = document.getElementById("fsd-" + key);
      if (el && !el.value) { el.value = value; count++; }
    });
    renderPreview();
    const note = document.getElementById("fsd-resident-fill-status");
    if (note) note.textContent = count ? `Data penduduk berhasil dimasukkan ke ${count} kolom yang cocok. Lengkapi data lain secara manual.` : "Tidak ada kolom kosong yang cocok; periksa apakah data sudah terisi atau nama kolom berbeda.";
  }
  function initEntryMode() {
    const mode = document.getElementById("fsd-entry-mode");
    const picker = document.getElementById("fsd-resident-picker");
    mode.addEventListener("change", () => { picker.hidden = mode.value !== "resident"; if (mode.value === "resident") refreshResidentPicker(); });
    document.getElementById("fsd-fill-resident").addEventListener("click", fillFromResident);
    const box = document.getElementById("fsd-resident-picker");
    const p = document.createElement("p"); p.id = "fsd-resident-fill-status"; p.className = "fsd-note"; p.setAttribute("aria-live","polite"); box.appendChild(p);
    refreshResidentPicker();
  }

  function renderFields() {
    const custom = customTemplates.find(t => t.id === typeSelect.value);
    if (custom) {
      const keys = [...custom.content.matchAll(/{{\s*([\w-]+)\s*}}/g)].map(m => m[1]);
      const uniq = [...new Set(keys)];
      const base = [["nomorSurat","Nomor surat (bagian kosong)","text",false],["bulanNomor","Bulan pada nomor surat","text",false],["tahunNomor","Tahun pada nomor surat","number",false],["tempatTerbit","Dikeluarkan di","text",false,"Pusar"],["tanggalTerbit","Tanggal surat","date",false]];
      fieldsBox.innerHTML = [...uniq.map(k => [k, k.replace(/[-_]/g," ").replace(/\b\w/g,c=>c.toUpperCase()), "text", false]), ...base].map(fieldMarkup).join("");
    } else fieldsBox.innerHTML = suratTypes[typeSelect.value].fields.map(fieldMarkup).join("");
    fieldsBox.querySelectorAll("input,select,textarea").forEach(el => {
      el.addEventListener("input", renderPreview);
      el.addEventListener("change", renderPreview);
    });
    renderPreview();
  }
  function getData() {
    const data = {};
    const custom = customTemplates.find(t => t.id === typeSelect.value);
    const fieldKeys = custom ? [...new Set([...custom.content.matchAll(/{{\s*([\w-]+)\s*}}/g)].map(m => m[1]).concat(["nomorSurat","bulanNomor","tahunNomor","tempatTerbit","tanggalTerbit"]))] : suratTypes[typeSelect.value].fields.map(f => f[0]);
    fieldKeys.forEach(key => { const el = document.getElementById(`fsd-${key}`); data[key] = el ? el.value.trim() : ""; });
    return data;
  }
  function renderPreview() {
    const custom = customTemplates.find(t => t.id === typeSelect.value);
    const type = custom ? {title:custom.title, numberPrefix:"140/", numberSuffix:"/DSP-BB/"} : suratTypes[typeSelect.value];
    const d = getData();
    const nomor = `${type.numberPrefix}${d.nomorSurat || " "}${type.numberSuffix}${d.bulanNomor || " "}/${d.tahunNomor || new Date().getFullYear()}`;
    const bodyHtml = custom ? `<div style="white-space:pre-wrap;text-align:justify">${esc(custom.content).replace(/{{\s*([\w-]+)\s*}}/g, (_,k) => esc(d[k] || "........................"))}</div>` : suratTypes[typeSelect.value].body(d);
    preview.innerHTML = `
      <div class="fsd-kop">
        <strong>${esc(kop.kabupaten)}</strong>
        <strong>${esc(kop.kecamatan)}</strong>
        <strong class="fsd-desa">${esc(kop.desa)}</strong>
        <small>${esc(kop.alamat)}<br>${esc(kop.kontak)}</small>
      </div>
      <div class="fsd-surat-title">${esc(type.title)}</div>
      <div class="fsd-nomor">Nomor: ${esc(nomor)}</div>
      ${bodyHtml}
      <div class="fsd-sign">
        <div>Dikeluarkan di: ${esc(d.tempatTerbit || "........................")}</div>
        <div>Pada tanggal: ${esc(fmtDate(d.tanggalTerbit) || "........................")}</div>
        <br><strong>${esc(kop.desa || "DESA PUSAR")}</strong>
        <br><br><br><strong><u>${esc(kop.kepala || "ZAINUDDIN")}</u></strong>
      </div>`;
  }
  function downloadHtml() {
    renderPreview();
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Surat Desa</title>
      <style>body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.45;margin:2cm;color:#000}
      .fsd-kop{text-align:center;border-bottom:3px double #000;padding-bottom:8px;margin-bottom:18px}
      .fsd-kop strong{display:block;font-size:14pt}.fsd-kop .fsd-desa{font-size:16pt}.fsd-kop small{font-size:9pt}
      .fsd-surat-title{text-align:center;font-weight:bold;text-decoration:underline;margin-top:16px}
      .fsd-nomor{text-align:center;margin-bottom:20px}p{text-align:justify}table{border-collapse:collapse;width:100%}
      td{vertical-align:top;padding:1px 4px}td:first-child{width:34%}.fsd-sign{width:42%;margin:25px 0 0 auto;text-align:center}</style>
      </head><body>${preview.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${typeSlug(typeSelect.value)}.html`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  async function downloadWord() {
    const button = document.getElementById("fsd-word");
    const oldLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Menyiapkan Word...";
    try {
      if (!window.docx) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/docx@8.5.0/build/index.umd.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Pustaka Word tidak bisa dimuat. Periksa koneksi internet."));
          document.head.appendChild(script);
        });
      }
      const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = window.docx;
      const typeKey = typeSelect.value;
      const type = suratTypes[typeKey];
      const d = getData();
      const children = [];
      const run = (text, opts={}) => new TextRun({text:String(text || ""),font:"Times New Roman",size:opts.size || 24,bold:!!opts.bold,underline:opts.underline ? {} : undefined});
      const centered = (text, opts={}) => new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:opts.after || 0},children:[run(text,{size:opts.size || 22,bold:opts.bold,underline:opts.underline})]});
      const para = (text, opts={}) => new Paragraph({alignment:opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,spacing:{before:80,after:100},children:[run(text,{size:opts.size || 24,bold:opts.bold,underline:opts.underline})]});
      const addText = text => children.push(para(text));
      const addRows = items => children.push(new Table({
        width:{size:100,type:WidthType.PERCENTAGE},
        rows:items.map(([label,value])=>new TableRow({children:[
          new TableCell({width:{size:34,type:WidthType.PERCENTAGE},children:[para(label)]}),
          new TableCell({width:{size:66,type:WidthType.PERCENTAGE},children:[para(": "+(value || "................................"))]})
        ]}))
      }));
      const date = value => {
        if (!value) return "";
        const dt = new Date(value + "T00:00:00");
        return Number.isNaN(dt.getTime()) ? value : dt.toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"});
      };
      const number = `${type.numberPrefix}${d.nomorSurat || " "}${type.numberSuffix}${d.bulanNomor || " "}/${d.tahunNomor || "2023"}`;

      children.push(centered(kop.kabupaten,{bold:true,size:24}));
      children.push(centered(kop.kecamatan,{bold:true,size:24}));
      children.push(centered(kop.desa,{bold:true,size:28,after:80}));
      children.push(centered(kop.alamat,{size:18}));
      children.push(centered(kop.kontak,{size:18,after:100}));
      children.push(new Paragraph({border:{bottom:{color:"000000",space:5,style:BorderStyle.DOUBLE,size:8}},spacing:{after:160},children:[]}));
      children.push(centered(type.title,{bold:true,underline:true,size:26}));
      children.push(centered("Nomor: "+number,{size:22,after:180}));

      if (typeKey === "domisili") {
        addText("Dengan ini menerangkan bahwa:");
        addRows([["Nama",d.nama],["NIK",d.nik],["Tempat Tanggal Lahir",d.ttl],["Jenis Kelamin",d.jk],["Agama",d.agama],["Alamat",d.alamat]]);
        addText(`Memang benar nama tersebut di atas adalah warga Desa Pusar yang berdomisili di ${d.domisili || "................................"}, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu.`);
        addText("Demikian surat keterangan domisili ini kami buat dengan sebenarnya untuk dipergunakan seperlunya.");
      } else if (typeKey === "kematian") {
        addText("Yang bertanda tangan di bawah ini Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu, dengan ini menerangkan bahwa:");
        addRows([["Nama",d.nama],["Tempat/Tanggal Lahir",d.ttl],["Jenis Kelamin",d.jk],["Alamat",d.alamat]]);
        addText("Benar nama tersebut di atas telah meninggal dunia karena sakit pada:");
        addRows([["Tanggal",date(d.tanggalMeninggal)],["Hari",d.hariMeninggal],["Pukul",d.pukulMeninggal],["Bertempat di",d.tempatMeninggal]]);
        addText("Dan telah dimakamkan di:");
        addRows([["Tempat",d.pemakaman],["Tanggal",date(d.tanggalMakam)],["Hari",d.hariMakam],["Pukul",d.pukulMakam]]);
        addText("Demikianlah surat keterangan kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.");
      } else if (typeKey === "kehilangan_kk") {
        addText("Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu dengan ini menerangkan bahwa:");
        addRows([["Nama",d.nama],["NIK",d.nik],["Tempat/Tgl Lahir",d.ttl],["Agama",d.agama],["Jenis Kelamin",d.jk],["Pekerjaan",d.pekerjaan],["Alamat",d.alamat]]);
        addText(`Benar yang tersebut namanya di atas adalah penduduk ${d.penduduk || "................................"}, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu dan selanjutnya dapat kami terangkan bahwa yang bersangkutan telah kehilangan:`);
        children.push(para("KARTU KELUARGA (KK)",{bold:true}));
        addRows([["Atas Nama",d.namaPemilikKK],["No. KK",d.noKK]]);
        addText("Demikianlah surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan seperlunya.");
        addText("Catatan pada template: surat ini berlaku 14 hari setelah diterbitkan.");
      } else if (["kelahiran","tugas_puskesmas","nikah_laki","nikah_perempuan","undangan_beasiswa"].includes(typeKey)) {
        const labels = Object.fromEntries(type.fields.map(([key,label]) => [key,label]));
        const skip = new Set(["nomorSurat","bulanNomor","tahunNomor","tempatTerbit","tanggalTerbit"]);
        if (typeKey === "kelahiran") addText("Yang bertanda tangan di bawah ini Kepala Desa Pusar, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu, menerangkan berdasarkan keterangan pemohon bahwa telah lahir seorang anak:");
        else if (typeKey === "tugas_puskesmas") addText("SURAT TUGAS. Kepala Desa Pusar menugaskan petugas berikut untuk melaksanakan tugas sesuai rincian di bawah ini:");
        else if (typeKey === "nikah_laki" || typeKey === "nikah_perempuan") addText("Yang bertanda tangan di bawah ini Kepala Desa Pusar, Kecamatan Baturaja Barat, Kabupaten Ogan Komering Ulu, menerangkan data calon pengantin berikut untuk keperluan pengantar nikah:");
        else addText(`Kepada Yth. ${d.namaPenerima || "................................"}${d.alamat ? " — "+d.alamat : ""}`);
        addRows(type.fields.filter(([key]) => !skip.has(key)).map(([key,label]) => [label, d[key]]));
        if (typeKey === "undangan_beasiswa") addText("Dengan hormat, kami mengundang Saudara/i untuk hadir dalam kegiatan penyerahan beasiswa berprestasi sebagaimana rincian di atas. Atas kehadirannya kami ucapkan terima kasih.");
        else if (typeKey === "tugas_puskesmas") addText("Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan dipergunakan sebagaimana mestinya.");
        else addText("Demikian surat keterangan/pengantar ini dibuat berdasarkan keterangan pemohon dan untuk dipergunakan sebagaimana mestinya. Periksa persyaratan dan data pendukung sebelum ditandatangani.");
      } else {
        addText("Kepala Desa Pusar Kecamatan Baturaja Barat Kabupaten Ogan Komering Ulu, dengan ini menerangkan dengan sebenarnya bahwa:");
        addRows([["Nama",d.nama],["No. KK",d.noKK],["NIK",d.nik],["Tempat, Tgl. Lahir",d.ttl],["Jenis Kelamin",d.jk],["Agama",d.agama],["Alamat",d.alamat]]);
        addText(`Benar nama tersebut di atas adalah penduduk ${d.penduduk || "................................"} dan selanjutnya dapat kami terangkan bahwa KARTU TANDA PENDUDUK (KTP) yang bersangkutan hilang.`);
        addText("Demikian surat keterangan ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.");
      }
      children.push(new Paragraph({alignment:AlignmentType.RIGHT,spacing:{before:250},children:[run("Dikeluarkan di: "+(d.tempatTerbit || "........................"),{size:22})]}));
      children.push(new Paragraph({alignment:AlignmentType.RIGHT,children:[run("Pada tanggal: "+(date(d.tanggalTerbit) || "........................"),{size:22})]}));
      children.push(new Paragraph({alignment:AlignmentType.RIGHT,spacing:{before:180},children:[run("KEPALA DESA PUSAR",{size:22,bold:true})]}));
      children.push(new Paragraph({alignment:AlignmentType.RIGHT,spacing:{before:850},children:[run("ZAINUDDIN",{size:22,bold:true,underline:true})]}));

      const doc = new Document({sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,right:1134,bottom:1134,left:1701}}},children}]});
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${typeSlug(typeKey)}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    } catch (e) {
      alert("Word belum berhasil dibuat. " + (e && e.message ? e.message : "Coba periksa koneksi internet."));
    } finally {
      button.disabled = false;
      button.textContent = oldLabel;
    }
  }

  function typeSlug(key) {
    return (suratTypes[key].title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  function initResidents() {
    const ids=["nik","kk","nama","ttl","jk","agama","pekerjaan","status","alamat"];
    const val=id=>document.getElementById("res-"+id).value.trim();
    function clear(){currentResidentId=null;ids.forEach(id=>document.getElementById("res-"+id).value="");document.getElementById("res-message").textContent="Form dikosongkan.";}
    function render(){const q=(document.getElementById("res-search").value||"").toLowerCase();const list=document.getElementById("res-list");const found=residents.filter(r=>(r.nama+" "+r.nik).toLowerCase().includes(q));list.innerHTML=found.length?`<table><thead><tr><th>Nama / NIK</th><th>Alamat</th><th>Aksi</th></tr></thead><tbody>${found.map(r=>`<tr><td>${esc(r.nama)}<br>${esc(r.nik)}</td><td>${esc(r.alamat)}</td><td><button type="button" data-edit-res="${r.id}">Edit</button> <button type="button" data-del-res="${r.id}">Hapus</button></td></tr>`).join("")}</tbody></table>`:"<p class='fsd-note'>Belum ada data penduduk tersimpan.</p>";
      list.querySelectorAll("[data-edit-res]").forEach(b=>b.onclick=()=>{const r=residents.find(x=>x.id===b.dataset.editRes);if(!r)return;currentResidentId=r.id;ids.forEach(id=>document.getElementById("res-"+id).value=r[id]||"");document.getElementById("res-message").textContent="Mode edit: "+r.nama;});
      list.querySelectorAll("[data-del-res]").forEach(b=>b.onclick=()=>{if(confirm("Hapus data penduduk ini?")){residents=residents.filter(x=>x.id!==b.dataset.delRes);localStorage.setItem("banuakita_residents_v1",JSON.stringify(residents));render();}});
    }
    document.getElementById("res-save").onclick=()=>{const r={id:currentResidentId||("p"+Date.now()),...Object.fromEntries(ids.map(id=>[id,val(id)]))};if(!r.nama||!r.nik){document.getElementById("res-message").textContent="Nama dan NIK wajib diisi.";return;}const i=residents.findIndex(x=>x.id===r.id);if(i>=0)residents[i]=r;else residents.unshift(r);try{localStorage.setItem("banuakita_residents_v1",JSON.stringify(residents));document.getElementById("res-message").textContent="Data penduduk tersimpan di browser ini.";clear();render();refreshResidentPicker();}catch(e){document.getElementById("res-message").textContent="Penyimpanan penuh atau tidak diizinkan browser.";}};
    document.getElementById("res-clear").onclick=clear;document.getElementById("res-search").oninput=render;render();refreshResidentPicker();
    document.getElementById("res-read-ktp").onclick=async()=>{const f=document.getElementById("res-ktp-file").files[0],status=document.getElementById("res-ocr-status");if(!f){status.textContent="Pilih foto KTP terlebih dahulu.";return;}status.textContent="Sedang membaca KTP...";try{if(!window.Tesseract){await new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";s.onload=ok;s.onerror=no;document.head.appendChild(s);});}const out=await Tesseract.recognize(f,"ind+eng");const text=out.data.text||"";const lines=text.split(/\n/).map(x=>x.trim()).filter(Boolean);const nik=(text.match(/\b\d{16}\b/)||[])[0]||"";const pick=(re)=>{const m=text.match(re);return m?m[1].trim().replace(/^[:\- ]+/,""):""};const nama=pick(/(?:Nama)\s*[:.]?\s*([^\n]+)/i);const ttl=pick(/(?:Tempat\s*[/,]?\s*Tgl\s*Lahir|Tempat\s*Lahir)\s*[:.]?\s*([^\n]+)/i);const jk= /perempuan/i.test(text)?"Perempuan":(/laki.?laki/i.test(text)?"Laki-laki":"");const agama=pick(/Agama\s*[:.]?\s*([^\n]+)/i);const alamat=pick(/Alamat\s*[:.]?\s*([^\n]+)/i);const vals={nik,nama,ttl,jk,agama,alamat};Object.entries(vals).forEach(([k,v])=>{if(v&&document.getElementById("res-"+k))document.getElementById("res-"+k).value=v;});status.textContent="OCR selesai. Periksa dan koreksi hasil sebelum menyimpan.";}catch(e){status.textContent="OCR gagal. Pastikan internet aktif dan foto jelas.";}};
  }
  function initSettings(){const ids={kabupaten:"kabupaten",kecamatan:"kecamatan",desa:"desa",kepala:"kepala",alamat:"alamat",kontak:"kontak"};function fill(){Object.entries(ids).forEach(([id,k])=>document.getElementById("set-"+id).value=kop[k]||"");}fill();document.getElementById("set-save").onclick=()=>{Object.entries(ids).forEach(([id,k])=>kop[k]=document.getElementById("set-"+id).value.trim());localStorage.setItem("banuakita_settings_v1",JSON.stringify(kop));document.getElementById("set-message").textContent="Pengaturan desa tersimpan dan akan digunakan pada kop/pratinjau surat.";renderPreview();};document.getElementById("set-reset").onclick=()=>{Object.assign(kop,DEFAULT_KOP);localStorage.setItem("banuakita_settings_v1",JSON.stringify(kop));fill();renderPreview();document.getElementById("set-message").textContent="Pengaturan default dipulihkan.";};}
  function initTemplates(){const title=document.getElementById("tpl-title"),file=document.getElementById("tpl-file"),content=document.getElementById("tpl-content"),msg=document.getElementById("tpl-message");function list(){document.getElementById("tpl-list").innerHTML=customTemplates.length?customTemplates.map(t=>`<p>📄 <b>${esc(t.title)}</b> <button type="button" data-use-tpl="${t.id}">Pilih</button> <button type="button" data-remove-tpl="${t.id}">Hapus</button></p>`).join(""):"<p class='fsd-note'>Belum ada template impor.</p>";document.querySelectorAll("[data-use-tpl]").forEach(b=>b.onclick=()=>{typeSelect.value=b.dataset.useTpl;showView("buat");renderFields();});document.querySelectorAll("[data-remove-tpl]").forEach(b=>b.onclick=()=>{if(confirm("Hapus template ini?")){const i=customTemplates.findIndex(t=>t.id===b.dataset.removeTpl);if(i>=0)customTemplates.splice(i,1);localStorage.setItem("banuakita_templates_v1",JSON.stringify(customTemplates));refreshTemplateChoices();list();}});}document.getElementById("tpl-import").onclick=async()=>{const f=file.files[0];if(!f){msg.textContent="Pilih file Word .docx terlebih dahulu.";return;}msg.textContent="Membaca dokumen Word...";try{if(!window.mammoth){await new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";s.onload=ok;s.onerror=no;document.head.appendChild(s);});}const ab=await f.arrayBuffer();const result=await mammoth.extractRawText({arrayBuffer:ab});content.value=result.value||"";if(!title.value)title.value=f.name.replace(/\.docx$/i,"").replace(/[_-]+/g," ");msg.textContent="Teks berhasil diimpor. Tata letak kompleks Word mungkin perlu disusun ulang; tambahkan placeholder seperti {{nama}} lalu simpan.";}catch(e){msg.textContent="Tidak dapat membaca Word. Pastikan file .docx dan koneksi internet aktif.";}};document.getElementById("tpl-save").onclick=()=>{const t=title.value.trim(),c=content.value.trim();if(!t||!c){msg.textContent="Nama dan isi template harus diisi.";return;}const item={id:"tpl_"+Date.now(),title:t,content:c};customTemplates.push(item);try{localStorage.setItem("banuakita_templates_v1",JSON.stringify(customTemplates));refreshTemplateChoices();list();msg.textContent="Template tersimpan sebagai pilihan surat. Buka menu Buat Surat untuk menggunakannya.";title.value="";content.value="";file.value="";}catch(e){customTemplates.pop();msg.textContent="Template terlalu besar untuk penyimpanan browser.";}};list();}

  const pageLabels = {dashboard:"Dashboard",penduduk:"Data Penduduk",buat:"Buat Surat",arsip:"Arsip Surat",jenis:"Jenis Surat",template:"Template Surat",pengaturan:"Pengaturan Desa",pengguna:"Pengguna","backup":"Backup / Restore"};
  function showView(view) {
    document.querySelectorAll("#form-surat-desa [data-panel]").forEach(panel => { panel.hidden = panel.dataset.panel !== view; });
    document.querySelectorAll("#form-surat-desa .fsd-nav button[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    document.getElementById("fsd-page-title").textContent = pageLabels[view] || "Dashboard";
    document.getElementById("fsd-breadcrumb").textContent = pageLabels[view] || "Dashboard";
    if (view === "buat") renderPreview();
  }
  document.querySelectorAll("#form-surat-desa .fsd-nav button[data-view]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
  document.querySelectorAll("#form-surat-desa [data-go]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.go)));
  document.querySelector("#form-surat-desa .fsd-dash-create").addEventListener("click", () => showView("buat"));
  function refreshTemplateChoices() {
    const old = typeSelect.value;
    typeSelect.querySelectorAll("option[data-custom-template]").forEach(o => o.remove());
    customTemplates.forEach(t => { const o=document.createElement("option"); o.value=t.id; o.textContent=t.title+" (Template Impor)"; o.dataset.customTemplate="1"; typeSelect.appendChild(o); });
    document.getElementById("fsd-type-list").innerHTML = Object.values(suratTypes).map(t => `<p style="margin:7px 0">• ${esc(t.title)}</p>`).join("")+customTemplates.map(t=>`<p>• ${esc(t.title)} (impor)</p>`).join("");
    if ([...typeSelect.options].some(o=>o.value===old)) typeSelect.value=old;
  }
  refreshTemplateChoices();
  typeSelect.addEventListener("change", renderFields);
  document.getElementById("fsd-update").addEventListener("click", renderPreview);
  document.getElementById("fsd-print").addEventListener("click", () => { renderPreview(); window.print(); });
  document.getElementById("fsd-download").addEventListener("click", downloadHtml);
  document.getElementById("fsd-word").addEventListener("click", downloadWord);
  document.getElementById("fsd-read-ktp").addEventListener("click", readKtp);
  document.getElementById("fsd-apply-ktp").addEventListener("click", applyKtpData);
  renderFields();
  initEntryMode();
  initResidents(); initSettings(); initTemplates();
  showView("dashboard");
})();
