import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathDataFile, pathLinkFile, pathErrorLinkFile } from 'src/tool/const';

@Injectable()
export class DeleteFileService {
    private readonly logger = new Logger(DeleteFileService.name);
    private fileDataPath: string = path.resolve(__dirname, pathDataFile);
    private fileLinkPath: string = path.resolve(__dirname, pathLinkFile);
    private fileErrorLinkPath: string = path.resolve(__dirname, pathErrorLinkFile);
    
    constructor(){}

    async deleteFile() {
        try {
            const fileDataExists = await this.checkFileExists(this.fileDataPath);
            const fileLinkExists = await this.checkFileExists(this.fileLinkPath);
            const fileErrorLinkExists = await this.checkFileExists(this.fileErrorLinkPath);
            
            if (fileDataExists) {
                await fs.unlink(this.fileDataPath);
            }

            if (fileLinkExists) {
                await fs.unlink(this.fileLinkPath);
            }

            if (fileErrorLinkExists) {
                await fs.unlink(this.fileErrorLinkPath);
            }

            this.logger.log(`File deleted successfully`);
            return;
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
