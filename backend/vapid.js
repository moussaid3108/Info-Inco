import webpush from 'web-push';
import db from './database.js';

function getOrCreateVapidKeys() {
  const pub = db.prepare("SELECT value FROM settings WHERE key = 'vapid_public'").get();
  const priv = db.prepare("SELECT value FROM settings WHERE key = 'vapid_private'").get();

  if (pub && priv) {
    return { publicKey: pub.value, privateKey: priv.value };
  }

  const keys = webpush.generateVAPIDKeys();
  db.prepare("INSERT INTO settings (key, value) VALUES ('vapid_public', ?)").run(keys.publicKey);
  db.prepare("INSERT INTO settings (key, value) VALUES ('vapid_private', ?)").run(keys.privateKey);
  console.log('[VAPID] Clés générées et sauvegardées en base');
  return keys;
}

const vapidKeys = getOrCreateVapidKeys();

webpush.setVapidDetails(
  'mailto:admin@inco-info.fr',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const vapidPublicKey = vapidKeys.publicKey;
export default webpush;
