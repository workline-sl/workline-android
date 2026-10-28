// Phone permissions WORKLINE uses (each is asked only when the feature is used):
// microphone = voice messages + speak-to-search, location = "nearest people" (stays on the phone).
// Also: the keyboard pushes the page up (chat box stays visible), Google sign-in returns to the app.
const fs = require('fs');
const f = 'android/app/src/main/AndroidManifest.xml';
let x = fs.readFileSync(f, 'utf8');
const perms = ['RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'POST_NOTIFICATIONS'];
const add = perms.filter(p => !x.includes('android.permission.' + p)).map(p => `    <uses-permission android:name="android.permission.${p}" />`).join('\n');
if (add) x = x.replace('</manifest>', add + '\n</manifest>');
if (!x.includes('android.speech.RecognitionService'))
  x = x.replace('</manifest>', '    <queries>\n        <intent>\n            <action android:name="android.speech.RecognitionService" />\n        </intent>\n    </queries>\n</manifest>');
if (!/windowSoftInputMode/.test(x)) x = x.replace(/(<activity\b)/, '$1\n            android:windowSoftInputMode="adjustResize"');
if (!x.includes('android:scheme="workline-app"'))
  x = x.replace(/(<activity\b[\s\S]*?<\/intent-filter>)/, `$1
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="workline-app" android:host="login" />
            </intent-filter>`);
// phone notifications (Firebase): the small white WORKLINE icon, brand colour and the main channel
if (!x.includes('default_notification_icon'))
  x = x.replace(/(<application\b[^>]*>)/, `$1
        <meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_stat_wl" />
        <meta-data android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/wl_notif" />
        <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="wl" />`);
const cf = 'android/app/src/main/res/values/wl_colors.xml';
fs.writeFileSync(cf, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="wl_notif">#5B5BFF</color>\n</resources>\n');
fs.writeFileSync(f, x);
console.log(x);
