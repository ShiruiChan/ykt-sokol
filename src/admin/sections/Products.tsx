/**
 * Модели: порядок в каталоге, добавление/дублирование/удаление,
 * редактор полей, фото, характеристик, комплектации и опций с ценами.
 */
import { useEffect, useMemo, useState } from 'react';
import type { Accessory, Product, Spec } from '../../types';
import { EXTENDED_SPEC_FIELDS, SLUG_RE, SPEC_FIELDS } from '../schema';
import { LoadError, SectionHeader, SnapshotNote, useAdmin, useSection } from '../section';
import { Field, OrderButtons, Panel, PriceField, UploadButton, move } from '../ui';
import { slugify } from '../upload';

const rub = (n: number) => `${Number.isFinite(n) ? n.toLocaleString('ru-RU') : '—'} ₽`;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const maxAccessoryId = (list: Product[]) =>
	Math.max(0, ...list.flatMap((p) => Object.values(p.accessories).flat().map((a) => a.id)));

function uniqueSlug(base: string, list: Product[]): string {
	const taken = new Set(list.map((p) => p.slug));
	const root = base || 'model';
	if (!taken.has(root)) return root;
	for (let i = 2; ; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
}

export default function Products() {
	const section = useSection('products');
	const { confirm } = useAdmin();
	const [selected, setSelected] = useState(0);
	const [mobileEdit, setMobileEdit] = useState(false);

	const products = section.draft ?? [];
	const savedSlugs = useMemo(() => (section.saved ?? []).map((p) => p.slug), [section.saved]);
	const lostSlugs = savedSlugs.filter((s) => !products.some((p) => p.slug === s));
	const current = products[selected];

	const update = (i: number, fn: (p: Product) => Product) =>
		section.setDraft((list) => list.map((p, j) => (j === i ? fn(p) : p)));

	function add() {
		const id = Math.max(0, ...products.map((p) => p.id)) + 1;
		const fresh: Product = {
			id,
			slug: uniqueSlug(`model-${id}`, products),
			name: 'Новая модель',
			description: '',
			deskSmall: '',
			price: 0,
			images: [],
			specs: {},
			defaultKit: [],
			accessories: {},
		};
		section.setDraft((list) => [...list, fresh]);
		setSelected(products.length);
		setMobileEdit(true);
	}

	function duplicate(i: number) {
		const src = products[i];
		let nextAcc = maxAccessoryId(products);
		const copy: Product = {
			...clone(src),
			id: Math.max(0, ...products.map((p) => p.id)) + 1,
			slug: uniqueSlug(`${src.slug}-copy`, products),
			name: `${src.name} (копия)`,
			// Новые id опций: КП ссылается на опции по id
			accessories: Object.fromEntries(
				Object.entries(src.accessories).map(([cat, items]) => [cat, items.map((a) => ({ ...a, id: ++nextAcc }))])
			),
		};
		section.setDraft((list) => [...list.slice(0, i + 1), copy, ...list.slice(i + 1)]);
		setSelected(i + 1);
		setMobileEdit(true);
	}

	function remove(i: number) {
		const p = products[i];
		// Перестанет работать адрес, который сейчас на сайте, а не правка в черновике
		const liveSlug = section.saved?.find((x) => x.id === p.id)?.slug;
		confirm({
			title: `Удалить модель «${p.name}»?`,
			body: (
				<>
					Модель пропадёт из каталога, сравнения и с главной после публикации.{' '}
					{liveSlug && (
						<>
							Адрес <code className="text-fog-200">/models/{liveSlug}</code> перестанет работать — ссылки на него из
							поиска и мессенджеров будут вести на страницу «не найдено».{' '}
						</>
					)}
					До сохранения удаление можно отменить кнопкой «Отменить правки».
				</>
			),
			confirmLabel: 'Удалить модель',
			danger: true,
			onConfirm: () => {
				section.setDraft((list) => list.filter((_, j) => j !== i));
				setSelected((s) => Math.max(0, s >= i ? s - 1 : s));
				setMobileEdit(false);
			},
		});
	}

	function save() {
		if (!lostSlugs.length) return void section.save();
		confirm({
			title: 'Старые адреса перестанут работать',
			body: (
				<>
					<p>После публикации эти страницы откроются как «не найдено»:</p>
					<ul className="mt-2 list-disc pl-5 text-fog-200">
						{lostSlugs.map((s) => (
							<li key={s}>/models/{s}</li>
						))}
					</ul>
					<p className="mt-2">
						Если модель просто переименована, попросите разработчика добавить редирект со старого адреса на новый
						(vercel.json), чтобы не потерять посетителей из поиска.
					</p>
				</>
			),
			confirmLabel: 'Сохранить всё равно',
			danger: true,
			onConfirm: () => void section.save(),
		});
	}

	if (section.loading) return <p className="py-8 text-fog-500">Загрузка моделей…</p>;
	if (section.loadError) return <LoadError message={section.loadError} onRetry={section.reload} />;

	return (
		<>
			<SectionHeader title="Модели" section={section} onSave={save} />
			{section.fromSnapshot && <SnapshotNote />}
			{lostSlugs.length > 0 && (
				<p className="adm-warn mb-4">
					После сохранения и публикации перестанут работать адреса:{' '}
					{lostSlugs.map((s) => (
						<code key={s} className="mr-2 text-fog-50">
							/models/{s}
						</code>
					))}
				</p>
			)}

			<div className="grid gap-4 md:grid-cols-[19rem_minmax(0,1fr)]">
				{/* Список моделей */}
				<div className={mobileEdit ? 'hidden md:block' : ''}>
					<Panel
						title={`В каталоге: ${products.length}`}
						actions={
							<button type="button" className="adm-btn adm-btn-primary" onClick={add}>
								+ Модель
							</button>
						}
					>
						<ol className="-my-1">
							{products.map((p, i) => (
								<li key={p.id} className="adm-row flex items-center gap-2 py-2">
									<button
										type="button"
										onClick={() => {
											setSelected(i);
											setMobileEdit(true);
										}}
										aria-current={i === selected ? 'true' : undefined}
										className={`min-w-0 flex-1 rounded-[0.375rem] px-2 py-1.5 text-left transition-colors ${
											i === selected ? 'bg-ink-800 shadow-[inset_2px_0_0_var(--color-accent-400)]' : 'hover:bg-white/4'
										}`}
									>
										<span className="block font-semibold break-words text-fog-50">{p.name || 'Без названия'}</span>
										<span className="tnum block text-xs text-fog-500">
											{rub(p.price)} · {p.images.length} фото
										</span>
									</button>
									<OrderButtons
										index={i}
										length={products.length}
										label={p.name}
										onMove={(to) => {
											section.setDraft((list) => move(list, i, to));
											if (selected === i) setSelected(to);
											else if (selected === to) setSelected(i);
										}}
									/>
								</li>
							))}
						</ol>
						<p className="adm-hint mt-3">Порядок здесь — порядок в каталоге на главной и в сравнении.</p>
					</Panel>
				</div>

				{/* Редактор */}
				<div className={mobileEdit ? '' : 'hidden md:block'}>
					{current ? (
						<ProductEditor
							key={current.id}
							product={current}
							index={selected}
							all={products}
							savedSlug={section.saved?.find((p) => p.id === current.id)?.slug}
							errors={section.errors}
							onChange={(fn) => update(selected, fn)}
							onDuplicate={() => duplicate(selected)}
							onRemove={() => remove(selected)}
							onBack={() => setMobileEdit(false)}
						/>
					) : (
						<p className="py-8 text-fog-500">Моделей нет. Нажмите «+ Модель».</p>
					)}
				</div>
			</div>
		</>
	);
}

/* ------------------------------- Редактор -------------------------------- */

interface EditorProps {
	product: Product;
	index: number;
	all: Product[];
	savedSlug?: string;
	errors: Record<string, string>;
	onChange: (fn: (p: Product) => Product) => void;
	onDuplicate: () => void;
	onRemove: () => void;
	onBack: () => void;
}

function ProductEditor({ product: p, index, all, savedSlug, errors, onChange, onDuplicate, onRemove, onBack }: EditorProps) {
	const { confirm } = useAdmin();
	const [imageUrl, setImageUrl] = useState('');
	const e = (field: string) => errors[`products[${index}].${field}`];
	const set = <K extends keyof Product>(key: K, value: Product[K]) => onChange((x) => ({ ...x, [key]: value }));

	const slugTaken = all.some((x) => x.id !== p.id && x.slug === p.slug);
	const slugError = !p.slug
		? 'Обязательное поле'
		: !SLUG_RE.test(p.slug)
			? 'Только латиница в нижнем регистре, цифры и дефис'
			: slugTaken
				? 'Такой адрес уже у другой модели'
				: e('slug');

	const setSpec = (key: keyof Omit<Spec, 'extendedSpecs'>, v: string) =>
		onChange((x) => ({ ...x, specs: { ...x.specs, [key]: v } }));
	const setExt = (key: keyof NonNullable<Spec['extendedSpecs']>, v: string) =>
		onChange((x) => ({ ...x, specs: { ...x.specs, extendedSpecs: { ...x.specs.extendedSpecs, [key]: v } } }));

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<button type="button" className="adm-btn adm-btn-quiet md:hidden" onClick={onBack}>
					← Все модели
				</button>
				<h3 className="min-w-0 truncate text-base font-bold text-fog-50">{p.name || 'Без названия'}</h3>
				<div className="flex gap-2">
					<a className="adm-btn adm-btn-quiet" href={`/models/${savedSlug ?? p.slug}`} target="_blank" rel="noopener">
						На сайте
					</a>
					<button type="button" className="adm-btn" onClick={onDuplicate}>
						Дублировать
					</button>
					<button type="button" className="adm-btn adm-btn-danger" onClick={onRemove}>
						Удалить
					</button>
				</div>
			</div>

			<Panel title="Основное">
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Название" value={p.name} onChange={(v) => set('name', v)} error={e('name')} className="sm:col-span-2" />
					<div>
						<Field
							label="Адрес страницы"
							value={p.slug}
							onChange={(v) => set('slug', v.toLowerCase().trim())}
							error={slugError}
							hint={`/models/${p.slug || '…'}`}
						/>
						<button type="button" className="adm-btn adm-btn-quiet mt-1 px-0 text-xs" onClick={() => set('slug', slugify(p.name))}>
							Сделать из названия
						</button>
					</div>
					<PriceField label="Цена, ₽ (базовая комплектация)" value={p.price} onChange={(v) => set('price', v)} error={e('price')} />
					{savedSlug && savedSlug !== p.slug && (
						<p className="adm-warn sm:col-span-2">
							Адрес меняется: <code>/models/{savedSlug}</code> → <code>/models/{p.slug || '…'}</code>. Старый адрес
							перестанет работать после публикации.
						</p>
					)}
					<Field
						label="Краткое описание (карточка в каталоге, поисковики)"
						value={p.deskSmall}
						onChange={(v) => set('deskSmall', v)}
						error={e('deskSmall')}
						multiline
						rows={2}
						className="sm:col-span-2"
					/>
					<Field
						label="Подробное описание (страница модели)"
						value={p.description}
						onChange={(v) => set('description', v)}
						error={e('description')}
						multiline
						rows={6}
						className="sm:col-span-2"
					/>
				</div>
			</Panel>

			<Panel
				title={`Фото: ${p.images.length}`}
				actions={<UploadButton kind="image" multiple label="Загрузить фото" onUploaded={(url) => onChange((x) => ({ ...x, images: [...x.images, url] }))} />}
			>
				{p.images.length === 0 && <p className="text-fog-500">Фото нет — на сайте будет заглушка.</p>}
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
					{p.images.map((src, i) => (
						<li key={src + i}>
							<div className="adm-thumb">
								<img src={src} alt={`Фото ${i + 1}`} loading="lazy" />
								{i === 0 && (
									<span className="absolute top-1.5 left-1.5 rounded-sm bg-accent-600 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-white">
										Главное
									</span>
								)}
							</div>
							<div className="mt-1.5 flex items-center justify-between gap-1">
								<OrderButtons
									horizontal
									index={i}
									length={p.images.length}
									label={`Фото ${i + 1}`}
									onMove={(to) => onChange((x) => ({ ...x, images: move(x.images, i, to) }))}
								/>
								<button
									type="button"
									className="adm-btn adm-btn-danger adm-icon"
									aria-label={`Убрать фото ${i + 1}`}
									title="Убрать фото"
									onClick={() =>
										confirm({
											title: 'Убрать фото из модели?',
											body: 'Файл останется в хранилище, но на странице модели его не будет.',
											confirmLabel: 'Убрать',
											danger: true,
											onConfirm: () => onChange((x) => ({ ...x, images: x.images.filter((_, j) => j !== i) })),
										})
									}
								>
									×
								</button>
							</div>
							{e(`images[${i}]`) && <p className="adm-error-text">{e(`images[${i}]`)}</p>}
						</li>
					))}
				</ul>
				<form
					className="mt-4 flex gap-2"
					onSubmit={(ev) => {
						ev.preventDefault();
						const url = imageUrl.trim();
						if (!url) return;
						onChange((x) => ({ ...x, images: [...x.images, url] }));
						setImageUrl('');
					}}
				>
					<input
						className="adm-input"
						placeholder="или адрес файла: /images/lis/1.webp или https://…"
						value={imageUrl}
						onChange={(ev) => setImageUrl(ev.target.value)}
						aria-label="Адрес фото"
					/>
					<button type="submit" className="adm-btn" disabled={!imageUrl.trim()}>
						Добавить
					</button>
				</form>
				<p className="adm-hint mt-2">Первое фото — главное: оно в карточке каталога и в превью для соцсетей. Фото ужимаются до 2000 px перед загрузкой.</p>
			</Panel>

			<Panel title="Характеристики">
				<p className="adm-hint -mt-1 mb-3">Пустые поля на сайте не показываются.</p>
				<div className="grid gap-3 sm:grid-cols-2">
					{SPEC_FIELDS.map(([key, label]) => (
						<Field key={key} label={label} value={p.specs[key] ?? ''} onChange={(v) => setSpec(key, v)} error={e(`specs.${key}`)} />
					))}
				</div>
				<h4 className="mt-6 mb-3 text-xs font-bold tracking-[0.06em] text-fog-400 uppercase">Подробные</h4>
				<div className="grid gap-3 sm:grid-cols-2">
					{EXTENDED_SPEC_FIELDS.map(([key, label]) => (
						<Field
							key={key}
							label={label}
							value={p.specs.extendedSpecs?.[key] ?? ''}
							onChange={(v) => setExt(key, v)}
							error={e(`specs.extendedSpecs.${key}`)}
						/>
					))}
				</div>
			</Panel>

			<KitEditor product={p} index={index} errors={errors} onChange={onChange} />
			<AccessoriesEditor product={p} index={index} all={all} errors={errors} onChange={onChange} />
		</div>
	);
}

