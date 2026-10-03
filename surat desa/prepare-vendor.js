const fs = require('fs');
const path = require('path');
const cp = (src, dst) => {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
};
const exists = p => fs.existsSync(p);
const root = __dirname;
const vendor = path.join(root, 'vendor');

function reqFile(id) {
  return require.resolve(id);
}

// Spreadsheet / Word libraries
cp(reqFile('xlsx/dist/xlsx.full.min.js'), path.join(vendor, 'xlsx.full.min.js'));
cp(reqFile('mammoth/mammoth.browser.min.js'), path.join(vendor, 'mammoth.browser.min.js'));

// Tesseract.js browser API and worker
cp(reqFile('tesseract.js/dist/tesseract.min.js'), path.join(vendor, 'tesseract/tesseract.min.js'));
cp(reqFile('tesseract.js/dist/worker.min.js'), path.join(vendor, 'tesseract/worker.min.js'));

// Tesseract core files (all 4 builds are required for local installation)
const corePkg = path.dirname(require.resolve('tesseract.js-core/package.json'));
for (const f of [
  'tesseract-core.wasm.js',
  'tesseract-core-simd.wasm.js',
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js'
]) {
  const src = path.join(corePkg, f);
  if (!exists(src)) throw new Error(`File core Tesseract tidak ditemukan: ${src}`);
  cp(src, path.join(vendor, 'tesseract/core', f));
}

console.log('Vendor library berhasil disiapkan di:', vendor);
console.log('Lang data OCR tidak dipaketkan oleh npm tesseract.js dan harus ditempatkan di vendor/tesseract/lang-data/');
console.log('Minimum yang diperlukan untuk OCR: ind.traineddata.gz dan eng.traineddata.gz');
