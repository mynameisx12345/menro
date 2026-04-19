const express = require('express');
const router = express.Router();
const { db, uuidv4 } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  res.json(db.prepare('SELECT * FROM waste_types ORDER BY name').all());
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const id = uuidv4();
  db.prepare('INSERT INTO waste_types (id,name,description,color) VALUES (?,?,?,?)').run(id, name, description || '', color || '#999999');
  res.status(201).json(db.prepare('SELECT * FROM waste_types WHERE id=?').get(id));
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM waste_types WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const { name, description, color } = { ...existing, ...req.body };
  db.prepare('UPDATE waste_types SET name=?,description=?,color=? WHERE id=?').run(name, description, color, req.params.id);
  res.json(db.prepare('SELECT * FROM waste_types WHERE id=?').get(req.params.id));
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM waste_types WHERE id=?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
