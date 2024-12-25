import { Module } from '@nestjs/common';
import { DeleteFileService } from './delete-file.service';
import { DeleteFileController } from './delete-file.controller';

@Module({
  providers: [DeleteFileService],
  controllers: [DeleteFileController]
})
export class DeleteFileModule {}
