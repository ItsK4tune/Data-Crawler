import { Module } from '@nestjs/common';
import { LinkCrawlerService } from './link-crawler.service';

@Module({
  providers: [LinkCrawlerService],
  exports: [LinkCrawlerService]
})
export class LinkCrawlerModule {}
