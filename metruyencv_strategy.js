const puppeteer = require('puppeteer');
const { CrawlerStrategy } = require('./crawler_strategy.js');

class MeTruyenCvStrategy extends CrawlerStrategy {
  constructor() {
    super();
  }

  async retrieveNovelContent(webURL) {
    await this.page.goto(webURL);

    const chapterTitle = await this.page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(`[class*="nh-read__title"]`)
      ).map((x) => x.textContent);
    });

    const chapterContents = await this.page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(`[id*="js-read__content"]`)
      ).map((x) => x.outerHTML);
    });

    return { chapterTitle: chapterTitle, chapterContents: chapterContents };
  }
}

module.exports = { MeTruyenCvStrategy };
