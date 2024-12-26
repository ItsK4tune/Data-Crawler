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

        let count = { index: 0 }
        for (const url of TextCrawlerService.urls){
            this.logger.log(`Crawling data from url: ${url}`);
            await this.dataCrawl(url, count);
        }

        this.logger.log(`Crawled data successfully data from ${count.index}/${TextCrawlerService.urls.length} source(s)`);
    }

    async dataCrawl(input: string, object: { index: number }) {
        this.page.setDefaultTimeout(5000);

        try {
            object.index++;

            await this.page.goto(input, {waitUntil: 'domcontentloaded'});

            // await this.scrollDown();

            const text = await this.page.evaluate(() => {
                const bodyText = document.body.innerText;
                return bodyText;
            });

            if (text.trim() != '')
                this.writeFileService.writeFile(text, input);
        }
        catch (err) {
            object.index--;
            this.logger.warn(`Error crawling data from ${input}: ${err}`, );
        }
    }

    async scrollDown(page: Page, time: number){
        const startTime = Date.now();
        let timeSinceLastScroll = Date.now();

        try {
            while (true) {        
                const previousHeight = await page.evaluate('document.body.scrollHeight');
                
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                const newHeight = await page.evaluate('document.body.scrollHeight');

                if (newHeight != previousHeight) {
                    timeSinceLastScroll = Date.now();
                }

                if (Date.now() - timeSinceLastScroll >= env.timeWindow){
                    break;
                }

                if (Date.now() - startTime >= time){
                    break;
                }

                await this.delay(env.timeDelay);
            }
        }
        catch (err){
            this.logger.warn(`Error during scrolling: ${err}`);
        }
    }

    delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
