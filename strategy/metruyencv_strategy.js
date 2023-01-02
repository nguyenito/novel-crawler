const puppeteer = require('puppeteer');
const { CrawlerStrategy } = require('./crawler_strategy.js');

class MeTruyenCvStrategy extends CrawlerStrategy {
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
        document.querySelectorAll(`[class*="nh-read__title"]`)
      ).map((x) => x.textContent);
    });

    const chapterContents = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(`[id*="js-read__content"]`)
      ).map((x) => x.outerHTML);
    });

    return { chapterTitle: chapterTitle, chapterContents: chapterContents };
  }
}

module.exports = { MeTruyenCvStrategy };
