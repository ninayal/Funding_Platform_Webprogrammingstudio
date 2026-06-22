const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const { users } = require('../constants/data');
const { requireLogin } = require('../middleware/auth');

router.get('/register', (req, res) => res.render('shared/register', { title: 'Register', error: null }));

router.post('/register', async (req, res) => {
  const { username, email, password, bio } = req.body;
  if (!username || !email || !password)
    return res.render('shared/register', { title: 'Register', error: 'All fields are required.' });
  if (users.find(u => u.username === username))
    return res.render('shared/register', { title: 'Register', error: 'Username already taken.' });
  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: users.length+1, username, email, password: hashed, role:'user', bio: bio||'', createdAt: new Date(), isLocked: false };
  users.push(newUser);
  req.session.user = { id: newUser.id, username, email, role:'user', isLocked: false };
  res.redirect('/');
});

router.get('/login', (req, res) => res.render('shared/login', { title: 'Login', error: null }));

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username || u.email === username);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.render('shared/login', { title: 'Login', error: 'Invalid username or password.' });
  if (user.isLocked)
    return res.render('shared/login', { title: 'Login', error: 'Your account has been locked.' });
  req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role, isLocked: user.isLocked };
  res.redirect('/');
});

router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/auth/login'); });

router.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const user = users.find(u => u.id === req.session.user.id);
  res.render('shared/profile', { title: 'My Profile', profileUser: user, error: null, success: null });
});

router.post('/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const { email, bio, new_password } = req.body;
  const user = users.find(u => u.id === req.session.user.id);
  if (email) user.email = email;
  if (bio)   user.bio   = bio;
  if (new_password) user.password = await bcrypt.hash(new_password, 10);
  res.render('shared/profile', { title: 'My Profile', profileUser: user, error: null, success: 'Profile updated!' });
});

module.exports = router;
