const Epub = require('epub-gen');

class NovelCrawler {
  constructor(crawlerStrategy) {
    this.is_complete = false;
    this.progress = 0;
    this.status = '';
    this.strategy = crawlerStrategy;
    this.book_chapter = 1;
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
    var progressUnit = Math.ceil(100.0 / numChapter);
    await this.strategy.init();

    const epubOptions = this.creatEpubOption();
    epubOptions.cover = bookCoverURI;
    epubOptions.title = bookName;
    epubOptions.tocTitle = 'Chapter List: ' + bookName;
    for (let i = 1; i <= numChapter; i++) {
      var webChapterURL = webURLChapterBase + i;
      this.status = 'Crawling web url: ' + webChapterURL;
      console.log(this.status);

      const novel = await this.strategy.retrieveNovelContent(webChapterURL);

      this.updateChappterContent(
        epubOptions,
        novel.chapterTitle,
        novel.chapterContents
      );
      if (this.progress + this.progress > 100) this.progress = 100;
      else this.progress += progressUnit;
    }
    await this.strategy.close();

    bookName = 'epubs/' + bookName + '.epub';
    this.status = 'Writing Contents to ' + bookName;
    console.log('Writing Contents to ', bookName);
    new Epub(epubOptions, bookName);

    this.is_complete = true;
  }
}

module.exports = NovelCrawler;
