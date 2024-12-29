import { Module } from '@nestjs/common';
import { XDataCrawlerController } from './x-data-crawler.controller';
import { XDataCrawlerService } from './x-data-crawler.service';
import { WriteFileService } from '../write-file/write-file.service';

@Module({
  controllers: [XDataCrawlerController],
  providers: [XDataCrawlerService, WriteFileService]
})
export class XDataCrawlerModule {}
