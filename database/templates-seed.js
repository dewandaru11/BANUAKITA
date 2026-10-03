/**
 * Seed template surat — DISINKRONKAN dengan folder "template surat desa"
 * (format resmi Desa Pusar, Kec. Baturaja Barat, Kab. Ogan Komering Ulu).
 *
 * Setiap kali aplikasi dijalankan:
 *  - file .docx di folder "template surat desa" dibaca ulang dan isinya
 *    dikonversi menjadi template bersetempat (kop & data desa mengikuti
 *    Pengaturan Desa, label warga otomatis jadi placeholder {{nik}}, dll)
 *  - jika filenya sudah pernah diimpor sebelumnya, kontennya UPDATED
 *    (jadi Anda cukup ganti file Word lalu restart aplikasi)
 *  - template bawaan untuk kode jenis surat 01/04/07/08/13/19/48 ikut
 *    disinkronkan dari file-file tersebut
 *
 * Cara pakai dari main process (sudah terpasang):
 *   require('./templates-seed')(db, { app });
 */

const path = require('path');
const fs = require('fs');

module.exports = function seedTemplates(db, ctx = {}) {
  if (!db) {
    console.error('Database tidak tersedia');
    return;
  }

  // ---------- helper baca .docx (ZIP -> paragraf teks) ----------
  function readDocxParagraphs(filePath) {
    const buf = fs.readFileSync(filePath);
    let eocd = -1;
    const minPos = Math.max(0, buf.length - 65557);
    for (let i = buf.length - 22; i >= minPos; i--) {
      if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('File bukan dokumen Word (.docx) yang valid.');
    const count = buf.readUInt16LE(eocd + 10);
    let off = buf.readUInt32LE(eocd + 16);
    let xml = null;
    for (let n = 0; n < count; n++) {
      if (buf.readUInt32LE(off) !== 0x02014b50) break;
      const method = buf.readUInt16LE(off + 10);
      const compSize = buf.readUInt32LE(off + 20);
      const nameLen = buf.readUInt16LE(off + 28);
      const extraLen = buf.readUInt16LE(off + 30);
      const commentLen = buf.readUInt16LE(off + 32);
      const localOff = buf.readUInt32LE(off + 42);
      const name = buf.toString('utf8', off + 46, off + 46 + nameLen);
      if (name === 'word/document.xml') {
        const lNameLen = buf.readUInt16LE(localOff + 26);
        const lExtraLen = buf.readUInt16LE(localOff + 28);
        const dataStart = localOff + 30 + lNameLen + lExtraLen;
        const data = buf.subarray(dataStart, dataStart + compSize);
        if (method === 0) xml = data.toString('utf8');
        else if (method === 8) xml = require('zlib').inflateRawSync(data).toString('utf8');
        else throw new Error('Metode kompresi ZIP tidak didukung: ' + method);
        break;
      }
      off += 46 + nameLen + extraLen + commentLen;
    }
    if (!xml) throw new Error('word/document.xml tidak ditemukan di dalam file.');

    const paras = [];
    for (const pm of xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>|<w:p\/>/g)) {
      const p = pm[0];
      if (/<w:instrText/.test(p)) continue;
      let text = '';
      for (const rm of p.matchAll(/<w:r(?: [^>]*)?>([\s\S]*?)<\/w:r>/g)) {
        const r = rm[1];
        if (/<w:strike\s*\/?>|<w:strike w:val="(true|1|on)"/i.test(r)) continue;
        let t = '';
        for (const tm of r.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g)) t += tm[1];
        if (/<w:tab(?: [^>]*)?\/?>/.test(r)) t = t + '\t';
        if (/<w:br(?: [^>]*)?\/?>/.test(r)) t = t + '\n';
        text += t;
      }
      text = text
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
        .replace(/&amp;/g, '&');
      paras.push(text);
    }
    return paras;
  }

  // ---------- normalisasi isi Word -> placeholder aplikasi ----------
  const WD = '\\s*[:;.]*\\s*';

  const PAIR_TOKENS = [
    ['NAMA\\s+AYAH', 'nama_ayah'], ['NAMA\\s+IBU', 'nama_ibu'],
    ['NAMA\\s+SUAMI', 'nama_suami'], ['NAMA\\s+ISTRI', 'nama_istri'],
    ['NAMA\\s+PEMOHON', 'nama_pemohon'], ['NAMA\\s+PELAPOR', 'nama_pelapor'],
    ['PUKUL', 'pukul'],
    ['ALASAN\\s+PINDAH', 'alasan_pindah'],
    ['PENGIKUT', 'pengikut']
  ];

  const LINE_BLACKLIST = /(anak\s+ke|jumlah\s+anak|urutan|berapakah|berapa\s+orang|cahaya|lembar|kolom|bulan\s+ke|tahun\s+anggaran)/i;

  function detectKopBlock(paras) {
    const isGov = t => /pemerintah|kecamatan|kabupaten|sekretariat|desa\s+[a-z]|kepala\s+desa/i.test(t);
    const isContact = t => /(jalan|jl\.|email|website|surel|http|@)/i.test(t);
    let end = 0, govCount = 0;
    for (let i = 0; i < Math.min(8, paras.length); i++) {
      const t = String(paras[i] || '').trim();
      if (!t) continue;
      if (isGov(t) || isContact(t)) { govCount++; end = i + 1; }
      else break;
    }
    return govCount >= 2 ? end : 0;
  }

  function detectTitleNomor(paras) {
    const isNomor = t => /nomor\s*[:.]?\s*\S/i.test(t) && /\d|\/|\./.test(t);
    const isKop = t => /pemerintah|kecamatan|desa\s|kabupaten|sekretariat/i.test(String(t));
    let title = '', nomor = '';
    for (const p of paras) {
      const t = String(p || '').trim();
      if (!t) continue;
      if (isNomor(t)) { if (!nomor) nomor = t; continue; }
      const letters = t.replace(/[^A-Za-z]/g, '');
      if (!letters) continue;
      const upperRatio = letters.split('').filter(c => c === c.toUpperCase()).length / letters.length;
      if (!title && upperRatio > 0.85 && !isKop(t) && letters.length >= 6) title = t;
    }
    return { title, nomor };
  }

  function wordParasToTemplate(paras, settings) {
    const s = settings || {};
    const def = {
      nama_desa: 'PUSAR', kecamatan: 'BATURAJA BARAT',
      kabupaten: 'OGAN KOMERING ULU', provinsi: 'SUMATERA SELATAN'
    };
    const val = k => String(s[k] ?? '').trim() || def[k];
    const escR = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const kopEnd = detectKopBlock(paras);
    let body = paras.slice(kopEnd).map(t => String(t || '').replace(/\t/g, ' ').replace(/[ \u00A0]+/g, ' ').trim());

    const setReps = [];
    const addRep = (re, ph) => setReps.push([re, ph]);
    const dNama = val('nama_desa'), dKec = val('kecamatan'),
          dKab = val('kabupaten'), dProv = val('provinsi');
    addRep(new RegExp('\\bKEPALA\\s+DESA\\s+' + escR(dNama) + '\\b', 'gi'), 'KEPALA DESA {{nama_desa}}');
    addRep(new RegExp('\\bDESA\\s+' + escR(dNama) + '\\b', 'gi'), 'Desa {{nama_desa}}');
    addRep(new RegExp('\\bD[E3]S[A4]\\s+' + escR(dNama) + '\\b', 'gi'), 'Desa {{nama_desa}}');
    addRep(new RegExp('\\b' + escR(dNama) + '\\b', 'gi'), '{{nama_desa}}');
    addRep(new RegExp('\\b' + escR(dKec) + '\\b', 'gi'), '{{kecamatan}}');
    addRep(new RegExp('KABUPATEN\\s+' + escR(dKab) + '\\b', 'gi'), 'KABUPATEN {{kabupaten}}');
    addRep(new RegExp('KAB\\.?\\s+' + escR(dKab) + '\\b', 'gi'), 'Kab. {{kabupaten}}');
    addRep(new RegExp('\\b' + escR(dKab) + '\\b', 'gi'), '{{kabupaten}}');
    addRep(new RegExp('(?:PROV|PROPINSI|PROP|OROV)\\.?\\s*' + escR(dProv) + '\\b', 'gi'), 'Provinsi {{provinsi}}');
    addRep(new RegExp('\\b' + escR(dProv) + '\\b', 'gi'), '{{provinsi}}');
    if (String(s.kepala_desa || '').trim()) {
      const kd = String(s.kepala_desa).trim();
      addRep(new RegExp('\\b' + escR(kd) + '\\b', 'gi'), '{{kepala_desa}}');
    } else {
      addRep(/\bZAINUDDIN\b/gi, '{{kepala_desa}}');
    }
    addRep(/(?:jalan|jl\.)\s*puyang\s*padang[^,\n]*/gi, '{{alamat_desa}}');
    addRep(/desapusar@okukab\.go\.id/gi, '');
    addRep(/https?:\/\/pusar\.[^\s,]*/gi, '');

    function inject(line) {
      if (LINE_BLACKLIST.test(line)) return line;
      let t = line;
      for (const [re, ph] of setReps) t = t.replace(re, ph);
      if (/^ZAINUDDIN$/i.test(t.trim())) t = t.replace(/^ZAINUDDIN$/i, '{{kepala_desa}}');
      const L = t.toUpperCase();

      if (/NIK\s+KTP\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/NIK\s+KTP(\s*[:;.]*\s*)$/i, 'NIK KTP\t: {{nik}}$1'); return t; }
      if (/NAMA?\s+KK\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/NAMA?(\s+KK)(\s*[:;.]*\s*)$/i, 'No KK\t: {{no_kk}}$2'); return t; }
      if (/(?:No|NOMOR)\.?\s*(?:KK|KARTU\s+KELUARGA)\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/((?:No|NOMOR)\.?)(\s*(?:KK|KARTU\s+KELUARGA))(\s*[:;.]*\s*)$/i, 'No KK\t: {{no_kk}}$3'); return t; }
      if (/TEMPAT\s*\/?\s*(?:TGL\.?|TANGGAL)[.,]?\s+LAHIR\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(TEMPAT\s*\/?\s*(?:TGL\.?|TANGGAL)[.,]?\s+LAHIR)(\s*[:;.]*\s*)$/i, 'Tempat/Tanggal Lahir\t: {{tempat_lahir}}, {{tanggal_lahir}}$2'); return t; }
      if (/TANGGAL\s+LAHIR\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(TANGGAL\s+LAHIR)(\s*[:;.]*\s*)$/i, 'Tanggal Lahir\t: {{tanggal_lahir}}$2'); return t; }
      if (/TGL\.?\s+LAHIR\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(TGL\.?\s+LAHIR)(\s*[:;.]*\s*)$/i, 'Tgl Lahir\t: {{tanggal_lahir}}$2'); return t; }
      if (/TEMPAT\s+LAHIR\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(TEMPAT\s+LAHIR)(\s*[:;.]*\s*)$/i, 'Tempat Lahir\t: {{tempat_lahir}}$2'); return t; }
      if (/JENIS\s+KELAMIN\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(JENIS\s+KELAMIN)(\s*[:;.]*\s*)$/i, 'Jenis Kelamin\t: {{jenis_kelamin}}$2'); return t; }
      if (/STATUS\s+PERKAWINAN\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(STATUS\s+PERKAWINAN)(\s*[:;.]*\s*)$/i, 'Status Perkawinan\t: {{status_perkawinan}}$2'); return t; }
      if (/KEWARGANEGARAAN\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(KEWARGANEGARAAN)(\s*[:;.]*\s*)$/i, 'Kewarganegaraan\t: {{kewarganegaraan}}$2'); return t; }
      if (/NAMA\s+LENGKAP\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(NAMA\s+LENGKAP)(\s*[:;.]*\s*)$/i, 'Nama Lengkap\t: {{nama}}$2'); return t; }
      if (/ALAMAT\s+(?:ASAL|KTP|PINDAH|TEMPAT\s+TINGGAL)\s*[:;.]*\s*$/i.test(t)) return t; // diisi lewat form dinamis
      if (/(?:No|NOMOR)\.?\s*KTP\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/((?:No|NOMOR)\.?)(\s*KTP)(\s*[:;.]*\s*)$/i, 'No KTP\t: {{nik}}$3'); return t; }
      if (/(?:No|NOMOR)\.?\s*KK\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/((?:No|NOMOR)\.?)(\s*KK)(\s*[:;.]*\s*)$/i, 'No KK\t: {{no_kk}}$3'); return t; }

      for (const [re, ph] of PAIR_TOKENS) {
        const R = new RegExp('(' + re + ')' + WD + '$', 'i');
        const m = t.match(R);
        if (m) {
          const name = m[1].replace(/\s+/g, ' ').trim().toLowerCase().replace(/\s+/g, '_');
          t = t.replace(R, m[1] + '\t: {{' + name + '}}');
          return t;
        }
      }

      if (/AGAMA\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(AGAMA)(\s*[:;.]*\s*)$/i, 'Agama\t: {{agama}}$2'); return t; }
      if (/PEKERJAAN\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(PEKERJAAN)(\s*[:;.]*\s*)$/i, 'Pekerjaan\t: {{pekerjaan}}$2'); return t; }
      if (/PENDIDIKAN\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(PENDIDIKAN)(\s*[:;.]*\s*)$/i, 'Pendidikan\t: {{pendidikan}}$2'); return t; }
      if (/ALAMAT\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(ALAMAT)(\s*[:;.]*\s*)$/i, 'Alamat\t: {{alamat}} RT {{rt}} RW {{rw}}$2'); return t; }
      if (/RT\s*\/?\s*(?:RW)?\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(RT\s*\/?\s*(?:RW)?)(\s*[:;.]*\s*)$/i, 'RT/RW\t: {{rt}} / {{rw}}$2'); return t; }
      if (/KECAMATAN\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(KECAMATAN)(\s*[:;.]*\s*)$/i, 'Kecamatan\t: {{kecamatan_pindah}}$2'); return t; }
      if (/KABUPATEN\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(KABUPATEN)(\s*[:;.]*\s*)$/i, 'Kabupaten\t: {{kabupaten_pindah}}$2'); return t; }
      if (/PROV(?:INSI)?\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(PROV(?:INSI)?)(\s*[:;.]*\s*)$/i, 'Provinsi\t: {{provinsi_pindah}}$2'); return t; }

      if (/(^|\b)NAMA\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/(^|\b)NAMA(\s*[:;.]*\s*)$/i, (mm, pre, sep) => pre + 'Nama\t: {{nama}}' + sep); return t; }
      if (/\bNIK\s*[:;.]*\s*$/i.test(t)) { t = t.replace(/\bNIK(\s*[:;.]*\s*)$/i, 'NIK\t: {{nik}}$1'); return t; }

      if (/^TANGGAL\b/i.test(t)) {
        if (!/LAHIR|SURAT/i.test(t) && !/\{\{/.test(t)) t = t.replace(/^TANGGAL\b[\s.:;]*/i, 'Tanggal\t: {{tanggal_peristiwa}}');
        return t;
      }
      if (/^PADA\s+TANGGAL\b/i.test(t) && !/\{\{/.test(t)) t = t.replace(/^PADA\s+TANGGAL\b[\s.:;]*/i, 'Pada Tanggal\t: {{tanggal_peristiwa}}');
      if (/^(DI\s*)?KELUARKAN\b/i.test(t)) {
        t = t.replace(/^(DI\s*)?KELUARKAN(\s+DI)?[\s.:;]*/i, 'Dikeluarkan di\t: ');
        if (!/\{\{|\.{3}/.test(t)) t += '{{nama_desa}}';
        return t;
      }
      if (/^BERTAMPAT\s+DI\b/i.test(t) && !/\{\{/.test(t)) t = t.replace(/^BERTAMPAT\s+DI[\s.:;]*/i, 'Bertempat di\t: {{tempat_peristiwa}}');
      if (/^TEMPAT\b/i.test(t) && !/LAHIR|TANGGAL|TINGGAL|\{\{/i.test(t)) t = t.replace(/^TEMPAT[\s.:;]*/i, 'Tempat\t: {{tempat_peristiwa}}');
      if (/^HARI\b/i.test(t) && !/\{\{/.test(t)) t = t.replace(/^HARI[\s.:;]*/i, 'Hari\t: {{hari_peristiwa}}');
      return t;
    }

    body = body.map(inject);

    // blok tanda tangan kota/tanggal + nama kepala desa
    for (let i = 0; i < body.length; i++) {
      const L = body[i].toUpperCase();
      if (/^(?:DI\s*)?KELUARKAN/.test(L)) {
        body[i] = `Dikeluarkan di : {{nama_desa}}`;
        if (i + 1 < body.length && /PADA\s*TANGGAL|^TANGGAL\b|^TGL\b/.test(body[i + 1].toUpperCase())) {
          body[i + 1] = `Pada Tanggal   : {{tanggal_surat}}`;
          i++;
        }
      } else if (/^PADA\s+TANGGAL\s*:/.test(L)) {
        body[i] = `Pada Tanggal   : {{tanggal_surat}}`;
      } else if (/^TANGGAL\s+:/.test(L) && i > body.length - 8) {
        body[i] = `Pada Tanggal   : {{tanggal_surat}}`;
      } else if (/^KEPALA\s+DESA\b/.test(L)) {
        body[i] = 'Kepala Desa {{nama_desa}}';
        const next = (body[i + 1] || '').trim();
        if (!next || /^\.{4,}|^_{4,}/.test(next)) body[i + 1] = '{{kepala_desa}}';
        else if (!/\{\{kepala_desa\}\}|ZAINUDDIN/i.test(next) && !/^\{/.test(next)) body.splice(i + 1, 0, '{{kepala_desa}}');
      }
    }

    // buang titik-titik isian & baris duplikat kop/email di tengah dokumen
    body = body
      .filter(l => !/^(email\s*:|website\s*:)/i.test(l) && !/@okukab\.go\.id/i.test(l) && !/^https?:\/\/pusar\./i.test(l))
      .map(l => l.replace(/[ \t]{2,}/g, ' ').replace(/\s*\.{5,}\s*/g, ' ').replace(/\s*_{5,}\s*/g, ' ').trim());

    const { title } = detectTitleNomor(body.filter(Boolean));
    const withoutDupTitle = body.filter(l => l && !(title && l.toUpperCase().replace(/\s+/g, ' ') === title.toUpperCase().replace(/\s+/g, ' ')));
    const head = [];
    if (title) head.push(title.toUpperCase());
    head.push('Nomor : {{nomor_surat}}');
    head.push('');
    const isi = head.concat(withoutDupTitle).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return { isi, title: title || '' };
  }

  // ---------- ambil pengaturan desa (untuk normalisasi) ----------
  let settings = {};
  try { settings = db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get() || {}; } catch (e) { /* kosong */ }

  // ---------- template bawaan (mengikuti file di folder desa) ----------
  const templates = [
    {
      kode: '01',
      nama: 'Surat Keterangan Domisili',
      judul: 'SURAT KETERANGAN DOMISILI',
      file: 'SURAT KETERANGAN DOMISILI NEW.docx',
      isi: `Dengan ini menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Agama                   : {{agama}}
Alamat                  : {{alamat}}

Memang benar nama tersebut di atas adalah Warga Desa {{nama_desa}} yang berdomisili di {{alamat}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}.

Demikian surat keterangan Domisili ini kami buat dengan sebenarnya untuk dipergunakan seperlunya.`
    },
    {
      kode: '04',
      nama: 'Surat Keterangan Pindah',
      judul: 'SURAT KETERANGAN PINDAH PENDUDUK',
      file: 'SURAT PINDAH NEW.docx',
      isi: `Nama Lengkap            : {{nama}}
Jenis Kelamin           : {{jenis_kelamin}}
Tempat/Tgl. Lahir       : {{tempat_lahir}}, {{tanggal_lahir}}
Kewarganegaraan         : Indonesia
Agama                   : {{agama}}
Pekerjaan               : {{pekerjaan}}
Pendidikan              : {{pendidikan}}
Alamat Asal             : {{alamat}} RT {{rt}} RW {{rw}}
No. KK                  : {{no_kk}}
No. KTP / NIK           : {{nik}}
Alamat Pindah           : {{alamat_pindah}}
RT/RW                   : {{rt_pindah}}/{{rw_pindah}}
Kecamatan               : {{kecamatan_pindah}}
Kabupaten               : {{kabupaten_pindah}}
Provinsi                : {{provinsi_pindah}}
Pada Tanggal            : {{tanggal_pindah}}
Alasan Pindah           : {{alasan_pindah}}
Pengikut                : {{pengikut}}

Demikian Surat Keterangan Pindah Penduduk ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '07',
      nama: 'Surat Keterangan Kelahiran',
      judul: 'SURAT KETERANGAN KELAHIRAN',
      file: 'SURAT KETERANGAN KELAHIRAN.docx',
      isi: `Kepala Desa {{nama_desa}} Kecamatan {{kecamatan}}, dengan ini menerangkan bahwa:

Nama                    : {{nama}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Kewarganegaraan         : Indonesia
Agama                   : {{agama}}
Alamat                  : {{alamat}}

Nama Ayah               : {{nama_ayah}}
Nama Ibu                : {{nama_ibu}}

Memang benar nama tersebut di atas adalah Penduduk Desa {{nama_desa}} dan yang bersangkutan tinggal/menetap di Desa {{nama_desa}} serta dilahirkan di {{tempat_lahir}} pada tanggal {{tanggal_lahir}}.

Demikian surat keterangan ini dibuat dengan sebenarnya dan dapat diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '08',
      nama: 'Surat Keterangan Kematian',
      judul: 'SURAT KETERANGAN KEMATIAN',
      file: 'SURAT KET KEMATIAN.docx',
      isi: `Yang bertanda tangan di bawah ini Kepala Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa:

Nama                    : {{nama}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Alamat                  : {{alamat}}

Benar nama tersebut di atas telah meninggal dunia karena {{penyebab_kematian}} pada:

Tanggal                 : {{tanggal_meninggal}}
Hari                    : {{hari_meninggal}}
Pukul                   : {{jam_meninggal}}
Bertempat di            : {{tempat_meninggal}}

Dan telah dimakamkan di:

Tempat                  : {{tempat_makam}}
Tanggal                 : {{tanggal_makam}}
Hari                    : {{hari_makam}}
Pukul                   : {{pukul_makam}}

Demikianlah Surat Keterangan ini kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '13',
      nama: 'Surat Keterangan Usaha (SKU)',
      judul: 'SURAT KETERANGAN USAHA',
      file: 'SURAT KETERANGAN USAHA NEW.docx',
      isi: `Kepala Desa {{nama_desa}} dengan ini menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin           : {{jenis_kelamin}}
Agama                   : {{agama}}
Alamat KTP              : {{alamat}}

Memang benar nama yang tersebut di atas mempunyai usaha yang bertempat di {{alamat_usaha}} dengan nama/jenis usaha: {{nama_usaha}}.

Demikian Surat Keterangan Usaha ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '19',
      nama: 'Surat Keterangan Tidak Mampu (SKTM)',
      judul: 'SURAT KETERANGAN TIDAK MAMPU',
      file: 'SURAT KETERANGAN TIDAK MAMPU.docx',
      isi: `Yang bertanda tangan di bawah ini Kepala Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Jenis Kelamin           : {{jenis_kelamin}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Kewarganegaraan         : Indonesia
Agama                   : {{agama}}
Status Perkawinan       : {{status_perkawinan}}
Pekerjaan               : {{pekerjaan}}
Alamat                  : {{alamat}}

Memang benar nama tersebut di atas adalah penduduk Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dan menurut sepengetahuan kami nama tersebut di atas memang tergolong Kurang/Tidak Mampu.

Demikian Surat Keterangan ini kami buat dengan sebenarnya dan dapat dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '19-KIS',
      nama: 'Surat Keterangan Tidak Mampu (KIS)',
      judul: 'SURAT KETERANGAN TIDAK MAMPU (KIS)',
      file: 'SURAT KETERANGAN TIDAK MAMPU (KIS).docx',
      isi: `Yang bertanda tangan di bawah ini Kepala Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
No. KK                  : {{no_kk}}
Jenis Kelamin           : {{jenis_kelamin}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Agama                   : {{agama}}
Alamat                  : {{alamat}}

Memang benar yang bernama tersebut di atas adalah penduduk Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dan berdomisili di {{alamat}}. Serta menurut pengetahuan kami orang tersebut memang benar keadaan tidak mampu dan belum memiliki Jaminan Kesehatan Nasional (JKN), Kartu Indonesia Sehat (KIS) maupun sumber pembiayaan lainnya.

Demikianlah Surat Keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`
    },
    {
      kode: '19-KIP',
      nama: 'Surat Keterangan Tidak Mampu Pelajar (KIP)',
      judul: 'SURAT KETERANGAN TIDAK MAMPU (SKTM) - KIP',
      file: 'SURAT KETERANGAN TIDAK MAMPU PELAJAR (KIP).docx',
      isi: `Yang bertanda tangan di bawah ini, Kepala Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, menerangkan dengan sesungguhnya bahwa:

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

Bahwa nama tersebut di atas benar penduduk dan berdomisili di Desa {{nama_desa}} dan yang bersangkutan tergolong dalam Keluarga yang tidak mampu dan belum memiliki Kartu Indonesia Pintar (KIP). Surat Keterangan ini dipergunakan oleh yang bersangkutan untuk keperluan Sekolah.

Demikianlah Surat Keterangan ini dibuat dengan sebenarnya, mengingat sumpah jabatan dan untuk dapat dipergunakan seperlunya.`
    },
    {
      kode: '48',
      nama: 'Surat Keterangan Kehilangan',
      judul: 'SURAT KETERANGAN KEHILANGAN',
      file: 'SURAT KETERANGAN KEHILANGAN KK.doc',
      isi: `Kepala Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dengan ini menerangkan bahwa:

Nama                    : {{nama}}
NIK                     : {{nik}}
Tempat/Tanggal Lahir    : {{tempat_lahir}}, {{tanggal_lahir}}
Agama                   : {{agama}}
Jenis Kelamin           : {{jenis_kelamin}}
Pekerjaan               : {{pekerjaan}}
Alamat                  : {{alamat}}

Benar yang tersebut namanya di atas adalah penduduk Desa {{nama_desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}} dan selanjutnya dapat kami terangkan bahwa yang bersangkutan telah kehilangan:

{{barang_dokumen_hilang}}

Atas Nama               : {{nama}}
No. Dokumen             : {{nomor_dokumen}}

Demikianlah Surat Keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan seperlunya.

NB: Surat ini berlaku 14 hari setelah diterbitkan.`
    }
  ];

  // ---------- coba sinkronkan isi dari file asli di folder desa ----------
  const app = ctx.app;
  let desaDir = '';
  if (app) {
    const roots = [app.getAppPath(), path.resolve(__dirname, '..')];
    const names = ['template surat desa', 'templates/template surat desa'];
    const seen = new Set();
    for (const root of roots) {
      if (seen.has(root)) continue;
      seen.add(root);
      for (const n of names) {
        const p = path.join(root, n);
        try { if (fs.existsSync(p) && fs.statSync(p).isDirectory()) { desaDir = p; } } catch (e) { /* skip */ }
      }
      if (desaDir) break;
    }
  }

  function findDocFile(name) {
    if (!desaDir || !name) return null;
    const exact = path.join(desaDir, name);
    try { if (fs.existsSync(exact)) return exact; } catch (e) { /* skip */ }
    // pencarian longgar: abaikan ekstensi/kapital/spasi/karakter khusus
    const norm = s => String(s).toLowerCase().replace(/\.(docx?|rtf)$/i, '').replace(/[^a-z0-9]/g, '');
    const target = norm(name);
    try {
      for (const f of fs.readdirSync(desaDir)) {
        if (!/\.(docx|doc|rtf)$/i.test(f)) continue;
        if (norm(f) === target) return path.join(desaDir, f);
      }
    } catch (e) { /* skip */ }
    return null;
  }

  for (const t of templates) {
    if (!t.file) continue;
    const fp = findDocFile(t.file);
    if (!fp || !/\.docx$/i.test(fp)) continue; // .doc/.rtf lama -> pakai teks bawaan
    try {
      const paras = readDocxParagraphs(fp);
      const { isi } = wordParasToTemplate(paras, settings);
      if (isi && /\{\{/.test(isi)) t.isi = isi;
    } catch (e) {
      console.warn('Sinkron template dari file gagal (' + t.file + '):', e.message);
    }
  }

  // ---------- simpan ke database ----------
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

  // Hapus template demo lama yang menabrak kode jenis surat bawaan
  try {
    db.prepare("DELETE FROM template_surat WHERE kode='001' AND nama LIKE '%Domisili%' AND from_word IS NULL").run();
  } catch (e) { /* kolom from_word mungkin belum ada di DB sangat lama */ }

  // Update pengaturan default untuk Desa Pusar (hanya jika masih default)
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

  console.log(`Template seed selesai: ${added} baru, ${updated} diupdate (sinkron folder "template surat desa": ${desaDir ? 'YA' : 'tidak ditemukan'}).`);
  return { added, updated };
};

// Jalankan langsung jika dipanggil via node
if (require.main === module) {
  console.log('Jalankan seed ini dari dalam aplikasi Electron (setelah db siap),');
  console.log('atau tambahkan di main.js setelah seed.js:');
  console.log("  require('./templates-seed')(db, { app });");
}
