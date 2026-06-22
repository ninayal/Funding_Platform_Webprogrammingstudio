const express = require('express');
const router  = express.Router();
const { requireLogin } = require('../middleware/auth');
const { reviews, users } = require('../constants/data');

router.get('/', (req, res) => {
  const { search, rating, sort } = req.query;
  let list = [...reviews];
  if (search) list = list.filter(r=>r.title.toLowerCase().includes(search.toLowerCase()));
  if (rating) list = list.filter(r=>r.rating>=+rating);
  if (sort==='rating_desc') list.sort((a,b)=>b.rating-a.rating);
  else list.sort((a,b)=>b.createdAt-a.createdAt);
  res.render('review/review_list', { title: 'Reviews', reviews: list, query: req.query, users });
});

router.get('/new', requireLogin, (req,res) => res.render('review/review_new', { title: 'Write a Review', review: null, error: null }));

router.post('/new', requireLogin, (req, res) => {
  const { title, description, rating, product } = req.body;
  if (!title||!description||!rating) return res.render('review/review_new', { title: 'Write a Review', review: null, error: 'All fields required.' });
  const r = { id: reviews.length+1, title, description, rating:+rating, product, reviewerId: req.session.user.id, createdAt: new Date(), image:'/images/reviews/default.jpg' };
  reviews.push(r);
  res.redirect('/reviews/'+r.id);
});

router.get('/:id', (req, res) => {
  const review = reviews.find(r=>r.id===+req.params.id);
  if (!review) return res.status(404).render('shared/404', { title: 'Not Found' });
  res.render('review/review_detail', { title: review.title, review, users });
});

router.get('/:id/edit', requireLogin, (req, res) => {
  const review = reviews.find(r=>r.id===+req.params.id && r.reviewerId===req.session.user.id);
  if (!review) return res.redirect('/reviews');
  res.render('review/review_new', { title: 'Edit Review', review, error: null });
});

router.post('/:id/edit', requireLogin, (req, res) => {
  const review = reviews.find(r=>r.id===+req.params.id && r.reviewerId===req.session.user.id);
  if (review) { review.title=req.body.title||review.title; review.description=req.body.description||review.description; review.rating=+req.body.rating||review.rating; }
  res.redirect('/reviews/'+req.params.id);
});

router.post('/:id/delete', requireLogin, (req, res) => {
  const idx = reviews.findIndex(r=>r.id===+req.params.id && r.reviewerId===req.session.user.id);
  if (idx!==-1) reviews.splice(idx,1);
  res.redirect('/reviews');
});

module.exports = router;
