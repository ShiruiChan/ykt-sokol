/** Новости — снимок content/news.json (правится в админ-панели) */
import type { NewsItem } from '../types';
import newsData from '../../content/news.json';

export const newsList: NewsItem[] = newsData as NewsItem[];
