const express = require('express');
const router  = express.Router();
const { threads, blogPosts } = require('../constants/data');

router.get('/', (req, res) => {
  res.render('index', { title: 'Home', latestThreads: threads.slice(0,3), latestPosts: blogPosts.slice(0,3) });
});

router.get('/sitemap', (req, res) => {
  const { threads, blogPosts, reviews } = require('../constants/data');
  res.render('shared/sitemap', { title: 'Sitemap', threads, blogPosts, reviews });
});

module.exports = router;
