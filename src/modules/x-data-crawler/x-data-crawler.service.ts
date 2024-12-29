import { Injectable, Logger } from '@nestjs/common';
import { Browser, ElementHandle, Page } from 'puppeteer';
import { env } from 'src/config';
import puppeteer from 'puppeteer-extra';
import { WriteFileService } from '../write-file/write-file.service';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

@Injectable()
export class XDataCrawlerService {
    private readonly logger = new Logger(XDataCrawlerService.name);
    private browser: Browser;
    private page: Page;
    private blogLink: string[] = [];

    constructor (
        private readonly writeFileService: WriteFileService,
    ) {}

    async initialize() {
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(400000);
        puppeteer.use(StealthPlugin());
    }

    async close() {
        await this.page.close(); 
        await this.browser.close();
    }

    async do(input: string) {
        await this.dataCrawl(input);
    }

    async dataCrawl(input: string) {
        try {
            await this.page.goto(input, {waitUntil: 'load'});
            await this.authen();
            await this.scrollDownForMain();
            await this.crawl();
        }
        catch (err) {
            this.logger.warn(`Error crawling data from ${input}: ${err}`, );
        }
    }

    async authen() {
        await this.page.waitForSelector('div[class="css-175oi2r"] a[href="/login"]');

        await this.page.click('div[class="css-175oi2r"] a[href="/login"]');
        
        await this.page.waitForSelector('label[class="css-175oi2r r-1roi411 r-z2wwpe r-rs99b7 r-18u37iz"]');             

        await this.page.type('label[class="css-175oi2r r-1roi411 r-z2wwpe r-rs99b7 r-18u37iz"]', 'caftun25182');
        await this.page.click('button[class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-ywje51 r-184id4b r-13qz1uu r-2yi16 r-1qi8awa r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l"]');
        
        await this.page.waitForSelector('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]');  

        await this.page.type('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]', 'duongcuteyb2004@gmail.com');
        await this.page.click('button[class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-19yznuf r-64el8z r-1fkl15p r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l"]');

        await this.page.waitForSelector('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]');   


        await this.page.type('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]', 'Duongnguyenyb2004');
        await this.page.click('button[class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-19yznuf r-64el8z r-1fkl15p r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l"]');
    }

    async scrollDownForMain(){
        const startTime = Date.now();

        try {
            await this.page.waitForNavigation();

            while (true) {
                await this.page.waitForSelector('div[data-testid="cellInnerDiv"] div[class="css-175oi2r r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l"]');

                const links = await this.page.evaluate(() => {
                    return Array.from(document.querySelectorAll('div[data-testid="cellInnerDiv"] div[class="css-175oi2r"] a'))
                        .map((anchor) => anchor.getAttribute('href'))  
                        .filter((href) => href !== null && href.startsWith('/WeberaFinance/status/') && !href.includes('?mx=2') && !href.endsWith('analytics') && !href.endsWith('/photo/1'))
                        .map((href) => `https://x.com${href}`);  
                }, {timeout: 2000}); 

                for (const link of links){
                    if (!this.blogLink.includes(link))
                        this.blogLink.push(link);
                }

                await this.page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                if (Date.now() - startTime >= env.time){
                    break;
                }

                await this.delay(env.timeDelay);        
            }
        }
        catch (err){
            this.logger.warn(`Error during scrolling: ${err}`);
        }
    }

    async crawl() {
        for (const link of this.blogLink){
            try {
                await this.page.goto(link, { waitUntil: 'load' });
                await this.scrollDownForSub(link);
            }
            catch {
                continue;
            }
        }
    }

    async scrollDownForSub(link: string){
        const startTime = Date.now();
        let data: string[] = [];

        try {
            let visited: Set<ElementHandle> = new Set();

            while (true) {
                try {
                    await this.page.waitForSelector('div[class="css-175oi2r r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l"]', { timeout: 5000 });
                } catch (err) {
                    continue;
                }
                
                const elements = await this.page.$$('div[class="css-175oi2r r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l"]');

                for (const element of elements) {
                    const articleText = await element.evaluate(() => {
                        const article = document.querySelector('article');
                        return article ? article.innerText.replace(/\n/g, ' ') : '';
                    });
    
                    if (!visited.has(element)) {
                        data.push(articleText.trim());
                        visited.add(element);
                    }
                }

                

                await this.page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                const newHeight = await this.page.evaluate(() => document.body.scrollHeight);

                if (Date.now() - startTime >= 10000){
                    break;
                }

                await this.delay(env.timeDelay);        
            }

            await this.writeFileService.writeXDataFile(data.join('\n'), link);
        }
        catch (err){
            this.logger.warn(`Error during scrolling: ${err}`);
        }
    }

    delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
