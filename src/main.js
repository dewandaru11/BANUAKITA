const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
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
  ensureAdmin();
}

// Migrasi ringan: tambah kolom baru jika DB lama belum punya
function migrate() {
  const cols = db.prepare('PRAGMA table_info(penduduk)').all().map(c => c.name);
  if (!cols.includes('ktp_path')) {
    db.prepare("ALTER TABLE penduduk ADD COLUMN ktp_path TEXT DEFAULT ''").run();
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

ipcMain.handle('surat:types', () =>
  db.prepare('SELECT id,kode,nama,kategori,field_json FROM jenis_surat WHERE aktif=1 ORDER BY CAST(kode AS INTEGER),kode')
    .all().map(x => ({ ...x, fields: JSON.parse(x.field_json || '[]') }))
);

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
    aktif: d.aktif === undefined ? 1 : (d.aktif ? 1 : 0)
  };
  if (!p.kode || !p.nama) throw new Error('Kode dan Nama template wajib diisi.');
  if (d.id) {
    const dup = db.prepare('SELECT id FROM template_surat WHERE kode=? AND id<>?').get(p.kode, d.id);
    if (dup) throw new Error('Template dengan kode ' + p.kode + ' sudah ada.');
    db.prepare(`UPDATE template_surat SET kode=@kode,nama=@nama,judul=@judul,isi=@isi,ukuran_kertas=@ukuran_kertas,margin_atas=@margin_atas,margin_bawah=@margin_bawah,margin_kiri=@margin_kiri,margin_kanan=@margin_kanan,aktif=@aktif WHERE id=@id`).run({ ...p, id: d.id });
    return db.prepare('SELECT * FROM template_surat WHERE id=?').get(d.id);
  }
  const dup = db.prepare('SELECT id FROM template_surat WHERE kode=?').get(p.kode);
  if (dup) throw new Error('Template dengan kode ' + p.kode + ' sudah ada. Silakan edit template yang tersedia.');
  const r = db.prepare('INSERT INTO template_surat(kode,nama,judul,isi,ukuran_kertas,margin_atas,margin_bawah,margin_kiri,margin_kanan,aktif) VALUES(@kode,@nama,@judul,@isi,@ukuran_kertas,@margin_atas,@margin_bawah,@margin_kiri,@margin_kanan,@aktif)').run(p);
  return db.prepare('SELECT * FROM template_surat WHERE id=?').get(r.lastInsertRowid);
});

ipcMain.handle('templates:get', (_, id) =>
  db.prepare('SELECT * FROM template_surat WHERE id=?').get(id) || null
);

ipcMain.handle('templates:delete', (_, id) => {
  db.prepare('DELETE FROM template_surat WHERE id=?').run(id);
  return true;
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
  return r.filePaths[0];
});

ipcMain.handle('print', async (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  return new Promise(res => w.webContents.print({ silent: false, printBackground: true }, ok => res(ok)));
});

ipcMain.handle('pdf', async (e) => {
  const r = await dialog.showSaveDialog({ title: 'Simpan PDF', defaultPath: 'surat.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (r.canceled) return null;
  const b = await BrowserWindow.fromWebContents(e.sender).webContents.printToPDF({ printBackground: true, pageSize: 'A4' });
  fs.writeFileSync(r.filePath, b);
  return r.filePath;
});

ipcMain.handle('word', async (e, html) => {
  const r = await dialog.showSaveDialog({ title: 'Simpan Word', defaultPath: 'surat.doc', filters: [{ name: 'Word', extensions: ['doc'] }] });
  if (r.canceled) return null;
  fs.writeFileSync(r.filePath, `<html><head><meta charset="utf-8"></head><body>${html}</body></html>`, 'utf8');
  return r.filePath;
});

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
