const express = require('express');
const router = express.Router();
const { db, uuidv4 } = require('../data/db');
const { authenticate } = require('../middleware/auth');

const VAPID_PUBLIC  = 'BIRhzppxhnPuZ7x2_8k5XfPIgSn109OZF_pwmoTeY9qypbEKLC8vKRu96ZaAfw3_D2XdLEOQ_Ck85RAdhk4-n9s';
const VAPID_PRIVATE = 'xMXXzOUPwbp7ag53Ivc2xfkGf3aCZ-Se24v3i8Ym8rs';

const webpush = require('web-push');
webpush.setVapidDetails('mailto:admin@menro.gov', VAPID_PUBLIC, VAPID_PRIVATE);

// Expose public key to clients
router.get('/vapid-public-key', (req, res) => res.json({ key: VAPID_PUBLIC }));

// Unauthenticated: save push subscription for a pending resident (pre-login)
const pendingRateLimit = new Map(); // email -> [timestamps]
router.post('/subscribe-pending', (req, res) => {
  const { email, subscription } = req.body;
  if (!email || !subscription) return res.status(400).json({ message: 'email and subscription required' });

  // Rate limit: max 3 attempts per email per hour
  const now = Date.now();
  const attempts = (pendingRateLimit.get(email) || []).filter(t => now - t < 60 * 60 * 1000);
  if (attempts.length >= 3) return res.status(429).json({ message: 'Too many attempts' });
  pendingRateLimit.set(email, [...attempts, now]);

  const user = db.prepare("SELECT id FROM users WHERE email=? AND role='resident' AND status='pending'").get(email);
  if (!user) { console.log('[push] subscribe-pending: user not found for email', email); return res.status(404).json({ message: 'Pending resident not found' }); }

  db.prepare('INSERT INTO push_subscriptions (id,userId,subscription) VALUES (?,?,?) ON CONFLICT(userId) DO UPDATE SET subscription=excluded.subscription')
    .run(require('crypto').randomUUID(), user.id, JSON.stringify(subscription));
  console.log('[push] subscribe-pending: saved subscription for userId', user.id);
  res.json({ ok: true });
});

// Save/update subscription for logged-in resident
router.post('/subscribe', authenticate, (req, res) => {
  const { subscription, lat, lng } = req.body;
  if (!subscription) return res.status(400).json({ message: 'subscription required' });
  // Embed coords into subscription object for proximity checks
  const sub = { ...subscription, _lat: lat, _lng: lng };
  db.prepare('INSERT INTO push_subscriptions (id,userId,subscription) VALUES (?,?,?) ON CONFLICT(userId) DO UPDATE SET subscription=excluded.subscription')
    .run(uuidv4(), req.user.id, JSON.stringify(sub));
  res.json({ ok: true });
});

// Remove subscription (opt-out)
router.delete('/subscribe', authenticate, (req, res) => {
  db.prepare('DELETE FROM push_subscriptions WHERE userId=?').run(req.user.id);
  res.json({ ok: true });
});

// Test: send push to all subscribers (admin only)
router.post('/test', authenticate, async (req, res) => {
  const subs = db.prepare('SELECT subscription FROM push_subscriptions').all();
  if (!subs.length) return res.json({ sent: 0, message: 'No subscriptions found' });
  let sent = 0;
  for (const row of subs) {
    try {
      const sub = JSON.parse(row.subscription);
      await webpush.sendNotification(sub, JSON.stringify({
        notification: { title: '🚛 Test Notification', body: 'Push is working!', icon: '/icons/icon-192x192.png' }
      }));
      sent++;
    } catch (e) { console.error('Push failed:', e.message); }
  }
  res.json({ sent, total: subs.length });
});

// Broadcast push to all subscribers (admin only)
router.post('/broadcast', authenticate, async (req, res) => {
  const { title, body } = req.body;
  const subs = db.prepare('SELECT subscription FROM push_subscriptions').all();
  let sent = 0;
  for (const row of subs) {
    try {
      await webpush.sendNotification(JSON.parse(row.subscription), JSON.stringify({
        notification: { title, body, icon: '/icons/icon-192x192.png', badge: '/icons/icon-72x72.png' }
      }));
      sent++;
    } catch (e) { /* stale subscription */ }
  }
  res.json({ sent });
});

module.exports = { router, webpush };
