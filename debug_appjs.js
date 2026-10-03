const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'renderer', 'app.js');

if (!fs.existsSync(filePath)) {
  console.log('❌ File tidak ditemukan:', filePath);
  process.exit(1);
}

const text = fs.readFileSync(filePath, 'utf8');
console.log('PANJANG FILE :', text.length);
console.log('BACKTICKS    :', (text.match(/`/g) || []).length, '(harus genap)');
console.log('TEMPLATE ${  :', (text.match(/\$\{/g) || []).length);
console.log('FUNGSI async :', (text.match(/async function/g) || []).length);
console.log('PANGGIL page :', (text.match(/page\('dashboard'\)/g) || []).length, '(harus 0 di luar login)');

// Cek apakah file terpotong
const trimmed = text.trim();
const lastChar = trimmed.slice(-1);
console.log('KARAKTER AKHIR:', JSON.stringify(lastChar));
if (lastChar !== '}' && lastChar !== ';') {
  console.log('⚠️  File mungkin terpotong (akhir bukan } atau ;)');
} else {
  console.log('✓ Akhir file terlihat wajar');
}

console.log('\n--- 200 karakter terakhir ---');
console.log(text.slice(-200));