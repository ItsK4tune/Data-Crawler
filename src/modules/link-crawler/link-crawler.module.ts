import { Module } from '@nestjs/common';
import { LinkCrawlerService } from './link-crawler.service';
import { WriteFileService } from '../write-file/write-file.service';

@Module({
  providers: [LinkCrawlerService, WriteFileService],
  exports: [LinkCrawlerService]
})
export class LinkCrawlerModule {}
