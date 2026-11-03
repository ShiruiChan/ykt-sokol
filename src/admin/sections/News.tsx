/** Новости: заголовок, дата, текст, превью, источник, метки, закрепление */
import { useState } from 'react';
import type { NewsItem } from '../../types';
import { LoadError, SectionHeader, SnapshotNote, useAdmin, useSection } from '../section';
import { Checkbox, Field, ItemShell, UploadButton, move } from '../ui';

const today = () => new Date().toISOString().slice(0, 10);

export default function News() {
	const section = useSection('news');
	const { confirm } = useAdmin();
	const [open, setOpen] = useState<number | null>(null);
	const items = section.draft ?? [];
	const set = (i: number, patch: Partial<NewsItem>) =>
		section.setDraft((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
	const err = (i: number, f: string) => section.errors[`news[${i}].${f}`];

	function add() {
		const id = Math.max(0, ...items.map((n) => n.id)) + 1;
		section.setDraft((l) => [{ id, title: '', content: '', date: today(), isPinned: false }, ...l]);
		setOpen(0);
	}

	if (section.loading) return <p className="py-8 text-fog-500">Загрузка…</p>;
	if (section.loadError) return <LoadError message={section.loadError} onRetry={section.reload} />;

	return (
		<>
			<SectionHeader title="Новости" section={section}>
				<button type="button" className="adm-btn" onClick={add}>
					+ Новость
				</button>
			</SectionHeader>
			{section.fromSnapshot && <SnapshotNote />}
			<p className="adm-hint mb-4">На сайте новости идут по дате, закреплённые — первыми.</p>
			<ol className="space-y-3">
				{items.map((n, i) => {
					const hasError = Object.keys(section.errors).some((k) => k.startsWith(`news[${i}].`));
					const expanded = open === i || hasError;
					return (
						<ItemShell
							key={n.id}
							index={i}
							length={items.length}
							title={n.title || 'Новая новость'}
							meta={`${n.date}${n.isPinned ? ' · закреплена' : ''}`}
							expanded={expanded}
							onToggle={() => setOpen(expanded ? null : i)}
							onMove={(to) => section.setDraft((l) => move(l, i, to))}
							onRemove={() =>
								confirm({
									title: 'Удалить новость?',
									body: n.title || undefined,
									confirmLabel: 'Удалить',
									danger: true,
									onConfirm: () => section.setDraft((l) => l.filter((_, j) => j !== i)),
								})
							}
						>
							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
								<Field label="Заголовок" value={n.title} onChange={(v) => set(i, { title: v })} error={err(i, 'title')} />
								<Field label="Дата" type="date" value={n.date} onChange={(v) => set(i, { date: v })} error={err(i, 'date')} />
								<Field
									label="Коротко (для карточки)"
									value={n.summary ?? ''}
									onChange={(v) => set(i, { summary: v || undefined })}
									className="sm:col-span-2"
								/>
								<Field
									label="Текст"
									value={n.content}
									onChange={(v) => set(i, { content: v })}
									error={err(i, 'content')}
									multiline
									rows={5}
									className="sm:col-span-2"
								/>
								<Field
									label="Ссылка на источник"
									value={n.sourceUrl ?? ''}
									onChange={(v) => set(i, { sourceUrl: v || undefined })}
									error={err(i, 'sourceUrl')}
									placeholder="https://…"
								/>
								<Field
									label="Издание или канал"
									value={n.sourceName ?? ''}
									onChange={(v) => set(i, { sourceName: v || undefined })}
								/>
								<Field
									label="Метки через запятую"
									value={(n.tags ?? []).join(', ')}
									onChange={(v) => set(i, { tags: v.split(',').map((t) => t.trimStart()).filter((t, k, a) => t || k === a.length - 1) })}
									className="sm:col-span-2"
								/>
								<div className="sm:col-span-2">
									<span className="adm-label">Превью</span>
									<div className="flex flex-wrap items-start gap-3">
										{n.image && (
											<div className="adm-thumb w-40">
												<img src={n.image} alt="" />
											</div>
										)}
										<div className="flex flex-col gap-2">
											<UploadButton kind="image" label={n.image ? 'Заменить фото' : 'Загрузить фото'} onUploaded={(url) => set(i, { image: url })} />
											{n.image && (
												<button type="button" className="adm-btn adm-btn-quiet" onClick={() => set(i, { image: undefined })}>
													Убрать превью
												</button>
											)}
										</div>
									</div>
									{err(i, 'image') && <p className="adm-error-text">{err(i, 'image')}</p>}
									<p className="adm-hint">Без превью карточка рисуется шрифтом, без заглушки.</p>
								</div>
								<Checkbox label="Закрепить вверху" checked={Boolean(n.isPinned)} onChange={(v) => set(i, { isPinned: v })} />
							</div>
						</ItemShell>
					);
				})}
			</ol>
		</>
	);
}
