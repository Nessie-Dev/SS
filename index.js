const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const port = 3000;

let browser;

(async () => {
  try {
    browser = await puppeteer.launch({
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote',
        '--disable-dev-shm-usage',
      ],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    app.get('/screenshot', async (req, res) => {
      const { url, width, height } = req.query;

      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      try {
        const page = await browser.newPage();
        const viewportWidth = !isNaN(width) ? parseInt(width) : undefined;
        const viewportHeight = !isNaN(height) ? parseInt(height) : undefined;

        if (viewportWidth && viewportHeight) {
          await page.setViewport({ width: viewportWidth, height: viewportHeight });
        }

        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 5000,
        });

        const screenshotOptions = {
          fullPage: !(viewportWidth && viewportHeight),
        };

        const screenshotBuffer = await page.screenshot(screenshotOptions);
        await page.close();

        res.set('Content-Type', 'image/png');
        res.send(screenshotBuffer);
      } catch (error) {
        console.error('Error capturing screenshot:', error);
        return res.status(500).json({ error: 'Failed to capture screenshot' });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error launching browser:', error);
  }
})();

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
