const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desaAPI', {
  login: (u, p) => ipcRenderer.invoke('login', u, p),
  dashboard: () => ipcRenderer.invoke('dashboard'),

  penduduk: {
    list: q => ipcRenderer.invoke('penduduk:list', q),
    get: id => ipcRenderer.invoke('penduduk:get', id),
    save: d => ipcRenderer.invoke('penduduk:save', d),
    nonaktif: id => ipcRenderer.invoke('penduduk:nonaktif', id)
  },

  ktpUpload: () => ipcRenderer.invoke('ktp:upload'),
  fileUrl: p => 'file://' + String(p || '').split(/[\\/]/).join('/'),

  surat: {
    types: () => ipcRenderer.invoke('surat:types'),
    nextNomor: (t, k) => ipcRenderer.invoke('surat:nextNomor', t, k),
    save: d => ipcRenderer.invoke('surat:save', d),
    get: id => ipcRenderer.invoke('surat:get', id)
  },

  arsip: {
    list: f => ipcRenderer.invoke('arsip:list', f)
  },

  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: d => ipcRenderer.invoke('settings:save', d)
  },

  users: {
    list: () => ipcRenderer.invoke('users:list'),
    save: d => ipcRenderer.invoke('users:save', d),
    toggle: id => ipcRenderer.invoke('users:toggle', id)
  },

  templates: {
    list: () => ipcRenderer.invoke('templates:list'),
    get: id => ipcRenderer.invoke('templates:get', id),
    getByKode: kode => ipcRenderer.invoke('templates:getByKode', kode),
    save: d => ipcRenderer.invoke('templates:save', d),
    remove: id => ipcRenderer.invoke('templates:delete', id)
  },

  backup: () => ipcRenderer.invoke('backup'),
  restore: () => ipcRenderer.invoke('restore'),
  print: () => ipcRenderer.invoke('print'),
  pdf: () => ipcRenderer.invoke('pdf'),
  word: h => ipcRenderer.invoke('word', h)
});
