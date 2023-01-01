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

let book_title = 'Bảo Hộ Bên Ta Tộc Trưởng';
let book_name = 'bao-ho-phe-ta-toc-truong.epub';
let chapter_number = 10;
let crawlerProgress = 5;
let crawlerStatus = '';
let progressUnit = 100.0 / chapter_number;
let isComplete = false;

let web_url_base =
  'https://metruyencv.com/truyen/bao-ho-phe-ta-toc-truong/chuong-';
let bookChapter = 1;
let book_cover_uri = '';

const epubOptions = {
  tocTitle: book_title,
  title: book_title, // *Required, title of the book.
  author: 'metruyencv.com', // *Required, name of the author.
  publisher: 'Double Nguyen', // optional
  cover: book_cover_uri, // Url or File path, both ok.
  content: [],
};

function updateChappterContent(chapterTitle, chapterContents) {
  if (chapterContents == null || chapterContents.length == 0) return;

  if (chapterTitle == null || chapterTitle.length == 0)
    chapterTitle = 'Chap ' + bookChapter;

  currentContent = { title: chapterTitle[0], data: chapterContents[0] };
  epubOptions.content.push(currentContent);
  bookChapter = bookChapter + 1;
}

async function startCrawler(
  bookName,
  webURLBase,
  chapterPostFix,
  numChapter,
  bookCoverURI
) {
  isComplete = false;
  book_name = bookName;
  web_url_base = webURLBase + chapterPostFix;
  chapter_number = numChapter;
  book_cover_uri = bookCoverURI;
  progressUnit = Math.ceil(100.0 / chapter_number);
  crawlerProgress = 0;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  epubOptions.content = [];
  epubOptions.cover = book_cover_uri;
  for (let i = 1; i <= chapter_number; i++) {
    var web_url = web_url_base + i;
    crawlerStatus = 'Crawling web url: ' + web_url;
    console.log(crawlerStatus);
    await page.goto(web_url);

    crawlerStatus = 'Query chapter title from web url: ' + web_url;
    const chapterTitle = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(`[class*="nh-read__title"]`)
      ).map((x) => x.textContent);
    });

    crawlerStatus = 'Query novel content from web url: ' + web_url;
    const chapterContents = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(`[id*="js-read__content"]`)
      ).map((x) => x.outerHTML);
    });

    updateChappterContent(chapterTitle, chapterContents);
    if (crawlerProgress + progressUnit > 100) crawlerProgress = 100;
    else crawlerProgress += progressUnit;
  }
  bookName = 'epubs/' + bookName + '.epub';
  crawlerStatus = 'Writing Contents to ' + bookName;
  console.log('Writing Contents to ', bookName);
  new Epub(epubOptions, bookName);
  await browser.close();
  isComplete = true;
}

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
      progress: crawlerProgress,
      status: crawlerStatus,
      is_complete: isComplete,
    })
  );
});

app.post('/crawling', (req, res) => {
  try {
    console.log('Book Name: ', req.body.book_name);
    console.log('Book Cover URI: ', req.body.book_cover_uri);
    console.log('Web URL for crawling: ', req.body.web_url);
    console.log('chapter_postfix for crawling: ', req.body.chapter_postfix);
    console.log('chapter_number for crawling: ', req.body.chapter_number);

    res.redirect('/crawling_progress');
    startCrawler(
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
