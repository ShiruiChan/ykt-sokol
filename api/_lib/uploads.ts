/**
 * Где лежат фото и PDF, загруженные через админку.
 *
 * Прод: каталог UPLOADS_DIR на сервере (вне папки сборки, чтобы пересборка
 * его не стирала), отдаётся по адресу /uploads/… Резервная копия — снимки
 * диска у хостера.
 * Локально: .admin-dev/uploads рабочей копии (в git не попадает).
 */
import path from 'node:path';

export const UPLOADS_URL_PREFIX = '/uploads/';

/** null — на проде каталог не задан, загрузка выключена */
export function uploadsDir(): string | null {
	if (process.env.UPLOADS_DIR) return path.resolve(process.env.UPLOADS_DIR);
	if (process.env.NODE_ENV === 'production') return null;
	return path.join(process.env.ADMIN_CONTENT_ROOT || process.cwd(), '.admin-dev', 'uploads');
}
