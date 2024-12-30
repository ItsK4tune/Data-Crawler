import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { pathDataFile, pathXDataFile, pathLinkFile, pathErrorLinkFile } from 'src/tool/const';

@Injectable()
export class WriteFileService {
    private readonly logger = new Logger(WriteFileService.name);
    private fileDataPath: string = path.resolve(__dirname, pathDataFile);
    private fileXDataPath: string = path.resolve(__dirname, pathXDataFile);
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

    async writeXDataFile(datas: string[], link: string, filterWord: string) {
        try {
            const fileExists = await this.checkFileExists(this.fileXDataPath);

            if (!fileExists) {
                await fs.writeFile(this.fileXDataPath, '', 'utf-8'); 
                this.logger.log(`Created new file: ${this.fileXDataPath}`);
            }

            const content = `URL: ${link}\n\n`;
            await fs.appendFile(this.fileXDataPath, content, 'utf-8');

            const contentData = datas.find(data => data.includes(`@${filterWord}`));
            const commentData = datas.filter(data => !data.includes(`@${filterWord}`));

        
            if (contentData) {
                const blogMainContent = `Content: ${contentData} \n\nComment:\n`;
                await fs.appendFile(this.fileXDataPath, blogMainContent, 'utf-8');
            }

        
            for (const comment of commentData) {
                const commentContent = `${comment}\n`;
                await fs.appendFile(this.fileXDataPath, commentContent, 'utf-8');
            }

            await fs.appendFile(this.fileXDataPath, `\n\n---\n\n`, 'utf-8');
        }
        catch (err) {
            this.logger.warn(`Error writing data from ${link}: ${err}`);
        }
    }

    async writeXDataFile2(data: string, link: string) {
        try {
            const fileExists = await this.checkFileExists(this.fileXDataPath);
    
            if (!fileExists) {
                await fs.writeFile(this.fileXDataPath, JSON.stringify({}, null, 2), 'utf-8');
                this.logger.log(`Created new file: ${this.fileXDataPath}`);
            }
    
            const fileContent = await fs.readFile(this.fileXDataPath, 'utf-8');
            const jsonData = JSON.parse(fileContent || "{}");
    
            if (!jsonData.url) {
                jsonData.url = link;
            }
    
            if (!jsonData.tweet) {
                jsonData.tweet = [];
            }
            if (!jsonData.tweet.includes(data)) {
                jsonData.tweet.push(data);
                this.logger.log(`Added new tweet: ${data}`);
            } else {
                this.logger.log(`Data already exists, skipping: ${data}`);
            }
    
            await fs.writeFile(this.fileXDataPath, JSON.stringify(jsonData, null, 2), 'utf-8');
        } catch (err) {
            this.logger.warn(`Error writing data from ${link}: ${err}`);
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
