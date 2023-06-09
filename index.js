const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/screenshot', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const screenshotBuffer = await page.screenshot();
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshotBuffer);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});