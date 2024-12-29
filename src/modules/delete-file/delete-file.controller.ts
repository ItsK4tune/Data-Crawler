import { Controller, Get } from '@nestjs/common';
import { DeleteFileService } from './delete-file.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Delete Files')
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
