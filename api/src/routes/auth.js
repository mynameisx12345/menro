const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, uuidv4 } = require('../data/db');
const { SECRET, authenticate } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials' });
  if (user.disabled) return res.status(403).json({ message: 'Account is disabled' });
  if (user.deleted) return res.status(403).json({ message: 'Account not found' });
  if (user.status === 'pending') return res.status(403).json({ message: 'Your account is pending approval by the admin.' });

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, truckId: user.truckId }, SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, truckId: user.truckId, address: user.address } });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id,name,email,role,truckId,address,lat,lng FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});


router.put('/me', authenticate, (req, res) => {
  const existing = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!existing) return res.status(404).json({ message: 'User not found' });
  const { name, email, password, address, lat, lng } = req.body;
  const hashed = password ? bcrypt.hashSync(password, 8) : existing.password;
  db.prepare('UPDATE users SET name=?,email=?,password=?,address=?,lat=?,lng=? WHERE id=?')
    .run(name ?? existing.name, email ?? existing.email, hashed, address ?? existing.address, lat ?? existing.lat, lng ?? existing.lng, req.user.id);
  res.json(db.prepare('SELECT id,name,email,role,truckId,address,lat,lng FROM users WHERE id=?').get(req.user.id));
});

router.post('/register', (req, res) => {
  const authHeader = req.headers['authorization'];
  let callerRole = null;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = require('jsonwebtoken').verify(token, SECRET);
      callerRole = decoded.role;
    } catch {}
  }
  const { name, email, password, role, truckId, address, lat, lng, status } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields required' });
  if (!['admin', 'resident', 'collector'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  // Non-admin self-registration: only resident allowed, always pending
  if (!callerRole || callerRole !== 'admin') {
    if (role !== 'resident') return res.status(403).json({ message: 'Self-registration is only allowed for residents' });
  }
  if (role === 'collector' && !truckId) return res.status(400).json({ message: 'Truck is required for collector' });
  if (role === 'resident' && !address) return res.status(400).json({ message: 'Address is required for resident' });
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return res.status(409).json({ message: 'Email already exists' });

  const id = uuidv4();
  const finalStatus = (callerRole === 'admin') ? (status || 'approved') : 'pending';
  db.prepare('INSERT INTO users (id,name,email,password,role,truckId,address,lat,lng,status) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, name, email, bcrypt.hashSync(password, 8), role, truckId || null, address || null, lat ?? null, lng ?? null, finalStatus);
  res.status(201).json({ id, name, email, role, truckId, address, lat, lng, status: finalStatus });
});

router.get('/residents', authenticate, (req, res) => {
  res.json(db.prepare('SELECT id,name,address,lat,lng FROM users WHERE role=? AND deleted=0 AND address IS NOT NULL').all('resident'));
});

router.get('/users', authenticate, (req, res) => {
  const caller = db.prepare('SELECT role FROM users WHERE id=?').get(req.user.id);
  if (!caller || caller.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  res.json(db.prepare('SELECT id,name,email,role,truckId,address,disabled,status FROM users WHERE deleted=0').all());
});

router.put('/users/:id', authenticate, (req, res) => {
  const caller = db.prepare('SELECT role FROM users WHERE id=?').get(req.user.id);
  if (!caller || caller.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const existing = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'User not found' });
  const { name, email, role, truckId, address, password, disabled, lat, lng, status } = { ...existing, ...req.body };
  const hashed = password && !password.startsWith('$2') ? bcrypt.hashSync(password, 8) : existing.password;
  db.prepare('UPDATE users SET name=?,email=?,role=?,truckId=?,address=?,password=?,disabled=?,lat=?,lng=?,status=? WHERE id=?')
    .run(name, email, role, truckId || null, address || null, hashed, disabled ? 1 : 0, lat ?? null, lng ?? null, status || 'approved', req.params.id);

  // Push notification on approval
  if (existing.status === 'pending' && status === 'approved') {
    const sub = db.prepare('SELECT subscription FROM push_subscriptions WHERE userId=?').get(req.params.id);
    console.log('[push] approval: userId', req.params.id, 'sub found:', !!sub);
    if (sub) {
      const { webpush } = require('./push');
      webpush.sendNotification(JSON.parse(sub.subscription), JSON.stringify({
        notification: {
          title: '✅ Account Approved!',
          body: 'Your MENRO EcoTrack account has been approved. You can now log in.',
          icon: '/icons/icon-192x192.png'
        }
      })).then(() => console.log('[push] approval notification sent'))
         .catch(e => console.error('[push] approval notification failed:', e.message));
    }
  }

  res.json(db.prepare('SELECT id,name,email,role,truckId,address,disabled,lat,lng,status FROM users WHERE id=?').get(req.params.id));
});

router.delete('/users/:id', authenticate, (req, res) => {
  const caller = db.prepare('SELECT role FROM users WHERE id=?').get(req.user.id);
  if (!caller || caller.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const info = db.prepare('UPDATE users SET deleted=1 WHERE id=?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
