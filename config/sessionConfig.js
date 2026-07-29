const sessionConfig = {
  secret: process.env.SESSION_SECRET || "lang-and-co-secret-key",
  resave: false,
  saveUninitialized: false,
};

module.exports = {
  secret: process.env.SESSION_SECRET || "development-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
};