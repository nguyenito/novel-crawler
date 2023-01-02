const NovelCrawlerAsync = require('./novel_crawler_async.js');
const NovelCrawler = require('./novel_crawler.js');
const { MeTruyenCvStrategy } = require('./strategy/metruyencv_strategy.js');
const { compose } = require('underscore');

const crawler = new NovelCrawlerAsync(new MeTruyenCvStrategy());

async function testCrawling() {
  await crawler.startCrawler(
    'Van Co Than De',
    'https://metruyencv.com/truyen/van-co-than-de/',
    'chuong-',
    50,
    ''
  );
}

testCrawling();
