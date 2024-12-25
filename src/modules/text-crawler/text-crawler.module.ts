import { Module } from '@nestjs/common';
import { TextCrawlerController } from './text-crawler.controller';
import { TextCrawlerService } from './text-crawler.service';
import { WriteFileService } from '../write-file/write-file.service';

@Module({
    providers: [TextCrawlerService, WriteFileService],
    controllers: [TextCrawlerController],
})
export class TextCrawlerModule {}
