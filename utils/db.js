const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'data', 'students.json');

function readStudents() {
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeStudents(students) {
  fs.writeFileSync(DB_FILE, JSON.stringify(students, null, 2), 'utf-8');
}

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

function getAllStudents() {
  return readStudents().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getStudentById(id) {
  return readStudents().find((s) => s.id === id);
}

function getStudentBySlug(slug) {
  return readStudents().find((s) => s.slug === slug);
}

function addStudent(data) {
  const students = readStudents();
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
    dateEmission: data.dateEmission || now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
  };
  students.push(student);
  writeStudents(students);
  return student;
}

function updateStudent(id, data) {
  const students = readStudents();
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
    dateEmission: data.dateEmission || existing.dateEmission,
    updatedAt: new Date().toISOString(),
  };
  students[index] = updated;
  writeStudents(students);
  return updated;
}

function deleteStudent(id) {
  const students = readStudents();
  const filtered = students.filter((s) => s.id !== id);
  writeStudents(filtered);
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
