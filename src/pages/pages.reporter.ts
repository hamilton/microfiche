import Reporter from "../../lib/reporter";
import { createLocalCacheTable } from "../cache-locally";

export default function initialize() {
    const page = new Reporter({ collectorName: "pages" });

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
        contentLastSeen: 'string'
    }

    page.addSchema("page", {...sharedEventProperties});
    const cacheLocally = createLocalCacheTable("pages", { replaceOnSamePrimaryKey: "pageId" });
    
    
    page.addListener(cacheLocally, {
        matchPatterns: ["<all_urls>"],
        privateWindows: false
    });
    return page;
}