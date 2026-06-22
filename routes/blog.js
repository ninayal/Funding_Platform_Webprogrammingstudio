const express = require('express');
const router  = express.Router();
const { requireLogin } = require('../middleware/auth');
const { blogPosts, users } = require('../constants/data');

router.get('/', (req, res) => {
  const { search, category, sort } = req.query;
  let list = [...blogPosts];
  if (search)   list = list.filter(p=>p.title.toLowerCase().includes(search.toLowerCase()));
  if (category) list = list.filter(p=>p.category===category);
  if (sort==='oldest') list.sort((a,b)=>a.createdAt-b.createdAt);
  else                 list.sort((a,b)=>b.createdAt-a.createdAt);
  res.render('blog/blog_list', { title: 'Blog', posts: list, query: req.query, users });
});

router.get('/new', requireLogin, (req,res) => res.render('blog/blog_new', { title: 'New Post', post: null, error: null }));

router.post('/new', requireLogin, (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title||!content) return res.render('blog/blog_new', { title: 'New Post', post: null, error: 'Title and content required.' });
  const p = { id: blogPosts.length+1, title, content, category, tags: tags?tags.split(',').map(t=>t.trim()):[], authorId: req.session.user.id, createdAt: new Date(), image:'/images/blog/default.jpg' };
  blogPosts.push(p);
  res.redirect('/blog/'+p.id);
});

router.get('/:id', (req, res) => {
  const post = blogPosts.find(p=>p.id===+req.params.id);
  if (!post) return res.status(404).render('shared/404', { title: 'Not Found' });
  res.render('blog/blog_detail', { title: post.title, post, users });
});

router.get('/:id/edit', requireLogin, (req, res) => {
  const post = blogPosts.find(p=>p.id===+req.params.id && p.authorId===req.session.user.id);
  if (!post) return res.redirect('/blog');
  res.render('blog/blog_new', { title: 'Edit Post', post, error: null });
});

router.post('/:id/edit', requireLogin, (req, res) => {
  const post = blogPosts.find(p=>p.id===+req.params.id && p.authorId===req.session.user.id);
  if (post) { post.title=req.body.title||post.title; post.content=req.body.content||post.content; post.category=req.body.category||post.category; }
  res.redirect('/blog/'+req.params.id);
});

router.post('/:id/delete', requireLogin, (req, res) => {
  const idx = blogPosts.findIndex(p=>p.id===+req.params.id && p.authorId===req.session.user.id);
  if (idx!==-1) blogPosts.splice(idx,1);
  res.redirect('/blog');
});

module.exports = router;
