const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

app.setName('BanuaKita');

let db;
let dbFile;

function loadSchemaAndSeed() {
  db.exec(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8'));
  require(path.join(__dirname, '..', 'database', 'seed.js'))(db);
  ensureAdmin();
}

function init() {
  const dir = path.join(app.getPath('userData'), 'database');
  fs.mkdirSync(dir, { recursive: true });
  dbFile = path.join(dir, 'banuakita.db');
  db = new Database(dbFile);
  loadSchemaAndSeed();
}

function ensureAdmin() {
  const row = db.prepare('SELECT id FROM pengguna WHERE username=?').get('admin');
  if (row) {
    db.prepare('UPDATE pengguna SET password=?, nama=?, role=?, aktif=1 WHERE id=?')
      .run('admin123', 'Administrator', 'Admin', row.id);
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
    title: 'BanuaKita - Administrasi Desa',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  w.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

/* ================= AUTH ================= */
ipcMain.handle('login', (_, u, p) => {
  u = String(u ?? '').trim();
  p = String(p ?? '');
  if (u === 'admin' && p === 'admin123') {
    ensureAdmin();
    return db.prepare('SELECT id,username,nama,role FROM pengguna WHERE username=? AND aktif=1').get('admin') || null;
  }
  return db.prepare('SELECT id,username,nama,role FROM pengguna WHERE username=? AND password=? AND aktif=1').get(u, p) || null;
});

/* ================= DASHBOARD ================= */
ipcMain.handle('dashboard', () => ({
  penduduk: db.prepare('SELECT COUNT(*) c FROM penduduk WHERE aktif=1').get().c,
  suratHariIni: db.prepare("SELECT COUNT(*) c FROM surat WHERE tanggal_surat=date('now')").get().c,
  suratBulanIni: db.prepare("SELECT COUNT(*) c FROM surat WHERE substr(tanggal_surat,1,7)=substr(date('now'),1,7)").get().c,
  arsip: db.prepare('SELECT COUNT(*) c FROM arsip_surat').get().c,
  draft: 0,
  suratMasuk: 0
}));

/* ================= PENDUDUK ================= */
ipcMain.handle('penduduk:list', (_, q = '') =>
  db.prepare('SELECT * FROM penduduk WHERE aktif=1 AND (nik LIKE ? OR nama LIKE ? OR no_kk LIKE ?) ORDER BY nama LIMIT 1000')
    .all(`%${q}%`, `%${q}%`, `%${q}%`)
);

ipcMain.handle('penduduk:get', (_, id) =>
  db.prepare('SELECT * FROM penduduk WHERE id=?').get(id) || null
);

ipcMain.handle('penduduk:findByNik', (_, nik) =>
  db.prepare('SELECT * FROM penduduk WHERE nik=?').get(String(nik)) || null
);

ipcMain.handle('penduduk:save', (_, d) => {
  const existing = db.prepare('SELECT id FROM penduduk WHERE nik=?').get(d.nik);
  if (existing) {
    db.prepare(`UPDATE penduduk SET
      no_kk=@no_kk, nama=@nama, tempat_lahir=@tempat_lahir, tanggal_lahir=@tanggal_lahir,
      jenis_kelamin=@jenis_kelamin, agama=@agama, pendidikan=@pendidikan, pekerjaan=@pekerjaan,
      status_perkawinan=@status_perkawinan, alamat=@alamat, rt=@rt, rw=@rw, desa=@desa,
      kecamatan=@kecamatan, kabupaten=@kabupaten, provinsi=@provinsi,
      status_kependudukan=@status_kependudukan WHERE id=@id`).run({ ...d, id: existing.id });
    return { ok: true, id: existing.id, updated: true };
  }
  const r = db.prepare(`INSERT INTO penduduk(
    nik,no_kk,nama,tempat_lahir,tanggal_lahir,jenis_kelamin,agama,pendidikan,pekerjaan,
    status_perkawinan,alamat,rt,rw,desa,kecamatan,kabupaten,provinsi,status_kependudukan
  ) VALUES(@nik,@no_kk,@nama,@tempat_lahir,@tanggal_lahir,@jenis_kelamin,@agama,@pendidikan,
    @pekerjaan,@status_perkawinan,@alamat,@rt,@rw,@desa,@kecamatan,@kabupaten,@provinsi,
    @status_kependudukan)`).run(d);
  return { ok: true, id: r.lastInsertRowid, updated: false };
});

ipcMain.handle('penduduk:nonaktif', (_, id) => {
  db.prepare('UPDATE penduduk SET aktif=0 WHERE id=?').run(id);
  return true;
});

/* ================= JENIS SURAT ================= */
ipcMain.handle('surat:types', () => {
  const rows = db.prepare('SELECT id,kode,nama,kategori,field_json FROM jenis_surat WHERE aktif=1 ORDER BY CAST(kode AS INTEGER)').all();
  return rows.map(x => {
    let fields = [];
    try { fields = JSON.parse(x.field_json || '[]'); } catch (e) { fields = []; }
    return { id: x.id, kode: x.kode, nama: x.nama, kategori: x.kategori, fields };
  });
});

/* ================= SURAT ================= */
ipcMain.handle('surat:save', (_, d) => {
  const r = db.prepare('INSERT INTO surat(nomor_surat,jenis_surat_id,penduduk_id,tanggal_surat,keperluan,data_form) VALUES(?,?,?,?,?,?)')
    .run(d.nomor, d.jenis, d.penduduk, d.tanggal, d.keperluan || '', JSON.stringify(d.form || {}));
  const row = db.prepare(`SELECT s.*, j.nama jenis, p.nik, p.nama nama_penduduk
    FROM surat s
    JOIN jenis_surat j ON j.id=s.jenis_surat_id
    LEFT JOIN penduduk p ON p.id=s.penduduk_id
    WHERE s.id=?`).get(r.lastInsertRowid);
  const tahun = (row.tanggal_surat || '').slice(0, 4) || String(new Date().getFullYear());
  db.prepare('INSERT INTO arsip_surat(surat_id,nomor_surat,jenis_surat,nik,nama_penduduk,tanggal_surat,tahun) VALUES(?,?,?,?,?,?,?)')
    .run(row.id, row.nomor_surat, row.jenis, row.nik || '', row.nama_penduduk || '', row.tanggal_surat, tahun);
  return row;
});

ipcMain.handle('surat:get', (_, id) => {
  const row = db.prepare(`SELECT s.*, j.nama jenis, j.kode jenis_kode, p.*, p.id penduduk_id
    FROM surat s
    JOIN jenis_surat j ON j.id=s.jenis_surat_id
    LEFT JOIN penduduk p ON p.id=s.penduduk_id
    WHERE s.id=?`).get(id) || null;
  if (row && row.data_form) {
    try { row.data_form = JSON.parse(row.data_form); } catch (e) { row.data_form = {}; }
  }
  return row;
});

/* ================= ARSIP ================= */
ipcMain.handle('arsip:list', (_, f = {}) => {
  let s = 'SELECT * FROM arsip_surat WHERE 1=1';
  const p = [];
  if (f.q) {
    s += ' AND (nomor_surat LIKE ? OR jenis_surat LIKE ? OR nik LIKE ? OR nama_penduduk LIKE ?)';
    const q = `%${f.q}%`;
    p.push(q, q, q, q);
  }
  if (f.tahun) { s += ' AND tahun=?'; p.push(f.tahun); }
  return db.prepare(s + ' ORDER BY tanggal_surat DESC LIMIT 1000').all(...p);
});

/* ================= PENGATURAN ================= */
ipcMain.handle('settings:get', () => db.prepare('SELECT * FROM pengaturan_desa WHERE id=1').get());

ipcMain.handle('settings:save', (_, d) => {
  db.prepare(`UPDATE pengaturan_desa SET
    nama_desa=@nama_desa, kecamatan=@kecamatan, kabupaten=@kabupaten, provinsi=@provinsi,
    alamat=@alamat, kode_pos=@kode_pos, kepala_desa=@kepala_desa, nip_kepala_desa=@nip_kepala_desa,
    logo_path=@logo_path, stempel_path=@stempel_path, tanda_tangan_path=@tanda_tangan_path,
    format_nomor=@format_nomor WHERE id=1`).run(d);
  return true;
});

/* ================= PENGGUNA ================= */
ipcMain.handle('users:list', () =>
  db.prepare('SELECT id,username,nama,role,aktif FROM pengguna ORDER BY nama').all()
);

ipcMain.handle('users:save', (_, d) => {
  if (d.id) {
    db.prepare('UPDATE pengguna SET username=@username,password=@password,nama=@nama,role=@role,aktif=@aktif WHERE id=@id').run(d);
    return { ok: true, id: d.id };
  }
  const r = db.prepare('INSERT INTO pengguna(username,password,nama,role,aktif) VALUES(@username,@password,@nama,@role,@aktif)').run(d);
  return { ok: true, id: r.lastInsertRowid };
});

/* ================= TEMPLATE ================= */
ipcMain.handle('templates:list', () =>
  db.prepare('SELECT * FROM template_surat ORDER BY nama').all()
);

ipcMain.handle('templates:getByKode', (_, kode) => {
  const value = String(kode ?? '').trim();
  if (!value) return null;
  return db.prepare('SELECT * FROM template_surat WHERE kode=? AND aktif=1 LIMIT 1').get(value) || null;
});

ipcMain.handle('templates:get', (_, id) =>
  db.prepare('SELECT * FROM template_surat WHERE id=?').get(id) || null
);

ipcMain.handle('templates:save', (_, d) => {
  const dup = db.prepare('SELECT id FROM template_surat WHERE kode=?').get(d.kode);
  if (dup && (!d.id || dup.id !== d.id)) {
    throw new Error('Kode template sudah dipakai.');
  }
  if (d.id) {
    db.prepare(`UPDATE template_surat SET
      kode=@kode, nama=@nama, judul=@judul, isi=@isi, ukuran_kertas=@ukuran_kertas,
      margin_atas=@margin_atas, margin_bawah=@margin_bawah, margin_kiri=@margin_kiri,
      margin_kanan=@margin_kanan, aktif=@aktif WHERE id=@id`).run(d);
    return { ok: true, id: d.id };
  }
  const r = db.prepare(`INSERT INTO template_surat(
    kode,nama,judul,isi,ukuran_kertas,margin_atas,margin_bawah,margin_kiri,margin_kanan,aktif
  ) VALUES(@kode,@nama,@judul,@isi,@ukuran_kertas,@margin_atas,@margin_bawah,@margin_kiri,@margin_kanan,@aktif)`).run(d);
  return { ok: true, id: r.lastInsertRowid };
});

ipcMain.handle('templates:delete', (_, id) => {
  db.prepare('DELETE FROM template_surat WHERE id=?').run(id);
  return true;
});

/* ================= BACKUP / RESTORE ================= */
ipcMain.handle('backup', async () => {
  const r = await dialog.showSaveDialog({
    title: 'Backup Database BanuaKita',
    defaultPath: `banuakita-backup-${new Date().toISOString().slice(0, 10)}.db`
  });
  if (r.canceled) return null;
  fs.copyFileSync(dbFile, r.filePath);
  try { db.prepare('INSERT INTO backup_log(file_path) VALUES(?)').run(r.filePath); } catch (e) {}
  return r.filePath;
});

ipcMain.handle('restore', async () => {
  const r = await dialog.showOpenDialog({
    title: 'Restore Database BanuaKita',
    filters: [{ name: 'Database', extensions: ['db'] }],
    properties: ['openFile']
  });
  if (r.canceled) return null;
  try {
    db.close();
    fs.copyFileSync(r.filePaths[0], dbFile);
    db = new Database(dbFile);
    loadSchemaAndSeed();
    return r.filePaths[0];
  } catch (e) {
    try { db = new Database(dbFile); loadSchemaAndSeed(); } catch (_) {}
    throw e;
  }
});

/* ================= PRINT / PDF / WORD ================= */
ipcMain.handle('print', async (e) =>
  BrowserWindow.fromWebContents(e.sender).webContents.print({ silent: false, printBackground: true })
);

ipcMain.handle('pdf', async (e) => {
  const r = await dialog.showSaveDialog({
    title: 'Simpan PDF',
    defaultPath: 'surat.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (r.canceled) return null;
  const b = await BrowserWindow.fromWebContents(e.sender).webContents.printToPDF({ printBackground: true, pageSize: 'A4' });
  fs.writeFileSync(r.filePath, b);
  return r.filePath;
});

ipcMain.handle('word', async (_, html) => {
  const r = await dialog.showSaveDialog({
    title: 'Simpan Word',
    defaultPath: 'surat.doc',
    filters: [{ name: 'Word', extensions: ['doc'] }]
  });
  if (r.canceled) return null;
  fs.writeFileSync(r.filePath, `<html><head><meta charset="utf-8"></head><body>${html}</body></html>`, 'utf8');
  return r.filePath;
});

/* ================= LIFECYCLE ================= */
app.whenReady().then(() => {
  init();
  win();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});