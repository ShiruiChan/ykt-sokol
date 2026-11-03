/**
 * Загрузка, черновик и сохранение одного раздела (products, faq, …).
 * Пока БД пуста (сид не выполнен), показывается снимок сайта из сборки —
 * при первом сохранении он запишется в БД.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError } from './api';
import { validateContent, type ContentKey, type ContentMap, type ValidationError } from './schema';
import type { ConfirmRequest } from './ui';
import productsSnapshot from '../../content/products.json';
import faqSnapshot from '../../content/faq.json';
import newsSnapshot from '../../content/news.json';
import documentsSnapshot from '../../content/documents.json';
import siteSnapshot from '../../content/site.json';

const SNAPSHOTS = {
	products: productsSnapshot,
	faq: faqSnapshot,
	news: newsSnapshot,
	documents: documentsSnapshot,
	site: siteSnapshot,
} as unknown as ContentMap;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export interface AdminContextValue {
	confirm: (req: ConfirmRequest) => void;
	setDirty: (dirty: boolean) => void;
	/** После сохранения — обновить плашку «не опубликовано» */
	refreshStatus: () => void;
	toast: (text: string) => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
	const ctx = useContext(AdminContext);
	if (!ctx) throw new Error('AdminContext');
	return ctx;
}

export interface Section<K extends ContentKey> {
	loading: boolean;
	loadError: string | null;
	/** В БД раздела ещё нет — показан снимок из сборки */
	fromSnapshot: boolean;
	saved: ContentMap[K] | null;
	draft: ContentMap[K] | null;
	setDraft: (updater: (draft: ContentMap[K]) => ContentMap[K]) => void;
	dirty: boolean;
	saving: boolean;
	saveError: string | null;
	errors: Record<string, string>;
	errorList: ValidationError[];
	save: () => Promise<boolean>;
	reset: () => void;
	reload: () => void;
}

export function useSection<K extends ContentKey>(key: K): Section<K> {
	const admin = useAdmin();
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [fromSnapshot, setFromSnapshot] = useState(false);
	const [saved, setSaved] = useState<ContentMap[K] | null>(null);
	const [draft, setDraftState] = useState<ContentMap[K] | null>(null);
	const [version, setVersion] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [errorList, setErrorList] = useState<ValidationError[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const res = await api.get(key);
			const data = res.data ?? clone(SNAPSHOTS[key]);
			setFromSnapshot(res.data === null);
			setSaved(data);
			setDraftState(clone(data));
			setVersion(res.version);
			setErrorList([]);
		} catch (e) {
			setLoadError(e instanceof ApiError ? e.message : 'Не удалось загрузить раздел');
		} finally {
			setLoading(false);
		}
	}, [key]);

	useEffect(() => {
		load();
	}, [load]);

	const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);
	const { setDirty } = admin;
	useEffect(() => {
		setDirty(dirty);
		return () => setDirty(false);
	}, [dirty, setDirty]);

	const setDraft = useCallback((updater: (d: ContentMap[K]) => ContentMap[K]) => {
		setDraftState((d) => (d === null ? d : updater(d)));
	}, []);

	const save = useCallback(async () => {
		if (!draft) return false;
		setSaveError(null);
		const check = validateContent(key, draft);
		if (!check.ok) {
			setErrorList(check.errors);
			setSaveError('Исправьте отмеченные поля — ничего не сохранено.');
			return false;
		}
		setErrorList([]);
		setSaving(true);
		try {
			const res = await api.put(key, check.data, version);
			setSaved(res.data);
			setDraftState(clone(res.data));
			setVersion(res.version);
			setFromSnapshot(false);
			admin.refreshStatus();
			admin.toast('Сохранено. Чтобы изменения появились на сайте, нажмите «Опубликовать».');
			return true;
		} catch (e) {
			if (e instanceof ApiError && e.errors) setErrorList(e.errors);
			setSaveError(e instanceof ApiError ? e.message : 'Не удалось сохранить');
			return false;
		} finally {
			setSaving(false);
		}
	}, [admin, draft, key, version]);

	const reset = useCallback(() => {
		setDraftState(saved === null ? null : clone(saved));
		setErrorList([]);
		setSaveError(null);
	}, [saved]);

	const errors = useMemo(() => Object.fromEntries(errorList.map((e) => [e.path, e.message])), [errorList]);

	return {
		loading,
		loadError,
		fromSnapshot,
		saved,
		draft,
		setDraft,
		dirty,
		saving,
		saveError,
		errors,
		errorList,
		save,
		reset,
		reload: load,
	};
}

