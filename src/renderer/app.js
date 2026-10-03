/* =========================================================
   BANUAKITA - Renderer
   TANPA LOGIN
   ========================================================= */

document.title = 'BanuaKita - Administrasi Desa';

let user = {
  id: 0,
  username: 'admin',
  nama: 'Administrasi Desa',
  role: 'Admin'
};

let suratTypes = [];
let lastPreview = '';
let cachedPenduduk = [];
let currentTemplate = null;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[m]));


/* =========================================================
   ROUTER
   ========================================================= */

async function page(x) {

  const titles = {
    dashboard: 'Dashboard',
    penduduk: 'Data Penduduk',
    buat: 'Buat Surat',
    arsip: 'Arsip Surat',
    types: 'Jenis Surat',
    templates: 'Template Surat',
    settings: 'Pengaturan Desa',
    users: 'Pengguna',
    backup: 'Backup / Restore'
  };

  const title = $('#title');
  const content = $('#content');

  if (title) {
    title.textContent = titles[x] || x;
  }

  const routes = {
    dashboard: dashboard,
    penduduk: penduduk,
    buat: buat,
    arsip: arsip,
    types: suratTypesPage,
    templates: templates,
    settings: settings,
    users: users,
    backup: backup
  };

  const fn = routes[x];

  if (typeof fn !== 'function') {
    if (content) {
      content.innerHTML = `
        <div class="panel">
          Halaman "${esc(x)}" tidak ditemukan.
        </div>
      `;
    }
    return;
  }

  try {
    await fn();
  } catch (e) {

    console.error('Page error:', e);

    if (content) {
      content.innerHTML = `
        <div class="panel">
          <b>Terjadi kesalahan:</b><br>
          ${esc(e?.message || e)}
        </div>
      `;
    }
  }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function dashboard() {

  try {

    const d = await window.desaAPI.dashboard();

    $('#content').innerHTML = `
      <div class="cards">

        <div class="card">
          Penduduk
          <div class="num">${d?.penduduk ?? 0}</div>
        </div>

        <div class="card">
          Surat Hari Ini
          <div class="num">${d?.suratHariIni ?? 0}</div>
        </div>

        <div class="card">
          Surat Bulan Ini
          <div class="num">${d?.suratBulanIni ?? 0}</div>
        </div>

        <div class="card">
          Arsip
          <div class="num">${d?.arsip ?? 0}</div>
        </div>

      </div>

      <div class="panel" style="margin-top:18px">

        <h2>Selamat Datang di BANUAKITA</h2>

        <p>
          Sistem Administrasi Desa untuk membantu pengelolaan
          data penduduk, surat, arsip, template, pengaturan,
          pengguna, dan backup database.
        </p>

      </div>
    `;

  } catch (e) {

    console.error('Dashboard error:', e);

    $('#content').innerHTML = `
      <div class="panel">

        <h2>Selamat Datang di BANUAKITA</h2>

        <p>
          Sistem Administrasi Desa.
        </p>

        <p>
          Statistik dashboard belum dapat ditampilkan.
        </p>

        <small>
          ${esc(e?.message || e)}
        </small>

      </div>
    `;
  }
}


/* =========================================================
   PENDUDUK
   ========================================================= */

async function penduduk() {

  const r = await window.desaAPI.penduduk.list('') || [];

  $('#content').innerHTML = `
    <div class="panel">

      <div class="toolbar">

        <input
          id="q"
          placeholder="Cari NIK / Nama / KK"
          oninput="loadP(this.value)"
        >

        <button
          class="primary"
          onclick="addP()"
        >
          + Tambah Penduduk
        </button>

      </div>

      <table class="table">

        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama</th>
            <th>KK</th>
            <th>JK</th>
            <th>Alamat</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody id="pr">
          ${
            r.map(pRow).join('') ||
            `
            <tr>
              <td colspan="6" class="empty">
                Belum ada data
              </td>
            </tr>
            `
          }
        </tbody>

      </table>

    </div>
  `;
}


function pRow(r) {

  return `
    <tr>

      <td>${esc(r.nik)}</td>

      <td>${esc(r.nama)}</td>

      <td>${esc(r.no_kk)}</td>

      <td>${esc(r.jenis_kelamin)}</td>

      <td>${esc(r.alamat)}</td>

      <td>

        <button onclick="editP(${r.id})">
          Edit
        </button>

        <button onclick="hapusP(${r.id})">
          Nonaktif
        </button>

      </td>

    </tr>
  `;
}


async function loadP(q) {

  const pr = $('#pr');
  if (!pr) return;

  const r = await window.desaAPI.penduduk.list(q) || [];

  pr.innerHTML =
    r.map(pRow).join('') ||
    `
      <tr>
        <td colspan="6" class="empty">
          Tidak ditemukan
        </td>
      </tr>
    `;
}


/* =========================================================
   FORM FIELD
   ========================================================= */

// Opsi standar (seperti form pelayanan desa)
const OPT_JK = 'Laki-laki|Perempuan';
const OPT_AGAMA = 'Islam|Kristen|Katolik|Hindu|Buddha|Konghucu|Kepercayaan';
const OPT_STATUS = 'Belum Kawin|Kawin|Cerai Hidup|Cerai Mati';
const OPT_PEKERJAAN = 'Belum/Tidak Bekerja|Pelajar/Mahasiswa|Ibu Rumah Tangga|Pensiunan|PNS|TNI|Polri|Petani|Nelayan|Pedagang|Wiraswasta|Karyawan Swasta|Buruh|Guru|Tenaga Kesehatan|Perangkat Desa|Lainnya';

function fld(
  id,
  label,
  type = 'text',
  opts = '',
  value = '',
  hint = '',
  placeholder = ''
) {

  const v = esc(value);
  const ph = esc(placeholder || '');

  let x;

  if (type === 'textarea') {

    x = `
      <textarea id="${id}" placeholder="${ph}" rows="3">${v}</textarea>
    `;

  } else if (type === 'select') {

    x = `
      <select id="${id}">
        <option value="">-- pilih --</option>
        ${opts
          .split('|')
          .filter(Boolean)
          .map(o => `
            <option
              value="${esc(o)}"
              ${o === value ? 'selected' : ''}
            >
              ${esc(o)}
            </option>
          `)
          .join('')
        }
      </select>
    `;

  } else {

    x = `
      <input
        id="${id}"
        type="${type}"
        value="${v}"
        placeholder="${ph}"
      >
    `;
  }

  return `
    <div class="form-field">
      <label for="${id}">${label}</label>
      ${x}
      ${hint ? `<small class="field-hint">${esc(hint)}</small>` : ''}
    </div>
  `;
}

/** Field dinamis pintar: pakai select untuk field yang dikenal */
function fldSmart(id, label, tipe, value = '') {
  const key = String(id || '').replace(/^f_/, '').toLowerCase();
  const lab = (label || key).replaceAll('_', ' ');

  if (key === 'jenis_kelamin' || /jenis.?kelamin|jk/i.test(lab)) {
    return fld(id, lab, 'select', OPT_JK, value);
  }
  if (key === 'agama') {
    return fld(id, lab, 'select', OPT_AGAMA, value);
  }
  if (key === 'status_perkawinan' || /status.?perkawinan/i.test(lab)) {
    return fld(id, lab, 'select', OPT_STATUS, value);
  }
  if (key === 'pekerjaan') {
    return fld(id, lab, 'select', OPT_PEKERJAAN, value);
  }
  if (tipe === 'DATE' || /tanggal/i.test(key)) {
    return fld(id, lab, 'date', '', value, 'Contoh: 01/01/1990');
  }
  if (/alamat/i.test(key)) {
    return fld(id, lab, 'textarea', '', value, '', 'Alamat lengkap');
  }
  if (key === 'nik') {
    return fld(id, lab, 'text', '', value, '16 digit angka', 'NIK');
  }
  if (key === 'rt' || key === 'rw') {
    return fld(id, lab, 'text', '', value, 'Contoh: 001', key.toUpperCase());
  }
  if (/keperluan/i.test(key)) {
    return fld(id, lab, 'text', '', value, 'Contoh: Beasiswa Sekolah', 'Keperluan');
  }

  return fld(
    id,
    lab,
    tipe === 'DATE' ? 'date' : 'text',
    '',
    value
  );
}


/* =========================================================
   TAMBAH PENDUDUK
   ========================================================= */

function addP() {

  $('#content').innerHTML = `

    <div class="panel">

      <h2>Tambah Penduduk</h2>

      <!-- SCAN KTP -->
      <div class="panel" style="margin-bottom:18px;background:#f8fafc;border:1px dashed #94a3b8">

        <h3 style="margin-top:0">📷 Scan KTP (OCR)</h3>

        <p class="hint" style="margin-bottom:12px">
          Upload foto/scan KTP. Sistem akan mencoba membaca data secara otomatis.
        </p>

        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">

          <div>
            <input
              type="file"
              id="ktp_file"
              accept="image/*"
              capture="environment"
              onchange="previewKtp(this, '')"
            >
            <div style="margin-top:8px">
              <button
                class="primary"
                id="btn_ocr"
                onclick="scanKtpOcr('')"
                disabled
              >
                Scan KTP Sekarang
              </button>
            </div>
            <div id="ocr_status" style="margin-top:8px;font-size:13px;color:#64748b"></div>
          </div>

          <div id="ktp_preview_wrap" style="display:none">
            <img
              id="ktp_preview"
              style="max-width:280px;max-height:180px;border:1px solid #cbd5e1;border-radius:6px"
            >
          </div>

        </div>

      </div>

      <div class="form-section-title">Data Penduduk</div>
      <div class="grid form-grid-2">
        ${fld('nama', 'Nama Lengkap *', 'text', '', '', '', 'Nama sesuai KTP')}
        ${fld('tempat_lahir', 'Tempat Lahir', 'text', '', '', '', 'Tempat lahir')}
        ${fld('tanggal_lahir', 'Tanggal Lahir', 'date', '', '', 'Contoh: 1 Januari 1990')}
        ${fld('nik', 'NIK *', 'text', '', '', '16 digit angka', 'NIK')}
        ${fld('no_kk', 'Nomor KK', 'text', '', '', '', 'Nomor Kartu Keluarga')}
        ${fld('jenis_kelamin', 'Jenis Kelamin', 'select', OPT_JK)}
        ${fld('agama', 'Agama', 'select', OPT_AGAMA)}
        ${fld('status_perkawinan', 'Status Perkawinan', 'select', OPT_STATUS)}
        ${fld('pekerjaan', 'Pekerjaan', 'select', OPT_PEKERJAAN)}
        ${fld('pendidikan', 'Pendidikan', 'text', '', '', '', 'Pendidikan terakhir')}
        ${fld('alamat', 'Alamat', 'textarea', '', '', '', 'Alamat lengkap')}
        ${fld('rt', 'RT', 'text', '', '', 'Contoh: 001', '001')}
        ${fld('rw', 'RW', 'text', '', '', 'Contoh: 001', '001')}
        ${fld('desa', 'Desa', 'text', '', '', '', 'Nama desa')}
        ${fld('kecamatan', 'Kecamatan', 'text', '', '', '', 'Nama kecamatan')}
        ${fld('kabupaten', 'Kabupaten', 'text', '', '', '', 'Nama kabupaten')}
        ${fld('provinsi', 'Provinsi', 'text', '', '', '', 'Nama provinsi')}
      </div>

      <div class="actions">

        <button
          class="primary"
          onclick="saveP()"
        >
          Simpan
        </button>

        <button onclick="penduduk()">
          Batal
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   EDIT PENDUDUK
   ========================================================= */

async function editP(id) {

  const p = await window.desaAPI.penduduk.get(id);

  if (!p) {
    return alert('Data tidak ditemukan');
  }

  $('#content').innerHTML = `

    <div class="panel">

      <h2>Edit Penduduk</h2>

      <div class="grid">

        ${fld('nik', 'NIK *', 'text', '', p.nik)}

        ${fld('no_kk', 'No. KK', 'text', '', p.no_kk)}

        ${fld('nama', 'Nama Lengkap *', 'text', '', p.nama)}

        ${fld(
          'tempat_lahir',
          'Tempat Lahir',
          'text',
          '',
          p.tempat_lahir
        )}

        ${fld(
          'tanggal_lahir',
          'Tanggal Lahir',
          'date',
          '',
          p.tanggal_lahir
        )}

        ${fld(
          'jenis_kelamin',
          'Jenis Kelamin',
          'select',
          'Laki-laki|Perempuan',
          p.jenis_kelamin
        )}

        ${fld('agama', 'Agama', 'text', '', p.agama)}

        ${fld(
          'pendidikan',
          'Pendidikan',
          'text',
          '',
          p.pendidikan
        )}

        ${fld(
          'pekerjaan',
          'Pekerjaan',
          'text',
          '',
          p.pekerjaan
        )}

        ${fld(
          'status_perkawinan',
          'Status Perkawinan',
          'text',
          '',
          p.status_perkawinan
        )}

        ${fld('rt', 'RT', 'text', '', p.rt)}

        ${fld('rw', 'RW', 'text', '', p.rw)}

        ${fld('desa', 'Desa', 'text', '', p.desa)}

        ${fld(
          'kecamatan',
          'Kecamatan',
          'text',
          '',
          p.kecamatan
        )}

        ${fld(
          'kabupaten',
          'Kabupaten',
          'text',
          '',
          p.kabupaten
        )}

        ${fld(
          'provinsi',
          'Provinsi',
          'text',
          '',
          p.provinsi
        )}

        <div class="full">
          ${fld(
            'alamat',
            'Alamat',
            'textarea',
            '',
            p.alamat
          )}
        </div>

      </div>

      <div class="actions">

        <button
          class="primary"
          onclick="saveP(${p.id})"
        >
          Update
        </button>

        <button onclick="penduduk()">
          Batal
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   SIMPAN PENDUDUK
   ========================================================= */

async function saveP(id) {

  const ids = [
    'nik',
    'no_kk',
    'nama',
    'tempat_lahir',
    'tanggal_lahir',
    'jenis_kelamin',
    'agama',
    'pendidikan',
    'pekerjaan',
    'status_perkawinan',
    'alamat',
    'rt',
    'rw',
    'desa',
    'kecamatan',
    'kabupaten',
    'provinsi'
  ];

  const d = {};

  ids.forEach(i => {
    const el = document.getElementById(i);
    d[i] = el ? String(el.value || '').trim() : '';
  });

  if (!d.nik || !d.nama) {
    return alert('NIK dan Nama wajib diisi.');
  }

  // Bersihkan NIK dari spasi/karakter non-digit
  d.nik = d.nik.replace(/\D/g, '');

  if (!/^\d{16}$/.test(d.nik)) {
    return alert('NIK harus 16 digit angka.\nSaat ini: ' + d.nik.length + ' digit.');
  }

  d.status_kependudukan = 'Tetap';

  if (id) {
    d.id = id;
  }

  // Pastikan tanggal_lahir format YYYY-MM-DD atau kosong
  if (d.tanggal_lahir && !/^\d{4}-\d{2}-\d{2}$/.test(d.tanggal_lahir)) {
    d.tanggal_lahir = '';
  }

  try {

    if (!window.desaAPI || !window.desaAPI.penduduk || typeof window.desaAPI.penduduk.save !== 'function') {
      throw new Error('API penduduk.save tidak tersedia. Periksa preload / main process.');
    }

    const r = await window.desaAPI.penduduk.save(d);

    const msg = (r && r.updated)
      ? 'Data diperbarui.'
      : 'Data tersimpan.';

    alert(msg);

    await penduduk();

  } catch (e) {

    console.error('saveP error:', e);
    alert(
      'Gagal menyimpan penduduk:\n\n' +
      (e?.message || String(e))
    );
  }
}


/* =========================================================
   NONAKTIF PENDUDUK
   ========================================================= */

async function hapusP(id) {

  if (!confirm('Nonaktifkan penduduk ini?')) {
    return;
  }

  await window.desaAPI.penduduk.nonaktif(id);

  await penduduk();
}


/* =========================================================
   OCR KTP
   ========================================================= */

let ktpFileObject = null;
let ktpOcrPrefix = '';   // '' untuk form tambah penduduk, 'm_' untuk input manual

function previewKtp(input, prefix = '') {

  const file = input.files && input.files[0];
  const isManual = prefix === 'm_';

  const preview = document.getElementById(isManual ? 'm_ktp_preview' : 'ktp_preview');
  const wrap = document.getElementById(isManual ? 'm_ktp_preview_wrap' : 'ktp_preview_wrap');
  const btn = document.getElementById(isManual ? 'm_btn_ocr' : 'btn_ocr');
  const status = document.getElementById(isManual ? 'm_ocr_status' : 'ocr_status');

  ktpFileObject = file || null;
  ktpOcrPrefix = prefix;

  if (!file) {
    if (wrap) wrap.style.display = 'none';
    if (btn) btn.disabled = true;
    if (status) status.textContent = '';
    return;
  }

  if (preview) {
    preview.src = URL.createObjectURL(file);
  }
  if (wrap) wrap.style.display = '';
  if (btn) btn.disabled = false;
  if (status) {
    status.textContent = 'Gambar siap di-scan. Klik tombol "Scan KTP Sekarang".';
    status.style.color = '#64748b';
  }
}


async function loadTesseract() {

  if (window.Tesseract) {
    return window.Tesseract;
  }

  // Coba load dari CDN
  return new Promise((resolve, reject) => {

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        reject(new Error('Tesseract gagal dimuat'));
      }
    };
    script.onerror = () =>
      reject(new Error('Gagal memuat library OCR (butuh koneksi internet)'));

    document.head.appendChild(script);
  });
}


