import { Module } from '@nestjs/common';
import { WriteFileService } from './write-file.service';

@Module({
  providers: [WriteFileService],
  exports: [WriteFileService],
})
export class WriteFileModule {}
