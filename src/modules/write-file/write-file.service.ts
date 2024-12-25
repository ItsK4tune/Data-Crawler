import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathFile } from 'src/tool/const';

@Injectable()
export class WriteFileService {
    private readonly logger = new Logger(WriteFileService.name);
    private filePath: string = path.resolve(__dirname, pathFile);

    constructor(){}

    async writeFile(data: string, url: string) {
        try {
            const fileExists = await this.checkFileExists(this.filePath);
            if (!fileExists) {
                await fs.writeFile(this.filePath, '', 'utf-8'); 
                this.logger.log(`Created new file: ${this.filePath}`);
            }

            const content = `URL: ${url}\n${data}\n\n---\n\n`;
            await fs.appendFile(this.filePath, content, 'utf-8');

            this.logger.log(`${url}: Data appended to file successful`)
        }
        catch (err) {
            this.logger.warn(`Error writing data from ${url}: ${err}`);
        }
    }   

    private async checkFileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch (err) {
            return false;
        }
    }
}