/* ------------------------------ Комплектация ----------------------------- */

function KitEditor({ product: p, index, errors, onChange }: Pick<EditorProps, 'product' | 'index' | 'errors' | 'onChange'>) {
	const setKit = (fn: (kit: Product['defaultKit']) => Product['defaultKit']) => onChange((x) => ({ ...x, defaultKit: fn(x.defaultKit) }));
	return (
		<Panel
			title={`Комплектация: ${p.defaultKit.length}`}
			actions={
				<button type="button" className="adm-btn" onClick={() => setKit((k) => [...k, { name: '', quantity: '1 шт.' }])}>
					+ Позиция
				</button>
			}
		>
			{p.defaultKit.length === 0 && <p className="text-fog-500">Пусто — блок комплектации на сайте скрыт.</p>}
			<ul className="space-y-2">
				{p.defaultKit.map((k, i) => (
					<li key={i} className="grid grid-cols-[minmax(0,1fr)_7rem] items-start gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto_auto]">
						<input
							className="adm-input"
							value={k.name}
							placeholder="Что входит"
							aria-label={`Позиция ${i + 1}`}
							aria-invalid={errors[`products[${index}].defaultKit[${i}].name`] ? true : undefined}
							onChange={(ev) => setKit((kit) => kit.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)))}
						/>
						<input
							className="adm-input"
							value={k.quantity}
							placeholder="1 шт."
							aria-label={`Количество, позиция ${i + 1}`}
							onChange={(ev) => setKit((kit) => kit.map((x, j) => (j === i ? { ...x, quantity: ev.target.value } : x)))}
						/>
						<OrderButtons index={i} length={p.defaultKit.length} label={k.name || `Позиция ${i + 1}`} onMove={(to) => setKit((kit) => move(kit, i, to))} />
						<button
							type="button"
							className="adm-btn adm-btn-danger adm-icon"
							aria-label={`Удалить позицию ${i + 1}`}
							onClick={() => setKit((kit) => kit.filter((_, j) => j !== i))}
						>
							×
						</button>
					</li>
				))}
			</ul>
		</Panel>
	);
}

