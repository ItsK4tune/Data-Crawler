import { Injectable, Logger } from '@nestjs/common';
import { env } from 'src/config';
import { Page } from 'puppeteer';
import { allowSubDomain, titleCheck, unallowDomain } from 'src/tool/page-check';
import { beautifyUrl } from 'src/tool/beautify-url';
import { WriteFileService } from '../write-file/write-file.service';

@Injectable()
export class LinkCrawlerService {
    private readonly logger = new Logger(LinkCrawlerService.name);

    constructor(
        private readonly writeFileService: WriteFileService,
    ){}

    async crawlLink(input: string, urls: string[], page: Page){
        let queue: string[] = [];

        queue.push(beautifyUrl(input));

        let index = 1;
        let retry = 1;
        while (queue.length && index <= env.perGen && retry <= env.retry){
            const currentUrl = queue.shift();

            try{
                this.logger.log(`Checking ${currentUrl}`);

                await page.goto(currentUrl, {waitUntil: 'domcontentloaded', timeout: 5000});

                if (!urls.includes(beautifyUrl(currentUrl)) && (await titleCheck(page) || allowSubDomain(currentUrl))){
                    urls.push(currentUrl);

                    const links = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("a:not(footer a)"))
                            .map((anchor) => anchor.getAttribute("href"))
                            .filter((href) => href !== null) as string[]
                    }, {timeout: 2000});

                    const absoluteLinks = links.map((link) => new URL(link, currentUrl).toString());

                    for (const link of absoluteLinks){
                        if (!queue.includes(beautifyUrl(link)) && this.isValidUrl(link) && unallowDomain(link)){
                            queue.push(beautifyUrl(link));
                        }
                    }
                    index++;
                }
                else {
                    const error = await this.Err(urls, currentUrl, page)
                    this.writeFileService.writeErrorLinkFile(currentUrl, error);
                    retry++;
                }
            }
            catch (err) {
                this.writeFileService.writeErrorLinkFile(currentUrl, 'TLE');
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

    async Err(urls: string[], currentUrl: string, page: Page): Promise<string> {
        if (urls.includes(beautifyUrl(currentUrl)))
            return 'Link existed';
        if (await titleCheck(page))
            return 'Not relevant';
        if (allowSubDomain(currentUrl))
            return 'Domain blocked';
    }
}
