const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/screenshot', async (req, res) => {
  const { url, width, height, delay } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  let browser;

  try {

    browser = await puppeteer.launch({
      headless: 'true',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
      ],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();


    if (width && height) {
      await page.setViewport({
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      });
    } else {
      await page.setViewport({ width: 1280, height: 800 });
    }


    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });


    if (delay) {
      await page.waitForTimeout(parseInt(delay, 10));
    }

   
    const screenshotOptions = {
      fullPage: !(width && height),
      type: 'png',
    };

    const screenshotBuffer = await page.screenshot(screenshotOptions);

    res.set('Content-Type', 'image/png');
    res.send(screenshotBuffer);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