function parseKtpText(text) {

  const result = {
    nik: '',
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    rt: '',
    rw: '',
    desa: '',
    kecamatan: '',
    agama: '',
    status_perkawinan: '',
    pekerjaan: '',
    provinsi: '',
    kabupaten: ''
  };

  if (!text) return result;

  // Normalisasi
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const full = text.replace(/\s+/g, ' ');

  // NIK (16 digit)
  const nikMatch =
    full.match(/\b(\d{16})\b/) ||
    text.match(/NIK[:\s]*(\d{16})/i);
  if (nikMatch) result.nik = nikMatch[1];

  // Helper: ambil nilai setelah label
  function afterLabel(label, src = full) {
    const re = new RegExp(
      label + '[:\\s]+([^\\n]+?)(?=\\s{2,}|\\n|NIK|Nama|Tempat|Jenis|Alamat|RT|Kel|Kecamatan|Agama|Status|Pekerjaan|Kewarganegaraan|Berlaku|$)',
      'i'
    );
    const m = src.match(re);
    return m ? m[1].trim().replace(/^[:\-\s]+/, '') : '';
  }

  // Nama
  result.nama =
    afterLabel('Nama') ||
    afterLabel('Nama Lengkap');

  // Bersihkan nama dari noise umum
  if (result.nama) {
    result.nama = result.nama
      .replace(/\b(NIK|Tempat|Tgl|Lahir|Jenis|Kelamin)\b.*/i, '')
      .trim();
  }

  // Tempat / Tgl Lahir  →  contoh: JAKARTA, 01-01-1990
  let ttl =
    afterLabel('Tempat/Tgl Lahir') ||
    afterLabel('Tempat / Tgl Lahir') ||
    afterLabel('Tempat/Tgl') ||
    afterLabel('Tempat Lahir');

  if (ttl) {
    // Coba pola: TEMPAT, DD-MM-YYYY atau DD/MM/YYYY
    const ttlMatch = ttl.match(
      /^(.+?)[,\s]+(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/
    );
    if (ttlMatch) {
      result.tempat_lahir = ttlMatch[1].trim();
      const d = ttlMatch[2].padStart(2, '0');
      const m = ttlMatch[3].padStart(2, '0');
      const y = ttlMatch[4];
      result.tanggal_lahir = `${y}-${m}-${d}`;
    } else {
      result.tempat_lahir = ttl.split(',')[0].trim();
    }
  }

  // Jenis Kelamin
  const jk =
    afterLabel('Jenis Kelamin') ||
    afterLabel('Jenis kelamin');
  if (/laki/i.test(jk) || /\bL\b/.test(jk)) {
    result.jenis_kelamin = 'Laki-laki';
  } else if (/perem|wanita/i.test(jk) || /\bP\b/.test(jk)) {
    result.jenis_kelamin = 'Perempuan';
  }

  // Alamat
  result.alamat =
    afterLabel('Alamat') ||
    afterLabel('ALAMAT');

  // RT/RW
  const rtrw =
    afterLabel('RT/RW') ||
    afterLabel('RT / RW') ||
    full.match(/RT[\s\/]*RW[:\s]*(\d{1,3})\s*[\/\-]\s*(\d{1,3})/i);

  if (typeof rtrw === 'string') {
    const parts = rtrw.split(/[\/\-]/).map(s => s.trim());
    if (parts[0]) result.rt = parts[0].replace(/\D/g, '');
    if (parts[1]) result.rw = parts[1].replace(/\D/g, '');
  } else if (rtrw && rtrw[1]) {
    result.rt = rtrw[1];
    result.rw = rtrw[2] || '';
  }

  // Kel/Desa
  result.desa =
    afterLabel('Kel/Desa') ||
    afterLabel('Kelurahan') ||
    afterLabel('Desa') ||
    afterLabel('Kel');

  // Kecamatan
  result.kecamatan =
    afterLabel('Kecamatan') ||
    afterLabel('Kec');

  // Agama
  result.agama = afterLabel('Agama');

  // Status Perkawinan
  result.status_perkawinan =
    afterLabel('Status Perkawinan') ||
    afterLabel('Status');

  // Pekerjaan
  result.pekerjaan = afterLabel('Pekerjaan');

  // Provinsi & Kabupaten (sering ada di bagian atas KTP)
  const provMatch = full.match(
    /PROVINSI\s+([A-Z\s]+?)(?=\s+KABUPATEN|\s+KOTA|$)/i
  );
  if (provMatch) {
    result.provinsi = provMatch[1].trim();
  }

  const kabMatch = full.match(
    /(?:KABUPATEN|KOTA)\s+([A-Z\s]+?)(?=\s+NIK|\s+Nama|$)/i
  );
  if (kabMatch) {
    result.kabupaten = kabMatch[1].trim();
  }

  return result;
}


function fillFormFromOcr(data, prefix = '') {

  const set = (id, val) => {
    const el = document.getElementById(prefix + id);
    if (el && val !== undefined && val !== null && val !== '') {
      el.value = val;
    }
  };

  set('nik', data.nik);
  set('nama', data.nama);
  set('no_kk', data.no_kk);
  set('tempat_lahir', data.tempat_lahir);
  set('tanggal_lahir', data.tanggal_lahir);
  set('jenis_kelamin', data.jenis_kelamin);
  set('alamat', data.alamat);
  set('rt', data.rt);
  set('rw', data.rw);
  set('desa', data.desa);
  set('kecamatan', data.kecamatan);
  set('agama', data.agama);
  set('status_perkawinan', data.status_perkawinan);
  set('pekerjaan', data.pekerjaan);
  set('kabupaten', data.kabupaten);
  set('provinsi', data.provinsi);
}


async function scanKtpOcr(prefix) {

  // prefix bisa dikirim dari onclick, atau pakai yang terakhir diset
  if (typeof prefix === 'string') {
    ktpOcrPrefix = prefix;
  }

  const isManual = ktpOcrPrefix === 'm_';
  const status = document.getElementById(isManual ? 'm_ocr_status' : 'ocr_status');
  const btn = document.getElementById(isManual ? 'm_btn_ocr' : 'btn_ocr');

  if (!ktpFileObject) {
    alert('Pilih gambar KTP terlebih dahulu.');
    return;
  }

  if (btn) btn.disabled = true;

  const setStatus = (msg, color = '#64748b') => {
    if (status) {
      status.textContent = msg;
      status.style.color = color;
    }
  };

  try {

    // 1. Coba lewat backend dulu (jika ada)
    if (window.desaAPI && typeof window.desaAPI.ocrKtp === 'function') {

      setStatus('Sedang memproses OCR via backend...', '#0ea5e9');

      const data = await window.desaAPI.ocrKtp(ktpFileObject);

      if (data && (data.nik || data.nama)) {
        fillFormFromOcr(data, ktpOcrPrefix);
        setStatus('✓ Data berhasil dibaca dari KTP (backend).', '#16a34a');
        return;
      }
    }

    // 2. Fallback: Tesseract.js (client-side)
    setStatus('Memuat library OCR...', '#0ea5e9');

    const Tesseract = await loadTesseract();

    setStatus('Sedang membaca KTP (bisa 10–30 detik)...', '#0ea5e9');

    const result = await Tesseract.recognize(
      ktpFileObject,
      'ind+eng',
      {
        logger: m => {
          if (m.status === 'recognizing text' && m.progress) {
            const pct = Math.round(m.progress * 100);
            setStatus(`Membaca KTP... ${pct}%`, '#0ea5e9');
          }
        }
      }
    );

    const text = result?.data?.text || '';
    console.log('OCR Raw Text:\n', text);

    const parsed = parseKtpText(text);

    if (!parsed.nik && !parsed.nama) {
      setStatus(
        '⚠ Tidak berhasil membaca data penting. Coba foto lebih jelas / pencahayaan lebih baik.',
        '#ea580c'
      );
      alert(
        'OCR tidak menemukan NIK atau Nama.\n\n' +
        'Tips:\n' +
        '• Pastikan foto KTP jelas dan tidak buram\n' +
        '• Pencahayaan cukup\n' +
        '• Hindari pantulan cahaya\n' +
        '• Coba crop hanya bagian data KTP'
      );
      return;
    }

    fillFormFromOcr(parsed, ktpOcrPrefix);

    const filled = [
      parsed.nik && 'NIK',
      parsed.nama && 'Nama',
      parsed.tempat_lahir && 'Tempat Lahir',
      parsed.tanggal_lahir && 'Tgl Lahir',
      parsed.jenis_kelamin && 'Jenis Kelamin',
      parsed.alamat && 'Alamat',
      parsed.desa && 'Desa',
      parsed.kecamatan && 'Kecamatan'
    ].filter(Boolean).join(', ');

    setStatus(
      `✓ Berhasil membaca: ${filled || 'sebagian data'}`,
      '#16a34a'
    );

  } catch (e) {

    console.error('OCR Error:', e);
    setStatus('Gagal melakukan OCR: ' + (e?.message || e), '#dc2626');
    alert(
      'Gagal melakukan OCR.\n\n' +
      (e?.message || e) +
      '\n\nPastikan ada koneksi internet (untuk memuat library) ' +
      'atau implementasikan window.desaAPI.ocrKtp di backend.'
    );

  } finally {

    if (btn) btn.disabled = false;
  }
}


/* =========================================================
   JENIS SURAT
   ========================================================= */

async function suratTypesPage() {

  suratTypes = await window.desaAPI.surat.types() || [];

  $('#content').innerHTML = `

    <div class="panel">

      <h2>
        Daftar Jenis Surat (${suratTypes.length})
      </h2>

      <table class="table">

        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Surat</th>
            <th>Kategori</th>
            <th>Field</th>
          </tr>
        </thead>

        <tbody>

          ${
            suratTypes.map(x => `
              <tr>

                <td>${esc(x.kode)}</td>

                <td>${esc(x.nama)}</td>

                <td>${esc(x.kategori)}</td>

                <td>${(x.fields || []).length}</td>

              </tr>
            `).join('')
          }

        </tbody>

      </table>

    </div>
  `;
}


/* =========================================================
   BUAT SURAT
   ========================================================= */

async function buat() {

  suratTypes = await window.desaAPI.surat.types() || [];

  cachedPenduduk =
    await window.desaAPI.penduduk.list('') || [];

  const tgl =
    new Date().toISOString().slice(0, 10);

  $('#content').innerHTML = `

    <div class="grid">

      <div class="panel">

        <h2>4. Buat Surat</h2>

        <label>Sumber Data Penduduk</label>

        <div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input
              type="radio"
              name="sumber_penduduk"
              value="db"
              checked
              onchange="togglePendudukMode()"
            >
            Dari Database
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input
              type="radio"
              name="sumber_penduduk"
              value="manual"
              onchange="togglePendudukMode()"
            >
            Input Manual
          </label>
        </div>

        <!-- Mode Database -->
        <div id="mode-db">
          <label>Penduduk</label>
          <select id="pid" onchange="onPendudukChange()">
            <option value="">-- pilih penduduk --</option>
            ${
              cachedPenduduk.map(x => `
                <option value="${x.id}">
                  ${esc(x.nama)} - ${esc(x.nik)}
                </option>
              `).join('')
            }
          </select>
          <div id="penduduk-info" style="display:none;margin-top:10px;padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:13px;line-height:1.6"></div>
        </div>

        <!-- Mode Manual -->
        <div id="mode-manual" style="display:none">

          <!-- SCAN KTP untuk Input Manual -->
          <div class="panel" style="margin:12px 0;background:#f8fafc;border:1px dashed #94a3b8;padding:12px">
            <h3 style="margin:0 0 8px 0;font-size:15px">📷 Scan KTP (OCR)</h3>
            <p class="hint" style="margin-bottom:10px;font-size:13px">
              Upload foto/scan KTP agar data terisi otomatis.
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
              <div>
                <input
                  type="file"
                  id="m_ktp_file"
                  accept="image/*"
                  capture="environment"
                  onchange="previewKtp(this, 'm_')"
                >
                <div style="margin-top:8px">
                  <button
                    class="primary"
                    id="m_btn_ocr"
                    onclick="scanKtpOcr('m_')"
                    disabled
                  >
                    Scan KTP Sekarang
                  </button>
                </div>
                <div id="m_ocr_status" style="margin-top:8px;font-size:13px;color:#64748b"></div>
              </div>
              <div id="m_ktp_preview_wrap" style="display:none">
                <img
                  id="m_ktp_preview"
                  style="max-width:220px;max-height:140px;border:1px solid #cbd5e1;border-radius:6px"
                >
              </div>
            </div>
          </div>

          <div class="form-section-title">Data Pemohon</div>
          <div class="grid form-grid-2" style="margin-top:8px">
            ${fld('m_nama', 'Nama Lengkap *', 'text', '', '', '', 'Nama sesuai KTP')}
            ${fld('m_tempat_lahir', 'Tempat Lahir', 'text', '', '', '', 'Tempat lahir')}
            ${fld('m_tanggal_lahir', 'Tanggal Lahir', 'date', '', '', 'Contoh: 1 Januari 1990')}
            ${fld('m_nik', 'NIK *', 'text', '', '', '16 digit angka', 'NIK')}
            ${fld('m_no_kk', 'Nomor KK', 'text', '', '', '', 'Nomor Kartu Keluarga')}
            ${fld('m_jenis_kelamin', 'Jenis Kelamin', 'select', OPT_JK)}
            ${fld('m_agama', 'Agama', 'select', OPT_AGAMA)}
            ${fld('m_status_perkawinan', 'Status Perkawinan', 'select', OPT_STATUS)}
            ${fld('m_pekerjaan', 'Pekerjaan', 'select', OPT_PEKERJAAN)}
            ${fld('m_alamat', 'Alamat', 'textarea', '', '', '', 'Alamat lengkap')}
            ${fld('m_rt', 'RT', 'text', '', '', 'Contoh: 001', '001')}
            ${fld('m_rw', 'RW', 'text', '', '', 'Contoh: 001', '001')}
            ${fld('m_desa', 'Desa', 'text', '', '', '', 'Nama desa')}
            ${fld('m_kecamatan', 'Kecamatan', 'text', '', '', '', 'Nama kecamatan')}
            ${fld('m_kabupaten', 'Kabupaten', 'text', '', '', '', 'Nama kabupaten')}
            ${fld('m_provinsi', 'Provinsi', 'text', '', '', '', 'Nama provinsi')}
          </div>
        </div>

        <label>Jenis Surat</label>

        <select
          id="tid"
          onchange="onJenisSuratChange()"
        >
          <option value="">-- pilih jenis surat --</option>
          ${
            suratTypes.map(x => `
              <option value="${x.id}">
                ${esc(x.kode)} - ${esc(x.nama)}
              </option>
            `).join('')
          }
        </select>

        <label>Nomor Surat</label>

        <input
          id="nomor"
          placeholder="Otomatis / isi manual"
        >

        <label>Tanggal</label>

        <input
          id="tanggal"
          type="date"
          value="${tgl}"
          onchange="autoNomorSurat()"
        >

        <div id="dyn"></div>

        <div class="actions">

          <button
            class="primary"
            onclick="saveLetter()"
          >
            Simpan
          </button>

          <button onclick="preview()">
            Preview
          </button>

        </div>

      </div>

      <div class="panel">

        <h2>5. Preview</h2>

        <div
          id="prev"
          class="preview"
        >
          Preview surat akan muncul di sini.
        </div>

      </div>

    </div>
  `;

  await dynamicFields();
  await cekTemplateStatus();
}


/* =========================================================
   AUTO-FILL SAAT PILIH PENDUDUK / JENIS SURAT
   ========================================================= */

function getSelectedPenduduk() {
  const pid = $('#pid');
  if (!pid || !pid.value) return null;
  return cachedPenduduk.find(x => String(x.id) === String(pid.value)) || null;
}

function onPendudukChange() {
  const p = getSelectedPenduduk();
  const info = $('#penduduk-info');

  if (!info) return;

  if (!p) {
    info.style.display = 'none';
    info.innerHTML = '';
    return;
  }

  // Tampilkan ringkasan data penduduk
  info.style.display = '';
  info.innerHTML = `
    <b style="color:#166534">✓ Data terpilih (otomatis terisi di surat)</b><br>
    <b>Nama:</b> ${esc(p.nama)} &nbsp;|&nbsp;
    <b>NIK:</b> ${esc(p.nik)}<br>
    <b>No. KK:</b> ${esc(p.no_kk || '-')} &nbsp;|&nbsp;
    <b>JK:</b> ${esc(p.jenis_kelamin || '-')}<br>
    <b>TTL:</b> ${esc(p.tempat_lahir || '-')} , ${esc(p.tanggal_lahir || '-')}<br>
    <b>Alamat:</b> ${esc(p.alamat || '-')}<br>
    <b>RT/RW:</b> ${esc(p.rt || '-')} / ${esc(p.rw || '-')} &nbsp;|&nbsp;
    <b>Desa:</b> ${esc(p.desa || '-')}
  `;

  // Isi otomatis field dinamis yang namanya sama dengan kolom penduduk
  fillDynFromPenduduk(p);
}

function fillDynFromPenduduk(p) {
  if (!p) return;

  // Map field form dinamis -> key data penduduk
  const map = {
    nama: p.nama,
    nik: p.nik,
    no_kk: p.no_kk,
    tempat_lahir: p.tempat_lahir,
    tanggal_lahir: p.tanggal_lahir,
    jenis_kelamin: p.jenis_kelamin,
    agama: p.agama,
    pendidikan: p.pendidikan,
    pekerjaan: p.pekerjaan,
    status_perkawinan: p.status_perkawinan,
    alamat: p.alamat,
    rt: p.rt,
    rw: p.rw,
    desa: p.desa,
    kecamatan: p.kecamatan,
    kabupaten: p.kabupaten,
    provinsi: p.provinsi
  };

  Object.entries(map).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '') return;
    const el = document.getElementById('f_' + key);
    if (el && !el.value) {
      el.value = val;
    }
  });
}

