const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "TonMotDePasse"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nAjoute cette ligne dans ton fichier .env :\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
