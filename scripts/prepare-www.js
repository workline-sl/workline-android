// Puts everything the app needs INSIDE the app, so it opens without internet:
// the Supabase library and the fonts (Sinhala, Tamil, Sora). Then points www/index.html at them.
const fs = require('fs'), path = require('path');
const W = 'www', V = path.join(W, 'vendor');
fs.mkdirSync(path.join(V, 'fonts'), { recursive: true });
fs.copyFileSync('node_modules/@supabase/supabase-js/dist/umd/supabase.js', path.join(V, 'supabase.js'));
const FONTS = [['noto-sans-sinhala', [400, 600, 700]], ['noto-sans-tamil', [400, 600, 700]], ['sora', [600, 800]]];
let css = '';
for (const [pkg, weights] of FONTS) {
  const src = path.join('node_modules/@fontsource', pkg), dst = path.join(V, 'fonts', pkg);
  fs.mkdirSync(path.join(dst, 'files'), { recursive: true });
  for (const w of weights) {
    let c = fs.readFileSync(path.join(src, w + '.css'), 'utf8');
    c = c.replace(/,\s*url\(\.\/files\/[^)]+\.woff\)\s*format\('woff'\)/g, '');           // woff2 is enough on Android
    for (const m of c.matchAll(/url\(\.\/files\/([^)]+\.woff2)\)/g)) fs.copyFileSync(path.join(src, 'files', m[1]), path.join(dst, 'files', m[1]));
    fs.writeFileSync(path.join(dst, w + '.css'), c);
    css += `@import url(fonts/${pkg}/${w}.css);\n`;
  }
}
fs.writeFileSync(path.join(V, 'fonts.css'), css);
let h = fs.readFileSync(path.join(W, 'index.html'), 'utf8'), n = 0;
const rep = (re, s) => { const b = h; h = h.replace(re, s); if (h !== b) n++; else console.warn('not found:', re); };
rep(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2[^"]*">/, '<link rel="stylesheet" href="vendor/fonts.css">');
rep(/<link rel="preload" as="script" href="https:\/\/cdn\.jsdelivr\.net[^"]*">/, '');
rep('</noscript>', '</noscript>\n<script src="vendor/supabase.js"></script>');
fs.writeFileSync(path.join(W, 'index.html'), h);
console.log('www ready:', n, 'changes; fonts', FONTS.map(f => f[0]).join(', '));
