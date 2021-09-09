import Reporter from "../../lib/reporter";
import { createLocalCacheTable } from "../cache-locally";

export default function initialize() {
    const event = new Reporter({ collectorName: "events" });
    const cacheLocally = createLocalCacheTable("events");
    
    // Event properties that both of these event types consume.
    const sharedEventProperties = {
        pageId: "string",
        eventType: "string",
        timestamp: "number"
    }
    
    event.addSchema("event", {...sharedEventProperties});
    
    event.addListener(cacheLocally, {
        matchPatterns: ["<all_urls>"],
        privateWindows: false
    });
    return event;
}