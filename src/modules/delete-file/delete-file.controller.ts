import { Controller, Get } from '@nestjs/common';
import { DeleteFileService } from './delete-file.service';

@Controller('delete-file')
export class DeleteFileController {
    constructor(
        private readonly deleteFileService: DeleteFileService,
    ) {}

    @Get()
    async Submit(){
        this.deleteFileService.deleteFile();
    }
}
