import { Injectable, Logger } from '@nestjs/common';
import { env } from 'src/config';
import { Page } from 'puppeteer';
import { titleCheck, unallowDomain } from 'src/tool/page-check';
import { beautifyUrl } from 'src/tool/beautify-url';

@Injectable()
export class LinkCrawlerService {
    private readonly logger = new Logger(LinkCrawlerService.name);

    constructor(){}

    async crawlLink(input: string, urls: string[], page: Page){
        let queue: string[] = [];

        queue.push(beautifyUrl(input));

        let index = 1;
        while (queue.length && index <= env.perGen){
            const currentUrl = queue.shift();

            try{
                await page.goto(currentUrl);

                if (!urls.includes(beautifyUrl(currentUrl)) && await titleCheck(page)){
                    urls.push(currentUrl);

                    const links = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("a"))
                            .map((anchor) => anchor.getAttribute("href"))
                            .filter((href) => href !== null) as string[]
                    });

                    const absoluteLinks = links.map((link) => new URL(link, currentUrl).toString());

                    for (const link of absoluteLinks)
                        if (!queue.includes(beautifyUrl(link)) && this.isValidUrl(link) && unallowDomain(link))
                            queue.push(beautifyUrl(link));
                }
                index++;
            }
            catch (err) {
                this.logger.error(`Error at URL: ${currentUrl}`, err.stack);
                index++;
                continue;
            }
        }
    }

    isValidUrl(url: string): boolean {
        try {
            new URL(url); 
            return true;
        } catch (e) {
            return false; 
        }
    }
}
