const Epub = require('epub-gen');

const REQUEST_INTERVAL = 10;

class NovelCrawlerAsync {
  constructor(crawlerStrategy) {
    this.is_complete = false;
    this.progress = 0;
    this.status = '';
    this.strategy = crawlerStrategy;
    this.book_chapter = 1;
    this.novels = [];
  }

  creatEpubOption() {
    const epuboOptions = {
      tocTitle: 'NovelCrawler',
      title: 'NovelCrawler', // *Required, title of the book.
      author: 'noverlcrawler', // *Required, name of the author.
      publisher: 'DoubleNguyen', // optional
      cover: '', // Url or File path, both ok.
      content: [],
    };
    return epuboOptions;
  }

  updateChappterContent(epubOptions, chapterTitle, chapterContents) {
    if (chapterContents == null || chapterContents.length == 0) return;

    if (chapterTitle == null || chapterTitle.length == 0)
      chapterTitle = 'Chap ' + bookChapter;

    const currentContent = { title: chapterTitle[0], data: chapterContents[0] };
    epubOptions.content.push(currentContent);
    this.book_chapter = this.book_chapter + 1;
  }

  async getNovelContentFromAsync(novelsPromises) {
    if (novelsPromises.length == 0) return;

    const novelsContent = await Promise.all(novelsPromises);
    this.novels.push(...novelsContent);
  }

  updateProgress(progressUnitPlus) {
    if (this.progress + progressUnitPlus > 100) this.progress = 100;
    else this.progress += progressUnitPlus;
  }

  async startCrawler(
    bookName,
    webURLBase,
    chapterPostFix,
    numChapter,
    bookCoverURI
  ) {
    this.is_complete = false;
    this.progress = 0;
    var webURLChapterBase = webURLBase + chapterPostFix;
    var progressUnit = 100.0 / numChapter;
    console.log('Total Chap: ', numChapter);
    console.log('Progress Unit per Chap: ', progressUnit);
    await this.strategy.init();

    const epubOptions = this.creatEpubOption();
    epubOptions.cover = bookCoverURI;
    epubOptions.title = bookName;
    epubOptions.tocTitle = 'Chapter List: ' + bookName;
    let novelsPromises = [];
    var requestIteration = 1;
    this.novels = [];

    var startTime = performance.now();
    for (let i = 1; i <= numChapter; i++) {
      var webChapterURL = webURLChapterBase + i;
      this.status = 'Request crawling for web url: ' + webChapterURL;
      console.log(this.status);

      try {
        novelsPromises.push(this.strategy.retrieveNovelContent(webChapterURL));
      } catch {
        console.log('Exception when retrive novel content');
        break;
      }
      if (i % REQUEST_INTERVAL == 0) {
        this.status = 'Wait for novel content at iteration ' + requestIteration;
        await this.getNovelContentFromAsync(novelsPromises);
        novelsPromises = [];
        this.updateProgress(REQUEST_INTERVAL * progressUnit);
        ++requestIteration;
      }
    }
    if (novelsPromises.length > 0) {
      this.status = 'Wait for novel content at iteration ' + requestIteration;
      await this.getNovelContentFromAsync(novelsPromises);
      this.updateProgress(REQUEST_INTERVAL * progressUnit);
    }

    var endTime = performance.now();
    console.log(
      `Novel Crawling took ${(endTime - startTime) / 1000.0} seconds`
    );

    for (const novel of this.novels) {
      console.log('Update novel content to epub: ', novel.chapterTitle);
      this.updateChappterContent(
        epubOptions,
        novel.chapterTitle,
        novel.chapterContents
      );
    }

    await this.strategy.close();

    bookName = 'epubs/' + bookName + '.epub';
    this.status = 'Writing Contents to ' + bookName;
    console.log('Writing Contents to ', bookName);
    new Epub(epubOptions, bookName);

    this.is_complete = true;
  }
}

module.exports = NovelCrawlerAsync;