/** Шапка раздела: заголовок, статус черновика, «Отменить правки» и «Сохранить» */
export function SectionHeader<K extends ContentKey>({
	title,
	section,
	children,
	onSave,
}: {
	title: string;
	section: Section<K>;
	children?: ReactNode;
	/** Своя обработка «Сохранить» (например, предупреждение о смене адреса) */
	onSave?: () => void;
}) {
	return (
		<div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/8 bg-ink-950/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex min-w-0 items-baseline gap-3">
					<h2 className="text-lg font-bold text-fog-50">{title}</h2>
					{section.dirty ? (
						<span className="adm-status text-signal-400">Есть несохранённые правки</span>
					) : (
						<span className="adm-status text-fog-500">Сохранено</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{children}
					<button type="button" className="adm-btn adm-btn-quiet" disabled={!section.dirty || section.saving} onClick={section.reset}>
						Отменить правки
					</button>
					<button
						type="button"
						className="adm-btn adm-btn-primary"
						disabled={!section.dirty || section.saving}
						onClick={() => (onSave ? onSave() : section.save())}
					>
						{section.saving ? 'Сохраняю…' : 'Сохранить'}
					</button>
				</div>
			</div>
			{section.saveError && (
				<div className="adm-err mt-3" role="alert">
					<p className="font-semibold">{section.saveError}</p>
					{section.errorList.length > 0 && (
						<ul className="mt-1 list-disc space-y-0.5 pl-5">
							{section.errorList.slice(0, 8).map((e) => (
								<li key={e.path + e.message}>
									{describePath(e.path, section.draft)}: {e.message}
								</li>
							))}
							{section.errorList.length > 8 && <li>…и ещё {section.errorList.length - 8}</li>}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}

const FIELD_NAMES: Record<string, string> = {
	name: 'название',
	slug: 'адрес страницы',
	price: 'цена',
	deskSmall: 'краткое описание',
	description: 'описание',
	images: 'фото',
	q: 'вопрос',
	a: 'ответ',
	title: 'заголовок',
	content: 'текст',
	date: 'дата',
	url: 'файл',
	label: 'номер',
	quantity: 'количество',
};

/** «products[2].accessories.Свет[0].price» → «Модель «ЛИС» → опция 1 в «Свет» → цена» */
export function describePath(path: string, draft: unknown): string {
	const m = path.match(/^(\w+)\[(\d+)\](.*)$/);
	const parts: string[] = [];
	let rest = path;
	if (m) {
		const [, root, idx, tail] = m;
		const item = Array.isArray(draft) ? (draft[Number(idx)] as Record<string, unknown> | undefined) : undefined;
		const name = item && typeof item.name === 'string' ? item.name : item && typeof item.title === 'string' ? item.title : null;
		const kind = { products: 'Модель', faq: 'Вопрос', news: 'Новость', documents: 'Документ' }[root] ?? root;
		parts.push(name ? `${kind} «${name}»` : `${kind} №${Number(idx) + 1}`);
		rest = tail.replace(/^\./, '');
	}
	const acc = rest.match(/^accessories\.([^[]+)\[(\d+)\]\.?(\w*)/);
	if (acc) {
		parts.push(`опция ${Number(acc[2]) + 1} в «${acc[1]}»`);
		rest = acc[3];
	}
	const last = rest.split(/[.[\]]/).filter(Boolean).pop();
	if (last && !/^\d+$/.test(last)) parts.push(FIELD_NAMES[last] ?? last);
	return parts.join(' → ') || path;
}

/* ------------------------------- Общее ----------------------------------- */

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<div className="adm-err my-6 max-w-lg" role="alert">
			{message}{' '}
			<button type="button" className="underline" onClick={onRetry}>
				Повторить
			</button>
		</div>
	);
}

export function SnapshotNote() {
	return (
		<p className="adm-warn mb-4">
			В базе этого раздела ещё нет — показаны данные, на которых сейчас собран сайт. При сохранении они запишутся в базу.
		</p>
	);
}
