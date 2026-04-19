require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const { db } = require('./src/data/db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Serve Angular build
const uiDist = path.join(__dirname, '../ui/dist/ui/browser');
app.use(express.static(uiDist, { maxAge: 0, etag: false }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/trucks', require('./src/routes/trucks'));
app.use('/api/schedules', require('./src/routes/schedules'));
app.use('/api/complaints', require('./src/routes/complaints'));
app.use('/api/segregation', require('./src/routes/segregation'));
app.use('/api/waste-types', require('./src/routes/waste-types'));
const { router: pushRouter, webpush } = require('./src/routes/push');
app.use('/api/push', pushRouter);

app.use('/api/geocode', require('./src/routes/geocode'));
app.use('/api/settings', require('./src/routes/settings'));

// Fallback to Angular index for client-side routing (exclude static assets)
app.get('/{*path}', (req, res) => {
  if (/\.(webmanifest|json|js|css|png|ico|svg|txt|woff2?|ttf)$/.test(req.path)) {
    return res.status(404).end();
  }
  res.sendFile(path.join(uiDist, 'index.html'));
});

// WebSocket server for real-time truck location (FR-1)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws/trucks' });
require('./src/routes/schedules').setWss(wss);

const lastNotified = new Map(); // userId -> timestamp

wss.on('connection', (ws) => {
  console.log('WS client connected');
  const trucks = db.prepare('SELECT * FROM trucks').all();
  ws.send(JSON.stringify({ type: 'trucks', data: trucks }));

  ws.on('message', (msg) => {
    try {
      const parsed = JSON.parse(msg);

      // Schedule cancelled broadcast
      if (parsed.type === 'schedule_cancelled') {
        const payload = JSON.stringify({ type: 'schedule_cancelled', data: parsed.data });
        wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
        // Push notify all subscribers
        const { routeId, wasteType, date } = parsed.data || {};
        const subs = db.prepare('SELECT subscription FROM push_subscriptions').all();
        console.log('[push] schedule_cancelled: found', subs.length, 'subscriptions');
        subs.forEach(row => {
          try {
            const sub = JSON.parse(row.subscription);
            console.log('[push] sending to endpoint:', sub.endpoint?.slice(0, 60));
            webpush.sendNotification(sub, JSON.stringify({
              notification: {
                title: '🚫 Schedule Cancelled',
                body: `Collection for ${routeId} (${wasteType}) on ${date} has been cancelled.`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png'
              }
            })).then(() => console.log('[push] sent ok')).catch(e => console.error('[push] failed:', e.statusCode, e.body));
          } catch(e) { console.error('[push] parse error:', e.message); }
        });
        return;
      }

      // Chat message
      if (parsed.type === 'chat') {
        const { truckId, fromId, fromName, toId, message } = parsed;
        const payload = JSON.stringify({ type: 'chat', data: { truckId, fromId, fromName, toId, message, timestamp: new Date().toISOString() } });
        // Broadcast to all WS clients (collector and resident will filter by relevance)
        wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
        // Push notify collector if their app is closed
        const collectorSub = db.prepare('SELECT subscription FROM push_subscriptions WHERE userId=?').get(toId);
        if (collectorSub) {
          try {
            webpush.sendNotification(JSON.parse(collectorSub.subscription), JSON.stringify({
              notification: {
                title: `💬 Message from ${fromName}`,
                body: message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png'
              }
            })).catch(() => {});
          } catch { /* skip */ }
        }
        return;
      }

      const { truckId, lat, lng, collectorId, scheduleId } = parsed;
      const now = new Date().toISOString();
      db.prepare('UPDATE trucks SET lat=?,lng=?,lastUpdated=? WHERE id=?').run(lat, lng, now, truckId);
      db.prepare('INSERT INTO truck_location_logs (id,truckId,collectorId,lat,lng,timestamp,scheduleId) VALUES (?,?,?,?,?,?,?)')
        .run(require('crypto').randomUUID(), truckId, collectorId||null, lat, lng, now, scheduleId||null);
      const truck = db.prepare('SELECT * FROM trucks WHERE id=?').get(truckId);
      if (truck) {
        const payload = JSON.stringify({ type: 'truck_update', data: { ...truck, lastUpdated: new Date(truck.lastUpdated) } });
        wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });

        // Push notification: alert residents within 1km
        const cooldownSetting = db.prepare("SELECT value FROM settings WHERE key='nearbyNotifCooldownMinutes'").get();
        const cooldownMs = (cooldownSetting ? +cooldownSetting.value : 10) * 60 * 1000;
        const subs = db.prepare('SELECT userId, subscription FROM push_subscriptions').all();
        subs.forEach(row => {
          try {
            const sub = JSON.parse(row.subscription);
            const resLat = sub._lat, resLng = sub._lng;
            if (resLat == null || resLng == null) return;
            const R = 6371000;
            const dLat = (lat - resLat) * Math.PI / 180;
            const dLng = (lng - resLng) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(resLat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)**2;
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            if (dist <= 1000) {
              const lastTime = lastNotified.get(row.userId) || 0;
              if (Date.now() - lastTime < cooldownMs) return;
              lastNotified.set(row.userId, Date.now());
              webpush.sendNotification(sub, JSON.stringify({
                notification: {
                  title: '🚛 Truck Nearby!',
                  body: 'A waste collection truck is within 1km of your location.',
                  icon: '/icons/icon-192x192.png',
                  badge: '/icons/icon-72x72.png',
                  vibrate: [200, 100, 200]
                }
              })).catch(() => {});
            }
          } catch { /* skip bad subscription */ }
        });
      }
    } catch (e) { /* ignore malformed */ }
  });

  ws.on('close', () => console.log('WS client disconnected'));
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`MENRO EcoTrack API running on port ${PORT}`));
