import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import puppeteer, { Browser, Page, Puppeteer } from 'puppeteer';

@Injectable()
export class TextCrawlerService {
    private readonly logger = new Logger(TextCrawlerService.name);
    private browser: Browser;
    private page: Page;
    private time: number = 10000;

    constructor(){}

    async initialize() {
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
    }

    async close() {
        await this.page.close(); 
        await this.browser.close();
    }

    async notification(input: string) {
        this.logger.log(`Crawling data from url: ${input}`);
        await this.dataCrawl(input);
    }

    async dataCrawl(input: string) {
        try {
            await this.page.goto(input, {waitUntil: 'load'});

            await this.scrollDown(this.page, this.time);

            const text = await this.page.evaluate(() => {
                const bodyText = document.body.innerText;
                return bodyText;
            });

            this.logger.log(`Data from ${input}: ${text}`);
        }
        catch (err) {
            this.logger.warn(`Error crawling data from ${input}: ${err}`, );
        }
    }

    async scrollDown(page: Page, time: number){
        const startTime = Date.now();
        try {
            while (true) {
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                if (Date.now() - startTime >= time){
                    console.log(Date.now() - startTime)
                    break;
                }

                await this.delay(200);
            }
        }
        catch (err){
            this.logger.warn(`Error during scrolling: ${err}`);
        }
    }

    delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
