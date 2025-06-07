// telegram-bot/src/server.ts
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { NewsItem } from './types';

const app = express();
app.use(express.json());
app.use(cors());

const DATA_PATH = path.resolve(__dirname, '../data/news.json');

let newsList: NewsItem[] = [];

// Загружаем новости из файла при старте
try {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  newsList = JSON.parse(data);
} catch {
  newsList = [];
}

// Получить список новостей
app.get('/news', (req, res) => {
  res.status(200).json(newsList.slice(0, 10));
});

// Добавить новость
app.post('/news', async (req, res) => {
  const newNews: NewsItem = req.body;
  newsList.unshift(newNews);

  // Сохраняем в файл
  await fs.writeFile(DATA_PATH, JSON.stringify(newsList, null, 2));

  res.status(200).json({ success: true });
});

// Старт сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API слушает на http://localhost:${PORT}/news`);
});