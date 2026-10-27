/* eslint-disable no-console */
/**
 * Données de démonstration : utilisatrices, publications, likes,
 * commentaires et réponses, conversations privées.
 *
 *   npm run seed              # ajoute le jeu de données s'il est absent
 *   SEED_RESET=1 npm run seed # supprime puis recrée les comptes de démo
 *
 * Tous les comptes de démo ont un e-mail en @demo.ampela.mg : on peut donc
 * les retirer sans toucher aux vraies utilisatrices.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DEMO_DOMAIN = 'demo.ampela.mg';

const daysAgo = (days, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const iso = (date) => date.toISOString().slice(0, 10);

const USERS = [
  // role : "doctor" = professionnelle de santé (profession = spécialité), "user" = utilisatrice
  { key: 'nirina', username: 'Nirina', role: 'doctor', profession: 'Sage-femme', cycle: 28, period: 5, last: 12 },
  { key: 'faniry', username: 'Faniry', role: 'doctor', profession: 'Gynécologue', cycle: 30, period: 4, last: 20 },
  { key: 'hanta', username: 'Hanta_R', role: 'user', profession: null, cycle: 27, period: 6, last: 3 },
  { key: 'mialy', username: 'Mialy', role: 'doctor', profession: 'Infirmière', cycle: 29, period: 5, last: 8 },
  { key: 'soa', username: 'Soa', role: 'user', profession: null, cycle: 31, period: 4, last: 25 },
  { key: 'vola', username: 'Vola_A', role: 'user', profession: null, cycle: 26, period: 7, last: 15 },
  { key: 'lanto', username: 'Lanto', role: 'user', profession: null, cycle: 28, period: 5, last: 1 },
  { key: 'tiana', username: 'Tiana', role: 'doctor', profession: 'Pharmacienne', cycle: 32, period: 3, last: 10 },
];

// [auteur, titre, description, likes, commentaires]
// commentaires : { by, text, replies: [{ by, text }] }
const POSTS = [
  {
    by: 'hanta',
    daysAgo: 9,
    title: 'Mon cycle est irrégulier, est-ce normal ?',
    description:
      "Depuis quelques mois mes cycles varient entre 24 et 35 jours. J'ai 19 ans et je ne prends pas de contraception. Est-ce que je dois consulter ?",
    likes: ['nirina', 'mialy', 'lanto', 'soa'],
    comments: [
      {
        by: 'faniry',
        text: "À 19 ans, des cycles qui varient de quelques jours restent fréquents. Si l'écart dépasse 10 jours plusieurs mois de suite, ou si les règles deviennent très abondantes, une consultation est conseillée.",
        replies: [
          { by: 'hanta', text: 'Merci docteur, je vais noter mes cycles dans Ampela pendant trois mois.' },
          { by: 'faniry', text: 'Très bonne idée, apportez ce suivi à la consultation.' },
        ],
      },
      { by: 'nirina', text: 'Le stress, les examens et le sommeil jouent beaucoup sur la régularité.', replies: [] },
    ],
  },
  {
    by: 'lanto',
    daysAgo: 7,
    title: 'Douleurs très fortes le premier jour',
    description:
      "Le premier jour de mes règles je dois rester couchée tellement j'ai mal au ventre. Le paracétamol ne fait presque rien. Avez-vous des conseils ?",
    likes: ['hanta', 'vola', 'soa', 'tiana', 'mialy'],
    comments: [
      {
        by: 'tiana',
        text: "Un anti-inflammatoire pris dès les premières douleurs est souvent plus efficace que le paracétamol, mais demandez d'abord conseil en pharmacie ou à votre médecin.",
        replies: [{ by: 'lanto', text: "D'accord, je passerai à la pharmacie demain." }],
      },
      { by: 'mialy', text: 'La bouillotte sur le bas-ventre et une marche légère me soulagent beaucoup.', replies: [] },
      {
        by: 'faniry',
        text: 'Des douleurs qui empêchent toute activité méritent une consultation : il faut écarter une endométriose.',
        replies: [],
      },
    ],
  },
  {
    by: 'vola',
    daysAgo: 6,
    title: 'Pilule oubliée hier soir, que faire ?',
    description:
      "J'ai oublié ma pilule hier soir et je m'en suis rendu compte ce matin, soit environ 10 heures de retard. Est-ce que je suis encore protégée ?",
    likes: ['nirina', 'tiana'],
    comments: [
      {
        by: 'tiana',
        text: "Prenez le comprimé oublié dès maintenant puis continuez normalement. Pour une pilule combinée, un retard de moins de 12 heures garde l'efficacité ; au-delà, utilisez un préservatif pendant 7 jours.",
        replies: [
          { by: 'vola', text: 'Merci, prise à l’instant !' },
        ],
      },
    ],
  },
  {
    by: 'soa',
    daysAgo: 5,
    title: 'Quelle protection pendant le sport ?',
    description:
      "Je fais de la course et de la natation. Les serviettes ne sont pas pratiques. Que me conseillez-vous ?",
    likes: ['hanta', 'lanto', 'mialy'],
    comments: [
      { by: 'nirina', text: 'La coupe menstruelle est idéale pour la natation, et les tampons pour la course. Pensez à changer toutes les 4 à 6 heures.', replies: [] },
      { by: 'hanta', text: "J'utilise des culottes menstruelles pour courir, très confortables.", replies: [] },
    ],
  },
  {
    by: 'mialy',
    daysAgo: 4,
    title: 'Pertes marron avant les règles',
    description:
      "Depuis deux cycles j'ai des pertes marron deux ou trois jours avant mes règles. C'est inquiétant ?",
    likes: ['soa'],
    comments: [
      {
        by: 'faniry',
        text: "Ce sont souvent de petites pertes de sang ancien, bénignes. Si cela s'accompagne de douleurs, d'odeur ou dure plus de quelques jours, consultez.",
        replies: [{ by: 'mialy', text: 'Merci pour cette réponse rassurante.' }],
      },
    ],
  },
  {
    by: 'nirina',
    daysAgo: 3,
    title: 'Hygiène menstruelle : les bons gestes',
    description:
      "Petit rappel pour toutes : changer de protection régulièrement, se laver les mains avant et après, préférer l'eau et un savon doux, et ne jamais garder un tampon plus de 8 heures.",
    likes: ['faniry', 'hanta', 'lanto', 'soa', 'vola', 'tiana', 'mialy'],
    comments: [
      { by: 'lanto', text: 'Merci pour ce rappel utile !', replies: [] },
      { by: 'soa', text: 'Peut-on utiliser des lingettes intimes ?', replies: [{ by: 'nirina', text: "Occasionnellement oui, mais l'eau suffit au quotidien : les lingettes peuvent irriter." }] },
    ],
  },
  {
    by: 'tiana',
    daysAgo: 2,
    title: 'Calcul de la période de fécondité',
    description:
      "Avec un cycle de 30 jours, comment savoir quels jours éviter ? L'application me montre une période, mais j'aimerais comprendre le calcul.",
    likes: ['nirina', 'faniry'],
    comments: [
      {
        by: 'faniry',
        text: "L'ovulation a lieu 14 jours avant les prochaines règles. La période féconde va du jour (cycle − 18) au jour (cycle − 11) : pour 30 jours, du 12e au 19e jour du cycle.",
        replies: [{ by: 'tiana', text: 'Très clair, merci !' }],
      },
    ],
  },
  {
    by: 'lanto',
    daysAgo: 1,
    title: 'Premier rendez-vous gynéco, à quoi s’attendre ?',
    description:
      "J'ai mon premier rendez-vous chez une gynécologue la semaine prochaine et je stresse un peu. Comment ça se passe ?",
    likes: ['hanta', 'mialy', 'soa'],
    comments: [
      {
        by: 'faniry',
        text: "Le premier rendez-vous est surtout une discussion : vos cycles, vos questions, votre contraception. L'examen n'est pas systématique et jamais sans votre accord.",
        replies: [{ by: 'lanto', text: 'Ça me rassure, merci.' }],
      },
    ],
  },
];

// Conversations privées : [a, b, messages[{ from, text, hoursAgo }]]
const CONVERSATIONS = [
  {
    between: ['hanta', 'faniry'],
    messages: [
      { from: 'hanta', text: 'Bonjour docteur, puis-je vous poser une question en privé ?', hoursAgo: 30 },
      { from: 'faniry', text: 'Bonjour Hanta, bien sûr, je vous écoute.', hoursAgo: 29 },
      { from: 'hanta', text: 'Mes règles ont 8 jours de retard, mais le test de grossesse est négatif.', hoursAgo: 28 },
      { from: 'faniry', text: 'Un retard isolé arrive souvent après un stress ou une maladie. Refaites un test dans une semaine si les règles ne viennent pas, et consultez si le retard dépasse un mois.', hoursAgo: 27 },
      { from: 'hanta', text: 'Merci beaucoup, je vous tiens au courant.', hoursAgo: 26 },
    ],
  },
  {
    between: ['lanto', 'nirina'],
    messages: [
      { from: 'lanto', text: 'Bonjour, est-ce que la coupe menstruelle convient quand on n’a jamais eu de rapport ?', hoursAgo: 10 },
      { from: 'nirina', text: 'Oui, il existe des petites tailles. Il faut juste un peu de pratique au début.', hoursAgo: 9 },
      { from: 'lanto', text: 'Super, merci pour votre réponse rapide !', hoursAgo: 8 },
    ],
  },
  {
    between: ['vola', 'tiana'],
    messages: [
      { from: 'vola', text: 'Bonsoir, ma plaquette se termine demain, je commence la suivante directement ?', hoursAgo: 5 },
      { from: 'tiana', text: 'Pour une plaquette de 28 comprimés, oui : la suivante dès le lendemain, sans pause.', hoursAgo: 4 },
    ],
  },
];

const roomIdFor = (a, b) => [a, b].sort().join('_');

async function reset() {
  const demo = await prisma.user.findMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
    select: { id: true },
  });
  const ids = demo.map((u) => u.id);
  if (!ids.length) return;
  await prisma.room.deleteMany({ where: { OR: [{ userAId: { in: ids } }, { userBId: { in: ids } }] } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Comptes de démo supprimés : ${ids.length}`);
}

async function main() {
  if (process.env.SEED_RESET === '1') await reset();

  const already = await prisma.user.count({ where: { email: { endsWith: `@${DEMO_DOMAIN}` } } });
  if (already) {
    console.log(`Jeu de données déjà présent (${already} comptes). SEED_RESET=1 pour le recréer.`);
    return;
  }

  // 1. Utilisatrices
  const users = {};
  for (const u of USERS) {
    users[u.key] = await prisma.user.create({
      data: {
        email: `${u.key}@${DEMO_DOMAIN}`,
        username: u.username,
        role: u.role,
        profession: u.profession,
        lastMenstruationDate: iso(daysAgo(u.last)),
        durationMenstruation: u.period,
        cycleDuration: u.cycle,
      },
    });
  }

  // 2. Publications, likes, commentaires et réponses
  let commentCount = 0;
  let likeCount = 0;
  for (const p of POSTS) {
    const post = await prisma.post.create({
      data: {
        authorId: users[p.by].id,
        title: p.title,
        description: p.description,
        createdAt: daysAgo(p.daysAgo, 10),
      },
    });
    for (const [i, who] of p.likes.entries()) {
      await prisma.like.create({
        data: { userId: users[who].id, postId: post.id, createdAt: daysAgo(p.daysAgo, 11 + i) },
      });
      likeCount++;
    }
    let hour = 12;
    for (const c of p.comments) {
      const parent = await prisma.comment.create({
        data: { postId: post.id, authorId: users[c.by].id, content: c.text, createdAt: daysAgo(p.daysAgo, hour++) },
      });
      commentCount++;
      for (const r of c.replies) {
        await prisma.comment.create({
          data: {
            postId: post.id,
            authorId: users[r.by].id,
            content: r.text,
            parentId: parent.id,
            createdAt: daysAgo(p.daysAgo, hour++),
          },
        });
        commentCount++;
      }
    }
  }

  // 3. Conversations privées
  let messageCount = 0;
  for (const conv of CONVERSATIONS) {
    const [a, b] = conv.between.map((k) => users[k].id);
    const room = await prisma.room.create({
      data: { id: roomIdFor(a, b), userAId: [a, b].sort()[0], userBId: [a, b].sort()[1] },
    });
    for (const m of conv.messages) {
      const createdAt = new Date(Date.now() - m.hoursAgo * 3600 * 1000);
      await prisma.message.create({
        data: { roomId: room.id, userId: users[m.from].id, text: m.text, createdAt },
      });
      messageCount++;
    }
  }

  console.log(
    `Seed terminé : ${USERS.length} utilisatrices, ${POSTS.length} publications, ${likeCount} likes, ${commentCount} commentaires (réponses incluses), ${CONVERSATIONS.length} conversations, ${messageCount} messages.`,
  );
  console.log(`Connexion : n'importe quel e-mail @${DEMO_DOMAIN} (ex. nirina@${DEMO_DOMAIN}) via le code reçu… sur une vraie boîte seulement : ces adresses sont fictives.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
