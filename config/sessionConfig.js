const sessionConfig = {
  secret: process.env.SESSION_SECRET || "lang-and-co-secret-key",
  resave: false,
  saveUninitialized: false,
};

module.exports = sessionConfig;