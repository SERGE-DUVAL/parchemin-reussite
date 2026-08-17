const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { resolveDiplome } = require('../utils/diplome');
const { resolveClasseSuperieure } = require('../utils/classeProgression');

router.get('/:slug', async (req, res, next) => {
  try {
    const student = await db.getStudentBySlug(req.params.slug);
    if (!student) {
      return res.status(404).render('404');
    }
    
    // Logique inchangée pour les diplômes
    const diplomeAffiche = resolveDiplome(student.classe, student.diplome);
    
    // Nouvelle logique pour les passages : utilise classeSuperieure si disponible
    // sinon calcule automatiquement, sinon utilise "Classe supérieure" par défaut
    let classeSuperieureAffiche = 'Classe supérieure';
    if (student.type === 'passage') {
      classeSuperieureAffiche = resolveClasseSuperieure(student.classe, student.classeSuperieure);
    }
    
    const shareUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.render('parchemin', { student, diplomeAffiche, classeSuperieureAffiche, shareUrl });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
