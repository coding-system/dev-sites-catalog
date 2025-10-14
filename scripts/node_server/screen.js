const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs-extra');
const path = require('path');

puppeteer.use(StealthPlugin()); // Включаем Stealth Mode

const app = express();
const PORT = 3001;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Создаем папку для скриншотов, если её нет
fs.ensureDirSync(SCREENSHOT_DIR);

// Функция для создания скриншота
const captureScreenshot = async (url) => {
  console.log(`Скриншотим: ${url}`);

  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ] 
  });

  const page = await browser.newPage();

  // Подменяем User-Agent на настоящий
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  // Добавляем заголовки, чтобы браузер выглядел как реальный пользователь
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Upgrade-Insecure-Requests': '1'
  });

  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const fileName = `screenshot_${Date.now()}.png`;
    const filePath = path.join(SCREENSHOT_DIR, fileName);

    await page.screenshot({ path: filePath, fullPage: true });

    await browser.close();

    return `/screenshots/${fileName}`;
  } catch (error) {
    console.error('Ошибка при создании скриншота:', error);
    await browser.close();
    return null;
  }
};

// API маршрут для получения скриншота
app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Ошибка: Укажите параметр "url"');
  }

  const screenshotPath = await captureScreenshot(url);
  if (screenshotPath) {
    res.json({ success: true, screenshot: screenshotPath });
  } else {
    res.status(500).send('Ошибка при создании скриншота');
  }
});

// Раздаём скриншоты через Express
app.use('/screenshots', express.static(SCREENSHOT_DIR));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