async function onJenisSuratChange() {
  await dynamicFields();
  await cekTemplateStatus();
  await autoNomorSurat();

  // Setelah form dinamis muncul, isi lagi dari penduduk terpilih
  const p = getSelectedPenduduk();
  if (p) fillDynFromPenduduk(p);
}

async function autoNomorSurat() {
  const nomorEl = $('#nomor');
  const tanggalEl = $('#tanggal');
  const tid = $('#tid');

  if (!nomorEl || !tid || !tid.value) return;

  // Jangan timpa jika user sudah isi manual (kecuali masih kosong / placeholder)
  const current = (nomorEl.value || '').trim();
  if (current && !/otomatis/i.test(current)) {
    // tetap boleh regenerate jika kosong; jika sudah ada isi biarkan
    // (user bisa hapus isi untuk generate ulang)
  }

  const x = suratTypes.find(t => String(t.id) === String(tid.value));
  if (!x) return;

  const tanggal = (tanggalEl && tanggalEl.value) || new Date().toISOString().slice(0, 10);

  try {
    if (window.desaAPI.surat && typeof window.desaAPI.surat.nextNomor === 'function') {
      const no = await window.desaAPI.surat.nextNomor(tanggal, x.kode);
      if (no) nomorEl.value = no;
      return;
    }
  } catch (e) {
    console.warn('nextNomor gagal, pakai fallback:', e);
  }

  // Fallback lokal jika API belum ada
  const year = tanggal.slice(0, 4);
  const month = tanggal.slice(5, 7);
  nomorEl.value = `001/${x.kode}/${month}/${year}`;
}


