/** Контакты: телефоны, адрес, часы работы, мессенджеры */
import type { SiteContent } from '../../types';
import { LoadError, SectionHeader, SnapshotNote, useSection } from '../section';
import { Field, Panel } from '../ui';
import { telHref } from '../schema';

export default function Site() {
	const section = useSection('site');
	const s = section.draft;
	const err = (path: string) => section.errors[`site.${path}`];
	const patch = <G extends keyof SiteContent>(group: G, value: Partial<SiteContent[G]>) =>
		section.setDraft((d) => ({ ...d, [group]: { ...d[group], ...value } }));

	if (section.loading) return <p className="py-8 text-fog-500">Загрузка…</p>;
	if (section.loadError || !s) return <LoadError message={section.loadError ?? 'Нет данных'} onRetry={section.reload} />;

	const phone = (key: 'main' | 'extra', label: string) => (
		<Field
			label={label}
			value={s.phones[key].label}
			inputMode="tel"
			error={err(`phones.${key}.label`)}
			hint={s.phones[key].label ? telHref(s.phones[key].label) : undefined}
			onChange={(v) => patch('phones', { [key]: { label: v, href: telHref(v) } })}
		/>
	);

	return (
		<>
			<SectionHeader title="Контакты" section={section} />
			{section.fromSnapshot && <SnapshotNote />}
			<div className="grid gap-4 xl:grid-cols-2">
				<Panel title="Телефоны">
					<div className="grid gap-3 sm:grid-cols-2">
						{phone('main', 'Основной (шапка, кнопки «Позвонить»)')}
						{phone('extra', 'Дополнительный (подвал, КП)')}
					</div>
				</Panel>

				<Panel title="Мессенджеры">
					<div className="grid gap-3">
						<Field label="WhatsApp" value={s.messengers.whatsapp} error={err('messengers.whatsapp')} placeholder="https://wa.me/7…" onChange={(v) => patch('messengers', { whatsapp: v })} />
						<Field label="Telegram" value={s.messengers.telegram} error={err('messengers.telegram')} placeholder="https://t.me/…" onChange={(v) => patch('messengers', { telegram: v })} />
					</div>
				</Panel>

				<Panel title="Адрес">
					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Город" value={s.address.city} error={err('address.city')} onChange={(v) => patch('address', { city: v })} />
						<Field label="Улица и дом" value={s.address.street} error={err('address.street')} onChange={(v) => patch('address', { street: v })} />
						<Field label="Полностью" value={s.address.full} error={err('address.full')} onChange={(v) => patch('address', { full: v })} className="sm:col-span-2" />
						<Field label="Коротко (подписи, кнопки)" value={s.address.short} error={err('address.short')} onChange={(v) => patch('address', { short: v })} />
						<Field label="Ссылка «Маршрут» (2ГИС, Яндекс)" value={s.address.routeUrl} error={err('address.routeUrl')} onChange={(v) => patch('address', { routeUrl: v })} />
					</div>
				</Panel>

				<Panel title="Часы работы">
					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Как пишем людям" value={s.hours.label} error={err('hours.label')} placeholder="Ежедневно, 9:00–18:00" onChange={(v) => patch('hours', { label: v })} />
						<Field label="Внутри фразы" value={s.hours.short} error={err('hours.short')} placeholder="ежедневно 9:00–18:00" onChange={(v) => patch('hours', { short: v })} />
						<Field label="Открываемся (ЧЧ:ММ)" value={s.hours.opens} error={err('hours.opens')} inputMode="numeric" onChange={(v) => patch('hours', { opens: v })} />
						<Field label="Закрываемся (ЧЧ:ММ)" value={s.hours.closes} error={err('hours.closes')} inputMode="numeric" onChange={(v) => patch('hours', { closes: v })} />
					</div>
					<p className="adm-hint mt-2">Время открытия и закрытия видят поисковики (карточка организации).</p>
				</Panel>
			</div>
		</>
	);
}
