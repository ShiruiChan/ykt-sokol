// telegram-bot/src/index.ts
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const token = process.env.BOT_TOKEN || '8134721380:AAGPqdtdIdh4AlkP28P8LG1CeNmJZua4mJI';
const bot = new TelegramBot(token, { polling: true });

let currentNews: any = {};

// Команда /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет! Напиши заголовок новости.');
});

// Обработка сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!currentNews.title && msg.text) {
    currentNews.title = msg.text;
    return bot.sendMessage(chatId, 'Хорошо! Теперь напиши текст новости.');
  }

  if (!currentNews.content && msg.text) {
    currentNews.content = msg.text;
    return bot.sendMessage(chatId, 'Отправь изображение.');
  }

  if (msg.photo) {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`; 

    currentNews.image = fileUrl;
    currentNews.date = new Date().toLocaleDateString('ru-RU');

    try {
      // Отправляем на наш собственный API
      await axios.post('http://localhost:3000/news', currentNews);

      // Отправляем ответ в Telegram
      bot.sendMessage(chatId, '✅ Новость успешно добавлена!', {
        reply_markup: {
          remove_keyboard: true,
        },
      });

      // Сбрасываем текущую новость
      currentNews = {};
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, '❌ Ошибка при добавлении новости.');
    }
  }
});