import { Page } from "puppeteer";

export const allowSubDomain = (url: string): boolean => {
    const allowedSubDomains = ["blog.berachain.com", "mirror.xyz", "ecosystem.berachain.com", "news.berachain.com", "docs.berachain.com"];

    try {
        const parsedUrl = new URL(url);

        if (allowedSubDomains.includes(parsedUrl.hostname)) {
            return true;
        }

        return false; 
    } catch (error) {
        console.error('Invalid URL:', error);
        return false;
    }
};

export const unallowDomain = (url: string):boolean => {
    const unallowedDomains = ["discord.com", "discord.gg", "youtube.com", "twitter.com", "t.me", "x.com", "www.linkedin.com", 
        "policies.google.com", "careers.berachain.com", "testnet.webera.finance", "github.com", "bartio.beratrail.io"];
    const blockedPaths = ["/terms-of-use", "/privacy-policy"];

    if (unallowedDomains.some(site => url.includes(site)))
        return false;

    try {
        const parsedUrl = new URL(url);

        if (unallowedDomains.includes(parsedUrl.hostname) || blockedPaths.includes(parsedUrl.pathname))
            return false;

        return true; 
    } catch (error) {
        console.error('Invalid URL:', error);
        return false;
    }
}

export const titleCheck = async (page: Page): Promise<boolean> => {
    const keywords = ["bera", "beaconkit"];

    try {
        const title = await page.title();
        return keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
    } catch (err) {
        console.error("Error fetching page title:", err);
        return false; 
    }
};