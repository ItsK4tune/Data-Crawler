import { Body, Controller, Post } from '@nestjs/common';
import { XDataCrawlerService } from './x-data-crawler.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Data Crawler')
@Controller('x-data-crawler')
export class XDataCrawlerController {
    constructor (
        private readonly xDataCrawlerService: XDataCrawlerService,
    ) {}

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    format: 'uri', // Đảm bảo định dạng là URI nếu cần
                },
            },
        },
    })
    @Post()
    async Submit(@Body() body: { url: string }) {
        await this.xDataCrawlerService.initialize();
        await this.xDataCrawlerService.do(body.url);
        await this.xDataCrawlerService.close();
    }
}
