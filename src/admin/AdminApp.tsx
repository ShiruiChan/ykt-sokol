/**
 * Админ-панель: вход по паролю, разделы содержимого, публикация.
 * Отдельная точка входа (admin.html) — в бандл сайта не попадает.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { api, ApiError, type AdminStatus } from './api';
import { AdminContext, type AdminContextValue } from './section';
import { ConfirmDialog, formatTime, type ConfirmRequest } from './ui';

const Products = lazy(() => import('./sections/Products'));
const Faq = lazy(() => import('./sections/Faq'));
const News = lazy(() => import('./sections/News'));
const Documents = lazy(() => import('./sections/Documents'));
const Site = lazy(() => import('./sections/Site'));

const SECTIONS = [
	{ id: 'models', label: 'Модели', Component: Products },
	{ id: 'faq', label: 'Вопросы', Component: Faq },
	{ id: 'news', label: 'Новости', Component: News },
	{ id: 'documents', label: 'Документы', Component: Documents },
	{ id: 'contacts', label: 'Контакты', Component: Site },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

const sectionFromHash = (): SectionId => {
	const id = window.location.hash.replace('#', '');
	return (SECTIONS.find((s) => s.id === id)?.id ?? 'models') as SectionId;
};

/* --------------------------------- Вход ---------------------------------- */

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	async function submit(e: FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			await api.login(password);
			onDone();
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Не удалось войти');
			setPassword('');
		} finally {
			setBusy(false);
		}
	}

	return (
		<main className="grid min-h-dvh place-items-center px-4 py-10">
			<form onSubmit={submit} className="adm-panel w-full max-w-sm p-6" aria-labelledby="login-title">
				<p className="eyebrow">ЯКТСокол</p>
				<h1 id="login-title" className="mt-3 text-xl font-bold text-fog-50">
					Админ-панель
				</h1>
				<p className="mt-1 text-sm text-fog-400">Модели, цены, новости, документы и контакты сайта.</p>
				{!configured && (
					<p className="adm-warn mt-4">
						Вход не настроен: в Vercel нужно задать ADMIN_PASSWORD и ADMIN_SESSION_SECRET (см. README).
					</p>
				)}
				<label htmlFor="password" className="adm-label mt-5">
					Пароль
				</label>
				<input
					id="password"
					type="password"
					autoComplete="current-password"
					className="adm-input"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					aria-invalid={error ? true : undefined}
					autoFocus
					required
				/>
				{error && (
					<p className="adm-error-text" role="alert">
						{error}
					</p>
				)}
				<button type="submit" className="adm-btn adm-btn-primary mt-5 w-full" disabled={busy || !password}>
					{busy ? 'Вхожу…' : 'Войти'}
				</button>
			</form>
		</main>
	);
}

/* ------------------------------ Публикация ------------------------------- */

