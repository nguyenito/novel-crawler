const puppeteer = require('puppeteer');
const { CrawlerStrategy } = require('./crawler_strategy.js');

class TruyenDichZStrategy extends CrawlerStrategy {
  constructor() {
    super();
  }

  async retrieveNovelContent(webURL) {
    await this.page.goto(webURL);

    const chapterTitle = await this.page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(`[class*="lh-name-chapter"]`)
      ).map((x) => x.textContent);
    });

    const chapterContents = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll(`[id*="read-content"]`)).map(
        (x) => x.outerHTML
      );
    });

    return { chapterTitle: chapterTitle, chapterContents: chapterContents };
  }
}

module.exports = { TruyenDichZStrategy };
