/* =========================================================
   BANUAKITA - Renderer (TANPA LOGIN)
   ========================================================= */

document.title = 'BanuaKita - Administrasi Desa';

const user = {
  id: 0,
  username: 'admin',
  nama: 'Administrasi Desa',
  role: 'Admin'
};

let suratTypes = [];
let lastPreview = '';
let cachedPenduduk = [];
let currentTemplate = null;
let editingTemplateId = null;
let editSuratId = null;

var $ = s => document.querySelector(s);
var $$ = s => document.querySelectorAll(s);

/* =========================================================
   SAFETY NETS
   Tanpa ini, satu error kecil membuat SEMUA tombol menu
   mati ("tidak bisa diklik apa-apa").
   ========================================================= */

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('error', ev => {
    const c = document.querySelector('#content');
    if (c && !c.innerHTML) {
      c.innerHTML = '<div class="panel"><b>Terjadi kesalahan:</b><br>' +
        String(ev.message || '') + '</div>';
    }
  });
}

// Fallback: jika DOMContentLoaded terlewat (script dimuat telat), tetap render.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

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

  // breadcrumb + highlight menu aktif di sidebar
  const crumb = $('#crumb-page');
  if (crumb) crumb.textContent = '/ ' + (titles[x] || x);

  $$('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === x);
  });

  const routes = {
    dashboard,
    penduduk,
    buat,
    arsip,
    types: suratTypesPage,
    templates,
    settings,
    users,
    backup
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

        <div class="card" style="--accent:#0e9f6e">
          <div class="card-ico" style="background:#e6f6ef">👥</div>
          Penduduk Terdaftar
          <div class="num">${d?.penduduk ?? 0}</div>
        </div>

        <div class="card" style="--accent:#2563eb">
          <div class="card-ico" style="background:#e8effc">📄</div>
          Surat Hari Ini
          <div class="num">${d?.suratHariIni ?? 0}</div>
        </div>

        <div class="card" style="--accent:#b45309">
          <div class="card-ico" style="background:#fdf1e0">🗓️</div>
          Surat Bulan Ini
          <div class="num">${d?.suratBulanIni ?? 0}</div>
        </div>

        <div class="card" style="--accent:#7c3aed">
          <div class="card-ico" style="background:#f1ecfd">🗄️</div>
          Total Arsip
          <div class="num">${d?.arsip ?? 0}</div>
        </div>

      </div>

      <div class="panel" style="margin-top:18px">

        <h2>Selamat Datang di BanuaKita 👋</h2>

        <p>
          Sistem Administrasi Desa untuk membantu pengelolaan
          data penduduk, surat, arsip, template, pengaturan,
          pengguna, dan backup database.
        </p>

        <div class="actions" style="margin-top:14px">
          <button class="primary" onclick="page('buat')">✉️ Buat Surat Baru</button>
          <button onclick="page('penduduk')">👥 Tambah Penduduk</button>
        </div>

      </div>
    `;

  } catch (e) {

    console.error('Dashboard error:', e);

    $('#content').innerHTML = `
      <div class="panel">

        <h2>Selamat Datang di BANUAKITA</h2>

        <p>Sistem Administrasi Desa.</p>

        <p>Statistik dashboard belum dapat ditampilkan.</p>

        <small>${esc(e?.message || e)}</small>

      </div>
    `;
  }
}


/* =========================================================
   PENDUDUK
   ========================================================= */

async function penduduk() {

  const r = await window.desaAPI.penduduk.list('');

  $('#content').innerHTML = `
    <div class="panel">

      <div class="toolbar">

        <input
          id="q"
          placeholder="Cari NIK / Nama / KK"
          oninput="loadP(this.value)"
        >

        <button class="ktp" onclick="uploadKtpManual()">
          🪪 Upload KTP + Scan OCR
        </button>

        <button class="primary" onclick="addP()">
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
            `<tr><td colspan="6" class="empty">Belum ada data</td></tr>`
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
        <button onclick="editP(${r.id})">Edit</button>
        <button onclick="hapusP(${r.id})">Nonaktif</button>
      </td>
    </tr>
  `;
}


async function loadP(q) {

  const box = $('#pr');
  if (!box) return;

  try {
    const r = await window.desaAPI.penduduk.list(q);
    box.innerHTML =
      r.map(pRow).join('') ||
      `<tr><td colspan="6" class="empty">Tidak ditemukan</td></tr>`;
  } catch (e) {
    box.innerHTML =
      `<tr><td colspan="6" class="empty">${esc(e?.message || e)}</td></tr>`;
  }
}


/* =========================================================
   FORM FIELD
   ========================================================= */

function fld(id, label, type = 'text', opts = '', value = '') {

  const v = esc(value);
  let x;

  if (type === 'textarea') {

    x = `<textarea id="${id}">${v}</textarea>`;

  } else if (type === 'select') {

    x = `
      <select id="${id}">
        <option value="">-- pilih --</option>
        ${opts
          .split('|')
          .map(o => `
            <option value="${esc(o)}" ${o === String(value) ? 'selected' : ''}>
              ${esc(o)}
            </option>
          `)
          .join('')}
      </select>
    `;

  } else {

    x = `<input id="${id}" type="${type}" value="${v}">`;
  }

  return `
    <div>
      <label>${label}</label>
      ${x}
    </div>
  `;
}


/* =========================================================
   TAMBAH / EDIT PENDUDUK
   ========================================================= */

const PENDUDUK_FIELDS = [
  'nik', 'no_kk', 'nama', 'tempat_lahir', 'tanggal_lahir',
  'jenis_kelamin', 'agama', 'pendidikan', 'pekerjaan',
  'status_perkawinan', 'alamat', 'rt', 'rw', 'desa',
  'kecamatan', 'kabupaten', 'provinsi'
];

/* =========================================================
   UPLOAD KTP + OCR (isi form otomatis)
   ========================================================= */

let ktpScannedPath = '';

function ktpBoxHtml(p = {}) {

  ktpScannedPath = p.ktp_path || '';

  const img = ktpScannedPath && window.desaAPI.fileUrl
    ? `<img id="ktpimg" src="${esc(window.desaAPI.fileUrl(ktpScannedPath))}" alt="KTP">`
    : `<span class="ktp-placeholder"><b>🪪</b><br>Belum ada gambar KTP</span>`;

  return `
    <div class="full ktp-box">

      <div class="ktp-preview" id="ktpbox">${img}</div>

      <div class="ktp-side">

        <b>Upload KTP</b>

        <p class="hint">
          Pilih foto/scan KTP, lalu tekan "Scan KTP" — NIK, Nama, TTL,
          Agama, Alamat dll. akan terisi otomatis. Periksa kembali hasilnya.
        </p>

        <div class="actions">

          <button type="button" onclick="uploadKtp()">📁 Pilih Gambar KTP</button>

          <button type="button" class="primary" id="btnscan" onclick="scanKtp()">🔍 Scan KTP</button>

        </div>

        <div id="ktpstatus" class="ktp-status"></div>

      </div>

    </div>
  `;
}

async function uploadKtp() {

  const status = $('#ktpstatus');
  if (!window.desaAPI?.ktpUpload) {
    if (status) status.textContent = 'Fitur upload butuh aplikasi desktop (Electron).';
    return;
  }

  try {
    const path = await window.desaAPI.ktpUpload();
    if (!path) return; // batal

    ktpScannedPath = path;

    const box = $('#ktpbox');
    if (box) {
      box.innerHTML = `<img id="ktpimg" src="${esc(window.desaAPI.fileUrl(path))}" alt="KTP">`;
    }
    if (status) status.innerHTML = '<span class="ok">✓ Gambar KTP dipilih. Tekan "Scan KTP".</span>';

  } catch (e) {
    if (status) status.innerHTML = `<span class="err">Gagal upload: ${esc(e?.message || e)}</span>`;
  }
}

// Tombol di daftar penduduk: upload → scan OCR → langsung buka form terisi
async function uploadKtpManual() {

  if (!window.desaAPI?.ktpUpload) return alert('Fitur upload butuh aplikasi desktop (Electron).');

  let path;
  try {
    path = await window.desaAPI.ktpUpload();
  } catch (e) {
    return alert('Gagal memilih file: ' + (e?.message || e));
  }
  if (!path) return; // batal

  addP();
  ktpScannedPath = path;

  const box = $('#ktpbox');
  if (box) box.innerHTML = `<img id="ktpimg" src="${esc(window.desaAPI.fileUrl(path))}" alt="KTP">`;

  await scanKtp();
}

async function scanKtp() {

  const status = $('#ktpstatus');
  const btn = $('#btnscan');

  if (!ktpScannedPath) {
    if (status) status.innerHTML = '<span class="err">Pilih gambar KTP dulu.</span>';
    return;
  }

  if (typeof window.KtpOcr === 'undefined') {
    if (status) status.innerHTML = '<span class="err">Modul OCR tidak tersedia.</span>';
    return;
  }

  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Memuat mesin OCR…';

  try {

    const text = await window.KtpOcr.runOcr(
      window.desaAPI.fileUrl(ktpScannedPath),
      pct => { if (status) status.textContent = `Membaca KTP… ${pct}%`; }
    );

    if (status) status.textContent = 'Mengurai hasil bacaan…';

    const d = window.KtpOcr.parseKtpText(text);

    let filled = 0;
    Object.entries(d).forEach(([k, v]) => {
      const el = $('#' + k);
      if (el && v) { el.value = v; filled++; }
    });

    if (filled === 0) {
      if (status) status.innerHTML =
        '<span class="err">Tidak ada data yang terbaca. Pastikan gambar KTP jelas / tidak miring, atau isi manual.</span>';
    } else {
      if (status) status.innerHTML =
        `<span class="ok">✓ ${filled} field terisi otomatis. Silakan periksa &amp; lengkapi sebelum simpan.</span>`;
    }

  } catch (e) {
    if (status) status.innerHTML = `<span class="err">OCR gagal: ${esc(e?.message || e)}</span>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}

