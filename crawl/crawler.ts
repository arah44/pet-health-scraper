import cheerio from 'cheerio';
import { NodeHtmlMarkdown } from 'node-html-markdown';

interface Page {
  url: string;
  content: string;
}

class Crawler {
  private seen = new Set<string>();
  private pages: Page[] = [];
  private queue: { url: string; depth: number }[] = [];

  constructor(private maxDepth = 2, private maxPages = 300) { }

  async crawl(startUrls: string[]): Promise<Page[]> {
    // Add the start URL to the queue
    this.addToQueue(startUrls);

    // While there are URLs in the queue and we haven't reached the maximum number of pages...
    while (this.shouldContinueCrawling()) {
      // Dequeue the next URL and depth
      const { url, depth } = this.queue.shift()!;

      // If the depth is too great or we've already seen this URL, skip it
      if (this.isTooDeep(depth) || this.isAlreadySeen(url)) continue;

      // Add the URL to the set of seen URLs
      this.seen.add(url);

      // Fetch the page HTML
      const html = await this.fetchPage(url);

      const parsedHtml = this.parseHtml(html)
      // Parse the HTML and add the page to the list of crawled pages
      this.pages.push({ url, content: parsedHtml  });

      console.log(`Queue length ${this.queue.length}`);


      // Extract new URLs from the page HTML and add them to the queue
      console.log(`Crawled ${url} (${this.pages.length} pages, ${this.queue.length} queue)`);
    }

    // Return the list of crawled pages
    return this.pages;
  }

  private isTooDeep(depth: number) {
    return depth > this.maxDepth;
  }

  private isAlreadySeen(url: string) {
    return this.seen.has(url);
  }

  private shouldContinueCrawling() {
    return this.queue.length > 0 && this.pages.length < this.maxPages;
  }

private addToQueue(urls: string[], depth = 0) {
    this.queue.push(...urls.map(url => ({ url, depth })));
  }

  private addNewUrlsToQueue(urls: string[], depth: number) {
    const matchedUrls = urls.filter(url => url.match("https://www.joiipetcare.com/health-conditions/.*/$"))
    this.queue.push(...matchedUrls.map(url => ({ url, depth: depth + 1 })));
  }

  private async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch ${url}: ${error}`);
      return '';
    }
  }

  private parseHtml(html: string): string {
    const $ = cheerio.load(html);
    $('a').removeAttr('href');
    $('img').removeAttr('src');
    const bodyElement = $('.elementor-location-single');

    // Check if the bodyElement exists before attempting to access its HTML
    if (bodyElement.length > 0) {
      const body = bodyElement.html();
  
      // Check if body is a non-null string before translating it
      if (typeof body === 'string') {
        return NodeHtmlMarkdown.translate(body);
      }
    }

    return '';
  }

  private extractUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const relativeUrls = $('a').map((_, link) => $(link).attr('href')).get() as string[];
    return relativeUrls.map(relativeUrl => new URL(relativeUrl, baseUrl).href);
  }
}

export { Crawler };
export type { Page };
