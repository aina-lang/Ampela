# Ampela

Monorepo de l'application Ampela (suivi du cycle menstruel, forum et messagerie).

| Dossier     | Contenu                                                     |
|-------------|-------------------------------------------------------------|
| `mobile/`   | Application Expo / React Native (expo-router, Legend State) |
| `backend/`  | API NestJS + PostgreSQL (Prisma), authentification par code e-mail |

## Démarrage rapide

```bash
# API
cd backend && cp .env.example .env && npm install
npx prisma migrate dev && npm run start:dev

# Mobile
cd mobile && npm install && npx expo start
```

L'URL de l'API utilisée par l'app mobile se règle dans `mobile/services/api.js`
(variable `EXPO_PUBLIC_API_URL` ou valeur par défaut).

## Publication (Google Play)

Le build et la signature sont gérés par [EAS Build](https://docs.expo.dev/build/introduction/) (`mobile/eas.json`). Les dossiers natifs `mobile/android` et `mobile/ios` ne sont pas versionnés : EAS les régénère depuis `app.json`.

### Première fois

```bash
cd mobile
npm install -g eas-cli      # si besoin
eas login
eas credentials -p android  # laisser EAS générer et conserver le keystore de signature
```

Dans la Play Console : créer l'application (package `com.maminiaina_mercia.Ampela`), puis un compte de service avec le rôle « Administrateur des versions », et enregistrer sa clé JSON dans `mobile/google-service-account.json` (ignoré par git).

### Chaque version

```bash
cd mobile
eas build -p android --profile production   # .aab signé, versionCode auto-incrémenté
eas submit -p android --latest              # envoi sur la piste « internal » (brouillon)
```

Puis dans la Play Console : promouvoir vers « fermé » ou « production ». Pour un APK de test à installer directement : `eas build -p android --profile preview`.

### Fiche Play Store

- Politique de confidentialité : `https://ampela.178-104-61-143.sslip.io/privacy/`
- Suppression de compte (section « Sécurité des données ») : `https://ampela.178-104-61-143.sslip.io/account-deletion/`
- Données de démonstration pour les captures et la revue : `cd backend && npm run seed` (comptes `*@demo.ampela.mg`).

## Application professionnelle (`doctor/`)

`doctor/` est l'application des professionnelles de santé, « Ampela Pro » : copie adaptée de `mobile/` qui partage le même backend. Connexion obligatoire, profil avec spécialité et rôle `doctor`, tableau de bord (questions sans réponse, messages, notifications), pas de calendrier ni de rappels. Voir `doctor/README.md`.
