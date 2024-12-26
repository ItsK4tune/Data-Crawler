import { Page } from "puppeteer";

export const allowDomain = (url: string):boolean => {
    const allowedDomains = ["discord.com", "youtube.com", "twitter.com", "t.me", "x.com", "www.linkedin.com"];
    return allowedDomains.some(site => url.includes(site));
}

export const unallowDomain = (url: string):boolean => {
    const unallowedDomains = ["discord.gg", "youtube.com", "twitter.com", "t.me", "x.com", "www.linkedin.com"];
    return !unallowedDomains.some(site => url.includes(site));
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