function togglePendudukMode() {

  const mode =
    document.querySelector(
      'input[name="sumber_penduduk"]:checked'
    )?.value || 'db';

  const modeDb = $('#mode-db');
  const modeManual = $('#mode-manual');

  if (modeDb) {
    modeDb.style.display =
      mode === 'db' ? '' : 'none';
  }

  if (modeManual) {
    modeManual.style.display =
      mode === 'manual' ? '' : 'none';
  }
}


function getPendudukMode() {
  return document.querySelector(
    'input[name="sumber_penduduk"]:checked'
  )?.value || 'db';
}


/* =========================================================
   FORM DINAMIS SURAT
   ========================================================= */

async function dynamicFields() {

  const tid = $('#tid');
  const dyn = $('#dyn');

  if (!tid || !dyn) {
    return;
  }

  if (!tid.value) {
    dyn.innerHTML = '';
    return;
  }

  const x =
    suratTypes.find(t => t.id == tid.value);

  if (!x) {
    dyn.innerHTML = '';
    return;
  }

  const fields =
    (x.fields || []).filter(
      f =>
        (f.field || '').toLowerCase()
        !== 'penduduk'
    );

  dyn.innerHTML =
    '<div class="form-section-title">Form Pengajuan / Data Tambahan</div>' +
    (
      fields.length
        ? `<div class="grid form-grid-2">${fields.map(f =>
            fldSmart(
              'f_' + f.field,
              f.label || f.field,
              f.tipe,
              ''
            )
          ).join('')}</div>`
        : `
          <p class="hint">
            Tidak ada field tambahan. Data penduduk akan dipakai otomatis di surat.
          </p>
        `
    );

  // Auto-isi field dinamis dari penduduk yang sedang dipilih
  const p = getSelectedPenduduk();
  if (p) fillDynFromPenduduk(p);

  await cekTemplateStatus();
}


