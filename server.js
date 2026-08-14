require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const parchemninRoutes = require('./routes/parchemin');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 },
  })
);

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/parchemin', parchemninRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Famille Tepomo - site des parchemins lance sur http://localhost:${PORT}`);
  });
}

module.exports = app;
