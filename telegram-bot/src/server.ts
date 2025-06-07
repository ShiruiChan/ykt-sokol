// telegram-bot/src/server.ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

let newsList: any[] = [];

app.get('/news', (req, res) => {
  res.status(200).json(newsList.slice(0, 10));
});

app.post('/news', (req, res) => {
  const newsItem = req.body;
  newsList.unshift(newsItem);
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API слушает на http://localhost:${PORT}/news`);
});