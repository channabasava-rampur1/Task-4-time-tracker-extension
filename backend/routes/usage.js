const express = require('express');
const router = express.Router();
const Usage = require('../models/Usage');
const auth = require('../middleware/auth');

// POST /api/usage - from Chrome extension (no auth required)
router.post('/', async (req, res) => {
  try {
    const { userEmail, events } = req.body;
    if (!userEmail || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Missing userEmail or events' });
    }
    const docs = events.map(e => ({
      userEmail,
      domain: e.domain,
      category: e.category || 'neutral',
      seconds: Number(e.seconds) || 0,
      ts: e.ts ? new Date(e.ts) : new Date()
    }));
    await Usage.insertMany(docs);
    return res.json({ ok: true, inserted: docs.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save usage' });
  }
});

// GET /api/usage - protected (logged-in user)
router.get('/', auth, async (req, res) => {
  try {
    const email = req.user?.email;
    const docs = await Usage.find({ userEmail: email }).sort({ ts: -1 }).limit(1000);
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

module.exports = router;
