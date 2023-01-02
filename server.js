const Epub = require('epub-gen');
const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();
app.set('view-engine', 'ejs');
app.use(express.json());

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const bodyParser = require('body-parser');
const { async } = require('q');
app.use(bodyParser.urlencoded({ extended: true }));

const NovelCrawler = require('./novel_crawler');
const NovelCrawlerAsync = require('./novel_crawler_async');
const { MeTruyenCvStrategy } = require('./strategy/metruyencv_strategy.js');
const { TruyenDichZStrategy } = require('./strategy/truyendichz_strategy.js');

const crawler = new NovelCrawlerAsync(new MeTruyenCvStrategy());
// const crawler = new NovelCrawler(new TruyenDichZStrategy());

app.get('/', (req, res) => {
  res.render('crawling.ejs');
});

app.get('/crawling', (req, res) => {
  res.render('crawling.ejs');
});
app.get('/crawling_progress', (req, res) => {
  res.render('crawling_progress.ejs');
});

app.get('/progress', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      progress: parseFloat(crawler.progress).toPrecision(3),
      status: crawler.status,
      is_complete: crawler.is_complete,
    })
  );
});

app.post('/crawling', (req, res) => {
  try {
    res.redirect('/crawling_progress');
    crawler.startCrawler(
      req.body.book_name,
      req.body.web_url,
      req.body.chapter_postfix,
      req.body.chapter_number,
      req.body.book_cover_uri
    );
  } catch {
    res.redirect('/crawling');
  }
});

server.listen(3000, () => {
  console.log('Server listening on 3000');
});
