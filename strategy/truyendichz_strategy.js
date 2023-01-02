const puppeteer = require('puppeteer');
const { CrawlerStrategy } = require('./crawler_strategy.js');

class TruyenDichZStrategy extends CrawlerStrategy {
  constructor() {
    super();
  }

  async retrieveNovelContent(webURL) {
    console.log('Go to link: ', webURL);
    const page = await this.browser.newPage();
    await page.goto(webURL);

    console.log('Query Chapter Contetn From: ', webURL);
    const chapterTitle = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(`[class*="lh-name-chapter"]`)
      ).map((x) => x.textContent);
    });

    const chapterContents = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(`[id*="read-content"]`)).map(
        (x) => x.outerHTML
      );
    });

    return { chapterTitle: chapterTitle, chapterContents: chapterContents };
  }
}

module.exports = { TruyenDichZStrategy };
