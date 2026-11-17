# Запуск сайта на своём сервере (VPS в России)

Как всё устроено на сервере:

```
nginx :80/:443 ─┬─ статика сайта   → /srv/ykt-sokol/current  (симлинк на releases/<время>)
                ├─ /uploads/       → /srv/ykt-sokol/uploads  (фото и PDF из админки)
                └─ /api/*          → node dist-server/index.js на 127.0.0.1:3000 (systemd: ykt-sokol)
                                        ├─ PostgreSQL на этом же сервере
                                        ├─ заявки → почта (SMTP), в Telegram — сигнал без ПДн
                                        └─ «Опубликовать» → deploy/rebuild.sh
```

```
/srv/ykt-sokol/          домашняя папка пользователя ykt
├── app/                 git-копия репозитория, здесь идёт сборка
├── releases/            последние 5 собранных версий сайта
├── current → releases/… то, что сейчас отдаёт nginx
├── uploads/             загрузки из админки (не трогаются при пересборке)
├── backups/             ежедневные дампы БД
└── logs/rebuild.log     журнал публикаций
/etc/ykt-sokol.env       все секреты (root:ykt, 640)
```

Кнопка «Опубликовать» запускает `deploy/rebuild.sh`. Скрипт берёт данные из БД,
собирает сайт в `app/dist`, копирует сборку в `releases/` и переключает `current`
одной операцией. Сайт не пропадает ни на секунду, а если сборка упала, остаётся
предыдущая версия.

## 0. Что купить

- **Домен** `.ru` у REG.RU или RU-CENTER. Регистрировать на юрлицо или ИП заказчика.
- **VPS**: Timeweb Cloud, Selectel или аналог. Ubuntu 24.04, 2 vCPU, 2 ГБ RAM,
  30 ГБ диска. В панели хостера включить автобэкапы (снимки) диска.
- В DNS домена: A-записи `@` и `www` → IP сервера.

Ниже `DOMAIN.RU` — ваш домен. Команды выполняются от root (или через `sudo`).

## 1. Пакеты и защита

```bash
apt update && apt -y upgrade
apt -y install nginx postgresql git curl certbot python3-certbot-nginx ufw
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt -y install nodejs
node -v   # v22.x

ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# Своп: сборке сайта на 2 ГБ RAM нужен запас
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 2. Пользователь и папки

```bash
useradd --system --create-home --home-dir /srv/ykt-sokol --shell /bin/bash ykt
chmod 755 /srv/ykt-sokol
sudo -u ykt mkdir -p /srv/ykt-sokol/{uploads,releases,logs,backups}
```

## 3. Код

Ключ только для чтения этого репозитория:

```bash
sudo -u ykt mkdir -m 700 -p /srv/ykt-sokol/.ssh
sudo -u ykt ssh-keygen -t ed25519 -N '' -f /srv/ykt-sokol/.ssh/id_ed25519
cat /srv/ykt-sokol/.ssh/id_ed25519.pub
```

Добавить ключ на GitHub: репозиторий → Settings → Deploy keys → Add (без write access).

```bash
sudo -u ykt git clone git@github.com:ShiruiChan/ykt-sokol.git /srv/ykt-sokol/app
```

## 4. База данных

```bash
DBPASS=$(openssl rand -hex 24); echo "$DBPASS"   # пригодится в шаге 5
sudo -u postgres psql -c "create role ykt login password '$DBPASS'" -c "create database ykt owner ykt"
```

Postgres слушает только localhost, наружу порт не открыт.

## 5. Секреты

```bash
install -m 640 -o root -g ykt /dev/null /etc/ykt-sokol.env
nano /etc/ykt-sokol.env
```

```ini
DATABASE_URL=postgres://ykt:ПАРОЛЬ_ИЗ_ШАГА_4@127.0.0.1:5432/ykt
UPLOADS_DIR=/srv/ykt-sokol/uploads
PUBLISH_COMMAND=/srv/ykt-sokol/app/deploy/rebuild.sh

ADMIN_PASSWORD=длинный-пароль-владельца
ADMIN_SESSION_SECRET=результат: openssl rand -base64 36

SMTP_URL=smtps://sales%40DOMAIN.RU:пароль-для-внешнего-приложения@smtp.mail.ru:465
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
MAIL_TO=sales@DOMAIN.RU

