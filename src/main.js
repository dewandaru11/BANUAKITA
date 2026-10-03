const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const Database = require('better-sqlite3');

let db;

// ---------- Database ----------

function init() {
  const dir = path.join(app.getPath('userData'), 'database');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'desa.db');
  db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8'));
  migrate();
  require(path.join(__dirname, '..', 'database', 'seed.js'))(db);
  // Template resmi Desa Pusar — sinkron dengan folder "template surat desa"
  try {
    const seedTpl = path.join(__dirname, '..', 'database', 'templates-seed.js');
    if (fs.existsSync(seedTpl)) {
      require(seedTpl)(db, { app });
    }
  } catch (e) {
    console.warn('templates-seed skip:', e.message);
  }
  // Sinkron ulang file Word yang ada di folder "template surat desa"
  try {
    syncDesaTemplateFolder();
  } catch (e) {
    console.warn('sinkron folder template desa skip:', e.message);
  }
  ensureAdmin();
}

// Migrasi ringan: tambah kolom baru jika DB lama belum punya
function migrate(d = db) {
  const cols = d.prepare('PRAGMA table_info(penduduk)').all().map(c => c.name);
  if (!cols.includes('ktp_path')) {
    d.prepare("ALTER TABLE penduduk ADD COLUMN ktp_path TEXT DEFAULT ''").run();
  }
  // penanda template hasil impor Word -> otomatis jadi pilihan jenis surat
  const tcols = d.prepare('PRAGMA table_info(template_surat)').all().map(c => c.name);
  if (!tcols.includes('from_word')) {
    d.prepare("ALTER TABLE template_surat ADD COLUMN from_word INTEGER DEFAULT 0").run();
  }
}

function ensureAdmin() {
  const row = db.prepare('SELECT id FROM pengguna WHERE username=?').get('admin');
  if (row) {
    db.prepare('UPDATE pengguna SET nama=?,role=?,aktif=1 WHERE id=?').run('Administrator', 'Admin', row.id);
  } else {
    db.prepare('INSERT INTO pengguna(username,password,nama,role,aktif) VALUES(?,?,?,?,1)')
      .run('admin', 'admin123', 'Administrator', 'Admin');
  }
}