function PublishBar({ status, onPublished }: { status: AdminStatus; onPublished: () => void }) {
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

	async function publish() {
		setBusy(true);
		setMessage(null);
		try {
			await api.publish();
			setMessage({ kind: 'ok', text: 'Сайт пересобирается — обновится примерно через минуту.' });
			onPublished();
		} catch (e) {
			setMessage({ kind: 'err', text: e instanceof ApiError ? e.message : 'Не удалось опубликовать' });
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
			<div className="min-w-0 text-xs leading-snug">
				{status.unpublished ? (
					<span className="adm-status text-signal-400">Изменения сохранены, не опубликованы</span>
				) : (
					<span className="adm-status text-accent-200">Сайт актуален</span>
				)}
				<span className="ml-3 hidden text-fog-500 lg:inline">
					сохранено {formatTime(status.lastSaveAt)} · опубликовано {formatTime(status.lastPublishAt)}
				</span>
			</div>
			<button type="button" className="adm-btn adm-btn-primary" onClick={publish} disabled={busy}>
				{busy ? 'Запускаю…' : 'Опубликовать на сайте'}
			</button>
			{message && (
				<p role="status" className={`w-full text-xs ${message.kind === 'ok' ? 'text-accent-200' : 'text-[#f3c0b2]'}`}>
					{message.text}
				</p>
			)}
		</div>
	);
}

/* -------------------------------- Каркас --------------------------------- */

export default function AdminApp() {
	const [status, setStatus] = useState<AdminStatus | null>(null);
	const [statusError, setStatusError] = useState<string | null>(null);
	const [section, setSection] = useState<SectionId>(sectionFromHash);
	const [confirmReq, setConfirmReq] = useState<ConfirmRequest | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const dirtyRef = useRef(false);
	const toastTimer = useRef<number>(0);

	const refreshStatus = useCallback(async () => {
		try {
			setStatus(await api.status());
			setStatusError(null);
		} catch (e) {
			setStatusError(e instanceof ApiError ? e.message : 'Сервер недоступен');
		}
	}, []);

	useEffect(() => {
		refreshStatus();
	}, [refreshStatus]);

	useEffect(() => {
		const onUnload = (e: BeforeUnloadEvent) => {
			if (dirtyRef.current) e.preventDefault();
		};
		window.addEventListener('beforeunload', onUnload);
		return () => window.removeEventListener('beforeunload', onUnload);
	}, []);

	const ctx = useMemo<AdminContextValue>(
		() => ({
			confirm: setConfirmReq,
			setDirty: (d) => {
				dirtyRef.current = d;
			},
			refreshStatus,
			toast: (text) => {
				setToast(text);
				window.clearTimeout(toastTimer.current);
				toastTimer.current = window.setTimeout(() => setToast(null), 5000);
			},
		}),
		[refreshStatus]
	);

	function go(id: SectionId) {
		if (id === section) return;
		const switchTo = () => {
			dirtyRef.current = false;
			setSection(id);
			history.replaceState(null, '', `#${id}`);
		};
		if (dirtyRef.current) {
			setConfirmReq({
				title: 'Уйти без сохранения?',
				body: 'В этом разделе есть несохранённые правки. Если перейти, они пропадут.',
				confirmLabel: 'Уйти, правки не нужны',
				danger: true,
				onConfirm: switchTo,
			});
		} else switchTo();
	}

	async function logout() {
		await api.logout().catch(() => undefined);
		setStatus({ authenticated: false, authConfigured: true });
	}

	if (statusError && !status) {
		return (
			<main className="grid min-h-dvh place-items-center px-4">
				<div className="adm-err max-w-sm">
					{statusError}{' '}
					<button type="button" className="underline" onClick={refreshStatus}>
						Повторить
					</button>
				</div>
			</main>
		);
	}
	if (!status) return <main className="min-h-dvh" aria-busy="true" />;
	if (!status.authenticated) return <Login configured={status.authConfigured} onDone={refreshStatus} />;

	const Current = SECTIONS.find((s) => s.id === section)!.Component;

	return (
		<AdminContext.Provider value={ctx}>
			<div className="flex min-h-dvh flex-col">
				<header className="border-b border-white/8 bg-ink-900">
					<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
						<div className="flex items-center gap-3">
							<span className="font-display text-sm tracking-[0.18em] text-fog-50">ЯКТСокол</span>
							<span className="text-xs text-fog-500">админ-панель</span>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<PublishBar status={status} onPublished={refreshStatus} />
							<a className="adm-btn adm-btn-quiet" href="/" target="_blank" rel="noopener">
								Открыть сайт
							</a>
							<button type="button" className="adm-btn adm-btn-quiet" onClick={logout}>
								Выйти
							</button>
						</div>
					</div>
					{(status.store === 'file' || status.storeError || status.store === null) && (
						<div className="border-t border-white/8 px-4 py-2 text-xs md:px-6">
							{status.store === 'file' && (
								<span className="text-signal-400">Локальный режим: правки пишутся в content/*.json рабочей копии.</span>
							)}
							{status.store === null && <span className="text-[#f3c0b2]">База данных не настроена (DATABASE_URL) — сохранение недоступно.</span>}
							{status.storeError && <span className="text-[#f3c0b2]">{status.storeError}</span>}
						</div>
					)}
				</header>

				<div className="flex flex-1 flex-col md:flex-row">
					<nav aria-label="Разделы" className="border-b border-white/8 bg-ink-900 md:w-52 md:shrink-0 md:border-r md:border-b-0">
						<ul className="flex gap-1 overflow-x-auto p-2 md:sticky md:top-0 md:flex-col md:p-3">
							{SECTIONS.map((s) => (
								<li key={s.id} className="shrink-0">
									<button
										type="button"
										className="adm-nav-item"
										aria-current={s.id === section ? 'page' : undefined}
										onClick={() => go(s.id)}
									>
										{s.label}
									</button>
								</li>
							))}
						</ul>
					</nav>

					<main className="adm min-w-0 flex-1 px-4 pb-16 md:px-6">
						<Suspense fallback={<p className="py-8 text-fog-500">Загрузка…</p>}>
							<Current key={section} />
						</Suspense>
					</main>
				</div>
			</div>

			<ConfirmDialog request={confirmReq} onClose={() => setConfirmReq(null)} />
			{toast && (
				<div role="status" className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-md border border-accent-500/40 bg-ink-850 px-4 py-3 text-sm text-fog-50 shadow-[var(--shadow-lift)]">
					{toast}
				</div>
			)}
		</AdminContext.Provider>
	);
}
