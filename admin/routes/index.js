var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

// Tüm route dosyalarını (index.js hariç) dinamik olarak mount et
const files = fs.readdirSync(__dirname);

for (const file of files) {
  // Sadece .js dosyaları ve bu index dosyası değil
  if (file === 'index.js' || path.extname(file) !== '.js') continue;

  const mountPath = '/' + path.basename(file, '.js');
  const mod = require(path.join(__dirname, file));
  // Hem `module.exports = router` hem de `exports.router = router` desteği
  const routeMiddleware = (mod && (mod.router || mod));

  if (typeof routeMiddleware === 'function') {
    router.use(mountPath, routeMiddleware);
    // İstersen debug için aç: console.log(`[routes] Mounted ${mountPath}`);
  } else {
    console.warn(`[routes] Skipped ${file}. Expected a router function, got: ${typeof routeMiddleware}`);
  }
}

module.exports = router;
