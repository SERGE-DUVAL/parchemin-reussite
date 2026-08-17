// Test de la logique de progression de classe
const { getNextClass, resolveClasseSuperieure } = require('./utils/classeProgression');

console.log('=== TESTS DE PROGRESSION DE CLASSE ===\n');

const testCases = [
  // Maternelle
  { input: 'Petite Section', expected: 'Moyenne Section' },
  { input: 'Moyenne Section', expected: 'Grande Section' },
  { input: 'Grande Section', expected: 'cp' },
  
  // Primaire
  { input: 'CP', expected: 'ce1' },
  { input: 'CE1', expected: 'ce2' },
  { input: 'CE2', expected: 'cm1' },
  { input: 'CM1', expected: 'cm2' },
  { input: 'CM2', expected: '6ème' },
  
  // Collège
  { input: '6ème', expected: '5ème' },
  { input: '5ème', expected: '4ème' },
  { input: '4ème', expected: '3ème' },
  { input: '3ème', expected: 'seconde' },
  
  // Lycée
  { input: 'Seconde', expected: 'première' },
  { input: 'Première', expected: 'terminale' },
  { input: 'Terminale', expected: 'enseignement supérieur' },
  
  // Système anglophone
  { input: 'Form 1', expected: 'form 2' },
  { input: 'Form 2', expected: 'form 3' },
  { input: 'Form 3', expected: 'form 4' },
  { input: 'Form 4', expected: 'form 5' },
  { input: 'Form 5', expected: 'lower sixth' },
  { input: 'Lower Sixth', expected: 'upper sixth' },
  
  // Enseignement supérieur
  { input: '1ère année Génie Informatique', expected: '2ème année Génie Informatique' },
  { input: '2ème année Droit', expected: '3ème année Droit' },
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = getNextClass(test.input);
  const success = result.toLowerCase() === test.expected.toLowerCase();
  
  if (success) {
    console.log(`✅ Test ${index + 1}: "${test.input}" → "${result}"`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: "${test.input}" → "${result}" (attendu: "${test.expected}")`);
    failed++;
  }
});

console.log(`\n=== RÉSULTATS ===`);
console.log(`Réussis: ${passed}/${testCases.length}`);
console.log(`Échoués: ${failed}/${testCases.length}`);

// Test de resolveClasseSuperieure
console.log('\n=== TESTS DE RESOLVECLASSESUPERIEURE ===\n');

const resolveTests = [
  { classe: 'CM2', override: '', expected: '6ème' },
  { classe: 'CM2', override: '5ème', expected: '5ème' }, // Override manuel
  { classe: '6ème', override: '', expected: '5ème' },
  { classe: 'Form 1', override: '', expected: 'form 2' },
];

resolveTests.forEach((test, index) => {
  const result = resolveClasseSuperieure(test.classe, test.override);
  const success = result.toLowerCase() === test.expected.toLowerCase();
  
  if (success) {
    console.log(`✅ Resolve test ${index + 1}: "${test.classe}" + "${test.override}" → "${result}"`);
    passed++;
  } else {
    console.log(`❌ Resolve test ${index + 1}: "${test.classe}" + "${test.override}" → "${result}" (attendu: "${test.expected}")`);
    failed++;
  }
});

console.log(`\n=== RÉSULTATS FINAUX ===`);
console.log(`Total réussis: ${passed}/${testCases.length + resolveTests.length}`);
console.log(`Total échoués: ${failed}/${testCases.length + resolveTests.length}`);

if (failed === 0) {
  console.log('\n🎉 Tous les tests sont passés !');
} else {
  console.log('\n⚠️ Certains tests ont échoué.');
  process.exit(1);
}