function pendudukFormHtml(title, p = {}) {

  return `
    <div class="panel">

      <h2>${title}</h2>

      <div class="grid">

        ${ktpBoxHtml(p)}

        ${fld('nik', 'NIK *', 'text', '', p.nik)}
        ${fld('no_kk', 'No. KK', 'text', '', p.no_kk)}
        ${fld('nama', 'Nama Lengkap *', 'text', '', p.nama)}
        ${fld('tempat_lahir', 'Tempat Lahir', 'text', '', p.tempat_lahir)}
        ${fld('tanggal_lahir', 'Tanggal Lahir', 'date', '', p.tanggal_lahir)}
        ${fld('jenis_kelamin', 'Jenis Kelamin', 'select', 'Laki-laki|Perempuan', p.jenis_kelamin)}
        ${fld('agama', 'Agama', 'text', '', p.agama)}
        ${fld('pendidikan', 'Pendidikan', 'text', '', p.pendidikan)}
        ${fld('pekerjaan', 'Pekerjaan', 'text', '', p.pekerjaan)}
        ${fld('status_perkawinan', 'Status Perkawinan', 'text', '', p.status_perkawinan)}
        ${fld('rt', 'RT', 'text', '', p.rt)}
        ${fld('rw', 'RW', 'text', '', p.rw)}
        ${fld('desa', 'Desa', 'text', '', p.desa)}
        ${fld('kecamatan', 'Kecamatan', 'text', '', p.kecamatan)}
        ${fld('kabupaten', 'Kabupaten', 'text', '', p.kabupaten)}
        ${fld('provinsi', 'Provinsi', 'text', '', p.provinsi)}

        <div class="full">
          ${fld('alamat', 'Alamat', 'textarea', '', p.alamat)}
        </div>

      </div>

      <div class="actions">

        <button class="primary" onclick="saveP(${p.id ? p.id : ''})">
          ${p.id ? 'Update' : 'Simpan'}
        </button>

        <button onclick="penduduk()">Batal</button>

      </div>

    </div>
  `;
}

