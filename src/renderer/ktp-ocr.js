/* =========================================================
   BANUAKITA - Modul OCR KTP (tesseract.js v7)
   Mengambil data dari teks hasil scan KTP:
   NIK, Nama, TTL, Alamat, RT/RW, Kelamin, Agama,
   Perkawinan, Pekerjaan, Kewarganegaraan.
   Diekspos sebagai window.KtpOcr
   ========================================================= */

(function () {

  const MONTHS = {
    JAN: 1, FEB: 2, MAR: 3, APR: 4, MEI: 5, JUN: 6,
    JUL: 7, AGT: 8, Agu: 8, AUG: 8, SEP: 9, OKT: 10, OCT: 10,
    NOV: 11, DES: 12, DEC: 12
  };

  // Bersihkan karakter OCR yang sering tertukar dengan digit
  function cleanDigits(s) {
    return String(s || '')
      .replace(/[OoQD]/g, '0')
      .replace(/lI|l|I/g, '1')
      .replace(/[Ss]/g, '5')
      .replace(/[B]/g, '8')
      .replace(/[Zz]/g, '2')
      .replace(/[^0-9]/g, '');
  }

  function pickNik(text) {
    const cands = [];
    const re = /\d[\d\s.\-]{14,22}\d/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const d = cleanDigits(m[0]);
      if (d.length === 16) cands.push(d);
    }
    if (!cands.length) {
      const all = cleanDigits(text);
      for (let i = 0; i + 16 <= all.length; i++) cands.push(all.slice(i, i + 16));
    }
    // heuristik NIK: 6 digit pertama = kode wilayah (angka saja, bukan 000000)
    cands.sort((a, b) => scoreNik(b) - scoreNik(a));
    return cands[0] || '';
  }

  function scoreNik(nik) {
    let s = 0;
    const wil = nik.slice(0, 6);
    if (/^[1-9]\d{5}/.test(wil)) s += 2;               // kode provinsi tidak 0
    const kkPart = nik.slice(6, 12);
    const y = Number(kkPart.slice(0, 2));
    if (y >= 10 && y <= 40) s += 2;                    // tahun lahir 2010-2040 masuk akal
    else if (y >= 50 && y <= 99) s += 1;               // pra-2000
    const uniq = new Set(nik).size;
    s += Math.min(uniq, 8) / 8;                        // hindari "111111..."
    return s;
  }

  function findLabelLine(lines, ...keys) {
    for (const l of lines) {
      const low = l.toLowerCase().replace(/\s+/g, '');
      if (keys.some(k => low.startsWith(k))) return l;
    }
    return '';
  }

  function afterColon(line) {
    const i = line.indexOf(':');
    if (i >= 0) return line.slice(i + 1).trim();
    // tanpa titik dua — buang kata label di depan
    return line.replace(/^\s*(NIK|nama|alamat|tempat[^:]*lahir|tanggal[^:]*lahir|agama|jk|jenis[^:]*kelamin|provi[nw]si|pekerjaan|kewarga[nn]egaraan|status[^:]*perkawinan)\s*[:\-]?\s*/i, '').trim();
  }

  function parseTanggalLahir(raw) {
    // Format KTP: "Tempat Lahir, DD-MM-YYYY" atau "DD-MM-YYYY"
    raw = String(raw || '').trim();
    if (!raw) return { tempat_lahir: '', tanggal_lahir: '' };

    const dmmy = raw.match(/(\d{1,2})[\s\-\/.]+([A-Za-zÀ-ÿ]{3,9})[\s\-\/.]+(\d{4})/);
    let tgl = null, idxTgl = -1;
    if (dmmy) {
      const mon = MONTHS[dmmy[2].slice(0, 3).toUpperCase()] || MONTHS[dmmy[2].slice(0, 3)];
      if (mon) {
        tgl = `${dmmy[3]}-${String(mon).padStart(2, '0')}-${String(dmmy[1]).padStart(2, '0')}`;
        idxTgl = dmmy.index;
      }
    } else {
      const num = raw.match(/(\d{1,2})[\s\-\/.]+(\d{1,2})[\s\-\/.]+(\d{4})/);
      if (num) {
        tgl = `${num[3]}-${String(num[2]).padStart(2, '0')}-${String(num[1]).padStart(2, '0')}`;
        idxTgl = num.index;
      }
    }

    if (tgl) {
      const tempat = raw.slice(0, idxTgl).replace(/^[^,]*,\s*/, '').replace(/[,.\s]+$/, '').trim();
      return { tempat_lahir: tempat, tanggal_lahir: tgl };
    }
    // tidak ada tanggal → seluruhnya dianggap tempat lahir
    return { tempat_lahir: raw.replace(/[,.\s]+$/, '').trim(), tanggal_lahir: '' };
  }

  function parseKtpText(text) {
    const out = {
      nik: '', nama: '', no_kk: '', tempat_lahir: '', tanggal_lahir: '',
      jenis_kelamin: '', agama: '', alamat: '', rt: '', rw: '',
      status_perkawinan: '', pekerjaan: '', kewarganegaraan: '', provinsi: ''
    };

    const lines = String(text || '')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    if (!lines.length) return out;

    // ---- NIK ----
    const nikLine = findLabelLine(lines, 'nik');
    out.nik = nikLine ? cleanDigits(afterColon(nikLine)).slice(0, 16) : pickNik(text);
    if (out.nik.length !== 16) out.nik = out.nik.length === 16 ? out.nik : (pickNik(text) || out.nik);

    // ---- No KK (opsional, beberapa desain KTP-el lama) ----
    const kkLine = findLabelLine(lines, 'nomorkk', 'nokk');
    if (kkLine) {
      const d = cleanDigits(afterColon(kkLine));
      if (d.length === 16 && d !== out.nik) out.no_kk = d;
    }

    // ---- NAMA ----
    const namaLine = findLabelLine(lines, 'nama', 'namalebihlengkap', 'namapenduduk');
    if (namaLine) {
      out.nama = afterColon(namaLine)
        .replace(/^nama(lebihlengkap|penduduk)?\s*[:\-]?\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // ---- TEMPAT & TANGGAL LAHIR ----
    const ttlLine = findLabelLine(lines, 'tempattanggallahir', 'tempat/tanggallahir', 'tempatlair', 'tanggallair');
    let ttlRaw = ttlLine ? afterColon(ttlLine) : '';
    if (!ttlRaw) {
      // baris seperti "Banjarmasin, 17-08-1990" di mana pun berada
      const cand = lines.find(l => /\b\d{1,2}[\s\-\/\.](JAN|FEB|MAR|APR|MEI|JUN|JUL|AGT|Agu|AUG|SEP|OKT|OCT|NOV|DES|DEC|\d{1,2})[\s\-\/\.]\d{4}\b/i.test(l));
      if (cand) ttlRaw = afterColon(cand);
    }
    const ttl = parseTanggalLahir(ttlRaw);
    out.tempat_lahir = ttl.tempat_lahir;
    out.tanggal_lahir = ttl.tanggal_lahir;

    // ---- AGAMA ----
    const agamaLine = findLabelLine(lines, 'agama');
    if (agamaLine) {
      let a = afterColon(agamaLine).toUpperCase();
      const map = { ISLAM: 'Islam', KRISTEN: 'Kristen', KATHOLIK: 'Katholik', HINDU: 'Hindu', BUDDHA: 'Buddha', KHONGHU: 'Khonghucu', ALIR: 'Aliran Kepercayaan' };
      out.agama = map[a.split(/\s/)[0]] || a.charAt(0) + a.slice(1).toLowerCase();
    }

    // ---- JENIS KELAMIN ----
    const jkLine = findLabelLine(lines, 'jeniskelamin', 'jk');
    if (jkLine) {
      const v = afterColon(jkLine).toUpperCase();
      out.jenis_kelamin = /P/.test(v) && !/L/.test(v) ? 'Perempuan'
        : /L/.test(v) ? 'Laki-laki'
        : '';
    }

    // ---- STATUS PERKAWINAN ----
    const stLine = findLabelLine(lines, 'statusperkawinan', 'perkawinan');
    if (stLine) {
      const v = afterColon(stLine).toUpperCase();
      out.status_perkawinan = v.includes('KAWIN') && !v.includes('BELUM') ? 'Kawin'
        : v.includes('BELUM') ? 'Belum Kawin'
        : v.includes('CERAI') ? 'Cerai' : v.charAt(0) + v.slice(1).toLowerCase();
    }

    // ---- PEKERJAAN ----
    const pekLine = findLabelLine(lines, 'pekerjaan');
    if (pekLine) out.pekerjaan = afterColon(pekLine);

    // ---- KEWARGANEGARAAN ----
    const kwLine = findLabelLine(lines, 'kewarganegaraan');
    if (kwLine) out.kewarganegaraan = afterColon(kwLine);

    // ---- PROVINSI (baris "PROV. XXXXX") ----
    const provLine = lines.find(l => /^PROV\.?\s+/i.test(l));
    if (provLine) out.provinsi = provLine.replace(/^PROV\.?\s*/i, '').trim();

    // ---- ALAMAT (label "Alamat" + baris-baris setelahnya) ----
    const idxAlamat = lines.findIndex(l => /^alamat\s*[:\-]?/i.test(l));
    if (idxAlamat >= 0) {
      let first = lines[idxAlamat].replace(/^alamat\s*[:\-]?\s*/i, '').trim();
      // RT/RW pada baris yang sama jangan masuk alamat
      first = first.replace(/\s*\bRT\s*[/:.]?\s*\d{3}.*$/i, '').replace(/\s*\bRW\s*[/:.]?\s*\d{3}.*$/i, '').trim();
      const parts = [first];
      for (let i = idxAlamat + 1; i < lines.length; i++) {
        const l = lines[i];
        if (/^(RT|RW|Kel|Desa|Kec|Kab|Prov|Nik|Nama|Agama|JK|Status|Pekerjaan|Kewarganegaraan|Tempat|Lahir)/i.test(l)) break;
        parts.push(l);
      }
      out.alamat = parts.filter(Boolean).join(', ');
    }

    // ---- RT / RW ----
    const rt = text.match(/RT\s*[\/:]?\s*(\d{3})/i);
    const rw = text.match(/RW\s*[\/:]?\s*(\d{3})/i);
    if (rt) out.rt = rt[1];
    if (rw) out.rw = rw[1];

    // Rapikan nilai yang cuma berisi noise
    Object.keys(out).forEach(k => {
      if (typeof out[k] === 'string') out[k] = out[k].replace(/\s+/g, ' ').trim();
    });

    return out;
  }

  async function runOcr(imagePathOrBlob, onProgress) {
    if (typeof Tesseract === 'undefined') {
      throw new Error('Mesin OCR (tesseract.min.js) tidak ditemukan.');
    }
    const worker = await Tesseract.createWorker('ind', 1, {
      logger: m => {
        if (typeof onProgress === 'function' && m && m.progress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });
    try {
      const { data } = await worker.recognize(imagePathOrBlob);
      return String(data.text || '');
    } finally {
      await worker.terminate();
    }
  }

  window.KtpOcr = { runOcr, parseKtpText };

})();
