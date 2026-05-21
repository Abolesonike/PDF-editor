import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.join(__dirname, '../public/fonts');
const outPath = path.join(fontsDir, 'fonts.json');

const manifest = [];

function scan(dir, urlBase) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const urlPath = `${urlBase}/${entry.name}`;
    if (entry.isDirectory()) {
      scan(fullPath, urlPath);
    } else if (/\.(ttf|otf|woff|woff2)$/i.test(entry.name)) {
      const name = entry.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
      manifest.push({ name, path: urlPath });
    }
  }
}

scan(fontsDir, './fonts');

// 按名称去重，保留第一个遇到的
const seen = new Set();
const deduped = [];
for (const item of manifest) {
  if (seen.has(item.name)) continue;
  seen.add(item.name);
  deduped.push(item);
}

fs.writeFileSync(outPath, JSON.stringify(deduped, null, 2));
console.log(`[font-manifest] 发现 ${deduped.length} 个字体，已写入 ${outPath}`);
