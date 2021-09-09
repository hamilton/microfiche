/* 
page.collector.js

This collector captures page-level details.

*/

import { Readability } from "@mozilla/readability";
import Collector from '../../lib/collector';
import type { PageManager } from "../../lib/collector";
import { getContentByElementName, getContentByTagProperty } from './probes';
const pageCollector = new Collector();

interface State {
    maxPixelScrollDepth: number,
    maxScrollHeight: number
}

function onEventEnd() {
    return (collector : Collector, pageManager : PageManager) => {
        
        const documentClone = document.cloneNode(true); 
        // @ts-ignore
        let parsedOutput = (new Readability(documentClone)).parse();
        let contentLastSeen : string;
        if (parsedOutput) {
            contentLastSeen = parsedOutput.textContent;
        } else {
            contentLastSeen = '';
        }

        const state = collector.get();
        const maxScrollHeight = state.maxScrollHeight || 0;
        const maxPixelScrollDepth = state.maxPixelScrollDepth || 0;

        const title = getContentByElementName("title", document) || "";
        // standards
        const ogTitle =getContentByTagProperty("og:title", document) || ""; 
        const ogDescription = getContentByTagProperty("og:description", document) || "";
        const ogType = getContentByTagProperty("og:type", document) || "";
        const ogImage = getContentByTagProperty("og:image", document) || "";
        const ogURL = getContentByTagProperty("og:url", document) || "";
        collector.send("page", {
            pageId: pageManager.pageId,
            url: pageManager.url,
            title,
            ogTitle,
            ogDescription,
            ogType,
            ogImage,
            ogURL,
            maxScrollHeight, 
            maxPixelScrollDepth,
            contentLastSeen
        });
    }
}

pageCollector.on('attention-stop', onEventEnd());
pageCollector.on('page-visit-stop', onEventEnd());

function collectScrollInformation(state : State) {

    const h = document.documentElement;
    const b = document.body;

    const maxScrollHeight = Math.max(h.scrollHeight || b.scrollHeight || 0, state.maxScrollHeight || 0, 0);

    const maxPixelScrollDepth =
        Math.min(maxScrollHeight,
            Math.max(
                (state.maxPixelScrollDepth || 0), 
                (h.scrollTop || b.scrollTop) + 
                window.innerHeight
            )
        );
    
    state.maxPixelScrollDepth = maxPixelScrollDepth;
    state.maxScrollHeight = maxScrollHeight;
}

pageCollector.on('interval', (collector : Collector) => { collector.updateState(collectScrollInformation); }, 1000);

pageCollector.run();