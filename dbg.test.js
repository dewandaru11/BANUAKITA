// Smoke test renderer (BANUAKITA tanpa login) against real DB via extracted main-process handlers
const Database = require('better-sqlite3');
const fs = require('fs'), path = require('path');

const db = new Database(':memory:');
db.exec(fs.readFileSync('database/schema.sql', 'utf8'));
require(path.resolve('database/seed.js'))(db);
{ const row = db.prepare("SELECT id FROM pengguna WHERE username='admin'").get();
  if (!row) db.prepare("INSERT INTO pengguna(username,password,nama,role,aktif) VALUES('admin','admin123','Administrator','Admin',1)").run(); }

// ---- stub electron dialog so backup/restore not needed for smoke ----
let dialogResult = { canceled: true };
const dialog = {
  showSaveDialog: async () => dialogResult,
  showOpenDialog: async () => dialogResult
};

// ---- build ipcMain stub that registers handlers from main.js ----
const handlers = {};
const ipcMain = { handle: (name, fn) => { handlers[name] = fn; } };

// reuse the real handler code from src/main.js
const mainSrc = fs.readFileSync('src/main.js', 'utf8');
const secStart = mainSrc.indexOf('// ---------- Helpers ----------');
const secEnd = mainSrc.indexOf('app.whenReady()');
const sec = mainSrc.slice(secStart, secEnd);
eval(sec);

// promisified invoke like ipcRenderer.invoke
const invoke = (name, ...args) => Promise.resolve(handlers[name](undefined, ...args)).catch(e => { throw e; });

const api = {
  dashboard: () => invoke('dashboard'),
  penduduk: {
    list: q => invoke('penduduk:list', q),
    get: id => invoke('penduduk:get', id),
    save: d => invoke('penduduk:save', d),
    nonaktif: id => invoke('penduduk:nonaktif', id)
  },
  surat: {
    types: () => invoke('surat:types'),
    nextNomor: (t,k) => invoke('surat:nextNomor', t, k),
    save: d => invoke('surat:save', d),
    get: id => invoke('surat:get', id)
  },
  arsip: { list: f => invoke('arsip:list', f) },
  settings: { get: () => invoke('settings:get'), save: d => invoke('settings:save', d) },
  users: { list: () => invoke('users:list'), save: d => invoke('users:save', d), toggle: id => invoke('users:toggle', id) },
  templates: {
    list: () => invoke('templates:list'),
    get: id => invoke('templates:get', id),
    getByKode: k => invoke('templates:getByKode', k),
    save: d => invoke('templates:save', d),
    remove: id => invoke('templates:delete', id)
  },
  print: () => Promise.resolve(true),
  pdf: () => Promise.resolve(null),
  word: () => Promise.resolve(null)
};

