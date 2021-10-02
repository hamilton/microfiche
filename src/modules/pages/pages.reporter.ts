import Reporter from "../../lib/reporter";
import { createLocalCacheTable } from "../../adapters/cache-locally";

export default function initialize() {
    const page = new Reporter({ collectorName: "pages" });
    const cacheLocally = createLocalCacheTable("pages", { replaceOnSamePrimaryKey: "pageId" });

    const sharedEventProperties = {
        pageId: "string",
        url: "string",
        title: "string",
        ogTitle: "string",
        ogDescription: "string",
        ogType: "string",
        ogImage: "string",
        ogURL: "string",
        maxScrollHeight: "number", 
        maxPixelScrollDepth: "number",
    }

    page.addSchema("page", {...sharedEventProperties});
    
    page.addListener(cacheLocally, {
        matchPatterns: ["<all_urls>"],
        privateWindows: false
    });
    return page;
}