function addP() {
  $('#content').innerHTML = pendudukFormHtml('Tambah Penduduk');
}

async function editP(id) {

  const p = await window.desaAPI.penduduk.get(id);

  if (!p) return alert('Data tidak ditemukan');

  $('#content').innerHTML = pendudukFormHtml('Edit Penduduk', p);
}


/* =========================================================
   SIMPAN PENDUDUK
   ========================================================= */

async function saveP(id) {

  const d = {};

  PENDUDUK_FIELDS.forEach(i => {
    d[i] = ($('#' + i)?.value || '').trim();
  });

  if (!d.nik || !d.nama) return alert('NIK dan Nama wajib diisi.');

  if (!/^\d{16}$/.test(d.nik)) return alert('NIK harus 16 digit angka.');

  d.status_kependudukan = 'Tetap';

  if (ktpScannedPath) d.ktp_path = ktpScannedPath;

  if (id) d.id = Number(id);

  try {

    await window.desaAPI.penduduk.save(d);

    alert(id ? 'Data diperbarui.' : 'Data tersimpan.');

    await penduduk();

  } catch (e) {

    alert('Gagal menyimpan: ' + (e?.message || e));
  }
}


/* =========================================================
   NONAKTIF PENDUDUK
   ========================================================= */

async function hapusP(id) {

  if (!confirm('Nonaktifkan penduduk ini?')) return;

  try {
    await window.desaAPI.penduduk.nonaktif(id);
    await penduduk();
  } catch (e) {
    alert('Gagal menonaktifkan: ' + (e?.message || e));
  }
}


/* =========================================================
   JENIS SURAT
   ========================================================= */

