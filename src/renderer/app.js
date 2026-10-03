```javascript
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
let editingTemplateId = null;

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

  const r = await window.desaAPI.penduduk.list('');

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

  const r = await window.desaAPI.penduduk.list(q);

  $('#pr').innerHTML =
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

function fld(
  id,
  label,
  type = 'text',
  opts = '',
  value = ''
) {

  const v = esc(value);

  let x;

  if (type === 'textarea') {

    x = `
      <textarea id="${id}">${v}</textarea>
    `;

  } else if (type === 'select') {

    x = `
      <select id="${id}">
        <option value="">-- pilih --</option>

        ${opts
          .split('|')
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
      >
    `;
  }

  return `
    <div>
      <label>${label}</label>
      ${x}
    </div>
  `;
}


/* =========================================================
   TAMBAH PENDUDUK
   ========================================================= */

function addP() {

  $('#content').innerHTML = `

    <div class="panel">

      <h2>Tambah Penduduk</h2>

      <div class="grid">

        ${fld('nik', 'NIK *')}

        ${fld('no_kk', 'No. KK')}

        ${fld('nama', 'Nama Lengkap *')}

        ${fld('tempat_lahir', 'Tempat Lahir')}

        ${fld('tanggal_lahir', 'Tanggal Lahir', 'date')}

        ${fld(
          'jenis_kelamin',
          'Jenis Kelamin',
          'select',
          'Laki-laki|Perempuan'
        )}

        ${fld('agama', 'Agama')}

        ${fld('pendidikan', 'Pendidikan')}

        ${fld('pekerjaan', 'Pekerjaan')}

        ${fld('status_perkawinan', 'Status Perkawinan')}

        ${fld('rt', 'RT')}

        ${fld('rw', 'RW')}

        ${fld('desa', 'Desa')}

        ${fld('kecamatan', 'Kecamatan')}

        ${fld('kabupaten', 'Kabupaten')}

        ${fld('provinsi', 'Provinsi')}

        <div class="full">
          ${fld('alamat', 'Alamat', 'textarea')}
        </div>

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
    d[i] = ($('#' + i)?.value || '').trim();
  });

  if (!d.nik || !d.nama) {
    return alert('NIK dan Nama wajib diisi.');
  }

  if (!/^\d{16}$/.test(d.nik)) {
    return alert('NIK harus 16 digit angka.');
  }

  d.status_kependudukan = 'Tetap';

  if (id) {
    d.id = id;
  }

  try {

    const r = await window.desaAPI.penduduk.save(d);

    alert(
      r.updated
        ? 'Data diperbarui.'
        : 'Data tersimpan.'
    );

    await penduduk();

  } catch (e) {

    alert(
      'Gagal menyimpan: ' +
      (e?.message || e)
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
   JENIS SURAT
   ========================================================= */

async function suratTypesPage() {

  suratTypes = await window.desaAPI.surat.types();

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

                <td>${x.fields.length}</td>

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

  suratTypes = await window.desaAPI.surat.types();

  cachedPenduduk =
    await window.desaAPI.penduduk.list('');

  const tgl =
    new Date().toISOString().slice(0, 10);

  $('#content').innerHTML = `

    <div class="grid">

      <div class="panel">

        <h2>4. Buat Surat</h2>

        <label>Penduduk</label>

        <select id="pid">

          ${
            cachedPenduduk.map(x => `
              <option value="${x.id}">
                ${esc(x.nama)} - ${esc(x.nik)}
              </option>
            `).join('')
          }

        </select>

        <label>Jenis Surat</label>

        <select
          id="tid"
          onchange="dynamicFields()"
        >

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
          placeholder="001/DESA/2025"
        >

        <label>Tanggal</label>

        <input
          id="tanggal"
          type="date"
          value="${tgl}"
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
   FORM DINAMIS SURAT
   ========================================================= */

async function dynamicFields() {

  const tid = $('#tid');

  if (!tid) {
    return;
  }

  const x =
    suratTypes.find(t => t.id == tid.value);

  if (!x) {
    $('#dyn').innerHTML = '';
    return;
  }

  const fields =
    x.fields.filter(
      f =>
        (f.field || '').toLowerCase()
        !== 'penduduk'
    );

  $('#dyn').innerHTML =
    '<h3>Form Dinamis</h3>' +
    (
      fields.length
        ? fields.map(f =>
            fld(
              'f_' + f.field,
              (f.label || f.field)
                .replaceAll('_', ' '),
              f.tipe === 'DATE'
                ? 'date'
                : 'text'
            )
          ).join('')
        : `
          <p class="hint">
            Tidak ada field tambahan untuk surat ini.
          </p>
        `
    );

  await cekTemplateStatus();
}


/* =========================================================
   CEK TEMPLATE
   ========================================================= */

async function cekTemplateStatus() {

  const tid = $('#tid');

  if (!tid) {
    return;
  }

  const x =
    suratTypes.find(t => t.id == tid.value);

  if (!x) {
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

  const pid = $('#pid');

  const p =
    cachedPenduduk.find(
      x => x.id == pid.value
    ) || {};

  const fields = {};

  $$('#dyn input, #dyn textarea, #dyn select')
    .forEach(e => {

      if (e.id.startsWith('f_')) {
        fields[e.id.slice(2)] = e.value;
      }

    });

  return {

    ...p,

    ...fields,

    keperluan:
      fields.keperluan || '',

    nomor_surat:
      $('#nomor').value,

    tanggal_surat:
      $('#tanggal').value
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

  if (!tid) {
    return;
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

  $('#prev').innerHTML =
    status +
    lastPreview +
    `

      <div class="actions preview-actions">

        <button
          class="primary"
          onclick="window.desaAPI.print()"
        >
          Cetak
        </button>

        <button
          onclick="window.desaAPI.pdf()"
        >
          PDF
        </button>

        <button
          onclick="window.desaAPI.word(lastPreview)"
        >
          Word
        </button>

      </div>
    `;
}


/* =========================================================
   SIMPAN SURAT
   ========================================================= */

async function saveLetter() {

  const tid = $('#tid');

  if (!tid) {
    return;
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

      if (e.id.startsWith('f_')) {
        fields[e.id.slice(2)] =
          e.value;
      }

    });

  try {

    await window.desaAPI.surat.save({

      nomor:
        $('#nomor').value,

      jenis:
        Number($('#tid').value),

      penduduk:
        Number($('#pid').value),

      tanggal:
        $('#tanggal').value,

      keperluan:
        fields.keperluan || '',

      form:
        fields

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
    await window.desaAPI.arsip.list({});

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
          </tr>

        </thead>

        <tbody id="ar">

          ${
            r.map(aRow).join('') ||
            `
              <tr>
                <td colspan="5" class="empty">
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

    </tr>
  `;
}


async function findA() {

  const r =
    await window.desaAPI.arsip.list({

      q:
        $('#aq').value,

      tahun:
        $('#yr').value

    });

  $('#ar').innerHTML =
    r.map(aRow).join('') ||
    `
      <tr>
        <td colspan="5" class="empty">
          Tidak ditemukan
        </td>
      </tr>
    `;
}


/* =========================================================
   TEMPLATE
   ========================================================= */

async function templates() {

  const r =
    await window.desaAPI.templates.list();

  suratTypes =
    await window.desaAPI.surat.types();

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
    await window.desaAPI.surat.types();

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

  editingTemplateId =
    t.id || null;

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
    await window.desaAPI.users.list();

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
      await window.desaAPI.users.list();

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

    await page('dashboard');
  }
);
```
