const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../utils/db');
const { requireAdmin } = require('../middleware/auth');

router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  const hash = process.env.ADMIN_PASSWORD_HASH || '$2a$10$wv4n.vpp3h4Nf0WOKRMAFOsxc6qMYhD4BQ7TnfM0Kxqsk9JbNUG.u';

  if (!hash) {
    return res.render('admin/login', {
      error: "Aucun mot de passe n'est configure (ADMIN_PASSWORD_HASH manquant dans .env).",
    });
  }

  if (password && bcrypt.compareSync(password, hash)) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }

  res.render('admin/login', { error: 'Mot de passe incorrect.' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(requireAdmin);

router.get('/', (req, res) => {
  const students = db.getAllStudents();
  res.render('admin/dashboard', { students });
});

router.get('/nouveau', (req, res) => {
  res.render('admin/form', { student: null, defaultAnnee: '2025/2026' });
});

router.post('/students', (req, res) => {
  db.addStudent(req.body);
  res.redirect('/admin');
});

router.get('/students/:id/modifier', (req, res) => {
  const student = db.getStudentById(req.params.id);
  if (!student) return res.status(404).render('404');
  res.render('admin/form', { student, defaultAnnee: student.anneeAcademique });
});

router.post('/students/:id/modifier', (req, res) => {
  const updated = db.updateStudent(req.params.id, req.body);
  if (!updated) return res.status(404).render('404');
  res.redirect('/admin');
});

router.post('/students/:id/supprimer', (req, res) => {
  db.deleteStudent(req.params.id);
  res.redirect('/admin');
});

module.exports = router;
