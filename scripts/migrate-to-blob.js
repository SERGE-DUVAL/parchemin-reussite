require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

const LOCAL_FILE = path.join(__dirname, '..', 'data', 'students.json');

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "BLOB_READ_WRITE_TOKEN manquant dans .env. Va chercher ce token dans le tableau de bord Vercel (Storage > ton Blob store) et ajoute-le a ton fichier .env avant de relancer cette commande."
    );
    process.exit(1);
  }

  if (!fs.existsSync(LOCAL_FILE)) {
    console.error(`Fichier introuvable : ${LOCAL_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(LOCAL_FILE, 'utf-8');
  const students = JSON.parse(raw || '[]');

  await put('students.json', JSON.stringify(students, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log(`${students.length} parchemin(s) transfere(s) vers le Blob store avec succes.`);
}

main().catch((err) => {
  console.error('Echec de la migration :', err);
  process.exit(1);
});
