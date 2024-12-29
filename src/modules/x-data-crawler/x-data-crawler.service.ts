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
    private sub: ElementHandle[] = [];

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
            await this.scrollDownForMain(input);
            await this.crawl(input);

            this.logger.log(`Finished crawl from ${input}`)
        }
        catch (err) {
            this.logger.warn(`Error crawling data from ${input}: ${err}`, );
        }
    }

    async authen() {
        try{
            await this.page.waitForSelector('div[class="css-175oi2r"] a[href="/login"]');

            await this.page.click('div[class="css-175oi2r"] a[href="/login"]');
            
            await this.page.waitForSelector('label[class="css-175oi2r r-1roi411 r-z2wwpe r-rs99b7 r-18u37iz"]');             

            await this.page.type('label[class="css-175oi2r r-1roi411 r-z2wwpe r-rs99b7 r-18u37iz"]', `caftun31976`);
            await this.page.click('button[class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-ywje51 r-184id4b r-13qz1uu r-2yi16 r-1qi8awa r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l"]');
            
            await this.page.waitForSelector('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]');  

            await this.page.type('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]', `duongyb2004dn@gmail.com`);
            await this.page.click('button[class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-19yznuf r-64el8z r-1fkl15p r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l"]');

            await this.page.waitForSelector('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]');   

            await this.page.type('label[class="css-175oi2r r-z2wwpe r-rs99b7 r-18u37iz r-vhj8yc r-9cip40"]', `Duongnguyenyb2004`);
            await this.page.click('button[class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-19yznuf r-64el8z r-1fkl15p r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l"]');
        }
        catch {
            this.logger.warn('Login failed');
        }
    }

    async scrollDownForMain(url: string){
        const startTime = Date.now();
        const filterWord = url.split('/').pop();

        try {
            await this.page.waitForNavigation();

            while (true) {
                await this.page.waitForSelector('div[data-testid="cellInnerDiv"] div[class="css-175oi2r r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l"]');

                const links = await this.page.evaluate((filterWord) => {
                    return Array.from(document.querySelectorAll('div[data-testid="cellInnerDiv"] div[class="css-175oi2r"] a'))
                        .map((anchor) => anchor.getAttribute('href'))  
                        .filter((href) => href !== null && href.startsWith(`/${filterWord}/status`) && !href.includes('?mx=2') && !href.endsWith('analytics') && !href.endsWith('/photo/1'))
                        .map((href) => `https://x.com${href}`);  
                }, filterWord, {timeout: 2000}); 

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

    async crawl(url: string) {
        for (const link of this.blogLink){
            try {
                await this.page.goto(link, { waitUntil: 'load' });
                await this.scrollDownForSub(link, url);
            }
            catch {
                continue;
            }
        }
    }

    async scrollDownForSub(link: string, url: string){
        const startTime = Date.now();
        let data: string[] = [];
        const filterWord = url.split('/').pop();

        try {
            while (true) {
                try {
                    await this.page.waitForSelector('div[class="css-175oi2r r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l"]', { timeout: 5000 });
                } catch (err) {
                    continue;
                }
                
                const elements = await this.page.$$('div[class="css-175oi2r r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l"]');

                for (const element of elements) {
                    const articleText = await element.evaluate(el => {
                        const article = el.querySelector(`article `);

                        const unwantedSelectors = [
                            'div.css-175oi2r.r-1kbdv8c.r-18u37iz.r-1oszu61.r-3qxfft.r-n7gxbd.r-2sztyj.r-1efd50x.r-5kkj8d.r-h3s6tt.r-1wtj0ep.r-1igl3o0.r-rull8r.r-qklmqi',
                            'div.css-175oi2r.r-1kbdv8c.r-18u37iz.r-1wtj0ep.r-1ye8kvj.r-1s2bzr4',
                            'button'
                        ];

                        unwantedSelectors.forEach(selector => {
                            const unwantedElements = article.querySelectorAll(selector);
                            unwantedElements.forEach(element => element.remove());
                        });

                        return article ? (article as HTMLElement).innerText.replace(/\n/g, ' ') : '';
                    });

                    if (!data.includes(articleText.trim())) {
                        data.push(articleText.trim())
                    }
                }

                await this.page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                if (Date.now() - startTime >= 2000){
                    break;
                }

                await this.delay(env.timeDelay);        
            }

            await this.writeFileService.writeXDataFile(data, link, filterWord);
        }
        catch (err){
            this.logger.warn(`Error during sub scrolling: ${err}`);
        }
    }

    delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
}
