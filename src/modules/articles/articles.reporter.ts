import Reporter from "../../lib/reporter";
import { createLocalCacheTable } from "../../adapters/cache-locally";

export default function initialize() {
    const article = new Reporter({ collectorName: "articles" });
    const cacheLocally = createLocalCacheTable("articles", { replaceOnSamePrimaryKey: "pageId" });

    const sharedEventProperties = {
        pageId: "string",
        content: "sting"
    };

    article.addSchema("article", {...sharedEventProperties});
    
    article.addListener(cacheLocally, {
        matchPatterns: ["<all_urls>"],
        privateWindows: false
    });
    return article;
}