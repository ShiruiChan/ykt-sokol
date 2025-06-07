import type { NextApiRequest, NextApiResponse } from 'next';

let newsList: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const newPost = req.body;
    newsList.unshift(newPost);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    return res.status(200).json(newsList.slice(0, 10));
  }

  return res.status(405).end();
}