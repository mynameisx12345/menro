const express = require('express');
const router = express.Router();
const { db, uuidv4, parseComplaint } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json(db.prepare('SELECT * FROM complaints').all().map(parseComplaint));
});

router.get('/mine', authenticate, (req, res) => {
  res.json(db.prepare('SELECT * FROM complaints WHERE residentId=? ORDER BY timestamp DESC').all(req.user.id).map(parseComplaint));
});

router.post('/', authenticate, authorize('resident', 'admin'), (req, res) => {
  const id = uuidv4();
  const { type, routeId, description, photoUrl, photoUrls, address } = req.body;
  const now = new Date().toISOString();
  const photos = JSON.stringify(photoUrls?.length ? photoUrls : (photoUrl ? [photoUrl] : []));
  db.prepare('INSERT INTO complaints (id,residentId,residentName,type,routeId,timestamp,description,photoUrl,photoUrls,status,address) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.user.id, req.user.name, type, routeId, now, description, photoUrl||null, photos, 'open', address);
  res.status(201).json(parseComplaint(db.prepare('SELECT * FROM complaints WHERE id=?').get(id)));
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM complaints WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Complaint not found' });
  const { status } = req.body;
  db.prepare('UPDATE complaints SET status=? WHERE id=?').run(status, req.params.id);
  res.json(parseComplaint(db.prepare('SELECT * FROM complaints WHERE id=?').get(req.params.id)));
});

module.exports = router;
