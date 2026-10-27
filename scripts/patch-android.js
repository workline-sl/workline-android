// Adds the phone permissions WORKLINE uses (asked only when a feature needs them):
// microphone = voice messages, location = "nearest people" (stays on the phone).
const fs = require('fs');
const f = 'android/app/src/main/AndroidManifest.xml';
let x = fs.readFileSync(f, 'utf8');
const perms = ['RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'];
const add = perms.filter(p => !x.includes('android.permission.' + p)).map(p => `    <uses-permission android:name="android.permission.${p}" />`).join('\n');
if (add) x = x.replace('</manifest>', add + '\n</manifest>');
fs.writeFileSync(f, x);
console.log('permissions ok:', perms.join(', '));
