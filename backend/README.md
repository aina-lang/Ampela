# Ampela API

Backend NestJS 11 + PostgreSQL (Prisma 6) de l'application mobile Ampela.
Remplace l'ancien backend Firebase (Auth, Firestore, Cloud Functions).

## Fonctionnalités

| Domaine        | Routes                                                                 |
|----------------|------------------------------------------------------------------------|
| Authentification | `POST /auth/request-otp`, `POST /auth/verify-otp` → JWT, `GET /auth/me` |
| Profil         | `GET/PATCH /users/me`, `GET /users` (autres membres + dernier message)  |
| Cycles         | `GET /cycles`, `PUT /cycles` (upsert idempotent, jamais de suppression) |
| Forum          | `GET/POST /posts`, `POST/DELETE /posts/:id/like`, `GET/POST /posts/:id/comments`, `DELETE /posts/:id` |
| Messagerie     | `GET/POST /conversations/:userId/messages` + WebSocket `message:new`    |
| Fichiers       | `POST /uploads` (multipart `file`, images ≤ 8 Mo) → `/uploads/<nom>`     |
| Santé          | `GET /health`                                                            |

Toutes les routes sauf `/auth/request-otp`, `/auth/verify-otp` et `/health`
exigent `Authorization: Bearer <jwt>`. Le WebSocket (socket.io) s'authentifie
avec `auth: { token }` à la connexion.

## Connexion sans mot de passe

Un code à 6 chiffres est envoyé par e-mail (haché SHA-256 en base, valable
10 min, 5 essais, 1 envoi/minute). **Sans `SMTP_HOST` dans `.env`, le code
est seulement écrit dans les logs** (`pm2 logs ampela-api`) : pratique pour
tester, à configurer avant la mise en production.

## Développement

```bash
cp .env.example .env            # puis renseigner DATABASE_URL et JWT_SECRET
npm install
npx prisma migrate dev          # crée/applique les migrations
npm run start:dev               # http://localhost:3200
```

## Déploiement (VPS, PM2 + nginx)

```bash
./deploy.sh                     # rsync → npm ci → build → migrate deploy → pm2 reload
```

Le fichier `.env` de production vit dans `/opt/ampela-api/.env` sur le serveur
(jamais versionné). `nginx.ampela.conf` est le vhost de référence ; certbot
ajoute le HTTPS.

## Professionnelles de santé (invitations)

Le rôle `doctor` n'est jamais accordé par le client : il est obtenu via `POST /doctors/register` avec un code d'invitation à usage unique. Sur le serveur (`/opt/ampela-api`) :

```bash
npm run invite -- create sage-femme@exemple.mg --note "Sage-femme, CSB Antsirabe" [--days 30]
npm run invite -- create --free --note "Code libre atelier"   # utilisable avec n'importe quel e-mail
npm run invite -- list
npm run invite -- revoke ABCD2345
npm run invite -- verify email@exemple.mg          # valider directement un compte
npm run invite -- revoke-doctor email@exemple.mg   # retirer le statut professionnel
```

`User.verificationStatus` (`none` / `pending` / `verified` / `rejected`), `verifiedAt`, `verifiedBy`, `fullName`, `institution` et `licenseNumber` préparent une validation par justificatifs : seules les professionnelles `verified` apparaissent comme telles et peuvent échanger avec les utilisatrices.