// --- minimal DOM stub ---
const els = {};
function mkEl(id){ return els[id] || (els[id] = { id, value:'', innerHTML:'', textContent:'', type:'text', placeholder:'', classList:{add(){},remove(){},contains(){return false}}, focus(){}, style:{} }); }
let dynFields = [];
global.document = {
  querySelector: sel => (String(sel).includes(',') || String(sel).startsWith('.'))
    ? null
    : mkEl(String(sel).replace(/^#/,'')),
  querySelectorAll: sel => (sel.includes('#dyn') ? dynFields : []),
  addEventListener: () => {}
};
global.window = { desaAPI: api };
global.alert = m => console.log('[alert]', String(m).split('\n')[0]);
global.confirm = () => true;
global.location = { reload(){} };

// load app.js (no login flow; init runs via DOMContentLoaded dispatch)
let src = fs.readFileSync('src/renderer/app.js','utf8');
try { eval(src); } catch (e) { console.error('APP EVAL ERROR:', e.message, '\n', e.stack.split('\n')[1]); throw e; }
// fire DOMContentLoaded
const listeners = [];
global.document.addEventListener = (ev, fn) => listeners.push(fn);
// re-run: since addEventListener was overwritten after eval, manually call page init
(async () => {
  let pass = 0, fail = 0;
  const check = (name, cond) => { if (cond) { pass++; console.log('PASS:', name); } else { fail++; console.log('FAIL:', name); } };

  await page('dashboard');
  check('dashboard renders cards', els['content'].innerHTML.includes('Selamat Datang di BANUAKITA'));

  // penduduk CRUD
  await penduduk();
  addP();
  console.log('after addP, content len:', els['content'].innerHTML.length, 'els keys:', Object.keys(els).join(','));
  try{ pendudukFormHtml; }catch(e){ console.log('pendudukFormHtml not global'); }
  try{ addP.toString().slice(0,120); }catch(e){}
  els['nik'].value='1234'; els['nama'].value='X';
  await saveP();
  check('NIK validation rejects <16 digits', !db.prepare("SELECT * FROM penduduk WHERE nama='X'").get());
  els['nik'].value='3300000000000001'; els['nama'].value='Budi Santoso'; els['no_kk'].value='3300000000001';
  await saveP();
  let list = await api.penduduk.list('');
  check('penduduk saved', list.length===1 && list[0].nama==='Budi Santoso');

  // duplicate NIK rejected
  addP();
  els['nik'].value='3300000000000001'; els['nama'].value='Budi Dua';
  await saveP();
  check('duplicate NIK rejected', (await api.penduduk.list('')).length===1);

  // edit
  await editP(list[0].id);
  els['nama'].value='Budi Update';
  await saveP(list[0].id);
  check('edit works', (await api.penduduk.get(list[0].id)).nama==='Budi Update');

  // buat surat + auto nomor
  await buat();
  await autoNomor();
  check('auto nomor filled', /^\d{3}\//.test(els['nomor'].value));
  const types = suratTypes;
  const t0 = types.find(t=>(t.fields||[]).some(f=>f.field==='keperluan')) || types[0];
  els['pid'].value = String(list[0].id);
  els['tid'].value = String(t0.id);
  await dynamicFields();
  dynFields = Object.keys(els).filter(k=>k.startsWith('f_')).map(k=>mkEl(k));
  if (els['f_keperluan']) els['f_keperluan'].value='Perlu surat domisili untuk bank';
  await preview();
  check('preview generated', els['prev'].innerHTML.length > 100 && els['prev'].innerHTML.includes('PEMERINTAH DESA'));
  await saveLetter();
  const srow = db.prepare('SELECT * FROM surat').get();
  check('surat saved', !!srow && srow.nomor_surat===els['nomor'].value);

  // duplicate nomor rejected on new save
  editSuratId = null;
  await saveLetter();
  check('duplicate nomor rejected', db.prepare('SELECT COUNT(*) c FROM surat').get().c===1);

  // arsip + reopen for reprint/edit
  const ar = await api.arsip.list({});
  check('arsip has row', ar.length===1);
  await arsip();
  check('arsip table rendered', els['content'].innerHTML.includes('Arsip Surat'));
  await buat(ar[0].surat_id);
  check('edit surat loads nomor', els['nomor'].value===ar[0].nomor_surat);
  if (els['f_keperluan']) els['f_keperluan'].value='Keperluan diperbarui';
  await saveLetter();
  check('surat updated keeps single row', db.prepare('SELECT COUNT(*) c FROM surat').get().c===1 && db.prepare('SELECT COUNT(*) c FROM arsip_surat').get().c===1);

  // template CRUD
  await templates();
  await templateForm();
  els['tk'].value=t0.kode; els['tn'].value='T Baru'; els['tj'].value='Judul T'; els['ti'].value='Isi untuk {{nama}}';
  els['tu'].value='A4'; els['ma'].value='2'; els['mb'].value='2'; els['mk'].value='3'; els['mn'].value='3';
  await saveT();
  check('template created', (await api.templates.list()).some(x=>x.nama==='T Baru'));
  await saveT(); // duplicate kode -> alert error, no crash
  const tl = await api.templates.list();
  const tb = tl.find(x=>x.nama==='T Baru');
  await templateForm(tb.id);
  check('template edit prefills isi', els['ti'].value.includes('{{nama}}'));
  await hapusT(tb.id);
  check('template deleted', !(await api.templates.list()).some(x=>x.id===tb.id));

  // users
  await users();
  await userForm();
  els['uu'].value='operator1'; els['up'].value='pass123'; els['un'].value='Operator Satu'; els['ur'].value='Operator';
  await saveU();
  check('user created', (await api.users.list()).some(u=>u.username==='operator1'));
  // edit without password keeps old password
  const op = (await api.users.list()).find(u=>u.username==='operator1');
  await userForm(op.id);
  els['up'].value=''; els['un'].value='Operator Baru';
  await saveU(op.id);
  check('password unchanged on empty', !!db.prepare("SELECT * FROM pengguna WHERE username='operator1' AND password='pass123'").get());
  await toggleU(op.id);
  check('user toggled inactive', db.prepare("SELECT aktif FROM pengguna WHERE id=?").get(op.id).aktif===0);

  // settings
  await settings();
  els['dn'].value='Desa Banua Kita'; els['dk'].value='Kec. Contoh';
  await saveS();
  const st = await api.settings.get();
  check('settings saved', st.nama_desa==='Desa Banua Kita' && st.kecamatan==='Kec. Contoh');

  // nonaktif penduduk
  await hapusP(list[0].id);
  check('penduduk nonaktif', (await api.penduduk.list('')).length===0);

  // other pages render
  for (const p of ['types','backup','arsip','penduduk','buat','dashboard']) {
    await page(p);
    check('page '+p+' renders', els['content'].innerHTML.length > 50);
  }

  console.log(`\nSMOKE_DONE pass=${pass} fail=${fail}`);
  if (fail) process.exit(1);
})().catch(e=>{ console.error('SMOKE_FAIL', e); process.exit(1); });
