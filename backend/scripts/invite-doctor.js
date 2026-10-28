/* eslint-disable no-console */
/**
 * Administration des invitations professionnelles (à lancer sur le serveur,
 * dans /opt/ampela-api) :
 *
 *   npm run invite -- create sage-femme@exemple.mg --note "Sage-femme, CSB Antsirabe"
 *   npm run invite -- create --free --note "Code libre pour l'atelier du 12/11"   (sans e-mail)
 *   npm run invite -- list
 *   npm run invite -- revoke ABCD2345
 *   npm run invite -- verify email@exemple.mg        (valider directement un compte existant)
 *   npm run invite -- revoke-doctor email@exemple.mg (retirer le statut professionnel)
 */
const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O/1/I pour éviter les confusions

const makeCode = () =>
  Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join('');

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};

async function main() {
  const [command, target] = process.argv.slice(2);
  switch (command) {
    case 'create': {
      const free = process.argv.includes('--free');
      const email = free ? null : (target || '').toLowerCase().trim();
      if (!free && !email.includes('@')) throw new Error('E-mail requis (ou --free).');
      const days = Number(arg('--days') || 0);
      const invitation = await prisma.doctorInvitation.create({
        data: {
          email,
          code: makeCode(),
          note: arg('--note'),
          createdBy: process.env.USER || 'admin',
          expiresAt: days ? new Date(Date.now() + days * 86400000) : null,
        },
      });
      console.log(`Invitation créée pour ${email ?? '(code libre)'} : code ${invitation.code}`);
      console.log('À transmettre à la professionnelle : elle se connecte avec son e-mail sur Ampela Pro puis saisit ce code.');
      break;
    }
    case 'list': {
      const rows = await prisma.doctorInvitation.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      for (const r of rows) {
        const state = r.revokedAt ? 'révoquée' : r.usedAt ? 'utilisée' : r.expiresAt && r.expiresAt < new Date() ? 'expirée' : 'disponible';
        console.log(`${r.code}  ${(r.email ?? '(libre)').padEnd(32)} ${state.padEnd(11)} ${r.note ?? ''}`);
      }
      if (!rows.length) console.log('Aucune invitation.');
      break;
    }
    case 'revoke': {
      await prisma.doctorInvitation.update({ where: { code: (target || '').toUpperCase() }, data: { revokedAt: new Date() } });
      console.log(`Invitation ${target} révoquée.`);
      break;
    }
    case 'verify': {
      const user = await prisma.user.update({
        where: { email: (target || '').toLowerCase() },
        data: { role: 'doctor', verificationStatus: 'verified', verifiedAt: new Date(), verifiedBy: process.env.USER || 'admin' },
      });
      console.log(`${user.email} est maintenant professionnelle vérifiée.`);
      break;
    }
    case 'revoke-doctor': {
      const user = await prisma.user.update({
        where: { email: (target || '').toLowerCase() },
        data: { role: 'user', verificationStatus: 'rejected', verifiedAt: null, verifiedBy: null },
      });
      console.log(`${user.email} n'a plus le statut professionnel.`);
      break;
    }
    default:
      console.log('Commandes : create <email> [--note ..] [--days N] | create --free | list | revoke <code> | verify <email> | revoke-doctor <email>');
  }
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
