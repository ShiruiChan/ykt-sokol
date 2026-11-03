/** Частые вопросы: текст, порядок, показ на главной */
import type { FaqItem } from '../../types';
import { LoadError, SectionHeader, SnapshotNote, useAdmin, useSection } from '../section';
import { Checkbox, Field, ItemShell, move } from '../ui';

export default function Faq() {
	const section = useSection('faq');
	const { confirm } = useAdmin();
	const items = section.draft ?? [];
	const set = (i: number, patch: Partial<FaqItem>) =>
		section.setDraft((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));

	if (section.loading) return <p className="py-8 text-fog-500">Загрузка…</p>;
	if (section.loadError) return <LoadError message={section.loadError} onRetry={section.reload} />;

	return (
		<>
			<SectionHeader title="Частые вопросы" section={section}>
				<button type="button" className="adm-btn" onClick={() => section.setDraft((l) => [...l, { q: '', a: '' }])}>
					+ Вопрос
				</button>
			</SectionHeader>
			{section.fromSnapshot && <SnapshotNote />}
			<p className="adm-hint mb-4">Все вопросы — на странице «Покупка», отмеченные — ещё и на главной.</p>
			<ol className="space-y-3">
				{items.map((f, i) => (
					<ItemShell
						key={i}
						index={i}
						length={items.length}
						title={f.q || 'Новый вопрос'}
						onMove={(to) => section.setDraft((l) => move(l, i, to))}
						onRemove={() =>
							confirm({
								title: 'Удалить вопрос?',
								body: f.q || undefined,
								confirmLabel: 'Удалить',
								danger: true,
								onConfirm: () => section.setDraft((l) => l.filter((_, j) => j !== i)),
							})
						}
					>
						<div className="grid gap-3">
							<Field label="Вопрос" value={f.q} onChange={(v) => set(i, { q: v })} error={section.errors[`faq[${i}].q`]} />
							<Field label="Ответ" value={f.a} onChange={(v) => set(i, { a: v })} error={section.errors[`faq[${i}].a`]} multiline rows={3} />
							<Checkbox label="Показывать на главной" checked={Boolean(f.home)} onChange={(v) => set(i, { home: v || undefined })} />
						</div>
					</ItemShell>
				))}
			</ol>
		</>
	);
}
