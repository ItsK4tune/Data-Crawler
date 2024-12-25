import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TextCrawlerModule } from './text-crawler/text-crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TextCrawlerModule,
  ],
})
export class AppModule {}
