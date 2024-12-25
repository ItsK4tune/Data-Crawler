import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import puppeteer, { Browser, Page, Puppeteer } from 'puppeteer';
import { env } from 'src/config';
import { WriteFileService } from '../write-file/write-file.service';

@Injectable()
export class TextCrawlerService {
    private readonly logger = new Logger(TextCrawlerService.name);
    private browser: Browser;
    private page: Page;
    private time: number = env.time;
    private timeWindow: number = 500;
    private timeDelay: number = 200;

    constructor(private readonly writeFileService: WriteFileService){}

    async initialize() {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
    }

    async close() {
        await this.page.close(); 
        await this.browser.close();
    }

    async crawlData(input: string) {
        this.logger.log(`Crawling data from url: ${input}`);
        await this.dataCrawl(input);
    }

    async dataCrawl(input: string) {
        this.page.setDefaultTimeout(5000);

        try {
            await this.page.goto(input, {waitUntil: 'load'});

            try {
                await this.scrollDown(this.page, this.time);
            }
            catch (ScrollErr) {
                await this.page.goto(input, {waitUntil: 'load'});
            }
            finally {
                const text = await this.page.evaluate(() => {
                    const bodyText = document.body.innerText;
                    return bodyText;
                });

                this.writeFileService.writeFile(text, input);
            }
        }
        catch (err) {
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

                if (Date.now() - timeSinceLastScroll >= this.timeWindow){
                    break;
                }

                if (Date.now() - startTime >= time){
                    break;
                }

                await this.delay(this.timeDelay);
            }
        }
        catch (err){
            this.logger.warn(`Error during scrolling: ${err}`);
        }
    }

    delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
