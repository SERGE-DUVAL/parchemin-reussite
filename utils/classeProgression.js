function stripAccents(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function extractSerie(remainder) {
  const s = (remainder || '').trim().replace(/^[,\-\s]+/, '');
  return s ? s.toUpperCase() : '';
}

function extractFieldOfStudy(remainder) {
  const s = (remainder || '').trim();
  return s ? s : '';
}

// Progression maternelle (système francophone)
const MATERNELLE_PROGRESS = {
  'ps': 'ms',
  'petite section': 'moyenne section',
  'ps ': 'ms',
  'petite section ': 'moyenne section ',
  'ms': 'gs',
  'moyenne section': 'grande section',
  'ms ': 'gs',
  'moyenne section ': 'grande section ',
  'gs': 'cp',
  'grande section': 'cp',
  'gs ': 'cp',
  'grande section ': 'cp',
};

// Progression primaire (système francophone)
const PRIMAIRE_PROGRESS = {
  'cp': 'ce1',
  'cp ': 'ce1',
  'ce1': 'ce2',
  'ce1 ': 'ce2',
  'ce2': 'cm1',
  'ce2 ': 'cm1',
  'cm1': 'cm2',
  'cm1 ': 'cm2',
  'cm2': '6ème',
  'cm2 ': '6ème',
};

// Progression collège (système francophone)
const COLLEGE_PROGRESS = {
  '6ème': '5ème',
  '6eme': '5ème',
  '6 eme': '5ème',
  '6 ème': '5ème',
  '5ème': '4ème',
  '5eme': '4ème',
  '5 eme': '4ème',
  '5 ème': '4ème',
  '4ème': '3ème',
  '4eme': '3ème',
  '4 eme': '3ème',
  '4 ème': '3ème',
  '3ème': 'seconde',
  '3eme': 'seconde',
  '3 eme': 'seconde',
  '3 ème': 'seconde',
};

// Progression lycée (système francophone)
const LYCEE_PROGRESS = {
  'seconde': 'première',
  '2nde': 'première',
  '2nd': 'première',
  'premiere': 'terminale',
  'première': 'terminale',
  '1ère': 'terminale',
  '1er': 'terminale',
  'terminale': 'enseignement supérieur',
  'tle': 'enseignement supérieur',
  'terminale ': 'enseignement supérieur',
  'tle ': 'enseignement supérieur',
};

// Progression système anglophone (Form system)
const ANGLOPHONE_PROGRESS = {
  'form 1': 'form 2',
  'form1': 'form2',
  'form 2': 'form 3',
  'form2': 'form3',
  'form 3': 'form 4',
  'form3': 'form4',
  'form 4': 'form 5',
  'form4': 'form5',
  'form 5': 'lower sixth',
  'form5': 'lower sixth',
  'lower sixth': 'upper sixth',
  'lower 6th': 'upper 6th',
  'l6': 'u6',
  'upper sixth': 'enseignement supérieur',
  'upper 6th': 'enseignement supérieur',
  'u6': 'enseignement supérieur',
};

// Détection automatique du système éducatif
function detectEducationSystem(classe) {
  const flat = stripAccents(classe).toLowerCase().trim();
  
  // Détection système anglophone
  if (/^form\s*\d|^form\d|^lower\s*sixth|^upper\s*sixth|^l6|^u6|^lower\s*6th|^upper\s*6th/.test(flat)) {
    return 'anglophone';
  }
  
  // Détection années d'enseignement supérieur (avec et sans accents)
  if (/^\d+\s*(ère|ere|ème|eme|e|er|year|année|annee)\s+.+/i.test(classe)) {
    return 'superieur';
  }
  
  // Détection maternelle
  if (/^ps|^petite\s*section|^ms|^moyenne\s*section|^gs|^grande\s*section/.test(flat)) {
    return 'maternelle';
  }
  
  // Détection primaire
  if (/^cp|^ce1|^ce2|^cm1|^cm6|^cm2/.test(flat)) {
    return 'primaire';
  }
  
  // Détection collège
  if (/^6\s*ème|^6eme|^6\s*eme|^5\s*ème|^5eme|^5\s*eme|^4\s*ème|^4eme|^4\s*eme|^3\s*ème|^3eme|^3\s*eme/.test(flat)) {
    return 'college';
  }
  
  // Détection lycée
  if (/^seconde|^2nde|^2nd|^première|^1ère|^1er|^terminale|^tle/.test(flat)) {
    return 'lycee';
  }
  
  return 'unknown';
}

// Fonction principale : retourne la classe/année supérieure
function getNextClass(currentClass, educationSystem = null, fieldOfStudy = null) {
  const classe = (currentClass || '').trim();
  if (!classe) return '';
  
  const flat = stripAccents(classe).toLowerCase();
  const system = educationSystem || detectEducationSystem(classe);
  
  let nextClass = '';
  let serie = '';
  
  // Extraction de la série pour les classes françaises
  if (system === 'college' || system === 'lycee') {
    const match = flat.match(/^[\d\sèéêë]+(?:ème|eme|ere|er|nde|nd|e)?\s*(.*)$/);
    if (match) {
      serie = extractSerie(match[1]);
    }
  }
  
  // Traitement selon le système éducatif
  switch (system) {
    case 'maternelle':
      nextClass = MATERNELLE_PROGRESS[flat] || '';
      break;
      
    case 'primaire':
      nextClass = PRIMAIRE_PROGRESS[flat] || '';
      break;
      
    case 'college':
      nextClass = COLLEGE_PROGRESS[flat] || '';
      if (nextClass && serie) {
        nextClass = nextClass.charAt(0).toUpperCase() + nextClass.slice(1) + (serie ? ' ' + serie : '');
      }
      break;
      
    case 'lycee':
      nextClass = LYCEE_PROGRESS[flat] || '';
      if (nextClass && serie && nextClass !== 'enseignement supérieur') {
        nextClass = nextClass.charAt(0).toUpperCase() + nextClass.slice(1) + (serie ? ' ' + serie : '');
      }
      break;
      
    case 'anglophone':
      nextClass = ANGLOPHONE_PROGRESS[flat] || '';
      break;
      
    case 'superieur':
      // Gestion des années d'enseignement supérieur (1ère, 2ème, 3ème, etc.)
      // On utilise directement la chaîne originale pour préserver les accents
      const yearMatch = classe.match(/^(\d+)\s*(ère|ere|ème|eme|e|er|year|année|annee)\s+(.+)$/i);
      if (yearMatch) {
        const currentYear = parseInt(yearMatch[1], 10);
        let field = extractFieldOfStudy(yearMatch[3]);
        
        // Si le champ commence par "année", on le retire pour éviter la duplication
        if (field && /^(année|annee|year)/i.test(field)) {
          field = field.replace(/^(année|annee|year)\s*/i, '').trim();
        }
        
        const nextYear = currentYear + 1;
        
        // Logique de fin de cycle selon le type de formation
        if (currentYear >= 3 && currentYear <= 5) {
          // Licence/Bachelor généralement 3-4 ans
          if (currentYear === 3) {
            nextClass = field ? `4ème année ${field}` : '4ème année';
          } else if (currentYear === 4) {
            nextClass = field ? `5ème année ${field}` : '5ème année';
          } else if (currentYear >= 5) {
            nextClass = 'enseignement supérieur - cycle avancé';
          }
        } else if (currentYear < 3) {
          nextClass = field ? `${nextYear}ème année ${field}` : `${nextYear}ème année`;
        } else {
          nextClass = 'enseignement supérieur - cycle avancé';
        }
      }
      break;
      
    default:
      // Tentative de détection générique
      nextClass = tryGenericProgression(classe, flat);
  }
  
  return nextClass || '';
}

// Progression générique pour les cas non reconnus
function tryGenericProgression(original, flat) {
  // Essai avec les différents systèmes
  const allMaps = {
    ...MATERNELLE_PROGRESS,
    ...PRIMAIRE_PROGRESS,
    ...COLLEGE_PROGRESS,
    ...LYCEE_PROGRESS,
    ...ANGLOPHONE_PROGRESS,
  };
  
  if (allMaps[flat]) {
    return allMaps[flat];
  }
  
  // Si rien trouvé, retourner une valeur par défaut
  return 'classe supérieure';
}

// Fonction utilitaire pour résoudre la classe supérieure
function resolveClasseSuperieure(classe, classeSuperieureOverride) {
  const override = (classeSuperieureOverride || '').trim();
  if (override) return override;
  
  const suggestion = getNextClass(classe);
  return suggestion || 'Classe supérieure';
}

module.exports = {
  getNextClass,
  resolveClasseSuperieure,
  detectEducationSystem,
};
