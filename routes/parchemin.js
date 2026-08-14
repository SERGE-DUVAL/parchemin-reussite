const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { resolveDiplome } = require('../utils/diplome');

router.get('/:slug', (req, res) => {
  const student = db.getStudentBySlug(req.params.slug);
  if (!student) {
    return res.status(404).render('404');
  }
  const diplomeAffiche = resolveDiplome(student.classe, student.diplome);
  const shareUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  res.render('parchemin', { student, diplomeAffiche, shareUrl });
});

module.exports = router;
