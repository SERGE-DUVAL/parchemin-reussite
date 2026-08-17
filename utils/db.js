const { put, get } = require('@vercel/blob');
const crypto = require('crypto');

// Toutes les donnees sont stockees dans un seul objet JSON, dans Vercel Blob.
// Vercel Functions tournent sur un systeme de fichiers en lecture seule en
// production : impossible d'ecrire dans un fichier local comme avant. Le
// Blob store est la seule persistance qui fonctionne a la fois en local et
// en production sur Vercel.
const BLOB_PATHNAME = 'students.json';

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function makeSlug(prenom, nom) {
  const base = slugify(`${prenom}-${nom}`) || 'eleve';
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

async function readStudents() {
  // useCache:false garantit de relire la derniere version ecrite (sinon le
  // CDN de Vercel peut renvoyer une copie en cache jusqu'a 60s apres une
  // ecriture, et un parchemin qui vient d'etre cree n'apparaitrait pas tout
  // de suite dans le tableau de bord).
  const result = await get(BLOB_PATHNAME, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return [];
  }
  const text = await new Response(result.stream).text();
  return JSON.parse(text || '[]');
}

async function writeStudents(students) {
  await put(BLOB_PATHNAME, JSON.stringify(students, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function getAllStudents() {
  const students = await readStudents();
  return students.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getStudentById(id) {
  const students = await readStudents();
  return students.find((s) => s.id === id);
}

async function getStudentBySlug(slug) {
  const students = await readStudents();
  return students.find((s) => s.slug === slug);
}

async function addStudent(data) {
  const students = await readStudents();
  const now = new Date().toISOString();
  const student = {
    id: crypto.randomUUID(),
    slug: makeSlug(data.prenom, data.nom),
    prenom: data.prenom.trim(),
    nom: data.nom.trim(),
    classe: data.classe.trim(),
    anneeAcademique: data.anneeAcademique.trim(),
    type: data.type === 'diplome' ? 'diplome' : 'passage',
    diplome: data.type === 'diplome' ? (data.diplome || '').trim() : '',
    classeSuperieure: data.type === 'passage' ? (data.classeSuperieure || '').trim() : '',
    dateEmission: data.dateEmission || now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
  };
  students.push(student);
  await writeStudents(students);
  return student;
}

async function updateStudent(id, data) {
  const students = await readStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const existing = students[index];
  const updated = {
    ...existing,
    prenom: data.prenom.trim(),
    nom: data.nom.trim(),
    classe: data.classe.trim(),
    anneeAcademique: data.anneeAcademique.trim(),
    type: data.type === 'diplome' ? 'diplome' : 'passage',
    diplome: data.type === 'diplome' ? (data.diplome || '').trim() : '',
    classeSuperieure: data.type === 'passage' ? (data.classeSuperieure || '').trim() : '',
    dateEmission: data.dateEmission || existing.dateEmission,
    updatedAt: new Date().toISOString(),
  };
  students[index] = updated;
  await writeStudents(students);
  return updated;
}

async function deleteStudent(id) {
  const students = await readStudents();
  const filtered = students.filter((s) => s.id !== id);
  await writeStudents(filtered);
  return filtered.length !== students.length;
}

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentBySlug,
  addStudent,
  updateStudent,
  deleteStudent,
};