VITE_SITE_URL=https://DOMAIN.RU
VITE_YM_ID=
```

Значения пишутся без кавычек и пробелов: файл читают и systemd, и bash.
Почта обязательна: без `SMTP_URL` и `MAIL_TO` форма отвечает «не настроено».
Заявка с данными клиента уходит только письмом (почта с серверами в РФ).
Telegram необязателен: туда приходит лишь сигнал «новая заявка» без имени и
телефона, поэтому трансграничной передачи персональных данных нет.

## 6. Сервис и права на перезапуск

```bash
cd /srv/ykt-sokol/app
install -m 440 deploy/sudoers /etc/sudoers.d/ykt-sokol && visudo -c
cp deploy/ykt-sokol.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable ykt-sokol
```

## 7. Первая выкладка и данные

```bash
sudo -u ykt /srv/ykt-sokol/app/deploy/deploy.sh
```

Скрипт ставит зависимости, создаёт таблицы, собирает API и сайт, запускает сервис.
Потом в БД заливается текущее содержимое сайта:

```bash
sudo -u ykt bash -c 'set -a; . /etc/ykt-sokol.env; cd /srv/ykt-sokol/app && npm run db:seed'
```

> Если владелец уже правил сайт в админке на Vercel, свежие данные лежат в Neon.
> Их сначала забирают на свой компьютер командой
> `DATABASE_URL='<строка Neon>' npm run content:pull`, коммитят `content/*.json`,
> выкатывают через `deploy.sh` и только потом делают сид.
> Проверьте `grep -r vercel-storage content/`: если там есть ссылки на файлы
> из Vercel Blob, эти файлы нужно перенести в `uploads/`, иначе после отключения
> Vercel они пропадут.

## 8. nginx и HTTPS

```bash
cd /srv/ykt-sokol/app
cp deploy/nginx-headers.conf /etc/nginx/snippets/ykt-sokol-headers.conf
sed 's/DOMAIN.RU/ваш-домен.ru/g' deploy/nginx.conf > /etc/nginx/sites-available/ykt-sokol
ln -s /etc/nginx/sites-available/ykt-sokol /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru --redirect -m почта@для-уведомлений
```

Certbot сам продлевает сертификат (`systemctl list-timers | grep certbot`).

## 9. Бэкап БД

```bash
sudo -u ykt crontab -e
```

```cron
30 3 * * * pg_dump -Fc -d ykt -f /srv/ykt-sokol/backups/ykt-$(date +\%F).dump && find /srv/ykt-sokol/backups -name '*.dump' -mtime +14 -delete
```

Загрузки (`uploads/`) и дампы сохраняются в снимках диска у хостера.
Восстановление: `pg_restore --clean -d ykt файл.dump`.

## Проверка после запуска

- `https://DOMAIN.RU` открывается, `http://` и `www.` перенаправляют на него;
- `/admin`: вход, правка, «Опубликовать». Через 1–2 минуты правка на сайте,
  в `logs/rebuild.log` строка «готово»;
- загрузка фото в админке → фото открывается по `/uploads/images/…`;
- без галочки согласия форма не отправляется; с галочкой тестовая заявка
  приходит письмом, а в Telegram — сигнал без контактов;
- при заданном `VITE_YM_ID` появляется cookie-баннер, Метрика грузится только
  после «Разрешить»;
- `https://DOMAIN.RU/sitemap.xml` содержит адреса с новым доменом.

## Обычная работа

| Что | Команда |
|---|---|
| Выкатить новый код из `main` | `sudo -u ykt /srv/ykt-sokol/app/deploy/deploy.sh` |
| Пересобрать сайт без нового кода | `sudo -u ykt /srv/ykt-sokol/app/deploy/rebuild.sh` |
| Журнал API | `journalctl -u ykt-sokol -f` |
| Журнал публикаций | `tail -f /srv/ykt-sokol/logs/rebuild.log` |
| Откатить сайт на прошлую сборку | `ls /srv/ykt-sokol/releases`, затем `ln -sfn /srv/ykt-sokol/releases/<версия> /srv/ykt-sokol/current` |
| Сменить секрет или канал заявок | правка `/etc/ykt-sokol.env`, затем `systemctl restart ykt-sokol` |
| Сменить `VITE_*` (домен, Метрика) | правка `/etc/ykt-sokol.env`, `systemctl restart ykt-sokol`, затем «Опубликовать» |

Новый редирект (переименовали модель) добавляется в `deploy/nginx.conf`, затем
файл копируется на сервер, как в шаге 8, и выполняется `nginx -t && systemctl reload nginx`.
