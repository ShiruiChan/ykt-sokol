#!/usr/bin/env bash
# Выкатить новую версию кода из git:
#   sudo -u ykt /srv/ykt-sokol/app/deploy/deploy.sh
# Ветка — DEPLOY_BRANCH (по умолчанию main).
set -euo pipefail

BASE="${YKT_BASE:-/srv/ykt-sokol}"
cd "$BASE/app"

set -a
# shellcheck disable=SC1091
. /etc/ykt-sokol.env
set +a

branch="${DEPLOY_BRANCH:-main}"
echo "→ код из origin/$branch"
git fetch --quiet origin
# content/*.json на сервере перезаписывает сборка — локальные правки не храним
git reset --hard --quiet "origin/$branch"
git log -1 --format='  %h %s'

echo "→ зависимости"
npm ci --include=dev --no-audit --no-fund --loglevel=error

echo "→ миграция БД"
npm run --silent db:migrate

echo "→ сервер API"
npm run --silent build:server

echo "→ сайт (лог: $BASE/logs/rebuild.log)"
if ! "$BASE/app/deploy/rebuild.sh"; then
	tail -n 30 "$BASE/logs/rebuild.log"
	exit 1
fi

echo "→ перезапуск API"
sudo /usr/bin/systemctl restart ykt-sokol
sleep 1
curl -fsS http://127.0.0.1:${PORT:-3000}/api/health >/dev/null && echo "✔ готово" || { echo "✖ API не отвечает: journalctl -u ykt-sokol -n 50"; exit 1; }
