export const beautifyUrl = (url: string): string => {
    let parsedUrl = new URL(url);

    parsedUrl.search = ""; 
    parsedUrl.hash = "";   

    return parsedUrl.toString();
};
