/**
 * Politique de confidentialité affichée dans l'application (Réglages →
 * À propos de moi → Politique de confidentialité). Reflète ce que fait
 * réellement l'app : données de cycle stockées sur le téléphone, compte
 * en ligne optionnel, aucune revente de données.
 */
export const PRIVACY_UPDATED_AT = "27 octobre 2026";

export const PRIVACY_CONTACT_EMAIL = "merciaaina@gmail.com";

export const PRIVACY_INTRO =
  "Ampela vous aide à suivre votre cycle menstruel. Vos données de santé sont sensibles : voici, simplement, ce que nous collectons, pourquoi, et comment vous gardez le contrôle.";

export const PRIVACY_SECTIONS = [
  {
    icon: "phone-portrait-outline",
    title: "Données stockées sur votre téléphone",
    body:
      "Vos dates de règles, la durée de votre cycle, vos prédictions, vos rappels et vos préférences sont enregistrés uniquement sur votre appareil. Sans compte, rien ne quitte votre téléphone. Le verrouillage biométrique, s'il est activé, utilise le système de votre téléphone : Ampela ne voit jamais votre empreinte ni votre visage.",
  },
  {
    icon: "cloud-outline",
    title: "Compte en ligne (optionnel)",
    body:
      "Créer un compte ne demande qu'une adresse e-mail : aucun mot de passe n'est stocké. Le compte sert à sauvegarder vos cycles, à retrouver vos données sur un autre téléphone, et à accéder au forum et à la messagerie. Nous conservons alors votre e-mail, votre pseudo, votre photo de profil si vous en ajoutez une, vos cycles synchronisés, vos publications, vos commentaires et vos messages.",
  },
  {
    icon: "mail-outline",
    title: "Code de connexion par e-mail",
    body:
      "À chaque connexion, un code à six chiffres vous est envoyé par e-mail. Il expire après dix minutes et n'est jamais stocké en clair. Votre adresse n'est utilisée que pour cet envoi : pas de newsletter, pas de publicité.",
  },
  {
    icon: "chatbubbles-outline",
    title: "Forum et messagerie",
    body:
      "Vos publications et commentaires sur le forum sont visibles par les autres membres, sous votre pseudo. Vos messages privés ne sont lisibles que par vous et votre interlocutrice. Vos données de cycle ne sont jamais visibles par les autres membres.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Aucun partage, aucune publicité",
    body:
      "Nous ne vendons ni ne cédons vos données à qui que ce soit. L'application ne contient ni publicité ni outil de suivi publicitaire. Les données du compte sont hébergées sur un serveur dédié, protégées par chiffrement en transit (HTTPS) et accessibles uniquement avec votre jeton de connexion.",
  },
  {
    icon: "time-outline",
    title: "Durée de conservation",
    body:
      "Les données de votre compte sont conservées tant que le compte existe. Les données locales restent sur votre téléphone jusqu'à ce que vous désinstalliez l'application ou effaciez ses données.",
  },
  {
    icon: "trash-outline",
    title: "Supprimer votre compte et vos données",
    body:
      "Depuis Réglages → À propos de moi → Supprimer mon compte, vous effacez définitivement et immédiatement votre compte en ligne : e-mail, profil, cycles synchronisés, publications, commentaires, messages et photo. Les données enregistrées sur votre téléphone sont conservées jusqu'à désinstallation. Vous pouvez aussi simplement vous déconnecter pour arrêter la synchronisation.",
  },
  {
    icon: "person-outline",
    title: "Vos droits",
    body:
      "Vous pouvez à tout moment consulter, modifier ou supprimer vos informations depuis l'application. Pour toute question ou demande concernant vos données, écrivez-nous : nous répondons sous 30 jours.",
  },
];
