import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const method = req.method;

  if (!method || method !== 'POST') {
    return res.status(405).end();
  }

  try {
    // Получаем текущие новости из тела запроса
    const newsItem = req.body;

    // Здесь можно сохранить новость в JSON или отправить в базу данных
    console.log('Получена новость:', newsItem);

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Не удалось добавить новость' });
  }
}