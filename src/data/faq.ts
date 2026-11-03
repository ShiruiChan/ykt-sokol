/**
 * Частые вопросы — снимок content/faq.json (правится в админ-панели).
 * Текст ответа — простая строка: из неё же собирается разметка FAQPage.
 */
import type { FaqItem } from '../types';
import faqData from '../../content/faq.json';

export type { FaqItem };

export const FAQ: FaqItem[] = faqData as FaqItem[];
