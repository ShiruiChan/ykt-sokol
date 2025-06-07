import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cors());

const DATA_PATH = path.resolve(__dirname, '../data/news.json');

let newsList: any[] = [];

// Загрузка новостей из файла (или пустой массив)
try {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  newsList = JSON.parse(data);
} catch {
  newsList = [];
}

app.get('/news', (req, res) => {
  res.status(200).json(newsList.slice(0, 10));
});

app.post('/news', async (req, res) => {
  const newsItem = req.body;
  newsList.unshift(newsItem);

  // Сохраняем в файл
  await fs.writeFile(DATA_PATH, JSON.stringify(newsList, null, 2));

  res.status(200).json({ success: true });
});

app.listen(3000, () => {
  console.log('Сервер слушает http://localhost:3000');
});