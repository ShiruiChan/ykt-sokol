/** Документы (PDF) — снимок content/documents.json (правится в админ-панели) */
import type { DocumentItem } from '../types';
import documentsData from '../../content/documents.json';

export const DOCUMENTS: DocumentItem[] = documentsData as DocumentItem[];
