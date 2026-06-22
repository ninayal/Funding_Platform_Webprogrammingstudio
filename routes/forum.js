const express = require('express');
const router  = express.Router();
const { requireLogin } = require('../middleware/auth');
const { threads, users } = require('../constants/data');

router.get('/', (req, res) => {
  const { search, sort } = req.query;
  let list = threads.filter(t=>!t.isArchived);
  if (search) list = list.filter(t=>t.title.toLowerCase().includes(search.toLowerCase())||t.content.toLowerCase().includes(search.toLowerCase()));
  if (sort==='oldest') list.sort((a,b)=>a.createdAt-b.createdAt);
  else                 list.sort((a,b)=>b.createdAt-a.createdAt);
  res.render('forum/forum_list', { title: 'Forum', threads: list, query: req.query, users });
});

router.get('/new', requireLogin, (req,res) => res.render('forum/forum_new', { title: 'New Thread', thread: null, error: null }));

router.post('/new', requireLogin, (req, res) => {
  const { title, content } = req.body;
  if (!title||!content) return res.render('forum/forum_new', { title: 'New Thread', thread: null, error: 'Title and content required.' });
  const t = { id: threads.length+1, title, content, authorId: req.session.user.id, createdAt: new Date(), isArchived: false, replies: [] };
  threads.push(t);
  res.redirect('/forum/'+t.id);
});

router.get('/:id', (req, res) => {
  const thread = threads.find(t=>t.id===+req.params.id);
  if (!thread) return res.status(404).render('shared/404', { title: 'Not Found' });
  res.render('forum/forum_thread', { title: thread.title, thread, users });
});

router.post('/:id/reply', requireLogin, (req, res) => {
  const thread = threads.find(t=>t.id===+req.params.id);
  if (thread && req.body.content) thread.replies.push({ id: thread.replies.length+1, content: req.body.content, authorId: req.session.user.id, createdAt: new Date() });
  res.redirect('/forum/'+req.params.id);
});

router.get('/:id/edit', requireLogin, (req, res) => {
  const thread = threads.find(t=>t.id===+req.params.id && t.authorId===req.session.user.id);
  if (!thread) return res.redirect('/forum');
  res.render('forum/forum_new', { title: 'Edit Thread', thread, error: null });
});

router.post('/:id/edit', requireLogin, (req, res) => {
  const thread = threads.find(t=>t.id===+req.params.id && t.authorId===req.session.user.id);
  if (thread) { thread.title=req.body.title||thread.title; thread.content=req.body.content||thread.content; }
  res.redirect('/forum/'+req.params.id);
});

router.post('/:id/delete', requireLogin, (req, res) => {
  const thread = threads.find(t=>t.id===+req.params.id && t.authorId===req.session.user.id);
  if (thread) thread.isArchived = true;
  res.redirect('/forum');
});

module.exports = router;
