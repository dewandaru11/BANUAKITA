const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desaAPI', {

  login: (u, p) => ipcRenderer.invoke('login', u, p),
  dashboard: () => ipcRenderer.invoke('dashboard'),

  penduduk: {
    list: (q) => ipcRenderer.invoke('penduduk:list', q || ''),
    get: (id) => ipcRenderer.invoke('penduduk:get', id),
    save: (d) => ipcRenderer.invoke('penduduk:save', d),
    nonaktif: (id) => ipcRenderer.invoke('penduduk:nonaktif', id)
  },

  ktp: {
    upload: () => ipcRenderer.invoke('ktp:upload')
  },

  surat: {
    types: () => ipcRenderer.invoke('surat:types'),
    nextNomor: (tanggal, kode) => ipcRenderer.invoke('surat:nextNomor', tanggal, kode),
    save: (d) => ipcRenderer.invoke('surat:save', d),
    get: (id) => ipcRenderer.invoke('surat:get', id),

    // ---- AKSI HAPUS JENIS SURAT ----
    deleteAllTypes: () => ipcRenderer.invoke('surat:types:deleteAll'),
    deleteByIds: (kodes) => ipcRenderer.invoke('surat:types:deleteByIds', kodes),
    deactivateAllTypes: () => ipcRenderer.invoke('surat:types:deactivateAll')
  },

  arsip: {
    list: (f) => ipcRenderer.invoke('arsip:list', f || {}),
    get: (id) => ipcRenderer.invoke('arsip:get', id),
    delete: (id) => ipcRenderer.invoke('arsip:delete', id)
  },

  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (d) => ipcRenderer.invoke('settings:save', d)
  },

  users: {
    list: () => ipcRenderer.invoke('users:list'),
    save: (d) => ipcRenderer.invoke('users:save', d),
    toggle: (id) => ipcRenderer.invoke('users:toggle', id)
  },

  templates: {
    list: () => ipcRenderer.invoke('templates:list'),
    get: (id) => ipcRenderer.invoke('templates:get', id),
    getByKode: (kode) => ipcRenderer.invoke('templates:getByKode', kode),
    save: (d) => ipcRenderer.invoke('templates:save', d),
    delete: (id) => ipcRenderer.invoke('templates:delete', id),
    importWord: () => ipcRenderer.invoke('templates:importWord'),
    syncDesaFolder: () => ipcRenderer.invoke('templates:syncDesaFolder')
  },

  backup: () => ipcRenderer.invoke('backup'),
  restore: () => ipcRenderer.invoke('restore'),

  print: (payload) => ipcRenderer.invoke('print', payload),
  pdf: (payload) => ipcRenderer.invoke('pdf', payload),
  word: (payload) => ipcRenderer.invoke('word', payload)

});