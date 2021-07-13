// @ts-ignore
import browser from "webextension-polyfill";
// @ts-ignore
import { pageManager, events, messaging } from "@mozilla/web-science";

interface Schema {
    [key : string] : any
}
export default class Reporter {
    matchPatterns : Array<string>;
    collectorName : string;
    notifyAboutPrivateWindows : boolean;
    onPageData : { notifyListeners : Function, addListener : Function };
    registeredContentScript : any;
    schemas : Array<{ schema : Schema, schemaNamespace : string}>;

    constructor(
        { collectorName, matchPatterns = ['<all_urls>'] } : 
        { collectorName : string, matchPatterns : Array<string> }
    ) {
        this.matchPatterns = matchPatterns;
        this.collectorName = collectorName;
        this.schemas = [];
        this.notifyAboutPrivateWindows = false;
        this.onPageData = events.createEvent({
            addListenerCallback: this._addListener.bind(this),
            removeListenerCallback: this._removeListener.bind(this)});
        // the storage instance stores the data and registers the namespace
        // for the app.
        //this.storage = new Storage({ namespace: collectorName });
    }

    // FIXME: get rid of this and put into this.onPageData directly after done with typescript.
    _addListener() {
        this._startMeasurement();
    }

    _removeListener(listener : Function) {
        // if (!this.hasAnyListeners()) {
            this._stopMeasurement();
        // }
    }

    // FIXME – don't use any type.
    _pageDataListener(pageData : any) {
        // If the page is in a private window and the module should not measure private windows,
        // ignore the page
        if(!(this.notifyAboutPrivateWindows) && pageData.privateWindow) {
            return;
        }
    
        // Delete the type string from the content script message
        delete pageData.type;
        this.onPageData.notifyListeners([ pageData ]);
    }

    addSchema(schemaNamespace : string, schema : Schema) {
        this.schemas.push({ schema, schemaNamespace });
    }

    async _startMeasurement() {
        await pageManager.initialize();

        this.registeredContentScript = await browser.contentScripts.register({
            matches: this.matchPatterns,
            js: [{
                file: `/dist/content-scripts/${this.collectorName}.collector.js`
            }],
            runAt: "document_start"
        });
        if (!this.schemas.length) { throw Error('the reporter must have at least one schema') }
        this.schemas.forEach(({ schemaNamespace, schema }) => {
            messaging.registerSchema(schemaNamespace, schema);
            messaging.onMessage.addListener(this._pageDataListener.bind(this), {type: schemaNamespace, schema });
        });

    }

    async _stopMeasurement() {
        this.schemas.forEach(({ schemaNamespace }) => {
            messaging.unregisterSchema(schemaNamespace);
            //messaging.unregisterListener(schemaNamespace, this._pageDataListener);    
        })
        
        this.registeredContentScript.unregister();
        this.registeredContentScript = null;
        this.notifyAboutPrivateWindows = false;
    }

    addListener(callback : Function, options : any) {
        this.onPageData.addListener(callback, options);
    }
}