async function suratTypesPage() {

  suratTypes = await window.desaAPI.surat.types();

  $('#content').innerHTML = `
    <div class="panel">

      <h2>Daftar Jenis Surat (${suratTypes.length})</h2>

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
            `).join('') ||
            `<tr><td colspan="4" class="empty">Belum ada jenis surat</td></tr>`
          }
        </tbody>

      </table>

    </div>
  `;
}


/* =========================================================
   BUAT SURAT
   ========================================================= */

async function buat(suratId = null) {

  editSuratId = suratId || null;

  suratTypes = await window.desaAPI.surat.types();

  cachedPenduduk = await window.desaAPI.penduduk.list('');

  const tgl = new Date().toISOString().slice(0, 10);

  let s = null;

  if (editSuratId) {
    s = await window.desaAPI.surat.get(editSuratId);
  }

  const selectedJenis = s ? s.jenis_surat_id : (suratTypes[0]?.id ?? '');
  const selectedPenduduk = s ? s.penduduk_id : (cachedPenduduk[0]?.id ?? '');

  $('#content').innerHTML = `
    <div class="grid two-col">

      <div class="panel">

        <h2>${editSuratId ? 'Edit / Cetak Ulang Surat' : '4. Buat Surat'}</h2>

        <label>Penduduk</label>

        <select id="pid" onchange="toggleManualP()">
          <option value="__manual__">➕ Penduduk Baru (Input Manual) ...</option>
          ${
            cachedPenduduk.map(x => `
              <option value="${x.id}" ${Number(x.id) === Number(selectedPenduduk) ? 'selected' : ''}>
                ${esc(x.nama)} - ${esc(x.nik)}
              </option>
            `).join('')
          }
        </select>

        <div id="manualp" class="manual-box"></div>

        <label>Jenis Surat</label>

        <select id="tid" onchange="dynamicFields()">
          ${
            suratTypes.map(x => `
              <option value="${x.id}" ${Number(x.id) === Number(selectedJenis) ? 'selected' : ''}>
                ${esc(x.kode)} - ${esc(x.nama)}
              </option>
            `).join('')
          }
        </select>

        <label>Nomor Surat</label>

        <div class="toolbar">
          <input id="nomor" placeholder="001/DESA/2025" value="${esc(s?.nomor_surat || '')}">
          <button onclick="autoNomor()">Otomatis</button>
        </div>

        <label>Tanggal</label>

        <input id="tanggal" type="date" value="${esc(s?.tanggal_surat || tgl)}">

        <div id="dyn"></div>

        <div class="actions">

          <button class="primary" onclick="saveLetter()">
            ${editSuratId ? 'Simpan Perubahan' : 'Simpan'}
          </button>

          <button onclick="preview()">Preview</button>

          ${editSuratId ? `<button onclick="buat()">+ Surat Baru</button>` : ''}

        </div>

      </div>

      <div class="panel">

        <h2>5. Preview</h2>

        <div id="prev" class="preview">
          Preview surat akan muncul di sini.
        </div>

      </div>

    </div>
  `;

  await dynamicFields(s ? s.form : null);

  if (s) preview();
}


/* =========================================================
   NOMOR OTOMATIS
   ========================================================= */

async function autoNomor() {

  const tid = $('#tid');
  if (!tid) return;

  const x = suratTypes.find(t => t.id == tid.value);
  if (!x) return alert('Pilih jenis surat dulu.');

  try {
    const nomor = await window.desaAPI.surat.nextNomor(
      $('#tanggal').value,
      x.kode
    );
    $('#nomor').value = nomor;
  } catch (e) {
    alert('Gagal membuat nomor: ' + (e?.message || e));
  }
}


/* =========================================================
   INPUT MANUAL PENDUDUK DI MENU BUAT SURAT
   (data otomatis masuk ke Daftar Penduduk saat surat disimpan)
   ========================================================= */

const MANUAL_P_FIELDS = [
  'nik', 'nama', 'no_kk', 'tempat_lahir', 'tanggal_lahir',
  'jenis_kelamin', 'agama', 'pendidikan', 'pekerjaan',
  'status_perkawinan', 'rt', 'rw', 'alamat'
];

function isManualMode() {
  return $('#pid')?.value === '__manual__';
}

async function toggleManualP() {

  const box = $('#manualp');
  if (!box) return;

  if (!isManualMode()) {
    box.innerHTML = '';
    return;
  }

  // bawa default wilayah dari Pengaturan Desa
  let s = {};
  try { s = await window.desaAPI.settings.get() || {}; } catch (e) {}

  box.innerHTML = `
    <div class="manual-inner">

      <h3>Input Manual Data Penduduk</h3>

      <p class="hint">
        Isi data di bawah. Saat surat disimpan, penduduk baru ini
        <b>otomatis tersimpan ke Daftar Penduduk</b>.
        Opsional: upload KTP untuk mengisi form lewat scan OCR.
      </p>

      <div class="actions" style="margin-bottom:10px">
        <button type="button" onclick="uploadKtpSurat()">🪪 Upload KTP + Scan OCR</button>
      </div>

      <div id="ktpstatus" class="ktp-status"></div>

      <div class="grid">

        ${fld('m_nik', 'NIK *', 'text')}
        ${fld('m_nama', 'Nama Lengkap *', 'text')}
        ${fld('m_no_kk', 'No. KK', 'text')}
        ${fld('m_tempat_lahir', 'Tempat Lahir', 'text')}
        ${fld('m_tanggal_lahir', 'Tanggal Lahir', 'date')}
        ${fld('m_jenis_kelamin', 'Jenis Kelamin', 'select', 'Laki-laki|Perempuan')}
        ${fld('m_agama', 'Agama', 'text')}
        ${fld('m_pendidikan', 'Pendidikan', 'text')}
        ${fld('m_pekerjaan', 'Pekerjaan', 'text')}
        ${fld('m_status_perkawinan', 'Status Perkawinan', 'text')}
        ${fld('m_rt', 'RT', 'text')}
        ${fld('m_rw', 'RW', 'text')}
        ${fld('m_desa', 'Desa', 'text', '', s.nama_desa || '')}
        ${fld('m_kecamatan', 'Kecamatan', 'text', '', s.kecamatan || '')}
        ${fld('m_kabupaten', 'Kabupaten', 'text', '', s.kabupaten || '')}
        ${fld('m_provinsi', 'Provinsi', 'text', '', s.provinsi || '')}

        <div class="full">
          ${fld('m_alamat', 'Alamat', 'textarea')}
        </div>

      </div>

    </div>
  `;
}

// Upload KTP khusus mode manual di Buat Surat → scan lalu isi field m_*
async function uploadKtpSurat() {

  if (!window.desaAPI?.ktpUpload) return alert('Fitur upload butuh aplikasi desktop (Electron).');

  const status = $('#ktpstatus');

  let path;
  try {
    path = await window.desaAPI.ktpUpload();
  } catch (e) {
    return; // batal
  }
  if (!path) return;

  ktpScannedPath = path;

  if (typeof window.KtpOcr === 'undefined') {
    if (status) status.innerHTML = '<span class="err">Modul OCR tidak tersedia.</span>';
    return;
  }

  if (status) status.textContent = 'Memuat mesin OCR…';

  try {

    const text = await window.KtpOcr.runOcr(
      window.desaAPI.fileUrl(path),
      pct => { if (status) status.textContent = `Membaca KTP… ${pct}%`; }
    );

    const d = window.KtpOcr.parseKtpText(text);

    let filled = 0;
    Object.entries(d).forEach(([k, v]) => {
      const el = $('#m_' + k);
      if (el && v) { el.value = v; filled++; }
    });

    if (status) status.innerHTML = filled
      ? `<span class="ok">✓ ${filled} field terisi otomatis — periksa kembali.</span>`
      : '<span class="err">Tidak ada data yang terbaca. Isi manual saja.</span>';

  } catch (e) {
    if (status) status.innerHTML = `<span class="err">OCR gagal: ${esc(e?.message || e)}</span>`;
  }
}

function collectManualPenduduk() {

  const d = {};

  MANUAL_P_FIELDS.forEach(f => {
    const el = $('#m_' + f);
    if (el) d[f] = el.value.trim();
  });

  ['desa', 'kecamatan', 'kabupaten', 'provinsi'].forEach(f => {
    const el = $('#m_' + f);
    if (el) d[f] = el.value.trim();
  });

  if (ktpScannedPath) d.ktp_path = ktpScannedPath;

  return d;
}

async function ensureManualPendudukSaved() {

  const d = collectManualPenduduk();

  if (!d.nik || !d.nama) {
    throw new Error('Mode manual: NIK dan Nama wajib diisi.');
  }
  if (!/^\d{16}$/.test(d.nik)) {
    throw new Error('Mode manual: NIK harus 16 digit angka.');
  }

  d.status_kependudukan = 'Tetap';

  const saved = await window.desaAPI.penduduk.save(d);

  // segarkan cache & dropdown agar penduduk baru ikut terdaftar
  cachedPenduduk = await window.desaAPI.penduduk.list('');

  return saved;
}


/* =========================================================
   FORM DINAMIS SURAT
   ========================================================= */

async function dynamicFields(existingForm = null) {

  const tid = $('#tid');
  if (!tid) return;

  const dyn = $('#dyn');

  const x = suratTypes.find(t => t.id == tid.value);

  if (!x) {
    if (dyn) dyn.innerHTML = '';
    await cekTemplateStatus();
    return;
  }

  const fields = (x.fields || []).filter(
    f => (f.field || '').toLowerCase() !== 'penduduk'
  );

  dyn.innerHTML =
    '<h3>Form Dinamis</h3>' +
    (
      fields.length
        ? fields.map(f =>
            fld(
              'f_' + f.field,
              (f.label || f.field).replaceAll('_', ' '),
              f.tipe === 'DATE' ? 'date' : 'text',
              '',
              existingForm ? (existingForm[f.field] ?? '') : ''
            )
          ).join('')
        : `<p class="hint">Tidak ada field tambahan untuk surat ini.</p>`
    );

  await cekTemplateStatus();
}


/* =========================================================
   CEK TEMPLATE
   ========================================================= */

async function cekTemplateStatus() {

  const tid = $('#tid');
  if (!tid) return;

  const x = suratTypes.find(t => t.id == tid.value);

  if (!x) {
    currentTemplate = null;
    return;
  }

  try {
    currentTemplate = await window.desaAPI.templates.getByKode(x.kode);
  } catch (e) {
    console.error(e);
    currentTemplate = null;
  }
}


/* =========================================================
   BUILD DATA SURAT
   ========================================================= */

function collectFields() {

  const fields = {};

  $$('#dyn input, #dyn textarea, #dyn select').forEach(e => {
    if (e.id.startsWith('f_')) {
      fields[e.id.slice(2)] = e.value;
    }
  });

  return fields;
}

function manualPendudukFromForm() {

  const d = {};

  ['nik', 'nama', 'no_kk', 'tempat_lahir', 'tanggal_lahir',
   'jenis_kelamin', 'agama', 'pendidikan', 'pekerjaan',
   'status_perkawinan', 'rt', 'rw', 'desa', 'kecamatan',
   'kabupaten', 'provinsi', 'alamat'].forEach(f => {
    const el = $('#m_' + f);
    if (el) d[f] = el.value.trim();
  });

  return d;
}

function buildDataMap() {

  const pid = $('#pid');

  const p = isManualMode()
    ? manualPendudukFromForm()
    : (cachedPenduduk.find(x => x.id == (pid?.value || -1)) || {});

  const fields = collectFields();

  return {
    ...p,
    ...fields,
    keperluan: fields.keperluan || '',
    nomor_surat: $('#nomor')?.value || '',
    tanggal_surat: $('#tanggal')?.value || ''
  };
}


/* =========================================================
   PLACEHOLDER
   ========================================================= */

function replacePlaceholders(isi, data) {

  return isi.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = data[k];
    return v !== undefined && v !== null ? String(v) : '';
  });
}


/* =========================================================
   PREVIEW SURAT
   ========================================================= */

async function preview() {

  const prev = $('#prev');
  if (!prev) return;

  const s = await window.desaAPI.settings.get();

  const tid = $('#tid');
  if (!tid) return;

  const x = suratTypes.find(t => t.id == tid.value);

  if (!x) return alert('Pilih jenis surat dulu.');

  await cekTemplateStatus();

  const data = buildDataMap();

  let bodyHtml;
  let usedTemplate = false;

  if (currentTemplate && currentTemplate.isi) {

    usedTemplate = true;

    bodyHtml =
      replacePlaceholders(currentTemplate.isi, data)
        .split('\n')
        .map(l => (l.trim() === '' ? '<br>' : `<p>${esc(l)}</p>`))
        .join('');

  } else {

    const fields = collectFields();

    const body =
      Object.entries(fields)
        .filter(a => a[1])
        .map(
          a =>
            `<p><b>${esc(a[0].replaceAll('_', ' '))}: </b>${esc(a[1])}</p>`
        )
        .join('');

    bodyHtml = `
      <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>

      <p>
        <b>${esc(data.nama || '')}</b><br>
        NIK: ${esc(data.nik || '')}<br>
        Alamat: ${esc(data.alamat || '')}
      </p>

      ${body}

      <p>Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
    `;
  }

  const kop = `
    <div class="kop">
      <b>PEMERINTAH DESA ${esc((s.nama_desa || '').toUpperCase())}</b><br>
      KECAMATAN ${esc((s.kecamatan || '').toUpperCase())}<br>
      KABUPATEN ${esc((s.kabupaten || '').toUpperCase())}<br>
      ${esc(s.alamat || '')}
    </div>
  `;

  lastPreview = `
    ${kop}

    <h3 class="letter-title">${esc((x.nama || '').toUpperCase())}</h3>

    <p class="letter-number">Nomor: ${esc(data.nomor_surat || '........................')}</p>

    <div class="letter-body">${bodyHtml}</div>

    <div class="signature">
      ${esc(s.nama_desa || '')}, ${esc(data.tanggal_surat || '')}
      <br><br>
      Kepala Desa
      <br><br><br><br>
      <b><u>${esc(s.kepala_desa || '........................')}</u></b>
    </div>
  `;

  const status = usedTemplate
    ? `<div class="template-status template-ok">✓ Menggunakan template kode ${esc(currentTemplate.kode)}</div>`
    : `<div class="template-status template-missing">⚠ Template untuk kode ${esc(x.kode)} belum dibuat. Menggunakan format dasar.</div>`;

  prev.innerHTML =
    status +
    lastPreview +
    `
      <div class="actions preview-actions">
        <button class="primary" onclick="cetakPreview()">Cetak</button>
        <button onclick="cetakPDF()">PDF</button>
        <button onclick="cetakWord()">Word</button>
      </div>
    `;
}

function ensurePreview() {
  if (!lastPreview) {
    alert('Buat preview surat terlebih dahulu.');
    return false;
  }
  return true;
}

async function cetakPreview() {
  if (!ensurePreview()) return;
  try { await window.desaAPI.print(); }
  catch (e) { alert('Gagal mencetak: ' + (e?.message || e)); }
}

async function cetakPDF() {
  if (!ensurePreview()) return;
  try {
    const f = await window.desaAPI.pdf();
    if (f) alert('PDF tersimpan:\n' + f);
  } catch (e) {
    alert('Gagal membuat PDF: ' + (e?.message || e));
  }
}

async function cetakWord() {
  if (!ensurePreview()) return;
  try {
    const f = await window.desaAPI.word(lastPreview);
    if (f) alert('Word tersimpan:\n' + f);
  } catch (e) {
    alert('Gagal membuat Word: ' + (e?.message || e));
  }
}


/* =========================================================
   SIMPAN SURAT
   ========================================================= */

async function saveLetter() {

  const tid = $('#tid');
  if (!tid) return;

  const x = suratTypes.find(t => t.id == tid.value);

  if (!x) return alert('Pilih jenis surat.');

  const nomor = ($('#nomor')?.value || '').trim();

  if (!nomor) return alert('Nomor surat wajib diisi (atau tekan "Otomatis").');

  const fields = collectFields();

  let manualSaved = null;

  try {

    // Mode manual: simpan penduduk baru DULU, lalu pakai id-nya untuk surat
    if (isManualMode()) {
      manualSaved = await ensureManualPendudukSaved();
    }

    const payload = {
      nomor,
      jenis: Number(tid.value),
      penduduk: manualSaved ? manualSaved.id : Number($('#pid')?.value || 0),
      tanggal: $('#tanggal')?.value || '',
      keperluan: fields.keperluan || '',
      form: fields
    };

    if (editSuratId) payload.id = editSuratId;

    await window.desaAPI.surat.save(payload);

    alert(
      (editSuratId ? 'Perubahan surat disimpan.' : 'Surat disimpan dan masuk arsip.') +
      (manualSaved ? `\nPenduduk "${manualSaved.nama}" (NIK ${manualSaved.nik}) juga tersimpan ke Daftar Penduduk.` : '')
    );

    await preview();

  } catch (e) {

    alert('Gagal menyimpan surat: ' + (e?.message || e));
  }
}


/* =========================================================
   ARSIP
   ========================================================= */

async function arsip() {

  const r = await window.desaAPI.arsip.list({});

  $('#content').innerHTML = `
    <div class="panel">

      <h2>6. Arsip Surat</h2>

      <div class="toolbar">

        <input id="aq" placeholder="Nomor / jenis / NIK / nama">

        <input id="yr" placeholder="Tahun" style="max-width:130px">

        <button class="primary" onclick="findA()">Cari</button>

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
            `<tr><td colspan="6" class="empty">Belum ada arsip</td></tr>`
          }
        </tbody>

      </table>

    </div>
  `;
}


function aRow(r) {

  return `
    <tr>
      <td>${esc(r.tanggal_surat)}</td>
      <td>${esc(r.nomor_surat)}</td>
      <td>${esc(r.jenis_surat)}</td>
      <td>${esc(r.nik)}</td>
      <td>${esc(r.nama_penduduk)}</td>
      <td><button onclick="buat(${r.surat_id})">Buka / Cetak Ulang</button></td>
    </tr>
  `;
}


async function findA() {

  const r = await window.desaAPI.arsip.list({
    q: $('#aq').value,
    tahun: $('#yr').value
  });

  $('#ar').innerHTML =
    r.map(aRow).join('') ||
    `<tr><td colspan="6" class="empty">Tidak ditemukan</td></tr>`;
}


/* =========================================================
   TEMPLATE
   ========================================================= */

async function templates() {

  const r = await window.desaAPI.templates.list();

  suratTypes = await window.desaAPI.surat.types();

  const mapKode = Object.fromEntries(
    suratTypes.map(t => [t.kode, t.nama])
  );

  $('#content').innerHTML = `
    <div class="panel">

      <h2>7. Template Surat</h2>

      <p class="hint">
        Placeholder: {{nama}}, {{nik}}, {{alamat}}, {{tanggal_surat}},
        {{nomor_surat}}. Kode template harus sama dengan kode jenis surat.
      </p>

      <div class="actions">
        <button class="primary" onclick="templateForm()">+ Template Baru</button>
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
                <td>${esc(x.kode)}</td>
                <td>${esc(x.nama)}</td>
                <td>${esc(mapKode[x.kode] || '-')}</td>
                <td>${esc(x.ukuran_kertas)}</td>
                <td>
                  <button onclick="templateForm(${x.id})">Edit</button>
                  <button onclick="hapusT(${x.id})">Hapus</button>
                </td>
              </tr>
            `).join('') ||
            `<tr><td colspan="5" class="empty">Belum ada template</td></tr>`
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

  suratTypes = await window.desaAPI.surat.types();

  let t = {
    id: null,
    kode: '',
    nama: '',
    judul: '',
    isi: defaultTemplateText(),
    ukuran_kertas: 'A4',
    margin_atas: 2,
    margin_bawah: 2,
    margin_kiri: 3,
    margin_kanan: 3,
    aktif: 1
  };

  if (id) {
    const row = await window.desaAPI.templates.get(id);
    if (row) t = row;
  }

  editingTemplateId = t.id || null;

  const opsiKode =
    suratTypes
      .map(x => `
        <option value="${esc(x.kode)}" ${x.kode === t.kode ? 'selected' : ''}>
          ${esc(x.kode)} - ${esc(x.nama)}
        </option>
      `)
      .join('');

  $('#content').innerHTML = `
    <div class="panel">

      <h2>${t.id ? 'Edit Template' : 'Template Baru'}</h2>

      <div class="grid">

        <div>
          <label>Kode (jenis surat)</label>
          <select id="tk">
            <option value="">-- pilih jenis surat --</option>
            ${opsiKode}
          </select>
        </div>

        ${fld('tn', 'Nama Template', 'text', '', t.nama)}
        ${fld('tj', 'Judul', 'text', '', t.judul)}
        ${fld('tu', 'Ukuran', 'select', 'A4|F4', t.ukuran_kertas)}
        ${fld('ma', 'Margin Atas (cm)', 'text', '', t.margin_atas)}
        ${fld('mb', 'Margin Bawah (cm)', 'text', '', t.margin_bawah)}
        ${fld('mk', 'Margin Kiri (cm)', 'text', '', t.margin_kiri)}
        ${fld('mn', 'Margin Kanan (cm)', 'text', '', t.margin_kanan)}

      </div>

      <label>Isi Template</label>

      <textarea id="ti" class="template-editor">${esc(t.isi)}</textarea>

      <div class="placeholder-box">

        <b>Placeholder yang tersedia:</b>

        <div class="placeholder-list">
          ${
            ['nama', 'nik', 'no_kk', 'tempat_lahir', 'tanggal_lahir',
             'jenis_kelamin', 'agama', 'pendidikan', 'pekerjaan',
             'alamat', 'rt', 'rw', 'desa', 'kecamatan', 'kabupaten',
             'provinsi', 'nomor_surat', 'tanggal_surat', 'keperluan']
              .map(k => `<code>{{${k}}}</code>`).join(' ')
          }
        </div>

      </div>

      <div class="actions">

        <button class="primary" onclick="saveT(${t.id || 'null'})">
          Simpan
        </button>

        <button onclick="templates()">Batal</button>

      </div>

    </div>
  `;
}

function defaultTemplateText() {
  return `Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama            : {{nama}}
