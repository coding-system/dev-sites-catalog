const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

// Прокси-маршрут
app.get('/proxy', async (req, res) => {
  const url = req.query.url; // URL сайта, который нужно загрузить

  if (!url) {
    return res.status(400).send('Параметр "url" обязателен');
  }

  try {
    // Загружаем HTML-код сайта
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
    });

    // Парсим HTML с помощью cheerio
    const $ = cheerio.load(response.data);

    // Изменяем относительные ссылки на абсолютные
    $('a, link, img, script').each((i, element) => {
      const attributes = ['href', 'src']; // Атрибуты, которые нужно изменить
      attributes.forEach((attr) => {
        const value = $(element).attr(attr);
        if (value && !value.startsWith('http') && !value.startsWith('//')) {
          // Преобразуем относительные ссылки в абсолютные
          const absoluteUrl = new URL(value, url).toString();
          $(element).attr(attr, absoluteUrl);
        }
      });
    });

    // Отправляем модифицированный HTML
    res.send($.html());
  } catch (error) {
    console.error('Ошибка при загрузке сайта:', error);
    res.status(500).send('Не удалось загрузить сайт');
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Прокси-сервер запущен на http://localhost:${PORT}`);
});