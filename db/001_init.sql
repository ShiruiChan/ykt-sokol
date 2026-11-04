-- Схема админ-панели ЯКТСокол. Запуск: npm run db:migrate (идемпотентно).

-- Содержимое сайта: по одной строке на раздел
-- (products, faq, news, documents, site), данные — JSON как в content/*.json
create table if not exists content (
	key text primary key,
	data jsonb not null,
	updated_at timestamptz not null default now()
);

-- Журнал действий админки: сохранения, публикации, входы.
-- Для неудачных входов key — обезличенный отпечаток IP (HMAC), не сам адрес.
create table if not exists admin_audit (
	id bigserial primary key,
	at timestamptz not null default now(),
	action text not null,
	key text
);

create index if not exists admin_audit_action_at on admin_audit (action, at desc);