NIK             : {{nik}}
No. KK          : {{no_kk}}
Tempat/Tgl Lahir: {{tempat_lahir}}, {{tanggal_lahir}}
Jenis Kelamin   : {{jenis_kelamin}}
Agama           : {{agama}}
Pekerjaan       : {{pekerjaan}}
Alamat          : {{alamat}}, RT {{rt}} / RW {{rw}}

Keperluan: {{keperluan}}

Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`;
}


/* =========================================================
   SIMPAN TEMPLATE
   ========================================================= */

async function saveT(id) {

  const d = {
    id: id || null,
    kode: $('#tk').value,
    nama: ($('#tn').value || '').trim(),
    judul: ($('#tj').value || '').trim(),
    isi: $('#ti').value,
    ukuran_kertas: $('#tu').value,
    margin_atas: +($('#ma').value || 2),
    margin_bawah: +($('#mb').value || 2),
    margin_kiri: +($('#mk').value || 3),
    margin_kanan: +($('#mn').value || 3),
    aktif: 1
  };

  if (!d.kode || !d.nama) return alert('Kode dan Nama wajib diisi.');

  if (!d.isi || !d.isi.trim()) return alert('Isi template wajib diisi.');

  try {

    await window.desaAPI.templates.save(d);

    alert('Template tersimpan.');

    editingTemplateId = null;

    await templates();

  } catch (e) {

    alert('Gagal menyimpan: ' + (e?.message || e));
  }
}


/* =========================================================
   HAPUS TEMPLATE
   ========================================================= */

async function hapusT(id) {

  if (!confirm('Hapus template ini?')) return;

  try {
    await window.desaAPI.templates.remove(id);
    await templates();
  } catch (e) {
    alert('Gagal menghapus: ' + (e?.message || e));
  }
}


/* =========================================================
   PENGATURAN
   ========================================================= */

async function settings() {

  const s = await window.desaAPI.settings.get();

  $('#content').innerHTML = `
    <div class="panel">

      <h2>8. Pengaturan Desa</h2>

      <div class="grid">

        ${fld('dn', 'Nama Desa', 'text', '', s.nama_desa)}
        ${fld('dk', 'Kecamatan', 'text', '', s.kecamatan)}
        ${fld('db', 'Kabupaten', 'text', '', s.kabupaten)}
        ${fld('dp', 'Provinsi', 'text', '', s.provinsi)}
        ${fld('dz', 'Kode Pos', 'text', '', s.kode_pos)}
        ${fld('dh', 'Kepala Desa', 'text', '', s.kepala_desa)}
        ${fld('di', 'NIP Kepala Desa', 'text', '', s.nip_kepala_desa)}
        ${fld('dl', 'Logo Path', 'text', '', s.logo_path)}
        ${fld('ds', 'Stempel Path', 'text', '', s.stempel_path)}
        ${fld('dt', 'Tanda Tangan Path', 'text', '', s.tanda_tangan_path)}
        ${fld('fn', 'Format Nomor', 'text', '', s.format_nomor)}

        <div class="full">
          ${fld('da', 'Alamat', 'textarea', '', s.alamat)}
        </div>

      </div>

      <button class="primary" onclick="saveS()">Simpan</button>

    </div>
  `;
}


/* =========================================================
   SIMPAN PENGATURAN
   ========================================================= */

async function saveS() {

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

  const d = {};

  map.forEach(a => {
    const el = $('#' + a[0]);
    d[a[1]] = el ? el.value : '';
  });

  try {
    await window.desaAPI.settings.save(d);
    alert('Pengaturan disimpan.');
  } catch (e) {
    alert('Gagal menyimpan pengaturan: ' + (e?.message || e));
  }
}


/* =========================================================
   PENGGUNA
   ========================================================= */

async function users() {

  const r = await window.desaAPI.users.list();

  $('#content').innerHTML = `
    <div class="panel">

      <h2>9. Pengguna</h2>

      <button class="primary" onclick="userForm()">+ Pengguna</button>

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
                <td>${esc(x.username)}</td>
                <td>${esc(x.nama)}</td>
                <td>${esc(x.role)}</td>
                <td>${x.aktif ? 'Ya' : 'Tidak'}</td>
                <td>
                  <button onclick="userForm(${x.id})">Edit</button>
                  ${x.id !== 1 ? `<button onclick="toggleU(${x.id})">${x.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>` : ''}
                </td>
              </tr>
            `).join('') ||
            `<tr><td colspan="5" class="empty">Belum ada pengguna</td></tr>`
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
    const list = await window.desaAPI.users.list();
    const found = list.find(x => Number(x.id) === Number(id));
    if (found) u = { ...found, password: '' };
  }

  $('#content').innerHTML = `
    <div class="panel">

      <h2>${u.id ? 'Edit' : 'Pengguna Baru'}</h2>

      ${fld('uu', 'Username', 'text', '', u.username)}
      ${fld('up', 'Password ' + (u.id ? '(kosongkan jika tidak diubah)' : '*'), 'password')}
      ${fld('un', 'Nama', 'text', '', u.nama)}
      ${fld('ur', 'Role', 'select', 'Admin|Operator|Kepala Desa', u.role)}

      <div class="actions">

        <button class="primary" onclick="saveU(${u.id || 'null'})">
          Simpan
        </button>

        <button onclick="users()">Batal</button>

      </div>

    </div>
  `;
}


/* =========================================================
   SIMPAN / TOGGLE PENGGUNA
   ========================================================= */

async function saveU(id) {

  const d = {
    id: id || null,
    username: ($('#uu').value || '').trim(),
    password: $('#up').value,
    nama: ($('#un').value || '').trim(),
    role: $('#ur').value,
    aktif: 1
  };

  if (!d.username || !d.nama) return alert('Username dan Nama wajib diisi.');

  if (!d.id && !d.password) return alert('Password wajib untuk pengguna baru.');

  try {
    await window.desaAPI.users.save(d);
    await users();
  } catch (e) {
    alert('Gagal menyimpan pengguna: ' + (e?.message || e));
  }
}

async function toggleU(id) {
  try {
    await window.desaAPI.users.toggle(Number(id));
    await users();
  } catch (e) {
    alert('Gagal mengubah status: ' + (e?.message || e));
  }
}


/* =========================================================
   BACKUP / RESTORE
   ========================================================= */

function backup() {

  $('#content').innerHTML = `
    <div class="panel">

      <h2>10. Backup / Restore</h2>

      <p>Backup database lokal atau restore dari file .db.</p>

      <div class="actions">

        <button class="primary" onclick="doBackup()">
          Backup Database
        </button>

        <button onclick="doRestore()">
          Restore Database
        </button>

      </div>

    </div>
  `;
}


async function doBackup() {

  try {

    const x = await window.desaAPI.backup();

    if (x) alert('Backup tersimpan:\n' + x);

  } catch (e) {

    alert('Gagal backup: ' + (e?.message || e));
  }
}


async function doRestore() {

  if (!confirm('Restore akan mengganti database aktif. Lanjutkan?')) return;

  try {

    const x = await window.desaAPI.restore();

    if (x) {
      alert('Restore berhasil.');
      location.reload();
    }

  } catch (e) {

    alert('Gagal restore: ' + (e?.message || e));
  }
}


/* =========================================================
   INIT BANUAKITA
   ========================================================= */

async function initApp() {

  /* Tidak ada login lagi. Aplikasi langsung membuka Dashboard. */

  // Sinkronkan helper global dengan DOM saat ini (penting untuk hot-reload/test)
  if (typeof window !== 'undefined') {
    $ = s => document.querySelector(s);
    $$ = s => document.querySelectorAll(s);
    window.page = page;
    window.initApp = initApp;

    // Ekspos fungsi yang dipanggil lewat atribut onclick HTML.
    // Jika salah satu gagal diekspos, tombol menu jadi mati total —
    // maka gunakan try/catch agar satu kegagalan tidak menyeret sisanya.
    const exports = {
      page, penduduk, addP, editP, saveP, hapusP,
      uploadKtp, scanKtp, uploadKtpManual, uploadKtpSurat, toggleManualP,
      suratTypesPage, buat, dynamicFields, autoNomor, preview, saveLetter,
      arsip, findA, templates, templateForm, saveT, hapusT,
      settings, saveS, users, userForm, saveU, toggleU,
      backup, doBackup, doRestore,
      logout: typeof logout === 'function' ? logout : undefined
    };
    for (const [k, v] of Object.entries(exports)) {
      try { if (typeof v === 'function') window[k] = v; } catch (e) { console.error('expose failed:', k, e); }
    }
  }

  // Guard: jika preload gagal dimuat, tampilkan pesan jelas
  // alih-alih membuat semua menu mati tanpa error yang terlihat.
  if (!window.desaAPI) {
    const c = $('#content');
    if (c) {
      c.innerHTML = `
        <div class="panel">
          <h2>Koneksi ke aplikasi utama gagal</h2>
          <p>Modul <code>preload.js</code> tidak tersedia, sehingga tombol
          menu tidak dapat mengambil data. Jalankan ulang aplikasi.</p>
        </div>`;
    }
    return;
  }

  // Hanya hapus elemen login lama jika ada (#app TIDAK BOLEH dihapus!)
  const loginEl = $('#login');
  if (loginEl && typeof loginEl.remove === 'function') loginEl.remove();

  const app = $('#app');
  if (app && app.classList) app.classList.remove('hidden');

  const keluar = document.querySelector('[onclick="logout()"]');
  if (keluar && typeof keluar.remove === 'function') keluar.remove();

  const who = $('#who');
  if (who) who.textContent = 'Administrasi Desa';

  // tanggal hari ini di topbar (format Indonesia)
  const today = $('#today');
  if (today) {
    try {
      today.textContent = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) {
      today.textContent = new Date().toISOString().slice(0, 10);
    }
  }

  await page('dashboard');
}
