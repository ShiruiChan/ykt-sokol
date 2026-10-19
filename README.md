# ЯКТ СОКОЛ — сайт производителя снегоболотоходов

React 19 + Vite 6 + Tailwind 4 + framer-motion. Деплой — Vercel.

## Команды

```bash
npm install
npm run dev          # локальная разработка, http://localhost:5173
npm run typecheck    # проверка типов
npm run build        # сборка + пререндер всех страниц + sitemap.xml/robots.txt
npm run preview      # посмотреть собранный dist (с чистыми URL, как на Vercel)
npm run optimize:images
```

## Как устроено

- **Пререндер.** `npm run build` собирает клиент, затем серверный бандл
  (`src/entry-server.tsx`) и запускает `scripts/prerender.mjs`: каждая страница
  превращается в готовый HTML с мета-тегами, а клиент «оживляет» его через
  `hydrateRoot`. Поисковики получают текст без выполнения JS.
- **Мета-теги** всех страниц — в `src/seo/meta.ts`. Новый адрес добавляется в
  `STATIC_PAGES` — и автоматически попадает в пререндер и sitemap.
- **Контакты, адрес, навигация** — `src/config/site.ts`. При переезде на свой
  домен меняется только `SITE_URL`.
- **Модели** — `src/data/products.ts`, адрес страницы `/models/<slug>`.
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

`.env` в репозиторий не коммитится.
