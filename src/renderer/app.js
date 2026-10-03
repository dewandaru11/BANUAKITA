let user = null;
let types = [];
let people = [];
let currentTemplate = null;
let templateRows = [];
let templateEditId = null;
let lastPreview = '';

const $ = s => document.querySelector(s);

const esc = v =>
  String(v ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));

function nl2br(v) {
  return esc(v).replace(/\r?\n/g, '<br>');
}

function formatLabel(v) {
  return String(v || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function doLogin() {
  window.desaAPI.login($('#u').value, $('#p').value).then(x => {
    if (!x) {
      $('#err').textContent = 'Username atau password salah';
      return;
    }

    user = x;
    $('#login').classList.add('hidden');
    $('#app').classList.remove('hidden');
    $('#who').innerHTML = `${esc(x.nama)}<br>${esc(x.role)}`;
    page('dashboard');
  });
}

function logout() {
  location.reload();
}

async function page(x) {
  const t = {
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

  $('#title').textContent = t[x];
  await ({ dashboard, penduduk, buat, arsip, types, templates, settings, users, backup })[x]();
}

async function dashboard() {
  const d = await window.desaAPI.dashboard();

  $('#content').innerHTML = `
    <div class="cards">
      <div class="card">Penduduk<div class="num">${d.penduduk}</div></div>
      <div class="card">Surat Hari Ini<div class="num">${d.suratHariIni}</div></div>
      <div class="card">Surat Bulan Ini<div class="num">${d.suratBulanIni}</div></div>
      <div class="card">Arsip<div class="num">${d.arsip}</div></div>
    </div>

    <div class="panel" style="margin-top:18px">
      <h2>Administrasi Desa</h2>
      <p>
        Alur: Login → Dashboard → Penduduk → Buat Surat →
        Template → Preview → Arsip → Pengaturan → Pengguna → Backup/Restore.
      </p>
    </div>
  `;
}

async function penduduk() {
  const r = await window.desaAPI.penduduk.list('');

  $('#content').innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <input id="q" placeholder="Cari NIK / Nama / KK" oninput="loadP(this.value)">
        <button class="primary" onclick="addP()">+ Tambah Penduduk</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>NIK</th><th>Nama</th><th>KK</th><th>JK</th><th>Alamat</th>
          </tr>
        </thead>
        <tbody id="pr">${r.map(pRow).join('')}</tbody>
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
    </tr>
  `;
}

async function loadP(q) {
  $('#pr').innerHTML = (await window.desaAPI.penduduk.list(q)).map(pRow).join('');
}

function fld(id, label, type = 'text', opts = '') {
  let x;

  if (type === 'textarea') {
    x = `<textarea id="${id}"></textarea>`;
  } else if (type === 'select') {
    x = `
      <select id="${id}">
        <option value="">-- pilih --</option>
        ${opts.split('|').map(o => `<option>${esc(o)}</option>`).join('')}
      </select>
    `;
  } else {
    x = `<input id="${id}" type="${type}">`;
  }

  return `<div><label>${esc(label)}</label>${x}</div>`;
}

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
        ${fld('jenis_kelamin', 'Jenis Kelamin', 'select', 'Laki-laki|Perempuan')}
        ${fld('agama', 'Agama')}
        ${fld('pendidikan', 'Pendidikan')}
        ${fld('pekerjaan', 'Pekerjaan')}
        ${fld('status_perkawinan', 'Status Perkawinan')}
        ${fld('alamat', 'Alamat', 'textarea')}
        ${fld('rt', 'RT')}
        ${fld('rw', 'RW')}
        ${fld('desa', 'Desa')}
        ${fld('kecamatan', 'Kecamatan')}
      </div>

      <button class="primary" onclick="saveP()">Simpan</button>
    </div>
  `;
}

async function saveP() {
  const ids = [
    'nik', 'no_kk', 'nama', 'tempat_lahir', 'tanggal_lahir',
    'jenis_kelamin', 'agama', 'pendidikan', 'pekerjaan',
    'status_perkawinan', 'alamat', 'rt', 'rw', 'desa', 'kecamatan'
  ];

  const d = {};
  ids.forEach(i => d[i] = $('#' + i).value);

  d.kabupaten = '';
  d.provinsi = '';
  d.status_kependudukan = 'Tetap';

  try {
    await window.desaAPI.penduduk.save(d);
    alert('Tersimpan');
    penduduk();
  } catch (e) {
    alert('Gagal menyimpan. NIK mungkin sudah ada.');
  }
}

async function types() {
  types = await window.desaAPI.surat.types();

  $('#content').innerHTML = `
    <div class="panel">
      <h2>80 Jenis Surat</h2>

      <table class="table">
        <thead>
          <tr><th>Kode</th><th>Nama Surat</th><th>Jumlah Field</th></tr>
        </thead>
        <tbody>
          ${types.map(x => `
            <tr>
              <td>${esc(x.kode)}</td>
              <td>${esc(x.nama)}</td>
              <td>${x.fields.length}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function buat() {
  types = await window.desaAPI.surat.types();
  people = await window.desaAPI.penduduk.list('');
  currentTemplate = null;

  if (!people.length) {
    $('#content').innerHTML = `
      <div class="panel">
        <h2>Belum ada data penduduk</h2>
        <p>Tambahkan penduduk terlebih dahulu sebelum membuat surat.</p>
        <button class="primary" onclick="page('penduduk')">Buka Data Penduduk</button>
      </div>
    `;
    return;
  }

  $('#content').innerHTML = `
    <div class="grid letter-workspace">
      <div class="panel">
        <h2>4. Buat Surat</h2>

        <label>Penduduk</label>
        <select id="pid" onchange="loadTemplate()">
          ${people.map(x => `
            <option value="${x.id}">
              ${esc(x.nama)} - ${esc(x.nik)}
            </option>
          `).join('')}
        </select>

        <label>Jenis Surat</label>
        <select id="tid" onchange="dynamicFields(); loadTemplate()">
          ${types.map(x => `
            <option value="${x.id}">
              ${esc(x.kode)} - ${esc(x.nama)}
            </option>
          `).join('')}
        </select>

        <div id="templateStatus" class="template-status">
          Memuat template...
        </div>

        <label>Nomor Surat</label>
        <input id="nomor" placeholder="001/.../...">

        <label>Tanggal</label>
        <input id="tanggal" type="date" value="${new Date().toISOString().slice(0, 10)}">

        <div id="dyn"></div>

        <div class="actions">
          <button class="primary" onclick="saveLetter()">Simpan Surat</button>
          <button onclick="preview()">Preview</button>
        </div>
      </div>

      <div class="panel">
        <h2>5. Preview Surat</h2>
        <div id="prev" class="preview">
          Preview surat akan muncul di sini.
        </div>
      </div>
    </div>
  `;

  dynamicFields();
  await loadTemplate();
}

function dynamicFields() {
  const x = types.find(t => t.id == $('#tid').value);
  if (!x) return;

  $('#dyn').innerHTML = `
    <h3>Form Dinamis</h3>
    ${x.fields
      .filter(f => f.field !== 'penduduk')
      .map(f => {
        const type = f.tipe === 'DATE' ? 'date' : 'text';
        return fld(`f_${f.field}`, formatLabel(f.field), type);
      })
      .join('')}
  `;
}

async function loadTemplate() {
  const type = types.find(t => t.id == Number($('#tid')?.value));
  if (!type) return;

  currentTemplate = await window.desaAPI.templates.getByKode(type.kode);

  if (currentTemplate) {
    $('#templateStatus').innerHTML = `
      <span class="template-ok">✓ Template aktif: <b>${esc(currentTemplate.nama)}</b></span>
    `;
  } else {
    $('#templateStatus').innerHTML = `
      <span class="template-missing">
        ⚠ Belum ada template untuk kode ${esc(type.kode)}.
        Sistem akan menggunakan format dasar.
      </span>
    `;
  }
}

function getFormValues() {
  const fields = {};

  document
    .querySelectorAll('#dyn input,#dyn textarea,#dyn select')
    .forEach(e => {
      fields[e.id.slice(2)] = e.value;
    });

  return fields;
}

function getSelectedPerson() {
  return people.find(p => Number(p.id) === Number($('#pid').value)) || {};
}

function makeTemplateData(settings, type, person, fields) {
  const data = {
    ...person,
    ...fields,

    nama: person.nama || '',
    nik: person.nik || '',
    no_kk: person.no_kk || '',
    tempat_lahir: person.tempat_lahir || '',
    tanggal_lahir: person.tanggal_lahir || '',
    jenis_kelamin: person.jenis_kelamin || '',
    agama: person.agama || '',
    pendidikan: person.pendidikan || '',
    pekerjaan: person.pekerjaan || '',
    status_perkawinan: person.status_perkawinan || '',
    alamat: person.alamat || '',
    rt: person.rt || '',
    rw: person.rw || '',
    desa: person.desa || '',
    kecamatan: person.kecamatan || '',
    kabupaten: person.kabupaten || settings.kabupaten || '',
    provinsi: person.provinsi || settings.provinsi || '',

    nama_desa: settings.nama_desa || '',
    kode_pos: settings.kode_pos || '',
    kepala_desa: settings.kepala_desa || '',
    nip_kepala_desa: settings.nip_kepala_desa || '',

    nomor_surat: $('#nomor').value || '',
    tanggal_surat: $('#tanggal').value || '',
    jenis_surat: type.nama || '',
    kode_surat: type.kode || ''
  };

  return data;
}

function replacePlaceholders(text, data) {
  return String(text || '').replace(
    /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
    (_, key) => {
      const value = data[key];
      return value === undefined || value === null ? '' : nl2br(value);
    }
  );
}

function basicLetter(settings, type, person, fields) {
  const fieldBody = Object.entries(fields)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<p><b>${esc(formatLabel(key))}:</b> ${nl2br(value)}</p>`
    )
    .join('');

  return `
    <div class="kop">
      <b>PEMERINTAH DESA ${esc(String(settings.nama_desa || '').toUpperCase())}</b><br>
      KECAMATAN ${esc(String(settings.kecamatan || '').toUpperCase())}<br>
      KABUPATEN ${esc(String(settings.kabupaten || '').toUpperCase())}<br>
      ${esc(settings.alamat || '')}
    </div>

    <h3 class="letter-title">${esc(String(type.nama || '').toUpperCase())}</h3>

    <p class="letter-number">
      Nomor: ${esc($('#nomor').value || '........................')}
    </p>

    <p>Menerangkan bahwa:</p>
    <p><b>${esc(person.nama || '')}</b></p>

    ${fieldBody}

    <p>
      Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.
    </p>

    <p class="signature">
      ${esc(settings.nama_desa || '')}, ${esc($('#tanggal').value || '')}<br>
      Kepala Desa<br><br><br>
      <b><u>${esc(settings.kepala_desa || '........................')}</u></b>
    </p>
  `;
}

async function preview() {
  const settings = await window.desaAPI.settings.get();
  const type = types.find(t => t.id == Number($('#tid').value));
  const person = getSelectedPerson();
  const fields = getFormValues();
  const data = makeTemplateData(settings, type, person, fields);

  let body;

  if (currentTemplate && currentTemplate.isi) {
    body = replacePlaceholders(currentTemplate.isi, data);

    const title = currentTemplate.judul || type.nama;

    lastPreview = `
      <div class="kop">
        <b>PEMERINTAH DESA ${esc(String(settings.nama_desa || '').toUpperCase())}</b><br>
        KECAMATAN ${esc(String(settings.kecamatan || '').toUpperCase())}<br>
        KABUPATEN ${esc(String(settings.kabupaten || '').toUpperCase())}<br>
        ${esc(settings.alamat || '')}
      </div>

      <h3 class="letter-title">${esc(String(title).toUpperCase())}</h3>

      <p class="letter-number">
        Nomor: ${esc($('#nomor').value || '........................')}
      </p>

      <div class="letter-body">${body}</div>

      <p class="signature">
        ${esc(settings.nama_desa || '')}, ${esc($('#tanggal').value || '')}<br>
        Kepala Desa<br><br><br>
        <b><u>${esc(settings.kepala_desa || '........................')}</u></b>
      </p>
    `;
  } else {
    lastPreview = basicLetter(settings, type, person, fields);
  }

  $('#prev').innerHTML = `
    ${lastPreview}

    <div class="actions preview-actions">
      <button onclick="window.desaAPI.print()">Cetak</button>
      <button onclick="window.desaAPI.pdf()">PDF</button>
      <button onclick="window.desaAPI.word(lastPreview)">Word</button>
    </div>
  `;
}

async function saveLetter() {
  const nomor = $('#nomor').value.trim();

  if (!nomor) {
    alert('Nomor surat harus diisi.');
    $('#nomor').focus();
    return;
  }

  const fields = getFormValues();

  await window.desaAPI.surat.save({
    nomor,
    jenis: Number($('#tid').value),
    penduduk: Number($('#pid').value),
    tanggal: $('#tanggal').value,
    keperluan: fields.keperluan || '',
    form: fields
  });

  alert('Surat disimpan dan masuk arsip.');
  await preview();
}

async function arsip() {
  const r = await window.desaAPI.arsip.list({});

  $('#content').innerHTML = `
    <div class="panel">
      <h2>6. Arsip</h2>

      <div class="toolbar">
        <input id="aq" placeholder="Nomor / jenis / NIK / nama">
        <input id="yr" placeholder="Tahun" style="max-width:130px">
        <button class="primary" onclick="findA()">Cari</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Tanggal</th><th>Nomor</th><th>Jenis</th><th>NIK</th><th>Nama</th>
          </tr>
        </thead>
        <tbody id="ar">${r.map(aRow).join('')}</tbody>
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
    </tr>
  `;
}

async function findA() {
  const r = await window.desaAPI.arsip.list({
    q: $('#aq').value,
    tahun: $('#yr').value
  });

  $('#ar').innerHTML = r.map(aRow).join('');
}

async function templates() {
  types = await window.desaAPI.surat.types();
  templateRows = await window.desaAPI.templates.list();

  $('#content').innerHTML = `
    <div class="panel">
      <div class="template-header">
        <div>
          <h2>7. Template Surat</h2>
          <p class="hint">
            Template terhubung ke jenis surat melalui <b>kode</b>.
            Contoh placeholder:
            {{nama}}, {{nik}}, {{alamat}}, {{nomor_surat}},
            {{tanggal_surat}}, {{keperluan}}.
          </p>
        </div>

        <button class="primary" onclick="templateForm()">+ Template Baru</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Judul</th>
            <th>Ukuran</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          ${
            templateRows.length
              ? templateRows.map(x => `
                <tr>
                  <td>${esc(x.kode)}</td>
                  <td>${esc(x.nama)}</td>
                  <td>${esc(x.judul)}</td>
                  <td>${esc(x.ukuran_kertas)}</td>
                  <td>${x.aktif ? 'Aktif' : 'Nonaktif'}</td>
                  <td>
                    <button onclick="editTemplate(${x.id})">Edit</button>
                  </td>
                </tr>
              `).join('')
              : `
                <tr>
                  <td colspan="6" class="empty">
                    Belum ada template. Buat template pertama untuk mengaktifkan
                    preview surat berbasis template.
                  </td>
                </tr>
              `
          }
        </tbody>
      </table>
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

{{keperluan}}

Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`;
}

function templateForm(id = null) {
  templateEditId = id;
  const row = id ? templateRows.find(x => Number(x.id) === Number(id)) : null;

  const selectedKode = row?.kode || types[0]?.kode || '';

  $('#content').innerHTML = `
    <div class="panel">
      <h2>${row ? 'Edit Template Surat' : 'Template Surat Baru'}</h2>

      <div class="grid">
        <div>
          <label>Jenis Surat</label>
          <select id="tkind" onchange="syncTemplateKode()">
            ${types.map(x => `
              <option value="${esc(x.kode)}" ${x.kode === selectedKode ? 'selected' : ''}>
                ${esc(x.kode)} - ${esc(x.nama)}
              </option>
            `).join('')}
          </select>
        </div>

        <div>
          <label>Kode Template</label>
          <input id="tk" value="${esc(row?.kode || selectedKode)}" readonly>
        </div>

        ${fld('tn', 'Nama Template')}
        ${fld('tj', 'Judul Surat')}

        <div>
          <label>Ukuran Kertas</label>
          <select id="tu">
            <option ${row?.ukuran_kertas === 'A4' || !row ? 'selected' : ''}>A4</option>
            <option ${row?.ukuran_kertas === 'F4' ? 'selected' : ''}>F4</option>
          </select>
        </div>

        <div></div>

        <div class="full">
          <label>Isi Template</label>
          <textarea id="ti" class="template-editor" placeholder="Tulis isi surat menggunakan {{placeholder}}">${esc(row?.isi || defaultTemplateText())}</textarea>
        </div>

        ${fld('ma', 'Margin Atas (cm)')}
        ${fld('mb', 'Margin Bawah (cm)')}
        ${fld('mk', 'Margin Kiri (cm)')}
        ${fld('mn', 'Margin Kanan (cm)')}
      </div>

      <div class="placeholder-box">
        <b>Placeholder yang tersedia</b>
        <div class="placeholder-list">
          ${[
            'nama', 'nik', 'no_kk', 'tempat_lahir', 'tanggal_lahir',
            'jenis_kelamin', 'agama', 'pendidikan', 'pekerjaan',
            'status_perkawinan', 'alamat', 'rt', 'rw', 'desa',
            'kecamatan', 'kabupaten', 'provinsi', 'kode_pos',
            'nama_desa', 'kepala_desa', 'nip_kepala_desa',
            'nomor_surat', 'tanggal_surat', 'jenis_surat',
            'kode_surat', 'keperluan'
          ].map(x => `<code>{{${x}}}</code>`).join(' ')}
        </div>
      </div>

      <div class="actions">
        <button class="primary" onclick="saveT()">Simpan Template</button>
        <button onclick="templates()">Batal</button>
      </div>
    </div>
  `;

  if (row) {
    $('#tn').value = row.nama || '';
    $('#tj').value = row.judul || '';
    $('#ma').value = row.margin_atas ?? 2;
    $('#mb').value = row.margin_bawah ?? 2;
    $('#mk').value = row.margin_kiri ?? 3;
    $('#mn').value = row.margin_kanan ?? 3;
  }
}

function syncTemplateKode() {
  $('#tk').value = $('#tkind').value;

  const type = types.find(x => x.kode === $('#tkind').value);

  if (type && !$('#tn').value) {
    $('#tn').value = `Template ${type.nama}`;
  }

  if (type && !$('#tj').value) {
    $('#tj').value = type.nama;
  }
}

async function editTemplate(id) {
  templateForm(id);
}

async function saveT() {
  const data = {
    id: templateEditId,
    kode: $('#tk').value,
    nama: $('#tn').value.trim(),
    judul: $('#tj').value.trim(),
    isi: $('#ti').value,
    ukuran_kertas: $('#tu').value,
    margin_atas: Number($('#ma').value || 2),
    margin_bawah: Number($('#mb').value || 2),
    margin_kiri: Number($('#mk').value || 3),
    margin_kanan: Number($('#mn').value || 3),
    aktif: 1
  };

  if (!data.kode || !data.nama || !data.isi) {
    alert('Kode, nama template, dan isi template wajib diisi.');
    return;
  }

  await window.desaAPI.templates.save(data);

  alert('Template berhasil disimpan.');
  templateEditId = null;
  await templates();
}

async function settings() {
  const s = await window.desaAPI.settings.get();

  $('#content').innerHTML = `
    <div class="panel">
      <h2>8. Pengaturan</h2>

      <div class="grid">
        ${fld('dn', 'Nama Desa')}
        ${fld('dk', 'Kecamatan')}
        ${fld('db', 'Kabupaten')}
        ${fld('dp', 'Provinsi')}
        ${fld('da', 'Alamat', 'textarea')}
        ${fld('dz', 'Kode Pos')}
        ${fld('dh', 'Kepala Desa')}
        ${fld('di', 'NIP')}
        ${fld('dl', 'Logo Path')}
        ${fld('ds', 'Stempel Path')}
        ${fld('dt', 'Tanda Tangan Path')}
        ${fld('fn', 'Format Nomor')}
      </div>

      <button class="primary" onclick="saveS()">Simpan</button>
    </div>
  `;

  [
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
  ].forEach(a => $('#' + a[0]).value = s[a[1]] || '');
}

async function saveS() {
  const d = {};

  [
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
  ].forEach(a => d[a[1]] = $('#' + a[0]).value);

  await window.desaAPI.settings.save(d);
  alert('Pengaturan disimpan');
}

async function users() {
  const r = await window.desaAPI.users.list();

  $('#content').innerHTML = `
    <div class="panel">
      <h2>9. Pengguna</h2>
      <button class="primary" onclick="userForm()">+ Pengguna</button>

      <table class="table">
        <thead>
          <tr><th>Username</th><th>Nama</th><th>Role</th><th>Aktif</th></tr>
        </thead>
        <tbody>
          ${r.map(x => `
            <tr>
              <td>${esc(x.username)}</td>
              <td>${esc(x.nama)}</td>
              <td>${esc(x.role)}</td>
              <td>${x.aktif ? 'Ya' : 'Tidak'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function userForm() {
  $('#content').innerHTML = `
    <div class="panel">
      <h2>Pengguna</h2>
      ${fld('uu', 'Username')}
      ${fld('up', 'Password')}
      ${fld('un', 'Nama')}
      ${fld('ur', 'Role', 'select', 'Admin|Operator|Kepala Desa')}
      <button class="primary" onclick="saveU()">Simpan</button>
    </div>
  `;
}

async function saveU() {
  await window.desaAPI.users.save({
    id: null,
    username: $('#uu').value,
    password: $('#up').value,
    nama: $('#un').value,
    role: $('#ur').value,
    aktif: 1
  });

  users();
}

function backup() {
  $('#content').innerHTML = `
    <div class="panel">
      <h2>10. Backup / Restore</h2>
      <p>Backup database lokal atau restore dari file .db.</p>

      <div class="actions">
        <button class="primary" onclick="doBackup()">Backup Database</button>
        <button onclick="doRestore()">Restore Database</button>
      </div>
    </div>
  `;
}

async function doBackup() {
  const x = await window.desaAPI.backup();
  if (x) alert('Backup tersimpan: ' + x);
}

async function doRestore() {
  if (confirm('Restore akan mengganti database aktif. Lanjutkan?')) {
    const x = await window.desaAPI.restore();

    if (x) {
      alert('Restore berhasil.');
      location.reload();
    }
  }
}

page('dashboard');
