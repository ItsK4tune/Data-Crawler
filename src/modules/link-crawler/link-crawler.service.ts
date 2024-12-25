import { Injectable, Logger } from '@nestjs/common';
import { env } from 'src/config';
import { Page } from 'puppeteer';

@Injectable()
export class LinkCrawlerService {
    private readonly logger = new Logger(LinkCrawlerService.name);

    constructor(){}

    async crawlLink(input: string, urls: string[], page: Page){
        let queue: string[] = [];

        queue.push(this.beautifyUrl(input));

        let index = 1;
        while (queue.length && index <= env.perGen){
            const currentUrl = queue.shift();

            if (!urls.includes(this.beautifyUrl(currentUrl))){
                urls.push(currentUrl);

                try {
                    await page.goto(currentUrl);
                    
                    const links = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("a"))
                            .map((anchor) => anchor.getAttribute("href"))
                            .filter((href) => href !== null) as string[];
                    });

                    for (const link of links){
                        if (this.isValidUrl(link) && this.isUrlFromSites(link))
                            queue.push(link);
                    }
                }
                catch (err) {
                    this.logger.error(`Error at URL: ${currentUrl}`, err.stack);
                    index++;
                    continue;
                }
            }
            index++;
        }
    }

    beautifyUrl(url: string): string {
        let parsedUrl = new URL(url);
    
        const paramsToRemove = ["utm_source", "utm_medium"];
        paramsToRemove.forEach(param => parsedUrl.searchParams.delete(param));
    
        parsedUrl.pathname = this.slugify(parsedUrl.pathname);
    
        return parsedUrl.toString().replace(/\/+$/, "");
    }
    
    slugify(input: string): string {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    isValidUrl(url: string): boolean {
        try {
            new URL(url); 
            return true;
        } catch (e) {
            return false; 
        }
    }

    isUrlFromSites(url: string): boolean {
        const unallowedDomains = ["discord.com", "youtube.com", "twitter.com", "t.me", "x.com", "www.linkedin.com"];
        return !unallowedDomains.some(site => url.includes(site));
    }
}
