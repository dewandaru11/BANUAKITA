// Entry aplikasi "Surat Desa" (Electron) — jalankan dengan: npm install lalu npm start
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1450,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    title: 'BanuaKita - Surat Desa',
    backgroundColor: '#f1f5f3',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Sembunyikan menu bawaan Electron agar tampak seperti aplikasi desktop asli.
  Menu.setApplicationMenu(null);
  win.removeMenu();

  // Prioritas: jika modul dimuat dari dalam EXE hasil build electron-builder
  // (asar package), gunakan index.html di dalamnya — bukan file HTML terpisah,
  // sehingga pengguna cukup mengklik dua kali file .exe tanpa perlu browser/npm.
  const asarHtml = path.join(__dirname, 'app.asar', 'index.html');
  try {
    if (require('fs').existsSync(asarHtml)) {
      win.loadFile(asarHtml);
    } else {
      win.loadFile(path.join(__dirname, 'index.html'));
    }
  } catch (e) {
    win.loadFile(path.join(__dirname, 'index.html'));
  }

  win.on('closed', () => app.quit());
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());
