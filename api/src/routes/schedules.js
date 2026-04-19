const express = require('express');
const router = express.Router();
const { db, uuidv4, parseSchedule } = require('../data/db');
const { authenticate, authorize } = require('../middleware/auth');

let wss;
router.setWss = (w) => { wss = w; };

const broadcast = (data) => {
  if (!wss) return;
  const payload = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(payload); });
};

router.get('/', authenticate, (req, res) => {
  const { date, routeId } = req.query;
  let sql = 'SELECT * FROM schedules WHERE 1=1';
  const params = [];
  if (date)    { sql += ' AND date=?';    params.push(date); }
  if (routeId) { sql += ' AND routeId=?'; params.push(routeId); }
  res.json(db.prepare(sql).all(...params).map(parseSchedule));
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const id = uuidv4();
  const { routeId, wasteType, truckId, date, timeSlot, areas } = req.body;
  db.prepare('INSERT INTO schedules (id,routeId,wasteType,truckId,date,timeSlot,areas,status) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, routeId, wasteType, truckId, date, timeSlot, JSON.stringify(areas||[]), 'pending');
  res.status(201).json(parseSchedule(db.prepare('SELECT * FROM schedules WHERE id=?').get(id)));
});

router.put('/:id', authenticate, (req, res) => {
  const existing = db.prepare('SELECT * FROM schedules WHERE id=?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Schedule not found' });
  const { role, truckId } = req.user;
  if (role !== 'admin') {
    if (role !== 'collector' || existing.truckId !== truckId) return res.status(403).json({ message: 'Forbidden' });
    // collectors can only update status
    const { status, completedAt } = req.body;
    if (status === 'in-progress') {
      db.prepare("UPDATE schedules SET status='pending' WHERE truckId=? AND id!=? AND status!='completed'")
        .run(existing.truckId, req.params.id);
    }
    if (status === 'completed') {
      db.prepare('UPDATE schedules SET status=?, completedAt=? WHERE id=?')
        .run(status, completedAt || new Date().toISOString(), req.params.id);
    } else {
      db.prepare('UPDATE schedules SET status=? WHERE id=?').run(status, req.params.id);
    }
    const updated = parseSchedule(db.prepare('SELECT * FROM schedules WHERE id=?').get(req.params.id));
    broadcast({ type: 'schedule_update', data: updated });
    return res.json(updated);
  }
  const { routeId, wasteType, truckId: tid, date, timeSlot, areas, status } = { ...parseSchedule(existing), ...req.body };
  db.prepare('UPDATE schedules SET routeId=?,wasteType=?,truckId=?,date=?,timeSlot=?,areas=?,status=? WHERE id=?')
    .run(routeId, wasteType, tid, date, timeSlot, JSON.stringify(areas||[]), status, req.params.id);
  const adminUpdated = parseSchedule(db.prepare('SELECT * FROM schedules WHERE id=?').get(req.params.id));
  broadcast({ type: 'schedule_update', data: adminUpdated });
  res.json(adminUpdated);
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM schedules WHERE id=?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'Schedule not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