/* -------------------------------- Опции ---------------------------------- */

function AccessoriesEditor({ product: p, index, all, errors, onChange }: Pick<EditorProps, 'product' | 'index' | 'all' | 'errors' | 'onChange'>) {
	const { confirm } = useAdmin();
	const categories = Object.entries(p.accessories);
	const total = categories.reduce((n, [, items]) => n + items.length, 0);

	const setCats = (fn: (cats: [string, Accessory[]][]) => [string, Accessory[]][]) =>
		onChange((x) => ({ ...x, accessories: Object.fromEntries(fn(Object.entries(x.accessories))) }));

	const setItems = (cat: string, fn: (items: Accessory[]) => Accessory[]) =>
		setCats((cats) => cats.map(([c, items]) => [c, c === cat ? fn(items) : items]));

	function addCategory() {
		let name = 'Новая категория';
		for (let i = 2; p.accessories[name]; i++) name = `Новая категория ${i}`;
		setCats((cats) => [...cats, [name, []]]);
	}

	function addItem(cat: string) {
		// id уникален по всем моделям: КП ссылается на опции по id
		const id = maxAccessoryId(all) + 1;
		setItems(cat, (items) => [...items, { id, name: '', description: '', price: 0 }]);
	}

	return (
		<Panel
			title={`Дооснащение: ${total}`}
			actions={
				<button type="button" className="adm-btn" onClick={addCategory}>
					+ Категория
				</button>
			}
		>
			{categories.length === 0 && <p className="text-fog-500">Опций нет — блок дооснащения на сайте скрыт.</p>}
			<div className="space-y-5">
				{categories.map(([cat, items], ci) => (
					<section key={ci} className="rounded-md border border-white/8 bg-ink-950/40">
						<header className="flex flex-wrap items-start gap-2 border-b border-white/8 p-3">
							<CategoryName
								name={cat}
								others={categories.filter((_, j) => j !== ci).map(([c]) => c)}
								onRename={(next) => setCats((cats) => cats.map(([c, it], j) => [j === ci ? next : c, it]))}
							/>
							<div className="ml-auto flex gap-1">
								<OrderButtons index={ci} length={categories.length} label={cat} onMove={(to) => setCats((cats) => move(cats, ci, to))} />
								<button
									type="button"
									className="adm-btn adm-btn-danger"
									onClick={() =>
										items.length
											? confirm({
													title: `Удалить категорию «${cat}»?`,
													body: `Вместе с ней удалятся опций: ${items.length}.`,
													confirmLabel: 'Удалить категорию',
													danger: true,
													onConfirm: () => setCats((cats) => cats.filter((_, j) => j !== ci)),
												})
											: setCats((cats) => cats.filter((_, j) => j !== ci))
									}
								>
									Удалить
								</button>
							</div>
						</header>
						<ul className="divide-y divide-white/6">
							{items.map((a, ai) => {
								const path = `products[${index}].accessories.${cat}[${ai}]`;
								return (
									<li key={a.id} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_9rem_auto]">
										<Field
											label="Опция"
											value={a.name}
											error={errors[`${path}.name`]}
											onChange={(v) => setItems(cat, (list) => list.map((x, j) => (j === ai ? { ...x, name: v } : x)))}
										/>
										<Field
											label="Пояснение"
											value={a.description}
											error={errors[`${path}.description`]}
											onChange={(v) => setItems(cat, (list) => list.map((x, j) => (j === ai ? { ...x, description: v } : x)))}
										/>
										<PriceField
											label="Цена, ₽"
											value={a.price}
											error={errors[`${path}.price`]}
											onChange={(v) => setItems(cat, (list) => list.map((x, j) => (j === ai ? { ...x, price: v } : x)))}
										/>
										<div className="flex items-end gap-1">
											<OrderButtons index={ai} length={items.length} label={a.name || 'Опция'} onMove={(to) => setItems(cat, (list) => move(list, ai, to))} />
											<button
												type="button"
												className="adm-btn adm-btn-danger adm-icon"
												aria-label={`Удалить опцию ${a.name}`}
												onClick={() => setItems(cat, (list) => list.filter((_, j) => j !== ai))}
											>
												×
											</button>
										</div>
									</li>
								);
							})}
						</ul>
						<div className="p-3 pt-1">
							<button type="button" className="adm-btn adm-btn-quiet" onClick={() => addItem(cat)}>
								+ Опция в «{cat}»
							</button>
						</div>
					</section>
				))}
			</div>
		</Panel>
	);
}

/** Название категории. Пустое или повторяющееся не применяется — иначе категории слились бы */
function CategoryName({ name, others, onRename }: { name: string; others: string[]; onRename: (next: string) => void }) {
	const [text, setText] = useState(name);
	// Категорию передвинули или правки отменили — показываем актуальное имя
	useEffect(() => {
		if (text.trim() !== name) setText(name);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name]);
	const trimmed = text.trim();
	const error = !trimmed ? 'Введите название' : trimmed !== name && others.includes(trimmed) ? 'Такая категория уже есть' : null;
	return (
		<div className="min-w-[12rem] flex-1">
			<input
				className="adm-input font-semibold"
				value={text}
				aria-label="Название категории"
				aria-invalid={error ? true : undefined}
				onChange={(ev) => {
					const v = ev.target.value;
					setText(v);
					const t = v.trim();
					if (t && !others.includes(t)) onRename(t);
				}}
			/>
			{error && <p className="adm-error-text">{error}</p>}
		</div>
	);
}
