import { Module } from '@nestjs/common';
import { TextCrawlerController } from './text-crawler.controller';
import { TextCrawlerService } from './text-crawler.service';
import { WriteFileService } from '../write-file/write-file.service';
import { LinkCrawlerService } from '../link-crawler/link-crawler.service';

@Module({
    providers: [TextCrawlerService, WriteFileService, LinkCrawlerService],
    controllers: [TextCrawlerController],
})
export class TextCrawlerModule {}
