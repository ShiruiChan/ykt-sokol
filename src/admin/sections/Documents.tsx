/** Документы (PDF) на странице «Документы»: название, пояснение, файл, порядок */
import type { DocumentItem } from '../../types';
import { LoadError, SectionHeader, SnapshotNote, useAdmin, useSection } from '../section';
import { Field, ItemShell, UploadButton, move } from '../ui';

export default function Documents() {
	const section = useSection('documents');
	const { confirm } = useAdmin();
	const items = section.draft ?? [];
	const set = (i: number, patch: Partial<DocumentItem>) =>
		section.setDraft((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
	const err = (i: number, f: string) => section.errors[`documents[${i}].${f}`];

	if (section.loading) return <p className="py-8 text-fog-500">Загрузка…</p>;
	if (section.loadError) return <LoadError message={section.loadError} onRetry={section.reload} />;

	return (
		<>
			<SectionHeader title="Документы" section={section}>
				<button
					type="button"
					className="adm-btn"
					onClick={() => section.setDraft((l) => [...l, { id: `doc-${Date.now().toString(36)}`, url: '', title: '' }])}
				>
					+ Документ
				</button>
			</SectionHeader>
			{section.fromSnapshot && <SnapshotNote />}
			<ol className="space-y-3">
				{items.map((d, i) => (
					<ItemShell
						key={d.id}
						index={i}
						length={items.length}
						title={d.title || 'Новый документ'}
						onMove={(to) => section.setDraft((l) => move(l, i, to))}
						onRemove={() =>
							confirm({
								title: 'Убрать документ со страницы?',
								body: d.title || undefined,
								confirmLabel: 'Убрать',
								danger: true,
								onConfirm: () => section.setDraft((l) => l.filter((_, j) => j !== i)),
							})
						}
					>
						<div className="grid gap-3">
							<Field label="Название" value={d.title} onChange={(v) => set(i, { title: v })} error={err(i, 'title')} />
							<Field
								label="Пояснение: номер, срок действия"
								value={d.description ?? ''}
								onChange={(v) => set(i, { description: v || undefined })}
								multiline
								rows={2}
							/>
							<div>
								<span className="adm-label">Файл PDF</span>
								<div className="flex flex-wrap items-center gap-3">
									{d.url ? (
										<a href={d.url} target="_blank" rel="noopener" className="link-quiet max-w-full truncate text-sm">
											{d.url.split('/').pop()}
										</a>
									) : (
										<span className="text-sm text-fog-500">не загружен</span>
									)}
									<UploadButton kind="pdf" label={d.url ? 'Заменить PDF' : 'Загрузить PDF'} onUploaded={(url) => set(i, { url })} />
								</div>
								{err(i, 'url') && <p className="adm-error-text">{err(i, 'url')}</p>}
								<p className="adm-hint">PDF до 20 МБ.</p>
							</div>
						</div>
					</ItemShell>
				))}
			</ol>
		</>
	);
}