/* =========================================================
   CEK TEMPLATE
   ========================================================= */

async function cekTemplateStatus() {

  const tid = $('#tid');

  if (!tid || !tid.value) {
    currentTemplate = null;
    return;
  }

  const x =
    suratTypes.find(t => t.id == tid.value);

  if (!x) {
    currentTemplate = null;
    return;
  }

  try {

    currentTemplate =
      await window.desaAPI.templates.getByKode(
        x.kode
      );

  } catch (e) {

    console.error(e);
    currentTemplate = null;
  }
}


/* =========================================================
   BUILD DATA SURAT
   ========================================================= */

function buildDataMap() {

  const nomorEl = $('#nomor');
  const tanggalEl = $('#tanggal');
  const mode = getPendudukMode();

  let p = {};

  if (mode === 'manual') {

    // Ambil data dari form manual
    const map = {
      nik: 'm_nik',
      nama: 'm_nama',
      no_kk: 'm_no_kk',
      tempat_lahir: 'm_tempat_lahir',
      tanggal_lahir: 'm_tanggal_lahir',
      jenis_kelamin: 'm_jenis_kelamin',
      agama: 'm_agama',
      pekerjaan: 'm_pekerjaan',
      status_perkawinan: 'm_status_perkawinan',
      rt: 'm_rt',
      rw: 'm_rw',
      desa: 'm_desa',
      kecamatan: 'm_kecamatan',
      kabupaten: 'm_kabupaten',
      provinsi: 'm_provinsi',
      alamat: 'm_alamat'
    };

    Object.entries(map).forEach(([key, id]) => {
      const el = $('#' + id);
      if (el) p[key] = (el.value || '').trim();
    });

  } else {

    // Ambil dari database
    const pid = $('#pid');
    p =
      (pid && pid.value)
        ? (cachedPenduduk.find(
            x => x.id == pid.value
          ) || {})
        : {};
  }

  const fields = {};

  $$('#dyn input, #dyn textarea, #dyn select')
    .forEach(e => {

      if (e.id && e.id.startsWith('f_')) {
        fields[e.id.slice(2)] = e.value;
      }

    });

  return {

    ...p,

    ...fields,

    keperluan:
      fields.keperluan || '',

    nomor_surat:
      (nomorEl && nomorEl.value) || '',

    tanggal_surat:
      (tanggalEl && tanggalEl.value) || ''
  };
}


/* =========================================================
   PLACEHOLDER
   ========================================================= */

function replacePlaceholders(isi, data) {

  return isi.replace(
    /\{\{(\w+)\}\}/g,
    (_, k) => {

      const v = data[k];

      return v !== undefined &&
             v !== null
        ? String(v)
        : '';
    }
  );
}


/* =========================================================
   PREVIEW SURAT
   ========================================================= */

async function preview() {

  const s =
    await window.desaAPI.settings.get();

  const tid = $('#tid');
  const mode = getPendudukMode();

  if (!tid || !tid.value) {
    return alert('Pilih jenis surat dulu.');
  }

  if (mode === 'db') {
    const pid = $('#pid');
    if (!pid || !pid.value) {
      return alert('Pilih penduduk dulu.');
    }
  } else {
    // Validasi input manual
    const nik = ($('#m_nik')?.value || '').trim();
    const nama = ($('#m_nama')?.value || '').trim();

    if (!nik || !nama) {
      return alert('NIK dan Nama wajib diisi (mode manual).');
    }

    if (!/^\d{16}$/.test(nik)) {
      return alert('NIK harus 16 digit angka.');
    }
  }

  const x =
    suratTypes.find(
      t => t.id == tid.value
    );

  if (!x) {
    return alert(
      'Pilih jenis surat dulu.'
    );
  }

  await cekTemplateStatus();

  const data =
    buildDataMap();

  let bodyHtml;
  let usedTemplate = false;

  if (
    currentTemplate &&
    currentTemplate.isi
  ) {

    usedTemplate = true;

    bodyHtml =
      replacePlaceholders(
        currentTemplate.isi,
        data
      )
      .split('\n')
      .map(
        l =>
          l.trim() === ''
            ? '<br>'
            : `<p>${esc(l)}</p>`
      )
      .join('');

  } else {

    const fields = {};

    $$('#dyn input, #dyn textarea, #dyn select')
      .forEach(e => {

        if (e.id.startsWith('f_')) {
          fields[e.id.slice(2)] =
            e.value;
        }

      });

    const body =
      Object.entries(fields)
        .filter(a => a[1])
        .map(
          a =>
            `<p>
              <b>
                ${esc(
                  a[0]
                    .replaceAll('_', ' ')
                )}:
              </b>
              ${esc(a[1])}
            </p>`
        )
        .join('');

    bodyHtml = `

      <p>
        Yang bertanda tangan di bawah ini
        menerangkan bahwa:
      </p>

      <p>
        <b>${esc(data.nama || '')}</b><br>
        NIK: ${esc(data.nik || '')}<br>
        Alamat: ${esc(data.alamat || '')}
      </p>

      ${body}

      <p>
        Demikian surat ini dibuat untuk
        dipergunakan sebagaimana mestinya.
      </p>
    `;
  }

  const kop = `

    <div class="kop">

      <b>
        PEMERINTAH DESA
        ${esc(
          (s.nama_desa || '')
            .toUpperCase()
        )}
      </b>

      <br>

      KECAMATAN
      ${esc(
        (s.kecamatan || '')
          .toUpperCase()
      )}

      <br>

      KABUPATEN
      ${esc(
        (s.kabupaten || '')
          .toUpperCase()
      )}

      <br>

      ${esc(s.alamat || '')}

    </div>
  `;

  lastPreview = `

    ${kop}

    <h3 class="letter-title">
      ${esc(
        x.nama.toUpperCase()
      )}
    </h3>

    <p class="letter-number">
      Nomor:
      ${esc(
        data.nomor_surat ||
        '........................'
      )}
    </p>

    <div class="letter-body">
      ${bodyHtml}
    </div>

    <div class="signature">

      ${esc(s.nama_desa || '')},
      ${esc(data.tanggal_surat || '')}

      <br>

      Kepala Desa

      <br><br><br><br>

      <b>
        <u>
          ${esc(
            s.kepala_desa ||
            '........................'
          )}
        </u>
      </b>

    </div>
  `;

  const status =
    usedTemplate

      ? `
        <div class="template-status template-ok">
          ✓ Menggunakan template kode
          ${esc(currentTemplate.kode)}
        </div>
      `

      : `
        <div class="template-status template-missing">
          ⚠ Template untuk kode
          ${esc(x.kode)}
          belum dibuat.
          Menggunakan format dasar.
        </div>
      `;

  const prev = $('#prev');
  if (prev) {
    prev.innerHTML =
      status +
      lastPreview +
      `

        <div class="actions preview-actions">

          <button
            class="primary"
            onclick="doPrint()"
          >
            Cetak
          </button>

          <button
            onclick="doPdf()"
          >
            PDF
          </button>

          <button
            onclick="doWord()"
          >
            Word
          </button>

        </div>
      `;
  }
}


