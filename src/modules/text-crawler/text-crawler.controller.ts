import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { TextCrawlerService } from './text-crawler.service';

@ApiTags('Data Crawler')
@Controller('text-crawler')
export class TextCrawlerController {
    constructor(
        private readonly textCrawlerService: TextCrawlerService,
    ) {}

    @Post()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                urls: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uri',
                    },
                },
            },
        },
    })
    async Submit(@Body() body: { urls: string[] }) {
        await this.textCrawlerService.initialize();

        for (const url of body.urls) {
            await this.textCrawlerService.crawlData(url);
        }

        await this.textCrawlerService.close();
    }
}
