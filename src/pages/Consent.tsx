import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { ContactWays, LegalSection as Section } from '../components/LegalSection';
import { BRAND, SITE_URL } from '../config/site';
import { LEGAL } from '../config/legal';

/**
 * Согласие на обработку персональных данных — отдельный документ, а не
 * пункт политики (ч. 1 ст. 9 152-ФЗ в редакции с 01.09.2025). Посетитель
 * даёт его галочкой в форме заявки. Меняя текст, обновите CONSENT_VERSION
 * в api/request.ts — версия попадает в письмо с заявкой.
 */

const operator = LEGAL.operatorName || `производитель техники «${BRAND}»`;
const requisites = [
	LEGAL.inn && `ИНН ${LEGAL.inn}`,
	LEGAL.ogrn && `ОГРН ${LEGAL.ogrn}`,
	LEGAL.legalAddress && `адрес: ${LEGAL.legalAddress}`,
]
	.filter(Boolean)
	.join(', ');

export default function Consent() {
	return (
		<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
			<div className="shell">
				<Reveal className="max-w-[68ch]">
					<p className="eyebrow">
						<span className="h-px w-8 bg-accent-400/70" />
						документы
					</p>
					<h1 className="mt-5 text-title text-fog-50">Согласие на обработку персональных данных</h1>
					<p className="mt-5 text-lede text-fog-400">
						Этот текст вы принимаете, когда отмечаете галочку в форме заявки на сайте{' '}
						<span className="break-all">{SITE_URL.replace(/^https?:\/\//, '')}</span>.
					</p>
				</Reveal>

				<div className="mt-12 max-w-[68ch] space-y-10 md:mt-16 md:space-y-12">
					<Section n={1} title="Кому я даю согласие">
						<p>
							Отмечая галочку в форме, я свободно, своей волей и в своём интересе даю согласие
							оператору — {operator}
							{requisites && <> ({requisites})</>} — на обработку моих персональных данных на
							условиях ниже.
						</p>
					</Section>

					<Section n={2} title="Какие данные">
						<ul>
							<li>фамилия, имя, отчество или то, как ко мне обращаться;</li>
							<li>номер телефона и (или) адрес электронной почты;</li>
							<li>ИНН — если я запрашиваю коммерческое предложение на организацию или ИП;</li>
							<li>сведения, которые я указываю в комментарии к заявке.</li>
						</ul>
					</Section>

					<Section n={3} title="Зачем">
						<p>
							Чтобы ответить на мою заявку, проконсультировать, подготовить коммерческое
							предложение и договор, если я решу купить технику.
						</p>
					</Section>

					<Section n={4} title="Что оператор может делать с данными">
						<p>
							Сбор, запись, систематизация, накопление, хранение, уточнение, извлечение,
							использование, блокирование, удаление и уничтожение — с использованием средств
							автоматизации и без них. Данные хранятся и обрабатываются на серверах в России,
							за рубеж не передаются, третьим лицам для их собственных целей не предоставляются.
						</p>
					</Section>

					<Section n={5} title="Срок и отзыв">
						<p>
							Согласие действует до достижения цели обработки или до его отзыва. Отозвать
							согласие можно в любой момент, сообщив оператору:
						</p>
						<ContactWays />
						<p>
							После отзыва данные удаляются в течение 30 дней, если хранить их дольше не
							требует закон.
						</p>
					</Section>

					<Section n={6} title="Подробнее">
						<p>
							Как оператор защищает данные и какие у меня права, описано в{' '}
							<Link to="/privacy" className="link-quiet">
								политике конфиденциальности
							</Link>
							.
						</p>
					</Section>
				</div>
			</div>

			<div className="h-20 md:h-28" />
		</main>
	);
}
