import db from './database.js';
import webpush from './vapid.js';

export async function sendPushToAll(title, body) {
  const subs = db.prepare(`SELECT subscription FROM push_subscriptions`).all();
  if (!subs.length) return;

  const dead = [];
  await Promise.allSettled(
    subs.map(async ({ subscription }) => {
      try {
        await webpush.sendNotification(
          JSON.parse(subscription),
          JSON.stringify({ title, body })
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          dead.push(JSON.parse(subscription).endpoint);
        }
      }
    })
  );

  if (dead.length) {
    const ph = dead.map(() => '?').join(',');
    db.prepare(`DELETE FROM push_subscriptions WHERE endpoint IN (${ph})`).run(...dead);
  }

  console.log(`[Push] Envoyé à ${subs.length} abonné(s)`);
}
