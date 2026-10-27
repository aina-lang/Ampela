# Ampela Pro — application des professionnelles de santé

Application Expo (React Native) destinée aux professionnelles de santé (sages-femmes, gynécologues, infirmières…). Elle partage le backend et le compte e-mail d'Ampela : un même e-mail peut être utilisatrice sur Ampela et professionnelle sur Ampela Pro, c'est le rôle `doctor` enregistré lors du premier profil qui fait la différence.

- **100 % en ligne** : aucune base locale, le profil et les contenus viennent de l'API (`EXPO_PUBLIC_API_URL`).
- **Parcours** : bienvenue → langue et thème → confidentialité → connexion par code e-mail → profil professionnel (nom affiché, spécialité, photo) → tableau de bord.
- **Tableau de bord** : questions du forum sans réponse, messages non lus, notifications, conversations récentes.
- **Forum, articles, messagerie, notifications** : mêmes écrans que l'app utilisatrice, avec la mention « Professionnelle de santé » sur les contributions.
- Pas de calendrier, de cycle ni de rappels.

```bash
cd doctor
npm install
npx expo start          # client de développement (npx expo run:android pour le construire)
```

Publication : `eas.json` est prêt ; lancer `eas init` pour créer le projet EAS « ampela-pro », puis `eas build -p android --profile production`.