/* =========================================================
   CETAK / PDF / WORD HELPERS
   ========================================================= */

function ensurePreviewContent() {
  if (!lastPreview || !String(lastPreview).trim()) {
    alert('Konten surat masih kosong.\n\nKlik tombol Preview terlebih dahulu, lalu coba lagi.');
    return false;
  }
  return true;
}

async function getPrintPayload() {
  let settings = {};
  try {
    settings = await window.desaAPI.settings.get() || {};
  } catch (e) { /* abaikan */ }
  return {
    html: lastPreview,
    settings,
    fileName: 'surat'
  };
}

async function doPrint() {
  if (!ensurePreviewContent()) return;
  try {
    const payload = await getPrintPayload();
    // dukung API lama (string) dan baru (object)
    await window.desaAPI.print(payload);
  } catch (e) {
    console.error(e);
    alert('Gagal mencetak:\n' + (e?.message || e));
  }
}

async function doPdf() {
  if (!ensurePreviewContent()) return;
  try {
    const payload = await getPrintPayload();
    const path = await window.desaAPI.pdf(payload);
    if (path) {
      alert('PDF berhasil disimpan:\n' + path);
    }
  } catch (e) {
    console.error(e);
    alert('Gagal membuat PDF:\n' + (e?.message || e));
  }
}

async function doWord() {
  if (!ensurePreviewContent()) return;
  try {
    const payload = await getPrintPayload();
    const path = await window.desaAPI.word(payload);
    if (path) {
      alert('File Word berhasil disimpan:\n' + path);
    }
  } catch (e) {
    console.error(e);
    alert('Gagal membuat Word:\n' + (e?.message || e));
  }
}


/* =========================================================
   SIMPAN SURAT
   ========================================================= */

async function saveLetter() {

  const tid = $('#tid');
  const nomorEl = $('#nomor');
  const tanggalEl = $('#tanggal');
  const mode = getPendudukMode();

  if (!tid || !tid.value) {
    return alert('Pilih jenis surat.');
  }

  let pendudukId = 0;
  let manualData = {};

  if (mode === 'db') {
    const pid = $('#pid');
    if (!pid || !pid.value) {
      return alert('Pilih penduduk.');
    }
    pendudukId = Number(pid.value);
  } else {
    // Validasi & ambil data manual
    const nik = ($('#m_nik')?.value || '').trim();
    const nama = ($('#m_nama')?.value || '').trim();

    if (!nik || !nama) {
      return alert('NIK dan Nama wajib diisi (mode manual).');
    }

    if (!/^\d{16}$/.test(nik)) {
      return alert('NIK harus 16 digit angka.');
    }

    const map = {
      nik: 'm_nik',
      nama: 'm_nama',
      no_kk: 'm_no_kk',
      tempat_lahir: 'm_tempat_lahir',
      tanggal_lahir: 'm_tanggal_lahir',
      jenis_kelamin: 'm_jenis_kelamin',
      agama: 'm_agama',
      pekerjaan: 'm_pekerjaan',
      status_perkawinan: 'm_status_perkawinan',
      rt: 'm_rt',
      rw: 'm_rw',
      desa: 'm_desa',
      kecamatan: 'm_kecamatan',
      kabupaten: 'm_kabupaten',
      provinsi: 'm_provinsi',
      alamat: 'm_alamat'
    };

    Object.entries(map).forEach(([key, id]) => {
      const el = $('#' + id);
      if (el) manualData[key] = (el.value || '').trim();
    });
  }

  const x =
    suratTypes.find(
      t => t.id == tid.value
    );

  if (!x) {
    return alert(
      'Pilih jenis surat.'
    );
  }

  const fields = {};

  $$('#dyn input, #dyn textarea, #dyn select')
    .forEach(e => {

      if (e.id && e.id.startsWith('f_')) {
        fields[e.id.slice(2)] =
          e.value;
      }

    });

  // Gabungkan data manual ke form agar tersimpan di arsip
  const formData = {
    ...fields,
    ...(mode === 'manual' ? manualData : {})
  };

  try {

    await window.desaAPI.surat.save({

      nomor:
        (nomorEl && nomorEl.value) || '',

      jenis:
        Number(tid.value),

      penduduk:
        pendudukId,          // 0 jika manual

      tanggal:
        (tanggalEl && tanggalEl.value) || '',

      keperluan:
        fields.keperluan || '',

      form:
        formData,

      // Flag agar backend tahu ini data manual
      is_manual:
        mode === 'manual'

    });

    alert(
      'Surat disimpan dan masuk arsip.'
    );

    await preview();

  } catch (e) {

    alert(
      'Gagal menyimpan surat: ' +
      (e?.message || e)
    );
  }
}


/* =========================================================
   ARSIP
   ========================================================= */

async function arsip() {

  const r =
    await window.desaAPI.arsip.list({}) || [];

  $('#content').innerHTML = `

    <div class="panel">

      <h2>6. Arsip Surat</h2>

      <div class="toolbar">

        <input
          id="aq"
          placeholder="Nomor / jenis / NIK / nama"
        >

        <input
          id="yr"
          placeholder="Tahun"
          style="max-width:130px"
        >

        <button
          class="primary"
          onclick="findA()"
        >
          Cari
        </button>

      </div>

      <table class="table">

        <thead>

          <tr>
            <th>Tanggal</th>
            <th>Nomor</th>
            <th>Jenis</th>
            <th>NIK</th>
            <th>Nama</th>
            <th>Aksi</th>
          </tr>

        </thead>

        <tbody id="ar">

          ${
            r.map(aRow).join('') ||
            `
              <tr>
                <td colspan="6" class="empty">
                  Belum ada arsip
                </td>
              </tr>
            `
          }

        </tbody>

      </table>

    </div>
  `;
}


function aRow(r) {

  const id = r.id;

  return `

    <tr>

      <td>
        ${esc(r.tanggal_surat)}
      </td>

      <td>
        ${esc(r.nomor_surat)}
      </td>

      <td>
        ${esc(r.jenis_surat)}
      </td>

      <td>
        ${esc(r.nik)}
      </td>

      <td>
        ${esc(r.nama_penduduk)}
      </td>

      <td class="aksi">

        <button
          title="Cetak Ulang"
          onclick="cetakArsip(${id})"
        >
          Cetak
        </button>

        <button
          title="Download PDF"
          onclick="unduhArsip(${id})"
        >
          PDF
        </button>

        <button
          title="Hapus Arsip"
          onclick="hapusArsip(${id})"
        >
          Hapus
        </button>

      </td>

    </tr>
  `;
}


async function findA() {

  const ar = $('#ar');
  const aq = $('#aq');
  const yr = $('#yr');
  if (!ar) return;

  const r =
    await window.desaAPI.arsip.list({

      q:
        (aq && aq.value) || '',

      tahun:
        (yr && yr.value) || ''

    }) || [];

  ar.innerHTML =
    r.map(aRow).join('') ||
    `
      <tr>
        <td colspan="6" class="empty">
          Tidak ditemukan
        </td>
      </tr>
    `;
}


/* =========================================================
   CETAK / UNDUH / HAPUS ARSIP
   ========================================================= */

