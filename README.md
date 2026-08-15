# Parchemins de Reussite — Famille Tepomo

Petit site Node.js/Express qui genere des parchemins de reussite scolaire dores,
avec les donnees stockees en JSON dans Vercel Blob, et un espace
d'administration protege par mot de passe pour creer/modifier/supprimer les parchemins.

## Installation locale

```bash
npm install
cp .env.example .env
npm run hash-password -- "TonMotDePasseAdmin"
# colle le hash affiche dans .env (ADMIN_PASSWORD_HASH=...)
```

Il faut aussi un Blob store Vercel, meme pour developper en local (voir
"Stockage des donnees" ci-dessous), et coller son token dans `BLOB_READ_WRITE_TOKEN`
dans `.env`.

```bash
npm start
```

Le site est alors disponible sur http://localhost:3000

- `/` : page d'accueil
- `/admin` : espace d'administration (login requis)
- `/parchemin/:slug` : parchemin public, genere automatiquement pour chaque eleve

## Fonctionnement

- Chaque parchemin cree recoit un lien unique (`/parchemin/mon-slug`) que tu peux
  partager avec la famille — pas besoin d'etre connecte pour le consulter.
- Deux types de parchemin :
  - **Diplome** : mentionne l'obtention d'un diplome precis (ex: Baccalaureat),
    avec un ornement en couronne de laurier.
  - **Passage en classe superieure** : felicite pour le passage a l'annee suivante,
    sans mention de diplome, avec un ornement en etoile.
- Sur la page du parchemin, le bouton "Telecharger en PDF" genere un PDF pret a
  imprimer (recto + verso) directement dans le navigateur, et le bouton "Partager"
  ouvre le partage natif du telephone (ou copie le lien).

## Stockage des donnees (Vercel Blob)

Ce site tourne sur Vercel, dont les fonctions n'ont pas de disque en ecriture en
production — impossible d'ecrire dans un simple fichier local comme sur un
serveur classique. Les donnees sont donc stockees dans **Vercel Blob**, sous la
forme d'un unique fichier `students.json`, ce qui reste tres proche de l'esprit
"base de donnees JSON" de depart.

### Mise en place (une seule fois)

1. Dans le dashboard Vercel de ton projet, va dans l'onglet **Storage**.
2. **Create Database** > **Blob**, choisis l'acces **Private**.
3. Connecte ce store a ton projet (coche Production, Preview, et Development si
   tu veux aussi l'utiliser en local).
4. Vercel ajoute automatiquement la variable d'environnement
   `BLOB_READ_WRITE_TOKEN` a ton projet — rien a copier manuellement en
   production.
5. En local, recupere cette variable avec `vercel env pull` (ou copie-la
   manuellement depuis le dashboard dans ton `.env`).

### Recuperer les donnees existantes

Si tu avais deja des parchemins dans l'ancien `data/students.json` (avant ce
changement), transfere-les une fois vers le Blob store :

```bash
npm run migrate-to-blob
```

## Hebergement

Deploiement pense pour Vercel (voir `vercel.json`). Si tu changes de plateforme
un jour, il faudra remplacer `utils/db.js` par un autre systeme de stockage
persistant (fichier local si la plateforme le permet, ou une vraie base de
donnees).

## Securite

- Le mot de passe admin n'est jamais stocke en clair : seul son hash (bcrypt) est
  conserve dans `.env` / dans les variables d'environnement Vercel.
- `.env` est exclu du depot via `.gitignore` — ne le partage jamais publiquement.
- Le Blob store est en acces **prive** : les donnees ne sont lisibles qu'a
  travers le serveur, jamais via une URL publique directe.
