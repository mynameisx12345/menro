const express = require('express');
const router = express.Router();
const { db, uuidv4, parseTruck } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  res.json(db.prepare('SELECT * FROM trucks').all().map(parseTruck));
});

router.get('/:id', authenticate, (req, res) => {
  const truck = parseTruck(db.prepare('SELECT * FROM trucks WHERE id = ?').get(req.params.id));
  if (!truck) return res.status(404).json({ message: 'Truck not found' });
  res.json(truck);
});

router.put('/:id/location', authenticate, authorize('collector', 'admin'), (req, res) => {
  const { lat, lng } = req.body;
  const now = new Date().toISOString();
  const info = db.prepare('UPDATE trucks SET lat=?,lng=?,lastUpdated=? WHERE id=?').run(lat, lng, now, req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'Truck not found' });
  res.json(parseTruck(db.prepare('SELECT * FROM trucks WHERE id=?').get(req.params.id)));
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const id = uuidv4();
  const { plateNumber, collectorId, collectorName, wasteType, status, lat, lng, route } = req.body;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO trucks (id,plateNumber,collectorId,collectorName,wasteType,status,lat,lng,route,lastUpdated) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, plateNumber, collectorId||null, collectorName, wasteType, status||'idle', lat||0, lng||0, route, now);
  res.status(201).json(parseTruck(db.prepare('SELECT * FROM trucks WHERE id=?').get(id)));
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const { plateNumber, collectorId, collectorName, wasteType, status, lat, lng, route } = req.body;
  const now = new Date().toISOString();
  const info = db.prepare('UPDATE trucks SET plateNumber=?,collectorId=?,collectorName=?,wasteType=?,status=?,lat=?,lng=?,route=?,lastUpdated=? WHERE id=?')
    .run(plateNumber, collectorId||null, collectorName, wasteType, status, lat, lng, route, now, req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'Truck not found' });
  res.json(parseTruck(db.prepare('SELECT * FROM trucks WHERE id=?').get(req.params.id)));
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM trucks WHERE id=?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'Truck not found' });
  res.status(204).send();
});

module.exports = router;