async function loadArsipPreview(id) {

  if (!id) {
    alert('ID arsip tidak valid.');
    return false;
  }

  try {

    // Ambil detail arsip (harus didukung di backend)
    const detail =
      await window.desaAPI.arsip.get(id);

    if (!detail) {
      alert('Data arsip tidak ditemukan.');
      return false;
    }

    const s =
      await window.desaAPI.settings.get() || {};

    // Data untuk placeholder
    const data = {
      ...(detail.penduduk || {}),
      ...(detail.form || {}),
      nomor_surat: detail.nomor_surat || detail.nomor || '',
      tanggal_surat: detail.tanggal_surat || detail.tanggal || '',
      nama: detail.nama_penduduk || (detail.penduduk && detail.penduduk.nama) || '',
      nik: detail.nik || (detail.penduduk && detail.penduduk.nik) || '',
      alamat: (detail.penduduk && detail.penduduk.alamat) || detail.alamat || ''
    };

    // Coba ambil template berdasarkan kode jenis surat
    let bodyHtml = '';
    let usedTemplate = false;
    let kodeJenis = detail.kode_jenis || detail.kode || '';

    if (!kodeJenis && detail.jenis_surat) {
      // fallback: cari dari daftar jenis surat
      const types = await window.desaAPI.surat.types() || [];
      const found = types.find(t =>
        t.nama === detail.jenis_surat ||
        t.id == detail.jenis
      );
      if (found) kodeJenis = found.kode;
    }

    if (kodeJenis) {
      try {
        const tmpl =
          await window.desaAPI.templates.getByKode(kodeJenis);

        if (tmpl && tmpl.isi) {
          usedTemplate = true;
          bodyHtml =
            replacePlaceholders(tmpl.isi, data)
              .split('\n')
              .map(l =>
                l.trim() === ''
                  ? '<br>'
                  : `<p>${esc(l)}</p>`
              )
              .join('');
        }
      } catch (e) {
        console.warn('Template tidak ditemukan:', e);
      }
    }

    // Fallback format dasar jika tidak ada template
    if (!usedTemplate) {
      const formFields = detail.form || {};
      const extra = Object.entries(formFields)
        .filter(([, v]) => v)
        .map(([k, v]) =>
          `<p><b>${esc(k.replaceAll('_', ' '))}:</b> ${esc(v)}</p>`
        )
        .join('');

      bodyHtml = `
        <p>
          Yang bertanda tangan di bawah ini
          menerangkan bahwa:
        </p>
        <p>
          <b>${esc(data.nama || '')}</b><br>
          NIK: ${esc(data.nik || '')}<br>
          Alamat: ${esc(data.alamat || '')}
        </p>
        ${extra}
        <p>
          Demikian surat ini dibuat untuk
          dipergunakan sebagaimana mestinya.
        </p>
      `;
    }

    const kop = `
      <div class="kop">
        <b>
          PEMERINTAH DESA
          ${esc((s.nama_desa || '').toUpperCase())}
        </b>
        <br>
        KECAMATAN
        ${esc((s.kecamatan || '').toUpperCase())}
        <br>
        KABUPATEN
        ${esc((s.kabupaten || '').toUpperCase())}
        <br>
        ${esc(s.alamat || '')}
      </div>
    `;

    const judul =
      (detail.jenis_surat || 'SURAT').toUpperCase();

    lastPreview = `
      ${kop}

      <h3 class="letter-title">
        ${esc(judul)}
      </h3>

      <p class="letter-number">
        Nomor:
        ${esc(data.nomor_surat || '........................')}
      </p>

      <div class="letter-body">
        ${bodyHtml}
      </div>

      <div class="signature">
        ${esc(s.nama_desa || '')},
        ${esc(data.tanggal_surat || '')}
        <br>
        Kepala Desa
        <br><br><br><br>
        <b>
          <u>
            ${esc(s.kepala_desa || '........................')}
          </u>
        </b>
      </div>
    `;

    return true;

  } catch (e) {
    console.error('Gagal memuat arsip:', e);
    alert(
      'Gagal memuat data arsip.\n' +
      (e?.message || e) +
      '\n\nPastikan backend mendukung:\nwindow.desaAPI.arsip.get(id)'
    );
    return false;
  }
}


async function cetakArsip(id) {

  const ok = await loadArsipPreview(id);
  if (!ok) return;

  try {
    await doPrint();
  } catch (e) {
    alert('Gagal mencetak: ' + (e?.message || e));
  }
}


async function unduhArsip(id) {

  const ok = await loadArsipPreview(id);
  if (!ok) return;

  try {
    await doPdf();
  } catch (e) {
    try {
      await doWord();
    } catch (e2) {
      alert(
        'Gagal mengunduh.\n' +
        (e?.message || e)
      );
    }
  }
}


async function hapusArsip(id) {

  if (!id) return;

  if (!confirm('Yakin ingin menghapus arsip surat ini?')) {
    return;
  }

  try {

    await window.desaAPI.arsip.delete(id);

    alert('Arsip berhasil dihapus.');

    // Refresh daftar
    await findA();

  } catch (e) {

    console.error(e);
    alert(
      'Gagal menghapus arsip.\n' +
      (e?.message || e) +
      '\n\nPastikan backend mendukung:\nwindow.desaAPI.arsip.delete(id)'
    );
  }
}


/* =========================================================
   TEMPLATE
   ========================================================= */

async function templates() {

  const r =
    await window.desaAPI.templates.list() || [];

  suratTypes =
    await window.desaAPI.surat.types() || [];

  const mapKode =
    Object.fromEntries(
      suratTypes.map(
        t => [t.kode, t.nama]
      )
    );

  $('#content').innerHTML = `

    <div class="panel">

      <h2>7. Template Surat</h2>

      <p class="hint">
        Placeholder:
        {{nama}},
        {{nik}},
        {{alamat}},
        {{tanggal_surat}},
        {{nomor_surat}}.
        Kode template harus sama dengan
        kode jenis surat.
      </p>

      <div class="actions">

        <button
          class="primary"
          onclick="templateForm()"
        >
          + Template Baru
        </button>

      </div>

      <table class="table">

        <thead>

          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Jenis Surat</th>
            <th>Ukuran</th>
            <th>Aksi</th>
          </tr>

        </thead>

        <tbody>

          ${
            r.map(x => `

              <tr>

                <td>
                  ${esc(x.kode)}
                </td>

                <td>
                  ${esc(x.nama)}
                </td>

                <td>
                  ${esc(
                    mapKode[x.kode] || '-'
                  )}
                </td>

                <td>
                  ${esc(x.ukuran_kertas)}
                </td>

                <td>

                  <button
                    onclick="templateForm(${x.id})"
                  >
                    Edit
                  </button>

                  <button
                    onclick="hapusT(${x.id})"
                  >
                    Hapus
                  </button>

                </td>

              </tr>

            `).join('') ||

            `
              <tr>
                <td
                  colspan="5"
                  class="empty"
                >
                  Belum ada template
                </td>
              </tr>
            `
          }

        </tbody>

      </table>

    </div>
  `;
}


/* =========================================================
   FORM TEMPLATE
   ========================================================= */

