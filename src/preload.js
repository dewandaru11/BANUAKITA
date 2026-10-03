const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desaAPI', {
  login: (u, p) => ipcRenderer.invoke('login', u, p),
  dashboard: () => ipcRenderer.invoke('dashboard'),

  penduduk: {
    list: q => ipcRenderer.invoke('penduduk:list', q),
    save: d => ipcRenderer.invoke('penduduk:save', d)
  },

  surat: {
    types: () => ipcRenderer.invoke('surat:types'),
    save: d => ipcRenderer.invoke('surat:save', d)
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
    save: d => ipcRenderer.invoke('users:save', d)
  },

  templates: {
    list: () => ipcRenderer.invoke('templates:list'),
    getByKode: kode => ipcRenderer.invoke('templates:getByKode', kode),
    save: d => ipcRenderer.invoke('templates:save', d)
  },

  backup: () => ipcRenderer.invoke('backup'),
  restore: () => ipcRenderer.invoke('restore'),
  print: () => ipcRenderer.invoke('print'),
  pdf: () => ipcRenderer.invoke('pdf'),
  word: h => ipcRenderer.invoke('word', h)
});
