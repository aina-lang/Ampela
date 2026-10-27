#!/usr/bin/env bash
# Déploie l'API sur le VPS : synchronise les sources, installe, compile,
# applique les migrations Prisma et recharge le processus PM2.
#
#   ./deploy.sh            # cible par défaut root@178.104.61.143
#   HOST=user@ip ./deploy.sh
set -euo pipefail

HOST="${HOST:-root@178.104.61.143}"
DEST="${DEST:-/opt/ampela-api}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "→ Synchronisation des sources vers $HOST:$DEST"
rsync -az --delete \
  --exclude /node_modules --exclude /dist --exclude .env --exclude /uploads \
  --exclude '*.tmp.*' \
  "$HERE/" "$HOST:$DEST/"

echo "→ Installation, build, migrations, redémarrage"
ssh "$HOST" bash -s <<REMOTE
set -euo pipefail
cd "$DEST"
test -f .env || { echo "Fichier .env manquant dans $DEST (voir .env.example)"; exit 1; }
npm install --no-audit --no-fund --loglevel=error
npx prisma generate >/dev/null
npm run build
npx prisma migrate deploy
if pm2 describe ampela-api >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save >/dev/null
sleep 2
curl -sf http://127.0.0.1:${PORT:-3200}/health && echo
REMOTE
echo "✓ Déploiement terminé"
