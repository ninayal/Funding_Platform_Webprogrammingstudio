const express = require('express');
const router  = express.Router();
const { requireAdmin } = require('../middleware/auth');
const { users, threads } = require('../constants/data');

router.use(requireAdmin);

router.get('/', (req, res) => res.render('shared/admin', { title: 'Administration', users, threads }));

router.post('/users/:id/lock',   (req, res) => { const u = users.find(u=>u.id===+req.params.id);   if(u) u.isLocked=true;  res.redirect('/admin'); });
router.post('/users/:id/unlock', (req, res) => { const u = users.find(u=>u.id===+req.params.id);   if(u) u.isLocked=false; res.redirect('/admin'); });
router.post('/threads/:id/archive', (req, res) => { const t = threads.find(t=>t.id===+req.params.id); if(t) t.isArchived=true; res.redirect('/admin'); });

module.exports = router;
