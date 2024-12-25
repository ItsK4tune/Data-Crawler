import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathFile } from 'src/tool/const';

@Injectable()
export class DeleteFileService {
    private readonly logger = new Logger(DeleteFileService.name);
    private filePath: string = path.resolve(__dirname, pathFile);
    
    constructor(){}

    async deleteFile() {
        try {
            const fileExists = await this.checkFileExists(this.filePath);
            if (!fileExists) {
                return;
            }

            await fs.unlink(this.filePath);
            this.logger.log(`File deleted successfully`);
        } catch (err) {
            this.logger.error(`Error deleting file`, err);
        }
    }

    private async checkFileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}
