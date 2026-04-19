const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(req.query.q)}&format=json&limit=1`;
    const r = await fetch(url, { headers: { 'User-Agent': 'MENRO-EcoTrack/1.0' }, signal: AbortSignal.timeout(5000) });
    const data = await r.json();
    res.json(data);
  } catch { res.json([]); }
});

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const r = await fetch(url, { headers: { 'User-Agent': 'MENRO-EcoTrack/1.0' }, signal: AbortSignal.timeout(5000) });
    const data = await r.json();
    res.json(data);
  } catch { res.json({}); }
});

module.exports = router;
