const express = require('express');
const puppeteer = require('puppeteer-core');
require('dotenv').config();
const { setTimeout } = require('timers/promises');

const app = express();
const port = process.env.PORT || 3000;

let browser;

async function getBrowser() {
  if (browser) return browser;
  browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process',
    ],
  });
  return browser;
}

app.get('/screenshot', async (req, res) => {
  const { url, width, height, delay } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parameter is required' });

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    if (width && height) {
      await page.setViewport({ width: parseInt(width, 10), height: parseInt(height, 10) });
    } else {
      await page.setViewport({ width: 1280, height: 800 });
    }

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

    if (delay) await setTimeout(parseInt(delay, 10));

    const screenshotBuffer = await page.screenshot({ fullPage: !(width && height), type: 'png' });

    res.set('Content-Type', 'image/png');
    res.send(screenshotBuffer);

    await page.close();
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
