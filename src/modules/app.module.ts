import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TextCrawlerModule } from './text-crawler/text-crawler.module';
import { WriteFileModule } from './write-file/write-file.module';
import { DeleteFileModule } from './delete-file/delete-file.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TextCrawlerModule,
    WriteFileModule,
    DeleteFileModule,
  ],
})
export class AppModule {}
