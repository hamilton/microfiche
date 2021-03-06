/**
 * Articles
 * For each page visit id, check if article.
 * If possibly an article, then call Readability
 * and get the content, and save the results.
 */

 import { Readability, isProbablyReaderable } from "@mozilla/readability";
 import Collector from '../../lib/collector';
 import type { PageManager } from "../../lib/collector";

 const articleCollector = new Collector();

 function onEventEnd() {
     return (collector:Collector, _:unknown, pageManager : PageManager) => {
        if (isProbablyReaderable(document)) {
            const documentClone = document.cloneNode(true); 
            // @ts-ignore
            let parsedOutput = (new Readability(documentClone)).parse();
            if (parsedOutput) {
                collector.send("article", {
                    pageId: pageManager.pageId,
                    textContent: parsedOutput.textContent,
                    content: parsedOutput.content,
                    byline: parsedOutput.byline || '',
                    title: parsedOutput.title || ''
                });
            }
         }
     }
 }

articleCollector.on("attention-stop", onEventEnd());
articleCollector.on('page-visit-stop', onEventEnd());

articleCollector.run();