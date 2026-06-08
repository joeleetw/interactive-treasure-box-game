const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, (req, res) => {
  const { score } = req.body;
  if (score === undefined) return res.status(400).json({ error: 'Score required' });

  const { lastInsertRowid: id } = db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)').run(req.user.id, score);
  res.status(201).json({ id });
});

router.get('/', requireAuth, (req, res) => {
  const scores = db.prepare('SELECT score, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(scores);
});

module.exports = router;
