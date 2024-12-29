import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TextCrawlerModule } from './text-crawler/text-crawler.module';
import { WriteFileModule } from './write-file/write-file.module';
import { DeleteFileModule } from './delete-file/delete-file.module';
import { XDataCrawlerModule } from './x-data-crawler/x-data-crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TextCrawlerModule,
    WriteFileModule,
    DeleteFileModule,
    XDataCrawlerModule,
  ],
})
export class AppModule {}
