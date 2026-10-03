/**
 * Seed template surat berdasarkan format resmi Desa Pusar
 * (Kabupaten Ogan Komering Ulu, Kecamatan Baturaja Barat)
 *
 * Cara pakai:
 *   node templates-seed.js
 * atau panggil dari main process setelah db siap:
 *   require('./templates-seed')(db);
 */

module.exports = function seedTemplates(db) {
  if (!db) {
    console.error('Database tidak tersedia');
    return;
  }

  const templates = [
    {
      kode: '01',
      nama: 'Surat Keterangan Domisili',
      judul: 'SURAT KETERANGAN DOMISILI',
      isi: `Dengan ini menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Agama                   : {{agama}}
Alamat                  : {{alamat}}

Memang benar nama tersebut di atas adalah Warga Desa {{desa}} yang berdomisili di {{alamat}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.

Demikian surat keterangan Domisili ini kami buat dengan sebenarnya untuk dipergunakan seperlunya.`
    },
    {
      kode: '08',
      nama: 'Surat Keterangan Kematian',
      judul: 'SURAT KETERANGAN KEMATIAN',
      isi: `Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa:

Nama                    : {{nama}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Alamat                  : {{alamat}}

Benar nama tersebut di atas telah meninggal dunia karena {{sebab_kematian}} pada:

Tanggal                 : {{tanggal_meninggal}}
Hari                    : {{hari_meninggal}}
Pukul                   : {{pukul_meninggal}}
Bertempat di            : {{tempat_meninggal}}

Dan telah dimakamkan di:

Tempat                  : {{tempat_makam}}
Tanggal                 : {{tanggal_makam}}
Hari                    : {{hari_makam}}
Pukul                   : {{pukul_makam}}

Demikianlah Surat Keterangan ini kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '07',
      nama: 'Surat Keterangan Kelahiran',
      judul: 'SURAT KETERANGAN KELAHIRAN',
      isi: `Kepala Desa {{desa}} Kecamatan {{kecamatan}}, dengan ini menerangkan bahwa:

Nama                    : {{nama}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Kewarganegaraan         : Indonesia
Agama                   : {{agama}}
Alamat                  : {{alamat}}

Nama Ayah               : {{nama_ayah}}
Nama Ibu                : {{nama_ibu}}

Memang benar nama tersebut di atas adalah Penduduk Desa {{desa}} dan yang bersangkutan tinggal/menetap di Desa {{desa}} dan dilahirkan di {{tempat_lahir}} pada tanggal {{tanggal_lahir}}.

Demikian surat keterangan ini dibuat dengan sebenarnya dan dapat diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '13',
      nama: 'Surat Keterangan Usaha (SKU)',
      judul: 'SURAT KETERANGAN USAHA',
      isi: `Kepala Desa {{desa}} dengan ini menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Agama                   : {{agama}}
Alamat KTP              : {{alamat}}

Memang benar nama yang tersebut di atas mempunyai usaha yang bertempat di {{alamat_usaha}} dengan jenis usaha: {{nama_usaha}}.

Demikian Surat Keterangan Usaha ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '19',
      nama: 'Surat Keterangan Tidak Mampu (SKTM)',
      judul: 'SURAT KETERANGAN TIDAK MAMPU',
      isi: `Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Jenis Kelamin           : {{jenis_kelamin}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Kewarganegaraan         : Indonesia
Agama                   : {{agama}}
Status Perkawinan       : {{status_perkawinan}}
Pekerjaan               : {{pekerjaan}}
Alamat                  : {{alamat}}

Memang benar nama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dan menurut sepengetahuan kami nama tersebut di atas memang tergolong Kurang/Tidak Mampu.

Demikian Surat Keterangan ini kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '19-KIS',
      nama: 'Surat Keterangan Tidak Mampu (KIS)',
      judul: 'SURAT KETERANGAN TIDAK MAMPU (KIS)',
      isi: `Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
No. KK                  : {{no_kk}}
Jenis Kelamin           : {{jenis_kelamin}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Agama                   : {{agama}}
Alamat                  : {{alamat}}

Memang benar yang bernama tersebut di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dan berdomisili di {{alamat}}. Serta menurut pengetahuan kami orang tersebut memang benar keadaan tidak mampu dan belum memiliki Jaminan Kesehatan Nasional (JKN), Kartu Indonesia Sehat (KIS) maupun sumber pembiayaan lainnya.

Demikianlah Surat Keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '19-KIP',
      nama: 'Surat Keterangan Tidak Mampu Pelajar (KIP)',
      judul: 'SURAT KETERANGAN TIDAK MAMPU (SKTM) - KIP',
      isi: `Yang bertanda tangan di bawah ini, Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, menerangkan dengan sesungguhnya bahwa:

1. Data Orang Tua / Wali
Nama Lengkap            : {{nama_orang_tua}}
NIK                     : {{nik_orang_tua}}
Tempat/Tanggal Lahir    : {{ttl_orang_tua}}
Agama                   : {{agama_orang_tua}}
Pekerjaan               : {{pekerjaan_orang_tua}}
Alamat                  : {{alamat}}

2. Data Anak / Pelajar
Nama Lengkap            : {{nama}}
NIK                     : {{nik}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Agama                   : {{agama}}
Alamat                  : {{alamat}}

Bahwa nama tersebut di atas benar penduduk dan berdomisili di Desa {{desa}} dan yang bersangkutan tergolong dalam Keluarga yang tidak mampu dan belum memiliki Kartu Indonesia Pintar (KIP). Surat Keterangan ini dipergunakan oleh yang bersangkutan untuk keperluan Sekolah.

Demikianlah Surat Keterangan ini dibuat dengan sebenarnya, mengingat sumpah jabatan dan untuk dapat dipergunakan seperlunya.`
    },
    {
      kode: '48',
      nama: 'Surat Keterangan Kehilangan',
      judul: 'SURAT KETERANGAN KEHILANGAN',
      isi: `Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dengan ini menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Agama                   : {{agama}}
Jenis Kelamin           : {{jenis_kelamin}}
Pekerjaan               : {{pekerjaan}}
Alamat                  : {{alamat}}

Benar yang tersebut namanya di atas adalah penduduk Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dan selanjutnya dapat kami terangkan bahwa yang bersangkutan telah kehilangan:

{{barang_hilang}}

Atas Nama               : {{nama}}
No. Dokumen             : {{no_dokumen}}

Demikianlah Surat Keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan seperlunya.

NB: Surat ini berlaku 14 hari setelah diterbitkan.`
    },
    {
      kode: '04',
      nama: 'Surat Keterangan Pindah',
      judul: 'SURAT KETERANGAN PINDAH PENDUDUK',
      isi: `1. Nama Lengkap           : {{nama}}
2. Jenis Kelamin          : {{jenis_kelamin}}
3. Tempat/Tgl. Lahir      : {{tempat_lahir}}, {{tanggal_lahir}}
4. Kewarganegaraan        : Indonesia
5. Agama                  : {{agama}}
6. Pekerjaan              : {{pekerjaan}}
7. Pendidikan             : {{pendidikan}}
8. Alamat Asal            : {{alamat}}
9. No. KK                 : {{no_kk}}
10. No. KTP / NIK         : {{nik}}
11. Alamat Pindah         : {{alamat_pindah}}
    RT/RW                 : {{rt_pindah}}/{{rw_pindah}}
    Kecamatan             : {{kecamatan_pindah}}
    Kabupaten             : {{kabupaten_pindah}}
    Provinsi              : {{provinsi_pindah}}
    Pada Tanggal          : {{tanggal_pindah}}
12. Alasan Pindah         : {{alasan_pindah}}
13. Pengikut              : {{pengikut}}

Demikian Surat Keterangan Pindah Penduduk ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.`
    }
  ];

  const insert = db.prepare(`
    INSERT INTO template_surat(
      kode, nama, judul, isi, ukuran_kertas,
      margin_atas, margin_bawah, margin_kiri, margin_kanan, aktif
    ) VALUES(
      @kode, @nama, @judul, @isi, 'A4',
      2, 2, 3, 3, 1
    )
  `);

  const update = db.prepare(`
    UPDATE template_surat SET
      nama=@nama, judul=@judul, isi=@isi,
      ukuran_kertas='A4', aktif=1
    WHERE kode=@kode
  `);

  const find = db.prepare('SELECT id FROM template_surat WHERE kode=?');

  let added = 0;
  let updated = 0;

  for (const t of templates) {
    const existing = find.get(t.kode);
    if (existing) {
      update.run(t);
      updated++;
    } else {
      insert.run(t);
      added++;
    }
  }

  // Update pengaturan default untuk Desa Pusar (opsional, hanya jika masih default)
  try {
    const s = db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get();
    if (s && (!s.nama_desa || /nama desa/i.test(s.nama_desa) || s.nama_desa === 'NAMA DESA')) {
      db.prepare(`
        UPDATE pengaturan_desa SET
          nama_desa='Pusar',
          kecamatan='Baturaja Barat',
          kabupaten='Ogan Komering Ulu',
          provinsi='Sumatera Selatan',
          alamat='Jalan Puyang Padang No 001 Baturaja Kab. Ogan Komering Ulu, Prov Sumatera Selatan',
          kepala_desa='ZAINUDDIN',
          format_nomor='{nomor}/{kode}/DSP-BB/{bulan}/{tahun}'
        WHERE id=1
      `).run();
      console.log('Pengaturan desa diisi default: Desa Pusar');
    }
  } catch (e) {
    console.warn('Skip update pengaturan:', e.message);
  }

  console.log(`Template seed selesai: ${added} baru, ${updated} diupdate.`);
  return { added, updated };
};

// Jalankan langsung jika dipanggil via node
if (require.main === module) {
  console.log('Jalankan seed ini dari dalam aplikasi Electron (setelah db siap),');
  console.log('atau tambahkan di main.js setelah seed.js:');
  console.log("  require('./templates-seed')(db);");
}
