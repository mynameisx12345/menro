const express = require('express');
const router = express.Router();
const { db } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const result = {};
  rows.forEach(r => result[r.key] = r.value);
  res.json(result);
});

router.put('/', authenticate, authorize('admin'), (req, res) => {
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)');
  const update = db.transaction(data => {
    Object.entries(data).forEach(([k, v]) => upsert.run(k, String(v)));
  });
  update(req.body);
  res.json({ ok: true });
});

module.exports = router;
