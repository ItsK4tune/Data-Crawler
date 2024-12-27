import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathDataFile, pathLinkFile, pathErrorLinkFile } from 'src/tool/const';

@Injectable()
export class WriteFileService {
    private readonly logger = new Logger(WriteFileService.name);
    private fileDataPath: string = path.resolve(__dirname, pathDataFile);
    private fileLinkPath: string = path.resolve(__dirname, pathLinkFile);
    private fileErrorLinkPath: string = path.resolve(__dirname, pathErrorLinkFile);

    constructor(){}

    async writeDataFile(data: string, url: string) {
        try {
            const fileExists = await this.checkFileExists(this.fileDataPath);

            if (!fileExists) {
                await fs.writeFile(this.fileDataPath, '', 'utf-8'); 
                this.logger.log(`Created new file: ${this.fileDataPath}`);
            }

            const content = `URL: ${url}\n${data}\n\n---\n\n`;
            await fs.appendFile(this.fileDataPath, content, 'utf-8');

            this.logger.log(`${url}: Data appended to file successful`)
        }
        catch (err) {
            this.logger.warn(`Error writing data from ${url}: ${err}`);
        }
    }

    async writeLinkFile(urls: string[]) {
        try {
            const fileExists = await this.checkFileExists(this.fileLinkPath);

            if (!fileExists) {
                await fs.writeFile(this.fileLinkPath, '', 'utf-8'); 
                this.logger.log(`Created new file: ${this.fileLinkPath}`);
            }

            for (const url of urls){
                const content = `${url}\n`;
                await fs.appendFile(this.fileLinkPath, content, 'utf-8');
            }

            this.logger.log(`All links appended to file`)
        }
        catch (err) {
            this.logger.warn(`Error writing link: ${err}`);
        }
    }

    async writeErrorLinkFile(url: string, err: string | Promise<string>) {
        try {
            const fileExists = await this.checkFileExists(this.fileErrorLinkPath);

            if (!fileExists) {
                await fs.writeFile(this.fileErrorLinkPath, '', 'utf-8'); 
                this.logger.log(`Created new file: ${this.fileErrorLinkPath}`);
            }

            const content = `${err}: ${url}\n`;
            await fs.appendFile(this.fileErrorLinkPath, content, 'utf-8');
            this.logger.warn(`Error at URL: ${url}`, err);
        }
        catch (err) {
            this.logger.warn(`Error writing link: ${err}`);
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
