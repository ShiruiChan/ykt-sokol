# ЯКТСокол — сайт производителя снегоболотоходов

React 19 + Vite 6 + Tailwind 4 + framer-motion. Деплой — Vercel.

## Команды

```bash
npm install
npm run dev          # локальная разработка, http://localhost:5173
npm run typecheck    # проверка типов
npm run build        # сборка + пререндер всех страниц + sitemap.xml/robots.txt
npm run preview      # посмотреть собранный dist (с чистыми URL, как на Vercel)
npm run optimize:images
npm test             # юнит-тесты
npm run admin:check  # самопроверка API админки (локально, без БД и Vercel)
npm run db:migrate   # создать таблицы админки в Postgres (нужен DATABASE_URL)
npm run db:seed      # заполнить БД текущим снимком content/*.json
```

## Как устроено

- **Пререндер.** `npm run build` собирает клиент, затем серверный бандл
  (`src/entry-server.tsx`) и запускает `scripts/prerender.mjs`: каждая страница
  превращается в готовый HTML с мета-тегами, а клиент «оживляет» его через
  `hydrateRoot`. Поисковики получают текст без выполнения JS.
- **Мета-теги** всех страниц — в `src/seo/meta.ts`. Новый адрес добавляется в
  `STATIC_PAGES` — и автоматически попадает в пререндер и sitemap.
- **Данные сайта** — снимок `content/*.json`: модели, FAQ, новости, документы,
  контакты. Правятся в админ-панели (`/admin`), перед сборкой подтягиваются из
  БД (`scripts/pull-content.mjs`). Типы — `src/types`.
- **Навигация и адрес сайта** — `src/config/site.ts`. При переезде на свой
  домен меняется только `SITE_URL`.
- **Модели** — `content/products.json`, адрес страницы `/models/<slug>`.
  Старые адреса `/product/<id>` перенаправляются (vercel.json и клиент).
- **Заявки** — `api/request.ts` (Vercel Function → Telegram-бот). Пока бот не
  настроен, клиент автоматически отправляет заявку резервным каналом (EmailJS).

## Переменные окружения

Шаблон — `.env.example`. В Vercel → Settings → Environment Variables:

| Переменная | Где используется |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather — сервер |
| `TELEGRAM_CHAT_ID` | чат/группа, куда приходят заявки — сервер |
| `VITE_YM_ID` | номер счётчика Яндекс.Метрики — клиент |
| `DATABASE_URL` | Postgres (Neon) для админки и сборки — сервер |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob, загрузка фото и PDF — сервер |
| `ADMIN_PASSWORD` | пароль входа в админку — сервер |
| `ADMIN_SESSION_SECRET` | ключ подписи сессии, ≥ 32 символов — сервер |
| `VERCEL_DEPLOY_HOOK_URL` | Deploy Hook для кнопки «Опубликовать» — сервер |

`.env` в репозиторий не коммитится.

## Админ-панель

Адрес — `/admin`. Владелец меняет модели (название, адрес, описание, цену, фото,
характеристики, комплектацию, опции с ценами, порядок в каталоге), вопросы,
новости, документы (PDF) и контакты. Страница закрыта от индексации
(`noindex`, `X-Robots-Tag`, `Disallow: /admin` в robots.txt) и не пререндерится;
её код — отдельная точка входа `admin.html`, публичный сайт он не утяжеляет.

### Как это работает

1. «Сохранить» в разделе → `PUT /api/admin/content/:key`: сервер проверяет данные
   (`src/admin/schema.ts`) и пишет в Postgres (таблица `content`).
2. «Опубликовать на сайте» → `POST /api/admin/publish` дёргает Deploy Hook.
   Vercel пересобирает сайт (~1 мин): `scripts/pull-content.mjs` забирает данные
   из БД в `content/*.json`, дальше обычная сборка с пререндером, sitemap и SEO.
   Пока не опубликовано, в шапке админки висит «Изменения сохранены, не опубликованы».
3. Фото и PDF грузятся из браузера прямо в Vercel Blob по одноразовому токену
   (`/api/admin/upload`): фото JPEG/PNG/WebP до 15 МБ (перед загрузкой ужимаются
   до 2000 px в WebP), PDF до 20 МБ. На сайте такие фото выводятся без srcset.
4. Без `DATABASE_URL` (или если БД недоступна) сборка идёт на снимке
   `content/*.json` из репозитория и не падает.

Вход — один пароль владельца. Сессия — cookie `HttpOnly; Secure; SameSite=Strict`
с HMAC-подписью на 7 дней. Пароль сравнивается за постоянное время; после
5 неудачных попыток за 15 минут вход с адреса блокируется (счётчик в БД,
IP хранится только как обезличенный HMAC-отпечаток).

> Удаление модели или смена её адреса (slug) ломает старую ссылку
> `/models/<старый>` — админка предупреждает об этом. Если модель
> переименована, добавьте редирект в `vercel.json` → `redirects`.

### Что настроить в Vercel (один раз)

1. **База данных.** Vercel → проект → Storage → Create Database → Neon
   (Marketplace) → подключить к проекту для Production и Preview.
   `DATABASE_URL` появится в переменных проекта сам.
2. **Хранилище файлов.** Storage → Create → Blob → подключить к проекту.
   Появится `BLOB_READ_WRITE_TOKEN`.
3. **Пароль и ключ сессии.** Settings → Environment Variables:
   - `ADMIN_PASSWORD` — длинный пароль, который больше нигде не используется;
   - `ADMIN_SESSION_SECRET` — случайная строка ≥ 32 символов:
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
     Смена секрета разлогинивает все сессии.
4. **Deploy Hook.** Settings → Git → Deploy Hooks → Create Hook: имя «admin»,
   ветка `main`. Скопировать адрес в переменную `VERCEL_DEPLOY_HOOK_URL`
   (это секрет — не публикуйте его).
5. **Таблицы и данные.** Локально, со строкой подключения из Vercel
   (`vercel env pull .env.local` или Storage → Neon → `.env.local`):
   ```bash
   DATABASE_URL='postgres://…' npm run db:migrate
   DATABASE_URL='postgres://…' npm run db:seed
   ```
   Сид без `--force` не трогает разделы, которые уже есть в БД.
6. Сделать Redeploy, чтобы функции увидели новые переменные, открыть `/admin`.

### Локально

```bash
npm run dev          # сайт + /admin + функции api/* (scripts/api-dev-plugin.mjs)
npm run admin:check  # прогон API: вход, запись, проверки схемы, публикация
```

`vercel dev` не нужен. Переменные берутся из `.env.local` (создайте сами по
`.env.example`, в git он не попадает). Без `DATABASE_URL` включается файловый
режим: админка пишет прямо в `content/*.json` рабочей копии — изменения видны
в `git diff`. На Vercel файловый режим отключён, там только Postgres.