function win() {
  const w = new BrowserWindow({
    width: 1450,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  w.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

// ---------- Helpers ----------

function todayISO() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function nextNomor(tanggal, kodeJenis) {
  const t = String(tanggal || todayISO());
  const year = t.slice(0, 4);
  const month = t.slice(5, 7);

  // nomor urut: hitung surat yang nomornya berakhiran /{bulan}/{tahun}
  const like = `%/${month}/${year}`;
  const rows = db
    .prepare("SELECT nomor_surat FROM surat WHERE substr(tanggal_surat,1,4)=? AND nomor_surat LIKE ?")
    .all(year, like);
  let maxSeq = 0;
  for (const r of rows) {
    const m = String(r.nomor_surat).match(/^(\d+)/);
    if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
  }
  const seq = String(maxSeq + 1).padStart(3, '0');

  // format dari pengaturan desa; placeholder: {nomor} {kode} {bulan} {tahun}
  let fmt = '';
  try {
    fmt = String(
      (db.prepare('SELECT format_nomor FROM pengaturan_desa WHERE id=1').get() || {}).format_nomor || ''
    );
  } catch (e) { fmt = ''; }
  if (!/\{nomor\}/.test(fmt)) fmt = '{nomor}/{kode}/{bulan}/{tahun}';

  const kode = String(kodeJenis || '').trim();
  return fmt
    .replace('{nomor}', seq)
    .replace('{kode}', kode)
    .replace('{bulan}', month)
    .replace('{tahun}', year);
}

// ---------- IPC ----------

// Pengaturan desa untuk keperluan normalisasi template Word.
function getSettings() {
  try { return db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get() || {}; }
  catch (e) { return {}; }
}

ipcMain.handle('login', (_, u, p) => {
  u = String(u ?? '').trim();
  p = String(p ?? '');
  return db.prepare('SELECT id,username,nama,role FROM pengguna WHERE username=? AND password=? AND aktif=1').get(u, p) || null;
});

ipcMain.handle('dashboard', () => ({
  penduduk: db.prepare('SELECT COUNT(*) c FROM penduduk WHERE aktif=1').get().c,
  suratHariIni: db.prepare("SELECT COUNT(*) c FROM surat WHERE tanggal_surat=date('now','localtime')").get().c,
  suratBulanIni: db.prepare("SELECT COUNT(*) c FROM surat WHERE substr(tanggal_surat,1,7)=substr(date('now','localtime'),1,7)").get().c,
  arsip: db.prepare('SELECT COUNT(*) c FROM arsip_surat').get().c,
  draft: 0,
  suratMasuk: 0
}));

ipcMain.handle('penduduk:list', (_, q = '') =>
  db.prepare('SELECT * FROM penduduk WHERE aktif=1 AND (nik LIKE ? OR nama LIKE ? OR no_kk LIKE ?) ORDER BY nama LIMIT 1000')
    .all(`%${q}%`, `%${q}%`, `%${q}%`)
);

ipcMain.handle('penduduk:get', (_, id) => db.prepare('SELECT * FROM penduduk WHERE id=?').get(id) || null);

function pendudukParams(d) {
  return {
    nik: d.nik ?? '', no_kk: d.no_kk ?? '', nama: d.nama ?? '',
    tempat_lahir: d.tempat_lahir ?? '', tanggal_lahir: d.tanggal_lahir ?? '',
    jenis_kelamin: d.jenis_kelamin ?? '', agama: d.agama ?? '',
    pendidikan: d.pendidikan ?? '', pekerjaan: d.pekerjaan ?? '',
    status_perkawinan: d.status_perkawinan ?? '', alamat: d.alamat ?? '',
    rt: d.rt ?? '', rw: d.rw ?? '', desa: d.desa ?? '', kecamatan: d.kecamatan ?? '',
    kabupaten: d.kabupaten ?? '', provinsi: d.provinsi ?? '',
    status_kependudukan: String(d.status_kependudukan || 'Tetap'),
    ktp_path: d.ktp_path ?? '',
    aktif: d.aktif === undefined ? 1 : (d.aktif ? 1 : 0)
  };
}

ipcMain.handle('penduduk:save', (_, d) => {
  if (!d || !String(d.nik || '').trim() || !String(d.nama || '').trim()) {
    throw new Error('NIK dan Nama wajib diisi.');
  }
  const p = pendudukParams(d);
  if (d.id) {
    const dup = db.prepare('SELECT id FROM penduduk WHERE nik=? AND id<>? AND aktif=1').get(p.nik, d.id);
    if (dup) throw new Error('NIK sudah digunakan penduduk lain.');
    db.prepare(`UPDATE penduduk SET nik=@nik,no_kk=@no_kk,nama=@nama,tempat_lahir=@tempat_lahir,tanggal_lahir=@tanggal_lahir,
      jenis_kelamin=@jenis_kelamin,agama=@agama,pendidikan=@pendidikan,pekerjaan=@pekerjaan,status_perkawinan=@status_perkawinan,
      alamat=@alamat,rt=@rt,rw=@rw,desa=@desa,kecamatan=@kecamatan,kabupaten=@kabupaten,provinsi=@provinsi,
      status_kependudukan=@status_kependudukan,ktp_path=@ktp_path,aktif=@aktif WHERE id=@id`)
      .run({ ...p, id: d.id });
    return db.prepare('SELECT * FROM penduduk WHERE id=?').get(d.id);
  }
  const dup = db.prepare('SELECT id FROM penduduk WHERE nik=? AND aktif=1').get(p.nik);
  if (dup) throw new Error('NIK sudah terdaftar.');
  const r = db.prepare(`INSERT INTO penduduk(nik,no_kk,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,agama,pendidikan,pekerjaan,status_perkawinan,alamat,rt,rw,desa,kecamatan,kabupaten,provinsi,status_kependudukan,ktp_path,aktif)
    VALUES(@nik,@no_kk,@nama,@tempat_lahir,@tanggal_lahir,@jenis_kelamin,@agama,@pendidikan,@pekerjaan,@status_perkawinan,@alamat,@rt,@rw,@desa,@kecamatan,@kabupaten,@provinsi,@status_kependudukan,@ktp_path,@aktif)`)
    .run(p);
  return db.prepare('SELECT * FROM penduduk WHERE id=?').get(r.lastInsertRowid);
});

// Upload KTP: simpan gambar ke folder userData/ktp, balas path-nya
ipcMain.handle('ktp:upload', async (e) => {
  const r = await dialog.showOpenDialog(e.sender, {
    title: 'Pilih Foto / Scan KTP',
    filters: [{ name: 'Gambar', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] }],
    properties: ['openFile']
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const src = r.filePaths[0];
  const ext = (path.extname(src) || '.jpg').toLowerCase();
  const dir = path.join(app.getPath('userData'), 'ktp');
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `ktp-${Date.now()}${ext}`);
  fs.copyFileSync(src, dest);
  return dest;
});

ipcMain.handle('penduduk:nonaktif', (_, id) => {
  db.prepare('UPDATE penduduk SET aktif=0 WHERE id=?').run(id);
  return true;
});

ipcMain.handle('surat:types', () => {
  const rows = db.prepare('SELECT id,kode,nama,kategori,field_json FROM jenis_surat WHERE aktif=1 ORDER BY CAST(kode AS INTEGER),kode')
    .all().map(x => ({ ...x, fields: JSON.parse(x.field_json || '[]') }));
  // Jenis surat hasil impor template Word (nama = nama yang kita simpan di Word)
  const extra = db.prepare(`
    SELECT t.id AS jenis_id, t.kode, t.nama, t.nama AS kategori, '[]' AS field_json
    FROM template_surat t
    WHERE IFNULL(t.from_word,0)=1 AND t.aktif=1
      AND NOT EXISTS (SELECT 1 FROM jenis_surat j WHERE j.kode = t.kode)
    ORDER BY t.kode`).all()
    .map(x => ({ id: x.jenis_id, kode: x.kode, nama: x.nama, kategori: x.kategori, fields: [] }));
  return rows.concat(extra);
});

// Buat jenis surat otomatis dari template Word agar langsung muncul di
// pilihan "Jenis Surat" pada menu Buat Surat.
function ensureJenisFromWord(kode, nama) {
  const ex = db.prepare('SELECT id FROM jenis_surat WHERE kode=?').get(kode);
  if (ex) {
    db.prepare("UPDATE jenis_surat SET aktif=1 WHERE kode=?").run(kode);
    return ex.id;
  }
  const r = db.prepare("INSERT INTO jenis_surat(kode,nama,kategori,aktif,field_json) VALUES(?,?,?,1,'[]')")
    .run(kode, nama, 'Template Word');
  return Number(r.lastInsertRowid);
}

ipcMain.handle('surat:nextNomor', (_, tanggal, kode) => nextNomor(tanggal, kode));

ipcMain.handle('surat:save', (_, d) => {
  const form = d.form || d.data_form || {};
  const nomor = String(d.nomor ?? d.nomor_surat ?? '').trim();
  const jenis = Number(d.jenis ?? d.jenis_surat_id);
  const pendudukId = Number(d.penduduk ?? d.penduduk_id) || null;
  const tanggal = String(d.tanggal ?? d.tanggal_surat ?? todayISO());
  const keperluan = String(d.keperluan ?? form.keperluan ?? '');
  if (!nomor) throw new Error('Nomor surat wajib diisi.');
  if (!jenis) throw new Error('Jenis surat wajib dipilih.');
  const isEdit = !!(d.id || d.surat_id);
  const editId = d.id || d.surat_id;
  let row;
  if (isEdit) {
    db.prepare('UPDATE surat SET nomor_surat=?,jenis_surat_id=?,penduduk_id=?,tanggal_surat=?,keperluan=?,data_form=? WHERE id=?')
      .run(nomor, jenis, pendudukId, tanggal, keperluan, JSON.stringify(form), editId);
    row = db.prepare('SELECT s.*,j.nama jenis,j.kode kode,p.nik,p.nama nama_penduduk FROM surat s JOIN jenis_surat j ON j.id=s.jenis_surat_id LEFT JOIN penduduk p ON p.id=s.penduduk_id WHERE s.id=?').get(editId);
    db.prepare('DELETE FROM arsip_surat WHERE surat_id=?').run(editId);
  } else {
    const dup = db.prepare('SELECT id FROM surat WHERE nomor_surat=?').get(nomor);
    if (dup) throw new Error('Nomor surat sudah ada: ' + nomor);
    const r = db.prepare('INSERT INTO surat(nomor_surat,jenis_surat_id,penduduk_id,tanggal_surat,keperluan,data_form) VALUES(?,?,?,?,?,?)')
      .run(nomor, jenis, pendudukId, tanggal, keperluan, JSON.stringify(form));
    row = db.prepare('SELECT s.*,j.nama jenis,j.kode kode,p.nik,p.nama nama_penduduk FROM surat s JOIN jenis_surat j ON j.id=s.jenis_surat_id LEFT JOIN penduduk p ON p.id=s.penduduk_id WHERE s.id=?').get(r.lastInsertRowid);
  }
  if (!row) throw new Error('Surat gagal disimpan.');
  db.prepare('INSERT INTO arsip_surat(surat_id,nomor_surat,jenis_surat,nik,nama_penduduk,tanggal_surat,tahun) VALUES(?,?,?,?,?,?,?)')
    .run(row.id, row.nomor_surat, row.jenis, row.nik || '', row.nama_penduduk || '', row.tanggal_surat, String(row.tanggal_surat || '').slice(0, 4) || new Date().getFullYear());
  return row;
});

ipcMain.handle('surat:get', (_, id) => {
  const s = db.prepare('SELECT s.*,j.nama jenis,j.kode kode,p.nik,p.nama nama_penduduk FROM surat s JOIN jenis_surat j ON j.id=s.jenis_surat_id LEFT JOIN penduduk p ON p.id=s.penduduk_id WHERE s.id=?').get(id);
  if (!s) return null;
  try { s.form = JSON.parse(s.data_form || '{}'); } catch { s.form = {}; }
  return s;
});

ipcMain.handle('arsip:list', (_, f = {}) => {
  let s = 'SELECT * FROM arsip_surat WHERE 1=1', p = [];
  if (f.q) { s += ' AND (nomor_surat LIKE ? OR jenis_surat LIKE ? OR nik LIKE ? OR nama_penduduk LIKE ?)'; const q = `%${f.q}%`; p.push(q, q, q, q); }
  if (f.tahun) { s += ' AND tahun=?'; p.push(f.tahun); }
  if (f.dari) { s += ' AND tanggal_surat>=?'; p.push(f.dari); }
  if (f.sampai) { s += ' AND tanggal_surat<=?'; p.push(f.sampai); }
  return db.prepare(s + ' ORDER BY tanggal_surat DESC, id DESC LIMIT 1000').all(...p);
});

ipcMain.handle('settings:get', () =>
  db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get() || {}
);

ipcMain.handle('settings:save', (_, d) => {
  const cur = db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get() || {};
  const p = {
    nama_desa: d.nama_desa ?? cur.nama_desa ?? '',
    kecamatan: d.kecamatan ?? cur.kecamatan ?? '',
    kabupaten: d.kabupaten ?? cur.kabupaten ?? '',
    provinsi: d.provinsi ?? cur.provinsi ?? '',
    alamat: d.alamat ?? cur.alamat ?? '',
    kode_pos: d.kode_pos ?? cur.kode_pos ?? '',
    kepala_desa: d.kepala_desa ?? cur.kepala_desa ?? '',
    nip_kepala_desa: d.nip_kepala_desa ?? cur.nip_kepala_desa ?? '',
    logo_path: d.logo_path ?? cur.logo_path ?? '',
    stempel_path: d.stempel_path ?? cur.stempel_path ?? '',
    tanda_tangan_path: d.tanda_tangan_path ?? cur.tanda_tangan_path ?? '',
    format_nomor: d.format_nomor ?? cur.format_nomor ?? ''
  };
  db.prepare(`UPDATE pengaturan_desa SET nama_desa=@nama_desa,kecamatan=@kecamatan,kabupaten=@kabupaten,provinsi=@provinsi,alamat=@alamat,kode_pos=@kode_pos,kepala_desa=@kepala_desa,nip_kepala_desa=@nip_kepala_desa,logo_path=@logo_path,stempel_path=@stempel_path,tanda_tangan_path=@tanda_tangan_path,format_nomor=@format_nomor WHERE id=1`).run(p);
  return db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get();
});

ipcMain.handle('users:list', () => db.prepare('SELECT id,username,nama,role,aktif FROM pengguna ORDER BY nama').all());

ipcMain.handle('users:save', (_, d) => {
  const username = String(d.username || '').trim();
  const nama = String(d.nama || '').trim();
  const role = d.role || 'Operator';
  const aktif = d.aktif === undefined ? 1 : (d.aktif ? 1 : 0);
  if (!username) throw new Error('Username wajib diisi.');
  if (!nama) throw new Error('Nama wajib diisi.');
  if (d.id) {
    const cur = db.prepare('SELECT username,password FROM pengguna WHERE id=?').get(d.id);
    if (!cur) throw new Error('Pengguna tidak ditemukan.');
    const dup = db.prepare('SELECT id FROM pengguna WHERE username=? AND id<>?').get(username, d.id);
    if (dup) throw new Error('Username sudah digunakan.');
    const pass = (!d.password || d.password === '__unchanged__') ? cur.password : d.password;
    db.prepare('UPDATE pengguna SET username=?,password=?,nama=?,role=?,aktif=? WHERE id=?')
      .run(username, pass, nama, role, aktif, d.id);
    return db.prepare('SELECT id,username,nama,role,aktif FROM pengguna WHERE id=?').get(d.id);
  }
  if (!d.password) throw new Error('Password wajib untuk pengguna baru.');
  const dup = db.prepare('SELECT id FROM pengguna WHERE username=?').get(username);
  if (dup) throw new Error('Username sudah digunakan.');
  const r = db.prepare('INSERT INTO pengguna(username,password,nama,role,aktif) VALUES(?,?,?,?,?)')
    .run(username, d.password, nama, role, aktif);
  return db.prepare('SELECT id,username,nama,role,aktif FROM pengguna WHERE id=?').get(r.lastInsertRowid);
});

ipcMain.handle('users:toggle', (_, id) => {
  if (id === 1) throw new Error('Akun admin utama tidak dapat dinonaktifkan.');
  db.prepare('UPDATE pengguna SET aktif=CASE WHEN aktif=1 THEN 0 ELSE 1 END WHERE id=?').run(id);
  return db.prepare('SELECT id,username,nama,role,aktif FROM pengguna WHERE id=?').get(id);
});

ipcMain.handle('templates:list', () => db.prepare('SELECT * FROM template_surat ORDER BY kode').all());

ipcMain.handle('templates:getByKode', (_, kode) =>
  db.prepare('SELECT * FROM template_surat WHERE kode=? AND aktif=1').get(String(kode ?? '')) || null
);

ipcMain.handle('templates:save', (_, d) => {
  const p = {
    kode: String(d.kode || '').trim(),
    nama: String(d.nama || '').trim(),
    judul: d.judul ?? '',
    isi: d.isi ?? '',
    ukuran_kertas: d.ukuran_kertas || 'A4',
    margin_atas: Number(d.margin_atas ?? 2),
    margin_bawah: Number(d.margin_bawah ?? 2),
    margin_kiri: Number(d.margin_kiri ?? 3),
    margin_kanan: Number(d.margin_kanan ?? 3),
    aktif: d.aktif === undefined ? 1 : (d.aktif ? 1 : 0),
    from_word: d.from_word ? 1 : 0
  };
  if (!p.nama) throw new Error('Nama template wajib diisi.');
  // Kode boleh kosong saat impor Word -> buat kode unik otomatis
  if (!p.kode) {
    let n = 900;
    while (db.prepare('SELECT id FROM template_surat WHERE kode=?').get(String(n))) n++;
    p.kode = String(n);
  }
  if (d.id) {
    const dup = db.prepare('SELECT id FROM template_surat WHERE kode=? AND id<>?').get(p.kode, d.id);
    if (dup) throw new Error('Template dengan kode ' + p.kode + ' sudah ada.');
    db.prepare(`UPDATE template_surat SET kode=@kode,nama=@nama,judul=@judul,isi=@isi,ukuran_kertas=@ukuran_kertas,margin_atas=@margin_atas,margin_bawah=@margin_bawah,margin_kiri=@margin_kiri,margin_kanan=@margin_kanan,aktif=@aktif,from_word=@from_word WHERE id=@id`).run({ ...p, id: d.id });
    if (p.from_word) ensureJenisFromWord(p.kode, p.nama);
    return db.prepare('SELECT * FROM template_surat WHERE id=?').get(d.id);
  }
  const dup = db.prepare('SELECT id FROM template_surat WHERE kode=?').get(p.kode);
  if (dup) throw new Error('Template dengan kode ' + p.kode + ' sudah ada. Silakan edit template yang tersedia.');
  const r = db.prepare('INSERT INTO template_surat(kode,nama,judul,isi,ukuran_kertas,margin_atas,margin_bawah,margin_kiri,margin_kanan,aktif,from_word) VALUES(@kode,@nama,@judul,@isi,@ukuran_kertas,@margin_atas,@margin_bawah,@margin_kiri,@margin_kanan,@aktif,@from_word)').run(p);
  // Template dari Word langsung masuk ke pilihan jenis surat dengan nama filenya
  if (p.from_word) ensureJenisFromWord(p.kode, p.nama);
  return db.prepare('SELECT * FROM template_surat WHERE id=?').get(r.lastInsertRowid);
});

ipcMain.handle('templates:get', (_, id) =>
  db.prepare('SELECT * FROM template_surat WHERE id=?').get(id) || null
);

ipcMain.handle('templates:delete', (_, id) => {
  db.prepare('DELETE FROM template_surat WHERE id=?').run(id);
  return true;
});

// ---------- Import Template dari file Word (.docx) ----------

// Baca isi .docx (ZIP) -> teks per paragraf. Mendukung ZIP mode store & deflate.
function readDocxParagraphs(filePath) {
  const buf = fs.readFileSync(filePath);
  // cari End of Central Directory (signature 0x06054b50) dari belakang
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
    if (/<w:instrText/.test(p)) continue; // skip isi field otomatis (TOC, dll.)
    let text = '';
    for (const rm of p.matchAll(/<w:r(?: [^>]*)?>([\s\S]*?)<\/w:r>/g)) {
      const r = rm[1];
      if (/<w:strike\s*\/?>|<w:strike w:val="(true|1|on)"/i.test(r)) continue; // coret = instruksi, buang
      let t = '';
      for (const tm of r.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g)) t += tm[1];
      for (const im of r.matchAll(/<w:instrText(?: [^>]*)?>([\s\S]*?)<\/w:instrText>/g)) t += ' {{' + im[1].trim() + '}}';
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

// Ubah placeholder model lama Word ({{Nomor}}, {{nama_panjang}}) ke kode aplikasi.
function normalizeDocxPlaceholders(isi) {
  const alias = {
    nomor: 'nomor_surat', nomorsurat: 'nomor_surat', nosurat: 'nomor_surat', no_surat: 'nomor_surat',
    tanggal: 'tanggal_surat', tanggalsurat: 'tanggal_surat', tgl: 'tanggal_surat', tgl_lahir: 'tanggal_lahir',
    ttl: 'tempat_lahir', tempatlahir: 'tempat_lahir', jeniskelamin: 'jenis_kelamin', sex: 'jenis_kelamin',
    nokk: 'no_kk', nik_ktp: 'nik', namalengkap: 'nama', alamatlengkap: 'alamat',
    pekerjaanktp: 'pekerjaan', agamaktp: 'agama', statusperkawinan: 'status_perkawinan',
    pendidikanktp: 'pendidikan', kepaladesa: 'kepala_desa', namakepaladesa: 'kepala_desa'
  };
  const known = new Set([
    'nama', 'nik', 'no_kk', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama',
    'pendidikan', 'pekerjaan', 'status_perkawinan', 'alamat', 'rt', 'rw', 'desa',
    'kecamatan', 'kabupaten', 'provinsi', 'nomor_surat', 'tanggal_surat', 'keperluan',
    'kepala_desa', 'nama_desa'
  ]);
  return String(isi || '').replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (m, raw) => {
    const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
    if (known.has(key)) return '{{' + key + '}}';
    if (alias[key]) return '{{' + alias[key] + '}}';
    return m; // biarkan apa adanya — ditampilkan utuh saat preview
  });
}

// ---------- Auto-fill: ubah teks template Word menjadi placeholder ----------
// Saat data penduduk dipilih, {{nik}}, {{nama}}, dst terisi otomatis di surat.

const WD = '\\s*[:;.]*\\s*'; // pemisah label:nilai khas surat Indonesia

// Label dua kata ("Nama Ayah", "Nama Ibu", "Pengikut 1") -> field dinamis,
// isinya diambil dari form tambahan surat (bukan dari data induk penduduk).
const PAIR_TOKENS = [
  ['NAMA\\s+AYAH', 'ayah'], ['NAMA\\s+IBU', 'ibu'],
  ['NAMA\\s+SUAMI', 'suami'], ['NAMA\\s+ISTRI', 'istri'],
  ['NAMA\\s+PEMOHON', 'pemohon'], ['NAMA\\s+PEMAKAM', 'pemakam'],
  ['NAMA\\s+SAKSI', 'saksi'],
  ['(?:(?:No|NOMOR)\\.?|NIK)\\s+(?:SURAT\\s+)?(?:BESAR|AKTA\\s+KELAHIRAN)', 'no_akta'],
  ['(?:(?:No|NOMOR)\\.?|NIK)\\s+AKTA\\s+KEMATIAN', 'no_akta_mati'],
  ['(?:(?:No|NOMOR)\\.?)\\s+AUK', 'auk'],
  ['(?:(?:No|NOMOR)\\.?|NIK)\\s+IJK[RT]', 'ijk'],
  ['PUKUL', 'pukul'],
  ['(?:No|NOMOR)\\.?\\s+POLRI', 'no_polri'], ['(?:No|NOMOR)\\.?\\s+SERI', 'no_seri'],
  ['(?:No|NOMOR)\\.?\\s+PASPOR', 'paspor'],
  ['(?:No|NOMOR)\\.?\\s+REKENING', 'no_rekening'],
  ['(?:No|NOMOR)\\.?\\s+TL', 'no_tl'],
  ['(?:No|NOMOR)\\.?\\s+SHEET', 'no_sheet'],
  ['(?:No|NOMOR)\\.?\\s+BUKU', 'no_buku'],
  ['(?:No|NOMOR)\\.?\\s+SIM', 'sim'],
  ['(?:No|NOMOR)\\.?\\s+(?:SEPTIKAS|TDP|NPWP)', 'npwp'],
  ['ALASAN\\s+PINDAH', 'alasan_pindah'],
  ['PENGIKUT\\s*(\\d+)', 'pengikut_$1'],
  ['(?:(?:No|NOMOR)\\.?|NIK)\\s+KARTU\\s+(?:SAYA|BERHASIL|GILA|HEBAT)', '__joke__'],
];

// Kata per baris yang menandakan baris tersebut adalah pertanyaan pengisi,
// bukan label identitas -> jangan diisi placeholder penduduk.
const LINE_BLACKLIST = /(anak\\s+ke|jumlah\\s+anak|urutan|berapakah|berapa\\s+orang|cahaya|lembar|kolom|bulan\\s+ke|tahun\\s+anggaran)/i;

// Deteksi blok kop desa pada 8 baris pertama file Word.
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

// Konversi paragraf hasil ekstrak .docx menjadi isi template bersetempat
// dengan placeholder {{...}} milik aplikasi.
function wordParasToTemplate(paras, settings) {
  const s = settings || {};
  // Kata kunci kop lama yang diganti dengan placeholder Pengaturan Desa.
  // Nilai default memakai data dari template desa bawaan (Desa Pusar).
  const def = {
    nama_desa: 'PUSAR', kecamatan: 'BATURAJA BARAT', kabupaten: 'OGAN KOMERING ULU',
    provinsi: 'SUMATERA SELATAN'
  };
  const val = k => String(s[k] ?? '').trim() || def[k];
  const escR = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1) buang blok kop lama (aplikasi mencetak kop dari Pengaturan Desa)
  const kopEnd = detectKopBlock(paras);
  let body = paras.slice(kopEnd).map(t => String(t || '').replace(/\t/g, ' ').replace(/[ \u00A0]+/g, ' ').trim());

  // 2) ganti penyebutan desa/kabupaten/kecamatan/provinsi/kades lama
  //    menjadi placeholder -> otomatis mengikuti Pengaturan Desa Anda
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
  addRep(new RegExp('(?:PROV|PROPINSI|PROP)\\.?\\s+' + escR(dProv) + '\\b', 'gi'), 'Provinsi {{provinsi}}');
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

  // 3) sisipkan placeholder sesuai label identitas warga
  function inject(line) {
    if (LINE_BLACKLIST.test(line)) return line;
    let t = line;
    for (const [re, ph] of setReps) t = t.replace(re, ph);
    if (/^ZAINUDDIN$/i.test(t.trim())) t = t.replace(/^ZAINUDDIN$/i, '{{kepala_desa}}');
    const L = t.toUpperCase();
    const put = re => re.lastIndex = 0, has = re => (put(re), re.test(t));
    const atEnd = v => !L.slice(L.indexOf(v) + v.length).trim();

    // NIK KTP harus dicek sebelum "NIK" berdiri sendiri
    if (has(new RegExp('NIK\\s+KTP' + WD))) {
      t = t.replace(new RegExp('NIK\\s+KTP' + WD, 'i'), 'NIK KTP\t: {{nik}}');
      return t;
    }
    if (has(new RegExp('NAMA?\\s+KK' + WD))) { t = t.replace(new RegExp('NAMA?\\s+KK' + WD, 'i'), 'No KK\t: {{no_kk}}'); return t; }
    if (has(new RegExp('(?:No|NOMOR)\\.?\\s*(?:KK|KARTU\\s+KELUARGA)' + WD))) { t = t.replace(new RegExp('(?:No|NOMOR)\\.?\\s*(?:KK|KARTU\\s+KELUARGA)' + WD, 'i'), 'No KK\t: {{no_kk}}'); return t; }
    if (has(new RegExp('TEMPAT\\s*/?\\s*(?:TGL\\.?|TANGGAL)\\s+LAHIR' + WD))) { t = t.replace(new RegExp('TEMPAT\\s*/?\\s*(?:TGL\\.?|TANGGAL)\\s+LAHIR' + WD, 'i'), 'Tempat/Tanggal Lahir\t: {{tempat_lahir}}, {{tanggal_lahir}}'); return t; }
    if (has(new RegExp('TANGGAL\\s+LAHIR' + WD))) { t = t.replace(new RegExp('TANGGAL\\s+LAHIR' + WD, 'i'), 'Tanggal Lahir\t: {{tanggal_lahir}}'); return t; }
    if (has(new RegExp('TGL\\.?\\s+LAHIR' + WD))) { t = t.replace(new RegExp('TGL\\.?\\s+LAHIR' + WD, 'i'), 'Tgl Lahir\t: {{tanggal_lahir}}'); return t; }
    if (has(new RegExp('TEMPAT\\s+LAHIR' + WD))) { t = t.replace(new RegExp('TEMPAT\\s+LAHIR' + WD, 'i'), 'Tempat Lahir\t: {{tempat_lahir}}'); return t; }
    if (has(new RegExp('JENIS\\s+KELAMIN' + WD))) { t = t.replace(new RegExp('JENIS\\s+KELAMIN' + WD, 'i'), 'Jenis Kelamin\t: {{jenis_kelamin}}'); return t; }
    if (has(new RegExp('STATUS\\s+PERKAWINAN' + WD))) { t = t.replace(new RegExp('STATUS\\s+PERKAWINAN' + WD, 'i'), 'Status Perkawinan\t: {{status_perkawinan}}'); return t; }
    if (has(new RegExp('KEWARGANEGARAAN' + WD))) { t = t.replace(new RegExp('KEWARGANEGARAAN' + WD, 'i'), 'Kewarganegaraan\t: {{kewarganegaraan}}'); return t; }
    if (has(new RegExp('NAMA\\s+LENGKAP' + WD))) { t = t.replace(new RegExp('NAMA\\s+LENGKAP' + WD, 'i'), 'Nama Lengkap\t: {{nama}}'); return t; }
    if (has(new RegExp('ALAMAT\\s+(?:ASAL|KTP|PINDAH|TEMPAT\\s+TINGGAL)' + WD))) return t; // biarkan — diisi lewat form
    if (has(new RegExp('(?:No|NOMOR)\\.?\\s*KTP' + WD))) { t = t.replace(new RegExp('(?:No|NOMOR)\\.?\\s*KTP' + WD, 'i'), 'No KTP\t: {{nik}}'); return t; }
    if (has(new RegExp('(?:No|NOMOR)\\.?\\s+KK' + WD))) { t = t.replace(new RegExp('(?:No|NOMOR)\\.?\\s+KK' + WD, 'i'), 'No KK\t: {{no_kk}}'); return t; }

    // label dua kata -> field dinamis (ayah/ibu/pukul/alasan_pindah/dst)
    for (const [re, ph] of PAIR_TOKENS) {
      const R = new RegExp('(' + re + ')' + WD, 'i');
      const m = t.match(R);
      if (m) {
        if (ph === '__joke__') return t;
        if (ph.startsWith('__alamat')) return t;
        const name = m[1].replace(/\s+/g, ' ').trim().toLowerCase().replace(/\s+/g, '_');
        t = t.replace(R, m[1] + '\t: {{' + name + '}}');
        return t;
      }
    }

    if (has(new RegExp('AGAMA' + WD))) { t = t.replace(new RegExp('AGAMA' + WD, 'i'), 'Agama\t: {{agama}}'); return t; }
    if (has(new RegExp('PEKERJAAN' + WD))) { t = t.replace(new RegExp('PEKERJAAN' + WD, 'i'), 'Pekerjaan\t: {{pekerjaan}}'); return t; }
    if (has(new RegExp('PENDIDIKAN' + WD))) { t = t.replace(new RegExp('PENDIDIKAN' + WD, 'i'), 'Pendidikan\t: {{pendidikan}}'); return t; }
    if (has(new RegExp('ALAMAT' + WD))) { t = t.replace(new RegExp('ALAMAT' + WD, 'i'), 'Alamat\t: {{alamat}} RT {{rt}} RW {{rw}}'); return t; }
    if (has(new RegExp('RT\\s*/?\\s*(?:RW)?' + WD))) { t = t.replace(new RegExp('RT\\s*/?\\s*(?:RW)?' + WD, 'i'), 'RT/RW\t: {{rt}} / {{rw}}'); return t; }
    if (has(new RegExp('KECAMATAN' + WD))) { t = t.replace(new RegExp('KECAMATAN' + WD, 'i'), 'Kecamatan\t: {{kecamatan_pindah}}'); return t; }
    if (has(new RegExp('KABUPATEN' + WD))) { t = t.replace(new RegExp('KABUPATEN' + WD, 'i'), 'Kabupaten\t: {{kabupaten_pindah}}'); return t; }
    if (has(new RegExp('PROV(?:INSI)?' + WD))) { t = t.replace(new RegExp('PROV(?:INSI)?' + WD, 'i'), 'Provinsi\t: {{provinsi_pindah}}'); return t; }

    // Nama berdiri sendiri (label atau "Nama :" kosong)
    if (has(new RegExp('(^|\\b)NAMA\\b' + WD))) {
      t = t.replace(new RegExp('(^|\\b)NAMA\\b' + WD, 'i'), (mm, pre) => pre + 'Nama\t: {{nama}}');
      return t;
    }
    if (has(new RegExp('\\bNIK\\b' + WD))) { t = t.replace(new RegExp('\\bNIK\\b' + WD, 'i'), 'NIK\t: {{nik}}'); return t; }

    // tanggal/hari/pukul peristiwa (kematian, kelahiran, pindah)
    if (/^TANGGAL\b/.test(L)) {
      const rest = L.slice('TANGGAL'.length);
      if (!/LAHIR|SURAT|LAHIR/.test(rest) && !/\{\{/.test(t)) t = t.replace(/^TANGGAL\b[\s.:;]*/i, 'Tanggal\t: {{tanggal_peristiwa}}');
      return t;
    }
    if (/^PADA\s+TANGGAL\b/.test(L) && !/\{\{/.test(t)) t = t.replace(/^PADA\s+TANGGAL\b[\s.:;]*/i, 'Pada Tanggal\t: {{tanggal_peristiwa}}');
    if (/^PADA\s+TANGGAL\s*:/.test(t) && !/\{\{/.test(t)) t = 'Pada Tanggal\t: {{tanggal_surat}}';
    if (/^DI\s+KELUARKAN\b/.test(L) || /^DIKELUARKAN\b/.test(L)) {
      t = t.replace(/^DI\s*KELUARKAN(\s+DI)?[\s.:;]*/i, 'Dikeluarkan di\t: ');
      if (!/\{\{|\.{3}/.test(t)) t += '{{nama_desa}}';
      return t;
    }
    if (/^BERTAMPAT\s+DI\b/.test(L) && !/\{\{/.test(t)) t = t.replace(/^BERTAMPAT\s+DI[\s.:;]*/i, 'Bertempat di\t: {{tempat_peristiwa}}');
    if (/^TEMPAT\b/.test(L) && !/\{\{|LAHIR|TANGGAL|TINGGAL/.test(L) && !/\{\{/.test(t)) t = t.replace(/^TEMPAT[\s.:;]*/i, 'Tempat\t: {{tempat_peristiwa}}');
    if (/^HARI\b/.test(L) && !/\{\{/.test(t)) t = t.replace(/^HARI[\s.:;]*/i, 'Hari\t: {{hari_peristiwa}}');
    if (/^NAMA\s+TERSEBUT\b|^BENAR\s+NAMA|^MEMANG\b|^YANG\b/.test(L)) return t;
    return t;
  }

  body = body.map(inject);

  // 4) blok tanda tangan: ganti kota & tanggal manual, tambahkan nama Kades
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
      // pastikan ada baris nama kepala desa setelahnya
      const next = (body[i + 1] || '').trim();
      if (!next || /^\.{4,}|^_{4,}/.test(next)) body[i + 1] = '{{kepala_desa}}';
      else if (!/\{\{kepala_desa\}\}|ZAINUDDIN/i.test(next) && !/^{/.test(next)) body.splice(i + 1, 0, '{{kepala_desa}}');
    }
  }

  // 5) buang titik-titik isian yang masih tersisa
  body = body.map(l => l.replace(/[ \t]{2,}/g, ' ').replace(/\s*\.{5,}\s*/g, ' ').replace(/\s*_{5,}\s*/g, ' ').trim());

  // 6) susun ulang: judul + nomor otomatis dari aplikasi, lalu isi bersih
  const { title } = detectTitleNomor(body.filter(Boolean));
  const withoutDupTitle = body.filter(l => l && !(title && l.toUpperCase() === title.toUpperCase()));
  const head = [];
  if (title) head.push(title.toUpperCase());
  head.push('Nomor : {{nomor_surat}}');
  head.push('');
  return head.concat(withoutDupTitle).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// Tebak judul & nomor surat dari paragraf awal dokumen Word.
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

// Folder "template surat desa" bawaan aplikasi (tempat Anda menaruh file Word).
function getDesaTemplateDir() {
  const roots = [app.getAppPath(), path.resolve(__dirname, '..')];
  const names = ['template surat desa', 'templates/template surat desa'];
  for (const root of roots) {
    for (const n of names) {
      const p = path.join(root, n);
      try { if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p; } catch (e) { /* skip */ }
    }
  }
  return '';
}

// Kode jenis surat tetap untuk nama file tertentu (agar tidak dobel dengan seed),
// sisanya dibuatkan kode otomatis dari nama file.
const DESA_FILE_KODE = {
  'surat keterangan domisili new': '01',
  'surat pindah new': '04',
  'surat keterangan kelahiran': '07',
  'surat ket kematian': '08',
  'surat keterangan usaha new': '13',
  'surat keterangan tidak mampu': '19',
  'surat keterangan tidak mampu (kis)': '19-KIS',
  'surat keterangan tidak mampu pelajar (kip)': '19-KIP'
};

function normFileName(s) {
  return String(s).toLowerCase().replace(/\.(docx|doc|rtf)$/i, '').trim();
}

// Sinkron otomatis: setiap file .docx di folder "template surat desa"
// dimasukkan/diperbarui sebagai template surat saat aplikasi start.
function syncDesaTemplateFolder() {
  const dir = getDesaTemplateDir();
  if (!dir) return 0;
  let files;
  try { files = fs.readdirSync(dir); } catch (e) { return 0; }
  const docxFiles = files.filter(f => /\.docx$/i.test(f));
  let count = 0;
  for (const f of docxFiles) {
    let paras;
    try { paras = readDocxParagraphs(path.join(dir, f)); } catch (e) { continue; }
    if (!paras.filter(t => t.trim() !== '').length) continue;
    let isi;
    try { isi = wordParasToTemplate(paras, getSettings()); } catch (e) { continue; }
    if (!isi || !/\{\{/.test(isi)) continue;

    const baseName = f.replace(/\.docx$/i, '');
    const niceName = baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase();
    const fixedKode = DESA_FILE_KODE[normFileName(f)];
    const { title } = detectTitleNomor(paras.filter(t => t.trim()));
    const judul = (title || niceName).toUpperCase();

    if (fixedKode) {
      const row = db.prepare('SELECT id FROM template_surat WHERE kode=?').get(fixedKode);
      if (row) {
        db.prepare('UPDATE template_surat SET nama=?, judul=?, isi=?, aktif=1 WHERE kode=?')
          .run(niceName, judul, isi, fixedKode);
        count++;
        continue;
      }
    }

    // cari template hasil impor file yang sama sebelumnya (nama file = nama template)
    const prev = db.prepare('SELECT id FROM template_surat WHERE from_word=1 AND lower(nama)=?').get(niceName.toLowerCase());
    if (prev) {
      db.prepare('UPDATE template_surat SET judul=?, isi=?, aktif=1 WHERE id=?').run(judul, isi, prev.id);
      count++;
      continue;
    }

    let kode = String(baseName).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'WORD';
    if (fixedKode) kode = fixedKode;
    let uniq = kode, i = 2;
    while (db.prepare('SELECT id FROM template_surat WHERE kode=?').get(uniq) || db.prepare('SELECT id FROM jenis_surat WHERE kode=?').get(uniq)) {
      uniq = kode + '_' + i++;
    }
    const r = db.prepare(`INSERT INTO template_surat(kode,nama,judul,isi,ukuran_kertas,margin_atas,margin_bawah,margin_kiri,margin_kanan,aktif,from_word)
      VALUES(?,?,?,?, 'A4', 2, 2, 3, 3, 1, 1)`).run(uniq, niceName, judul, isi);
    ensureJenisFromWord(uniq, niceName);
    void r;
    count++;
  }
  if (count) console.log(`Sinkron folder "template surat desa": ${count} template diperbarui/dibuat.`);
  return count;
}

ipcMain.handle('templates:importWord', async (e) => {
  const win = BrowserWindow.fromWebContents(e.sender) || undefined;
  const r = await dialog.showOpenDialog(win, {
    title: 'Pilih File Word (.docx) untuk Template',
    filters: [{ name: 'Microsoft Word', extensions: ['docx'] }],
    properties: ['openFile']
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const src = r.filePaths[0];
  let paras;
  try {
    paras = readDocxParagraphs(src);
  } catch (err) {
    throw new Error('Gagal membaca file Word: ' + (err?.message || err));
  }
  const nonEmpty = paras.filter(t => t.trim() !== '');
  if (!nonEmpty.length) throw new Error('Dokumen Word kosong atau tidak ada paragraf teks yang dapat diekstrak.');
  const baseName = path.basename(src).replace(/\.docx$/i, '');
  // Kode unik dari nama file Word: huruf/digit, dipendekkan, anti duplikat.
  let kode = String(baseName).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'WORD';
  let uniq = kode, i = 2;
  while (db.prepare('SELECT id FROM template_surat WHERE kode=?').get(uniq) || db.prepare('SELECT id FROM jenis_surat WHERE kode=?').get(uniq)) {
    uniq = kode + '_' + i++;
  }
  kode = uniq;
  const { title, nomor } = detectTitleNomor(nonEmpty);
  // Ubah isi Word menjadi template bersetempat: kop diganti placeholder
  // pengaturan desa + label data warga diisi {{nik}} {{nama}} dst sehingga
  // terisi OTOMATIS saat data penduduk dipilih di menu Buat Surat.
  let isi;
  try {
    isi = wordParasToTemplate(paras, getSettings());
  } catch (err) {
    // fallback: cara lama (buang judul/nomor, gabung paragraf)
    const cleanParas = paras.map(t => String(t || '').trim()).filter(t => t && t !== title && t !== nomor);
    isi = normalizeDocxPlaceholders(cleanParas.join('\n')).replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');
  }
  return {
    fileName: baseName,
    guessedKode: kode,
    title,
    nomor,
    isi
  };
});

ipcMain.handle('backup', async () => {
  const r = await dialog.showSaveDialog({ title: 'Backup Database', defaultPath: `backup-desa-${todayISO()}.db` });
  if (r.canceled) return null;
  await db.backup(r.filePath);
  db.prepare('INSERT INTO backup_log(file_path) VALUES(?)').run(r.filePath);
  return r.filePath;
});

ipcMain.handle('restore', async () => {
  const r = await dialog.showOpenDialog({ title: 'Restore Database', filters: [{ name: 'Database', extensions: ['db'] }], properties: ['openFile'] });
  if (r.canceled) return null;
  const current = db.name;
  db.close();
  fs.copyFileSync(r.filePaths[0], current);
  db = new Database(current);
  db.pragma('journal_mode = WAL');
  migrate(); // DB lama hasil restore mungkin belum punya kolom baru
  return r.filePaths[0];
});

// ---------- Export Surat (Cetak / PDF / Word) ----------

// CSS khusus dokumen: hasil PDF/Word rapi A4, tidak ikut gaya aplikasi.
const LETTER_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #111; }
  .sheet { width: 210mm; min-height: 297mm; padding: 20mm 25mm 25mm 30mm; background: #fff; }
  .kop { text-align: center; line-height: 1.35; padding-bottom: 10px; border-bottom: 3px double #111; margin-bottom: 24px; }
  .kop-text { display: inline-block; vertical-align: middle; }
  .kop img.logo { height: 70px; width: auto; margin-right: 16px; vertical-align: middle; }
  .kop .l1 { font-size: 14pt; font-weight: bold; letter-spacing: .5px; }
  .kop .l2 { font-size: 12pt; font-weight: bold; }
  .kop .l3 { font-size: 10.5pt; margin-top: 2px; }
  .letter-title { text-align: center; text-decoration: underline; font-size: 13pt; font-weight: bold; margin: 20px 0 4px; text-transform: uppercase; }
  .letter-number { text-align: center; margin: 0 0 22px; font-size: 12pt; }
  .letter-body { line-height: 1.7; text-align: justify; }
  .letter-body p { margin: 0 0 8px; }
  .signature { text-align: right; margin-top: 60px; line-height: 1.5; }
  .signature .ttd-space { height: 75px; position: relative; }
  .signature img.ttd { max-height: 75px; max-width: 160px; position: absolute; right: 10px; bottom: -12px; }
  .signature img.stempel { max-height: 85px; position: absolute; left: -10px; bottom: -18px; opacity: .95; }
`;

// Konversi path file gambar lokal menjadi data URI base64 agar logo/stempel/
// tanda tangan ikut tampil di jendela tak terlihat saat render PDF, dan juga
// saat dibuka di Microsoft Word.
function imageToDataUri(p) {
  try {
    const raw = String(p || '').trim();
    if (!raw) return '';
    // sudah berupa data URI? pakai apa adanya
    if (/^data:image\//i.test(raw)) return raw;
    let fp = raw.replace(/^file:\/\/\/?/i, '');
    try { fp = decodeURIComponent(fp); } catch (e) { /* biarkan */ }
    if (!path.isAbsolute(fp)) fp = path.resolve(fp);
    if (!fs.existsSync(fp)) return '';
    const ext = path.extname(fp).toLowerCase();
    const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp' }[ext] || 'application/octet-stream';
    return `data:${mime};base64,${fs.readFileSync(fp).toString('base64')}`;
  } catch (e) {
    return '';
  }
}

// Bangun HTML surat lengkap dari isi preview + pengaturan desa.
function buildLetterHtml(contentHtml, settings) {
  const s = settings || {};
  const logo = imageToDataUri(s.logo_path);
  const stempel = imageToDataUri(s.stempel_path);
  const ttd = imageToDataUri(s.tanda_tangan_path);

  const kop = `
    <div class="kop">
      ${logo ? `<img class="logo" src="${logo}" alt="Logo">` : ''}
      <div class="kop-text">
        <div class="l1">PEMERINTAH KABUPATEN ${escHtml(String(s.kabupaten || '').toUpperCase())}</div>
        <div class="l2">KECAMATAN ${escHtml(String(s.kecamatan || '').toUpperCase())}</div>
        <div class="l2">DESA ${escHtml(String(s.nama_desa || '').toUpperCase())}</div>
        <div class="l3">${escHtml(s.alamat || '')}${s.kode_pos ? ', Kode Pos ' + escHtml(s.kode_pos) : ''}</div>
      </div>
    </div>`;

  let body = String(contentHtml || '');
  // sisipkan gambar tanda tangan & stempel di area tanda tangan
  if (ttd || stempel) {
    body = body.replace(
      /(<div class="signature">)/,
      `$1<div class="ttd-space">${stempel ? `<img class="stempel" src="${stempel}" alt="">` : ''}${ttd ? `<img class="ttd" src="${ttd}" alt="">` : ''}</div>`
    );
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Surat</title>
<style>${LETTER_CSS}</style>
</head>
<body><div class="sheet">${kop}
${body}
</div></body>
</html>`;
}

function escHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// Nama file aman dari karakter ilegal Windows/Linux.
function safeFileName(name, ext) {
  let n = String(name || 'surat').trim();
  n = n.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '-').slice(0, 120) || 'surat';
  return `${n}.${ext}`;
}

async function getSettings() {
  try {
    return db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get() || {};
  } catch (e) {
    return {};
  }
}

// Simpan HTML sementara agar gambar (logo/stempel/ttd) ikut termuat saat render.
function writeTempHtml(html) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'banuakita-'));
  const f = path.join(dir, 'surat.html');
  fs.writeFileSync(f, html, 'utf8');
  return f;
}

// Render HTML surat ke PDF via jendela tak terlihat (isi penuh, bukan layar aplikasi).
async function renderPdf(html) {
  const w = new BrowserWindow({
    show: false,
    width: 820,
    webPreferences: { sandbox: true }
  });
  let tmpFile = null;
  try {
    tmpFile = writeTempHtml(html);
    await w.loadFile(tmpFile);
    const buf = await w.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      preferCSSPageSize: true
    });
    return buf;
  } finally {
    w.destroy();
    if (tmpFile) { try { fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true }); } catch (e2) {} }
  }
}

ipcMain.handle('print', async (e, payload) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (payload && payload.html) {
    // cetak lewat jendela dokumen terpisah agar hasilnya sama dengan PDF
    const dw = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
    const tmpFile = writeTempHtml(buildLetterHtml(payload.html, payload.settings));
    await dw.loadFile(tmpFile);
    return new Promise(res => {
      dw.webContents.print({ silent: false, printBackground: true }, ok => {
        dw.destroy();
        try { fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true }); } catch (e2) {}
        res(ok);
      });
      dw.on('closed', () => res(false));
    });
  }
  return new Promise(res => w.webContents.print({ silent: false, printBackground: true }, ok => res(ok)));
});

ipcMain.handle('pdf', async (e, payload = {}) => {
  const win = BrowserWindow.fromWebContents(e.sender) || undefined;
  const contentHtml = (payload && payload.html) || '';
  if (!String(contentHtml).trim()) throw new Error('Konten surat kosong, buat preview terlebih dahulu.');
  const settings = payload.settings || await getSettings();
  const defName = safeFileName(payload.fileName || 'surat', 'pdf');
  const r = await dialog.showSaveDialog(win, { title: 'Simpan PDF', defaultPath: defName, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (r.canceled || !r.filePath) return null;
  let buf;
  try {
    buf = await renderPdf(buildLetterHtml(contentHtml, settings));
  } catch (err) {
    throw new Error('Gagal merender PDF: ' + (err?.message || err));
  }
  if (!buf || !buf.length) throw new Error('Hasil PDF kosong, silakan coba lagi.');
  try {
    fs.writeFileSync(r.filePath, buf);
  } catch (err) {
    throw new Error('Gagal menyimpan PDF: ' + (err?.message || err));
  }
  try { shell.showItemInFolder(r.filePath); } catch (e2) { /* abaikan */ }
  return r.filePath;
});

// ---------- Sinkron folder "template surat desa" dari menu aplikasi ----------
ipcMain.handle('templates:syncDesaFolder', () => {
  const dir = getDesaTemplateDir();
  if (!dir) {
    throw new Error('Folder "template surat desa" tidak ditemukan di folder aplikasi.');
  }
  let n = 0;
  try { n = syncDesaTemplateFolder(); } catch (e) {
    throw new Error('Gagal sinkron folder: ' + (e?.message || e));
  }
  return { dir, count: n };
});

ipcMain.handle('word', async (e, payload = {}) => {
  // dukung pemanggilan lama: word(htmlString)
  const htmlArg = typeof payload === 'string' ? { html: payload } : (payload || {});
  const contentHtml = htmlArg.html || '';
  if (!String(contentHtml).trim()) throw new Error('Konten surat kosong, buat preview terlebih dahulu.');
  const win = BrowserWindow.fromWebContents(e.sender) || undefined;
  const settings = htmlArg.settings || await getSettings();
  const defName = safeFileName(htmlArg.fileName || 'surat', 'docx');
  const r = await dialog.showSaveDialog(win, { title: 'Simpan Word', defaultPath: defName, filters: [{ name: 'Microsoft Word', extensions: ['docx'] }] });
  if (r.canceled || !r.filePath) return null;
  let doc;
  try {
    doc = buildWordDoc(contentHtml, settings);
  } catch (err) {
    throw new Error('Gagal membuat Word: ' + (err?.message || err));
  }
  if (!doc || !doc.length) throw new Error('Hasil Word kosong, silakan coba lagi.');
  fs.writeFileSync(r.filePath, doc);
  try { shell.showItemInFolder(r.filePath); } catch (e2) { /* abaikan */ }
  return r.filePath;
});

// ---------- Word (.docx) : bangun paket OOXML minimal tanpa dependency ----------

function xmlEscape(v) {
  return String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// HTML -> daftar run Word sederhana (bold/underline per bagian teks).
function htmlRunsToText(html) {
  // ganti tag <br> jadi newline, buang tag lain
  let t = String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  t = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return t;
}

function paraXml(text, opts = {}) {
  const runs = [];
  // pisahkan bagian **bold** dan __underline__ sederhana bila ada
  const parts = String(text).split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);
  for (const p of parts) {
    let txt = p, bold = !!opts.bold, underline = !!opts.underline;
    if (/^\*\*[\s\S]+\*\*$/.test(p)) { txt = p.slice(2, -2); bold = true; }
    else if (/^__[\s\S]+__$/.test(p)) { txt = p.slice(2, -2); underline = true; }
    const lines = txt.split('\n');
    lines.forEach((ln, i) => {
      const rPr = [];
      if (bold) rPr.push('<w:b/>');
      if (underline) rPr.push('<w:u w:val="single"/>');
      runs.push(`<w:r>${rPr.length ? `<w:rPr>${rPr.join('')}</w:rPr>` : ''}${i > 0 ? '<w:br/>' : ''}<w:t xml:space="preserve">${xmlEscape(ln)}</w:t></w:r>`);
    });
  }
  const pPr = [];
  if (opts.align) pPr.push(`<w:jc w:val="${opts.align}"/>`);
  if (opts.spaceAfter != null) pPr.push(`<w:spacing w:after="${opts.spaceAfter}"/>`);
  return `<w:p>${pPr.length ? `<w:pPr>${pPr.join('')}</w:pPr>` : ''}${runs.join('')}</w:p>`;
}

function buildWordDoc(contentHtml, settings) {
  const s = settings || {};
  const body = String(contentHtml || '');

  const paragraphs = [];

  // KOP SURAT
  const upper = v => String(v || '').toUpperCase();
  paragraphs.push(paraXml(`PEMERINTAH KABUPATEN ${upper(s.kabupaten)}`, { align: 'center', bold: true, spaceAfter: 0 }));
  paragraphs.push(paraXml(`KECAMATAN ${upper(s.kecamatan)}`, { align: 'center', bold: true, spaceAfter: 0 }));
  paragraphs.push(paraXml(`DESA ${upper(s.nama_desa)}`, { align: 'center', bold: true, spaceAfter: 0 }));
  if (s.alamat) paragraphs.push(paraXml(s.alamat + (s.kode_pos ? `, Kode Pos ${s.kode_pos}` : ''), { align: 'center', spaceAfter: 240 }));
  else paragraphs.push(paraXml('', { align: 'center', spaceAfter: 240 }));
  // garis ganda kop disimulasikan dengan paragrais bergaris bawah ganda
  paragraphs.push(`<w:p><w:pPr><w:pBdr><w:bottom w:val="double" w:sz="10" w:space="1" w:color="000000"/></w:pBdr><w:spacing w:after="360"/></w:pPr></w:p>`);

  // JUDUL & NOMOR dari konten
  const titleM = body.match(/<h3[^>]*class="letter-title"[^>]*>([\s\S]*?)<\/h3>/i);
  const nomorM = body.match(/<p[^>]*class="letter-number"[^>]*>([\s\S]*?)<\/p>/i);
  if (titleM) paragraphs.push(paraXml(htmlRunsToText(titleM[1]), { align: 'center', bold: true, underline: true, spaceAfter: 60 }));
  if (nomorM) paragraphs.push(paraXml(htmlRunsToText(nomorM[1]), { align: 'center', spaceAfter: 360 }));

  // ISI (setiap <p>/<br> jadi paragraf)
  const bodyM = body.match(/<div[^>]*class="letter-body"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="signature"/i);
  const bodyHtml = bodyM ? bodyM[1] : body.replace(/<div[^>]*class="kop"[^>]*>[\s\S]*?<\/div>/i, '').replace(/<h3[^>]*>[\s\S]*?<\/h3>/i, '').replace(/<p[^>]*class="letter-number"[^>]*>[\s\S]*?<\/p>/i, '').replace(/<div[^>]*class="signature"[^>]*>[\s\S]*?<\/div>/i, '');
  // pisahkan per <p>...</p>; isi di luar <p> dianggap paragraf terpisah
  const chunks = bodyHtml
    .replace(/<p([^>]*)>/gi, '\u0001P$1>').replace(/<\/p>/gi, '\u0001')
    .split('\u0001').filter(c => c.trim() !== '');
  for (const c of chunks) {
    const isNoIndent = /text-align:\s*(center|right)/i.test(c);
    paragraphs.push(paraXml(htmlRunsToText(c), { align: isNoIndent ? 'center' : 'both', spaceAfter: 120 }));
  }

  // TANDA TANGAN
  const sigM = body.match(/<div[^>]*class="signature"[^>]*>([\s\S]*?)<\/div>/i);
  if (sigM) {
    const sigLines = htmlRunsToText(sigM[1]).split('\n').map(l => l.trim()).filter(Boolean);
    sigLines.forEach((ln, i) => {
      const last = i === sigLines.length - 1;
      paragraphs.push(paraXml(ln, { align: 'right', bold: last, underline: last, spaceAfter: 0 }));
      if (i === 0) { paragraphs.push(paraXml('', { spaceAfter: 0 })); paragraphs.push(paraXml('', { spaceAfter: 0 })); paragraphs.push(paraXml('', { spaceAfter: 0 })); }
    });
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${paragraphs.join('\n')}
<w:sectPr><pgSz w:w="11906" w:h="16838"/><pgMar w:top="1134" w:right="1417" w:bottom="1417" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>
</w:body>
</w:document>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
</w:styles>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const entries = [
    ['[Content_Types].xml', contentTypes],
    ['_rels/.rels', rels],
    ['word/document.xml', documentXml],
    ['word/_rels/document.xml.rels', docRels],
    ['word/styles.xml', stylesXml]
  ];

  return zipStore(entries);
}

// ZIP (store) minimal — cukup untuk .docx yang dibaca Word/LibreOffice.
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}

function zipStore(entries) {
  const chunksLocal = [], chunksCentral = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

  for (const [nameStr, contentStr] of entries) {
    const name = Buffer.from(nameStr, 'utf8');
    const data = Buffer.from(String(contentStr), 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);          // version needed
    local.writeUInt16LE(0x0800, 6);      // UTF-8 flag
    local.writeUInt16LE(0, 8);           // method: store
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunksLocal.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    chunksCentral.push(central, name);

    offset += 30 + name.length + data.length;
  }

  const centralBuf = Buffer.concat(chunksCentral);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...chunksLocal, centralBuf, end]);
}

app.whenReady().then(() => {
  try {
    init();
  } catch (e) {
    console.error('Database init failed:', e);
    dialog.showErrorBox(
      'BanuaKita - Gagal Memuat Database',
      'Aplikasi tidak dapat membuka database lokal.\n\n' + (e?.message || e) +
      '\n\nCoba hapus folder data aplikasi lalu jalankan ulang.'
    );
  }
  win();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
