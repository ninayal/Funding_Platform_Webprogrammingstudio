// ============================================
// COSC3060 - Web Programming Studio
// Main Express Application
// ============================================

const express    = require('express');
const path       = require('path');
const session    = require('express-session');

const app = express();

// ─── View Engine (EJS) ───────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Middleware ──────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
secret: process.env.SESSION_SECRET || 'cosc3060-dev-secret',
resave: false,
saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Make logged-in user available in all views
app.use((req, res, next) => {
res.locals.user = req.session.user || null;
next();
});

// ─── Routes ──────────────────────────────────
app.use('/',        require('./routes/index'));
app.use('/auth',    require('./routes/auth'));
app.use('/cart',    require('./routes/cart'));
app.use('/forum',   require('./routes/forum'));
app.use('/blog',    require('./routes/blog'));
app.use('/reviews', require('./routes/reviews'));
app.use('/admin',   require('./routes/admin'));

// ─── 404 Handler ─────────────────────────────
app.use((req, res) => {
res.status(404).render('shared/404', { title: 'Page Not Found' });
});

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
