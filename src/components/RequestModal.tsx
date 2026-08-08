/**
 * Глобальная модалка «Оставить заявку».
 * Состояние держим в zustand (уже в зависимостях), чтобы кнопку можно было
 * повесить в шапке, на первом экране, в подвале и на карточке товара —
 * без проброса пропсов через всё дерево.
 */
import { create } from 'zustand';
import Modal from './Modal';
import ContactForm from './ContactForm';
import { Phone } from './Icons';

interface RequestState {
	isOpen: boolean;
	subject: string;
	open: (subject?: string) => void;
	close: () => void;
}

export const useRequestModal = create<RequestState>((set) => ({
	isOpen: false,
	subject: 'Заявка с сайта',
	open: (subject = 'Заявка с сайта') => set({ isOpen: true, subject }),
	close: () => set({ isOpen: false }),
}));

export default function RequestModal() {
	const { isOpen, subject, close } = useRequestModal();

	return (
		<Modal isOpen={isOpen} onClose={close} title="Оставить заявку">
			<div className="px-6 py-7 sm:px-8">
				<p className="mb-6 text-sm leading-relaxed text-fog-400">
					{subject !== 'Заявка с сайта' ? (
						<>
							Интересует <span className="text-fog-50">{subject}</span>. Оставьте контакт —
							инженер перезвонит, рассчитает комплектацию и сроки.
						</>
					) : (
						<>
							Оставьте контакт — инженер перезвонит, подберёт модель под ваши задачи и
							рассчитает комплектацию.
						</>
					)}
				</p>

				<ContactForm subject={subject} compact />

				<div className="mt-6 flex items-center justify-center gap-2 border-t border-white/8 pt-6 text-sm text-fog-400">
					<Phone className="h-4 w-4 text-accent-400" />
					<span>Или сразу позвоните:</span>
					<a href="tel:+79969141414" className="tnum font-semibold text-fog-50 hover:text-accent-200">
						+7 (996) 914-14-14
					</a>
				</div>
			</div>
		</Modal>
	);
}
