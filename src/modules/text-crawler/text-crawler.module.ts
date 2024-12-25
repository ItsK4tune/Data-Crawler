import { Module } from '@nestjs/common';
import { TextCrawlerController } from './text-crawler.controller';
import { TextCrawlerService } from './text-crawler.service';

@Module({
    providers: [TextCrawlerService],
    controllers: [TextCrawlerController],
})
export class TextCrawlerModule {}
