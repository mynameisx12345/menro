const express = require('express');
const router = express.Router();
const { db, uuidv4, parseSegregation } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'collector'), (req, res) => {
  res.json(db.prepare('SELECT * FROM segregation_issues').all().map(parseSegregation));
});

router.get('/mine', authenticate, authorize('collector'), (req, res) => {
  res.json(db.prepare('SELECT * FROM segregation_issues WHERE collectorId=? ORDER BY timestamp DESC').all(req.user.id).map(parseSegregation));
});

router.post('/', authenticate, authorize('collector', 'admin'), (req, res) => {
  const id = uuidv4();
  const { address, wasteType, issue, photoUrl, photoUrls } = req.body;
  const photos = JSON.stringify(photoUrls?.length ? photoUrls : (photoUrl ? [photoUrl] : []));
  const now = new Date().toISOString();
  db.prepare('INSERT INTO segregation_issues (id,collectorId,collectorName,address,wasteType,issue,photoUrl,photoUrls,timestamp,residentNotified) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.user.id, req.user.name, address, wasteType, issue, photoUrl||null, photos, now, 1);
  res.status(201).json(parseSegregation(db.prepare('SELECT * FROM segregation_issues WHERE id=?').get(id)));
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM segregation_issues WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const { status } = req.body;
  db.prepare('UPDATE segregation_issues SET status=? WHERE id=?').run(status, req.params.id);
  res.json(parseSegregation(db.prepare('SELECT * FROM segregation_issues WHERE id=?').get(req.params.id)));
});

module.exports = router;
