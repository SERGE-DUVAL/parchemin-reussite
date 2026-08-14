function stripAccents(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function extractSerie(remainder) {
  const s = (remainder || '').trim().replace(/^[,\-\s]+/, '');
  return s ? s.toUpperCase() : '';
}

// Deduit l'intitule du diplome camerounais a partir du libelle de la classe
// (ex: "Terminale D" -> "Baccalaureat, serie D", "3eme" -> "B.E.P.C.")
function suggestDiplome(classeRaw) {
  const classe = (classeRaw || '').trim();
  const flat = stripAccents(classe).toLowerCase();

  if (/^(3\s*e?me|troisieme)\b/.test(flat)) {
    return 'B.E.P.C.';
  }

  let match = flat.match(/^(?:premiere|1\s*ere|1\s*re)\b(.*)$/);
  if (match) {
    const serie = extractSerie(match[1]);
    return serie ? `Probatoire, série ${serie}` : 'Probatoire';
  }

  match = flat.match(/^(?:terminale|tle)\b(.*)$/);
  if (match) {
    const serie = extractSerie(match[1]);
    return serie ? `Baccalauréat, série ${serie}` : 'Baccalauréat';
  }

  return '';
}

// Determine le libelle final a afficher sur le parchemin : la saisie manuelle
// de l'admin est prioritaire, sinon on deduit a partir de la classe.
function resolveDiplome(classe, diplomeOverride) {
  const override = (diplomeOverride || '').trim();
  if (override) return override;

  const suggestion = suggestDiplome(classe);
  return suggestion || 'diplome';
}

module.exports = { suggestDiplome, resolveDiplome };
