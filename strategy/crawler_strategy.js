const puppeteer = require('puppeteer');

class CrawlerStrategy {
  constructor() {}
  async init() {
    console.log('CrawlerStrategy INIT');
    this.browser = await puppeteer.launch();
  }

  async close() {
    console.log('CrawlerStrategy CLOSE');
    await this.browser.close();
  }
}

module.exports = { CrawlerStrategy };
