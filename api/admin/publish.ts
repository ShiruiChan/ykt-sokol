/**
 * POST /api/admin/publish — запускает пересборку сайта на сервере:
 * команду из PUBLISH_COMMAND (на проде — deploy/rebuild.sh). Сборка сама
 * подтянет свежие данные из БД (scripts/pull-content.mjs), разложит новую
 * версию рядом и атомарно переключит на неё — через 1–2 минуты сайт обновится.
 * Команда задаётся только в окружении сервера, из запроса ничего не берётся.
 */
import { spawn } from 'node:child_process';
import { requireAdmin } from '../_lib/auth.js';
import { fail, json, sameOrigin } from '../_lib/http.js';
import { getStore } from '../_lib/store.js';

export async function POST(request: Request): Promise<Response> {
	if (!sameOrigin(request)) return fail(403, 'Запрос с чужого сайта');
	const denied = requireAdmin(request);
	if (denied) return denied;

	const command = process.env.PUBLISH_COMMAND;
	if (!command) {
		return fail(503, 'Публикация не настроена: задайте PUBLISH_COMMAND на сервере (см. deploy/README.md).', {
			code: 'publish_not_configured',
		});
	}

	try {
		await new Promise<void>((resolve, reject) => {
			// Сборка живёт дольше запроса: отцепляем процесс, вывод пишет сам скрипт
			const child = spawn('/bin/sh', ['-c', command], { detached: true, stdio: 'ignore' });
			child.once('error', reject);
			child.once('spawn', () => {
				child.unref();
				resolve();
			});
		});
	} catch {
		return fail(502, 'Не удалось запустить публикацию. Попробуйте ещё раз через минуту.');
	}

	try {
		await getStore()?.audit('publish', null);
	} catch {
		/* сборка уже запущена — журнал не критичен */
	}
	return json(200, { ok: true, publishedAt: new Date().toISOString() });
}
