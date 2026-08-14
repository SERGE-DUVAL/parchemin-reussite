# Parchemins de Reussite — Famille Tepomo

Petit site Node.js/Express qui genere des parchemins de reussite scolaire dores,
avec une base de donnees au format JSON (`data/students.json`) et un espace
d'administration protege par mot de passe pour creer/modifier/supprimer les parchemins.

## Installation

```bash
npm install
cp .env.example .env
npm run hash-password -- "TonMotDePasseAdmin"
# colle le hash affiche dans .env (ADMIN_PASSWORD_HASH=...)
npm start
```

Le site est alors disponible sur http://localhost:3000

- `/` : page d'accueil
- `/admin` : espace d'administration (login requis)
- `/parchemin/:slug` : parchemin public, genere automatiquement pour chaque eleve

## Fonctionnement

- Toutes les donnees des eleves sont stockees dans `data/students.json`.
- Chaque parchemin cree recoit un lien unique (`/parchemin/mon-slug`) que tu peux
  partager avec la famille — pas besoin d'etre connecte pour le consulter.
- Deux types de parchemin :
  - **Diplome** : mentionne l'obtention d'un diplome precis (ex: Baccalaureat),
    avec un ornement en couronne de laurier.
  - **Passage en classe superieure** : felicite pour le passage a l'annee suivante,
    sans mention de diplome, avec un ornement en etoile.
- Sur la page du parchemin, le bouton "Telecharger en PDF" genere un PDF pret a
  imprimer (recto + verso) directement dans le navigateur.

## Hebergement

Ce site n'a besoin que de Node.js pour tourner — pas de base de donnees externe.
Il fonctionne sur n'importe quel hebergement supportant Node.js (Railway, Render,
un VPS, etc.). Pense a definir les variables d'environnement `ADMIN_PASSWORD_HASH`
et `SESSION_SECRET` sur la plateforme choisie, et a t'assurer que le dossier
`data/` est bien persistant (pas efface a chaque redeploiement).

## Securite

- Le mot de passe admin n'est jamais stocke en clair : seul son hash (bcrypt) est
  conserve dans `.env`.
- `.env` est exclu du depot via `.gitignore` — ne le partage jamais publiquement.