async function templateForm(id) {

  suratTypes =
    await window.desaAPI.surat.types() || [];

  let t = {

    id: null,

    kode: '',

    nama: '',

    judul: '',

    isi: '',

    ukuran_kertas: 'A4',

    margin_atas: 2,

    margin_bawah: 2,

    margin_kiri: 3,

    margin_kanan: 3,

    aktif: 1

  };

  if (id) {

    const row =
      await window.desaAPI.templates.get(id);

    if (row) {
      t = row;
    }
  }

  const opsiKode =
    suratTypes
      .map(x => `

        <option
          value="${esc(x.kode)}"
          ${
            x.kode === t.kode
              ? 'selected'
              : ''
          }
        >
          ${esc(x.kode)}
          -
          ${esc(x.nama)}
        </option>

      `)
      .join('');

  $('#content').innerHTML = `

    <div class="panel">

      <h2>
        ${t.id ? 'Edit' : 'Template Baru'}
      </h2>

      <div class="grid">

        <div>

          <label>
            Kode (jenis surat)
          </label>

          <select id="tk">

            <option value="">
              -- pilih jenis surat --
            </option>

            ${opsiKode}

          </select>

        </div>

        ${fld(
          'tn',
          'Nama Template',
          'text',
          '',
          t.nama
        )}

        ${fld(
          'tj',
          'Judul',
          'text',
          '',
          t.judul
        )}

        ${fld(
          'tu',
          'Ukuran',
          'select',
          'A4|F4',
          t.ukuran_kertas
        )}

        ${fld(
          'ma',
          'Margin Atas (cm)',
          'text',
          '',
          t.margin_atas
        )}

        ${fld(
          'mb',
          'Margin Bawah (cm)',
          'text',
          '',
          t.margin_bawah
        )}

        ${fld(
          'mk',
          'Margin Kiri (cm)',
          'text',
          '',
          t.margin_kiri
        )}

        ${fld(
          'mn',
          'Margin Kanan (cm)',
          'text',
          '',
          t.margin_kanan
        )}

      </div>

      <label>
        Isi Template
      </label>

      <textarea
        id="ti"
        class="template-editor"
      >${esc(t.isi)}</textarea>

      <div class="placeholder-box">

        <b>
          Placeholder yang tersedia:
        </b>

        <div class="placeholder-list">

          <code>{{nama}}</code>
          <code>{{nik}}</code>
          <code>{{no_kk}}</code>

          <code>{{tempat_lahir}}</code>
          <code>{{tanggal_lahir}}</code>
          <code>{{jenis_kelamin}}</code>

          <code>{{agama}}</code>
          <code>{{pendidikan}}</code>
          <code>{{pekerjaan}}</code>

          <code>{{alamat}}</code>
          <code>{{rt}}</code>
          <code>{{rw}}</code>

          <code>{{desa}}</code>
          <code>{{kecamatan}}</code>

          <code>{{kabupaten}}</code>
          <code>{{provinsi}}</code>

          <code>{{nomor_surat}}</code>
          <code>{{tanggal_surat}}</code>

        </div>

      </div>

      <div class="actions">

        <button
          class="primary"
          onclick="saveT(${t.id || 'null'})"
        >
          Simpan
        </button>

        <button onclick="templates()">
          Batal
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   SIMPAN TEMPLATE
   ========================================================= */

async function saveT(id) {

  const d = {

    id:
      id || null,

    kode:
      $('#tk').value,

    nama:
      $('#tn').value,

    judul:
      $('#tj').value,

    isi:
      $('#ti').value,

    ukuran_kertas:
      $('#tu').value,

    margin_atas:
      +($('#ma').value || 2),

    margin_bawah:
      +($('#mb').value || 2),

    margin_kiri:
      +($('#mk').value || 3),

    margin_kanan:
      +($('#mn').value || 3),

    aktif: 1
  };

  if (!d.kode || !d.nama) {

    return alert(
      'Kode dan Nama wajib diisi.'
    );
  }

  try {

    await window.desaAPI.templates.save(d);

    alert(
      'Template tersimpan.'
    );

    await templates();

  } catch (e) {

    alert(
      'Gagal menyimpan: ' +
      (e?.message || e)
    );
  }
}


/* =========================================================
   HAPUS TEMPLATE
   ========================================================= */

async function hapusT(id) {

  if (!confirm(
    'Hapus template ini?'
  )) {
    return;
  }

  await window.desaAPI.templates.delete(id);

  await templates();
}


/* =========================================================
   PENGATURAN
   ========================================================= */

async function settings() {

  const s =
    await window.desaAPI.settings.get();

  $('#content').innerHTML = `

    <div class="panel">

      <h2>8. Pengaturan Desa</h2>

      <div class="grid">

        ${fld(
          'dn',
          'Nama Desa',
          'text',
          '',
          s.nama_desa
        )}

        ${fld(
          'dk',
          'Kecamatan',
          'text',
          '',
          s.kecamatan
        )}

        ${fld(
          'db',
          'Kabupaten',
          'text',
          '',
          s.kabupaten
        )}

        ${fld(
          'dp',
          'Provinsi',
          'text',
          '',
          s.provinsi
        )}

        ${fld(
          'dz',
          'Kode Pos',
          'text',
          '',
          s.kode_pos
        )}

        ${fld(
          'dh',
          'Kepala Desa',
          'text',
          '',
          s.kepala_desa
        )}

        ${fld(
          'di',
          'NIP Kepala Desa',
          'text',
          '',
          s.nip_kepala_desa
        )}

        ${fld(
          'dl',
          'Logo Path',
          'text',
          '',
          s.logo_path
        )}

        ${fld(
          'ds',
          'Stempel Path',
          'text',
          '',
          s.stempel_path
        )}

        ${fld(
          'dt',
          'Tanda Tangan Path',
          'text',
          '',
          s.tanda_tangan_path
        )}

        ${fld(
          'fn',
          'Format Nomor',
          'text',
          '',
          s.format_nomor
        )}

        <div class="full">

          ${fld(
            'da',
            'Alamat',
            'textarea',
            '',
            s.alamat
          )}

        </div>

      </div>

      <button
        class="primary"
        onclick="saveS()"
      >
        Simpan
      </button>

    </div>
  `;
}


/* =========================================================
   SIMPAN PENGATURAN
   ========================================================= */

async function saveS() {

  const d = {};

  const map = [

    ['dn', 'nama_desa'],
    ['dk', 'kecamatan'],
    ['db', 'kabupaten'],
    ['dp', 'provinsi'],

    ['da', 'alamat'],

    ['dz', 'kode_pos'],

    ['dh', 'kepala_desa'],

    ['di', 'nip_kepala_desa'],

    ['dl', 'logo_path'],

    ['ds', 'stempel_path'],

    ['dt', 'tanda_tangan_path'],

    ['fn', 'format_nomor']

  ];

  map.forEach(a => {

    d[a[1]] =
      $('#' + a[0]).value;

  });

  await window.desaAPI.settings.save(d);

  alert(
    'Pengaturan disimpan.'
  );
}


/* =========================================================
   PENGGUNA
   ========================================================= */

async function users() {

  const r =
    await window.desaAPI.users.list() || [];

  $('#content').innerHTML = `

    <div class="panel">

      <h2>9. Pengguna</h2>

      <button
        class="primary"
        onclick="userForm()"
      >
        + Pengguna
      </button>

      <table class="table">

        <thead>

          <tr>
            <th>Username</th>
            <th>Nama</th>
            <th>Role</th>
            <th>Aktif</th>
            <th>Aksi</th>
          </tr>

        </thead>

        <tbody>

          ${
            r.map(x => `

              <tr>

                <td>
                  ${esc(x.username)}
                </td>

                <td>
                  ${esc(x.nama)}
                </td>

                <td>
                  ${esc(x.role)}
                </td>

                <td>
                  ${x.aktif ? 'Ya' : 'Tidak'}
                </td>

                <td>

                  <button
                    onclick="userForm(${x.id})"
                  >
                    Edit
                  </button>

                </td>

              </tr>

            `).join('')
          }

        </tbody>

      </table>

    </div>
  `;
}


/* =========================================================
   FORM PENGGUNA
   ========================================================= */

async function userForm(id) {

  let u = {

    id: null,

    username: '',

    password: '',

    nama: '',

    role: 'Operator',

    aktif: 1

  };

  if (id) {

    const list =
      await window.desaAPI.users.list() || [];

    const found =
      list.find(
        x => x.id === id
      );

    if (found) {

      u = {
        ...found,
        password: ''
      };
    }
  }

  $('#content').innerHTML = `

    <div class="panel">

      <h2>
        ${u.id
          ? 'Edit'
          : 'Pengguna Baru'}
      </h2>

      ${fld(
        'uu',
        'Username',
        'text',
        '',
        u.username
      )}

      ${fld(
        'up',
        'Password ' +
        (
          u.id
            ? '(kosongkan jika tidak diubah)'
            : ''
        ),
        'password'
      )}

      ${fld(
        'un',
        'Nama',
        'text',
        '',
        u.nama
      )}

      ${fld(
        'ur',
        'Role',
        'select',
        'Admin|Operator|Kepala Desa',
        u.role
      )}

      <div class="actions">

        <button
          class="primary"
          onclick="saveU(${u.id || 'null'})"
        >
          Simpan
        </button>

        <button onclick="users()">
          Batal
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   SIMPAN PENGGUNA
   ========================================================= */

async function saveU(id) {

  const d = {

    id:
      id || null,

    username:
      $('#uu').value,

    password:
      $('#up').value,

    nama:
      $('#un').value,

    role:
      $('#ur').value,

    aktif: 1

  };

  if (!d.username || !d.nama) {

    return alert(
      'Username dan Nama wajib diisi.'
    );
  }

  if (!d.id && !d.password) {

    return alert(
      'Password wajib untuk pengguna baru.'
    );
  }

  await window.desaAPI.users.save(d);

  await users();
}


/* =========================================================
   BACKUP / RESTORE
   ========================================================= */

function backup() {

  $('#content').innerHTML = `

    <div class="panel">

      <h2>10. Backup / Restore</h2>

      <p>
        Backup database lokal atau
        restore dari file .db.
      </p>

      <div class="actions">

        <button
          class="primary"
          onclick="doBackup()"
        >
          Backup Database
        </button>

        <button onclick="doRestore()">
          Restore Database
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   BACKUP DATABASE
   ========================================================= */

async function doBackup() {

  try {

    const x =
      await window.desaAPI.backup();

    if (x) {

      alert(
        'Backup tersimpan:\n' + x
      );
    }

  } catch (e) {

    alert(
      'Gagal backup: ' +
      (e?.message || e)
    );
  }
}


/* =========================================================
   RESTORE DATABASE
   ========================================================= */

async function doRestore() {

  if (!confirm(
    'Restore akan mengganti database aktif. Lanjutkan?'
  )) {
    return;
  }

  try {

    const x =
      await window.desaAPI.restore();

    if (x) {

      alert(
        'Restore berhasil.'
      );

      location.reload();
    }

  } catch (e) {

    alert(
      'Gagal restore: ' +
      (e?.message || e)
    );
  }
}


/* =========================================================
   INIT BANUAKITA
   ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  async function () {

    /*
      Tidak ada login lagi.
      Aplikasi langsung membuka Dashboard.
    */

    const app = $('#app');

    if (app) {
      app.classList.remove('hidden');
    }

    const login = $('#login');

    if (login) {
      login.classList.add('hidden');
    }

    const who = $('#who');

    if (who) {
      who.innerHTML =
        'Administrasi Desa';
    }

    // Style form + footer
    if (!document.getElementById('bk-form-style')) {
      const style = document.createElement('style');
      style.id = 'bk-form-style';
      style.textContent = `
        .form-grid-2 {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 14px 20px;
        }
        @media (max-width: 700px) {
          .form-grid-2 { grid-template-columns: 1fr !important; }
        }
        .form-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 5px;
        }
        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          background: #fff;
          transition: border-color .15s, box-shadow .15s;
        }
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.15);
        }
        .form-field .field-hint {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #94a3b8;
        }
        .form-section-title {
          grid-column: 1 / -1;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 16px 0 4px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
        }
        #penduduk-info {
          font-size: 13px;
        }
        #bk-footer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          text-align: center;
          padding: 8px 12px;
          font-size: 12px;
          color: #64748b;
          background: rgba(255,255,255,0.92);
          border-top: 1px solid #e2e8f0;
          letter-spacing: 0.2px;
          pointer-events: none;
        }
        #bk-footer span { pointer-events: auto; }
        body { padding-bottom: 36px !important; }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById('bk-footer')) {
      const footer = document.createElement('div');
      footer.id = 'bk-footer';
      footer.innerHTML = '<span>BK Tech · Support Adha H.Y</span>';
      document.body.appendChild(footer);
    }

    await page('dashboard');
  }
);
