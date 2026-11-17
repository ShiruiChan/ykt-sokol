#!/usr/bin/env bash
# Пересборка сайта с данными из БД и атомарное переключение на новую версию.
# Вызывается кнопкой «Опубликовать» в админке (PUBLISH_COMMAND) и из deploy.sh.
# Работает от пользователя ykt. Вывод — в $BASE/logs/rebuild.log.
#
# Сборка идёт в app/dist, сайт в это время продолжает отдаваться из старой
# версии (nginx смотрит на $BASE/current). Готовая сборка копируется в
# releases/<время>, и симлинк current переключается одной операцией.
set -euo pipefail

BASE="${YKT_BASE:-/srv/ykt-sokol}"
APP="$BASE/app"
LOG="$BASE/logs/rebuild.log"
KEEP=5

mkdir -p "$BASE/logs" "$BASE/releases"
exec >>"$LOG" 2>&1

# Две публикации подряд не собираются одновременно: вторая ждёт первую
exec 9>"$BASE/.rebuild.lock"
flock 9

echo "=== $(date -Is) сборка начата"

# Запуск руками: переменные берём из файла окружения сервиса
if [[ -z "${DATABASE_URL:-}" && -r /etc/ykt-sokol.env ]]; then
	set -a
	# shellcheck disable=SC1091
	. /etc/ykt-sokol.env
	set +a
fi

# Без боевого адреса canonical и sitemap укажут не туда — не собираем
if [[ -z "${VITE_SITE_URL:-}" ]]; then
	echo "=== $(date -Is) ОШИБКА: не задан VITE_SITE_URL в /etc/ykt-sokol.env"
	exit 1
fi

cd "$APP"
if ! npm run build; then
	echo "=== $(date -Is) ОШИБКА сборки — сайт остался на прежней версии"
	exit 1
fi

release="$BASE/releases/$(date +%Y%m%d-%H%M%S)-$$"
cp -a dist "$release"
ln -sfn "$release" "$BASE/current.new"
mv -Tf "$BASE/current.new" "$BASE/current"

# Старые версии — кроме последних $KEEP
ls -1dt "$BASE"/releases/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf

echo "=== $(date -Is) готово: $(basename "$release")"
