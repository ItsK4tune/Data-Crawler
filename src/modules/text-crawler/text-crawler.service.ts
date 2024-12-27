import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import puppeteer, { Browser, Page, Puppeteer } from 'puppeteer';
import { env } from 'src/config';
import { WriteFileService } from '../write-file/write-file.service';
import { LinkCrawlerService } from '../link-crawler/link-crawler.service';

@Injectable()
export class TextCrawlerService {
    private readonly logger = new Logger(TextCrawlerService.name);
    private browser: Browser;
    private page: Page;

    private static urls: string[] = [];

    constructor(
        private readonly writeFileService: WriteFileService,
        private readonly linkCrawlerService: LinkCrawlerService,
    ){}

    async initialize() {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
    }

    async close() {
        await this.page.close(); 
        await this.browser.close();
    }

    async do(input: string[]) {
        this.logger.log(`Finding more links related to given links`);
        for (const link of input)
            await this.linkCrawlerService.crawlLink(link, TextCrawlerService.urls, this.page);

        if (TextCrawlerService.urls.length)
            this.writeFileService.writeLinkFile(TextCrawlerService.urls);

        let count = { index: 0 }
        for (const url of TextCrawlerService.urls){
            this.logger.log(`Crawling data from url: ${url}`);
            await this.dataCrawl(url, count);
        }

        this.logger.log(`Crawled data successfully data from ${count.index}/${TextCrawlerService.urls.length} source(s)`);
    }

    async dataCrawl(input: string, object: { index: number }) {
        this.page.setDefaultTimeout(4000);

        try {
            object.index++;

            await this.page.goto(input, {waitUntil: 'domcontentloaded'});

            const text = await this.page.evaluate(() => {
                const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'];
                const elements = document.querySelectorAll(
                    allowedTags.map(tag => `${tag}:not(button ${tag}):not(nav ${tag}):not(a ${tag}):not(header ${tag}):not(footer ${tag})`).join(',')
                );
            
                return Array.from(elements)
                    .filter(element => !element.closest('button'))
                    .map(element => (element as HTMLElement).textContent?.trim())
                    .filter(text => text.length > 0)
                    .join('\n');
            });

            if (text.trim() != '')
                this.writeFileService.writeDataFile(text, input);
        }
        catch (err) {
            object.index--;
            this.logger.warn(`Error crawling data from ${input}: ${err}`, );
        }
    }

    delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
