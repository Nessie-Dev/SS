## Screenshot API

The Screenshot API allows you to capture screenshots of web pages. It uses Puppeteer, a Node library for controlling headless Chrome or Chromium, to navigate to a URL and capture the screenshot.

### Endpoint

```
GET /screenshot
```

### Parameters

- `url` (required): The URL of the web page to capture the screenshot.
- `width` (optional): The width of the viewport for the screenshot. If not provided, a full-page screenshot will be taken.
- `height` (optional): The height of the viewport for the screenshot. If not provided, a full-page screenshot will be taken.

### Example Usage

To capture a screenshot of a web page, make a GET request to the `/screenshot` endpoint with the required `url` parameter. Optionally, you can provide `width` and `height` parameters to specify a custom viewport size for the screenshot.

#### Request

```
GET /screenshot?url=http://example.com&width=800&height=600
```

#### Response

The API will return a response with the screenshot image.

```
Status: 200 OK
Content-Type: image/png
```

The response body will contain the binary data of the screenshot image in PNG format.

### Error Handling

If an error occurs during the screenshot capturing process, the API will return an error response.

- If the `url` parameter is missing:

  ```
  Status: 400 Bad Request
  Content-Type: application/json

  {
    "error": "URL parameter is required"
  }
  ```

- If there is an error capturing the screenshot:

  ```
  Status: 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Failed to capture screenshot"
  }
  ```

### Example Code

Here's an example code using Express.js and Puppeteer to implement the Screenshot API:

```javascript
const express = require('express');
const puppeteer = require('puppeteer');
require("dotenv").config();

const app = express();
const port = 3000;

app.get('/screenshot', async (req, res) => {
  const { url, width, height } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    await page.goto(url);

    if (width && height) {
      await page.setViewport({ width: parseInt(width), height: parseInt(height) });
    }

    const screenshotOptions = {
      fullPage: !(width && height), // Take full-page screenshot if width and height are not provided
    };

    const screenshotBuffer = await page.screenshot(screenshotOptions);
    await browser.close();

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
```

Please note that you need to have Puppeteer and the required dependencies installed to run the code successfully. You can install Puppeteer using npm or yarn

:

```
npm install puppeteer
```

or

```
yarn add puppeteer
```

Feel free to customize and enhance the code according to your requirements.
