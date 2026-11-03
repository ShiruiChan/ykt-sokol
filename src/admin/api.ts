/** Запросы админки к /api/admin/*. Cookie сессии браузер подставляет сам */
import type { ContentKey, ContentMap, ValidationError } from './schema';

export class ApiError extends Error {
	status: number;
	errors?: ValidationError[];
	constructor(status: number, message: string, errors?: ValidationError[]) {
		super(message);
		this.status = status;
		this.errors = errors;
	}
}

async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
	let res: Response;
	try {
		res = await fetch(url, {
			method,
			credentials: 'same-origin',
			headers: body === undefined ? undefined : { 'content-type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch {
		throw new ApiError(0, 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
	}
	const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
	if (!res.ok) {
		const message = typeof data.error === 'string' ? data.error : `Ошибка сервера (${res.status})`;
		throw new ApiError(res.status, message, data.errors as ValidationError[] | undefined);
	}
	return data as T;
}

export interface AdminStatus {
	authenticated: boolean;
	authConfigured: boolean;
	store?: 'postgres' | 'file' | null;
	storeError?: string | null;
	publishConfigured?: boolean;
	uploadsConfigured?: boolean;
	lastSaveAt?: string | null;
	lastPublishAt?: string | null;
	unpublished?: boolean;
}

export const api = {
	status: () => call<AdminStatus>('GET', '/api/admin/status'),
	login: (password: string) => call<{ ok: true }>('POST', '/api/admin/login', { password }),
	logout: () => call<{ ok: true }>('POST', '/api/admin/logout', {}),
	publish: () => call<{ ok: true; publishedAt: string }>('POST', '/api/admin/publish', {}),
	get: <K extends ContentKey>(key: K) =>
		call<{ data: ContentMap[K] | null; version: string | null }>('GET', `/api/admin/content/${key}`),
	put: <K extends ContentKey>(key: K, data: ContentMap[K], version: string | null) =>
		call<{ data: ContentMap[K]; version: string }>('PUT', `/api/admin/content/${key}`, {
			data,
			version: version ?? undefined,
		}),
};
